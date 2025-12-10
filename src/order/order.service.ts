import { HttpStatus, Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseResponseTypeDTO, generateUniqueKey } from 'src/utils';
import { CreateOrderDto, OrderFilterDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderDocument, OrderItem } from './entities/order.entity';
import { Product, ProductDocument } from 'src/product/entities/product.entity';
import { Customer, CustomerDocument } from 'src/customer/entities/customer.entity';
import { CartItem, CartItemDocument } from 'src/cart-item/entities/cart-item.entity';
import * as crypto from 'crypto';
import { ShippingService } from 'src/shipping/shipping.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Customer.name) private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(CartItem.name) private readonly cartItemModel: Model<CartItemDocument>,
    private readonly shippingService: ShippingService,
  ) {}

  async create(userId: string, payload: CreateOrderDto): Promise<BaseResponseTypeDTO> {
    if (!payload.cartItemIds || payload.cartItemIds.length === 0) {
      throw new BadRequestException('Order requires at least one cart item');
    }
    const customer = await this.customerModel.findById(userId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    const cartItems = await this.cartItemModel
      .find({
        _id: { $in: payload.cartItemIds.map((id) => new Types.ObjectId(id)) },
        customerId: new Types.ObjectId(userId),
      })
      .lean();

    if (!cartItems.length) {
      throw new NotFoundException('No cart items found for this order');
    }

    for (const item of cartItems) {
      const product = await this.productModel.findById(item.productId);
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      const price = product.amount ?? product.price ?? 0;
      const quantity = Math.max(item.quantity || 1, 1);
      const lineTotal = price * quantity;
      totalAmount += lineTotal;

      orderItems.push({
        productId: new Types.ObjectId(item.productId),
        name: product.name,
        price,
        quantity,
        imageUrl: product.imageurl,
        category: product.category,
      } as OrderItem);
    }

    // Add shipping cost to total amount if provided
    const shippingCost = payload.shippingCost || 0;
    const finalTotalAmount = totalAmount + shippingCost;

    const orderNumber = `FLX${generateUniqueKey(5)}`;
    const order = new this.orderModel({
      orderNumber,
      items: orderItems,
      totalAmount: finalTotalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      userId: customer._id.toString(),
      shippingAddress: customer.address,
      contactEmail: customer.email,
      contactName: customer.name,
      notes: payload.notes,
      placedAt: new Date(),
    });

    const saved = await order.save();
    await this.cartItemModel.deleteMany({
      _id: { $in: payload.cartItemIds.map((id) => new Types.ObjectId(id)) },
      customerId: new Types.ObjectId(userId),
    });

    return {
      data: saved,
      success: true,
      code: HttpStatus.CREATED,
      message: 'Order Created',
    };
  }

  async findAll(userId: string, filters: OrderFilterDto): Promise<BaseResponseTypeDTO> {
    const query: any = {};
  
    // Find customer
    const customer = await this.customerModel.findById(userId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
  
    // Match orders to this customer (userId is stored as string, so convert to string for comparison)
    query.userId = customer._id.toString();
  
    // Filter by status
    if (filters.status) {
      query.status = filters.status;
    }
  
    // Search
    if (filters.search) {
      query.orderNumber = { $regex: filters.search.trim(), $options: 'i' };
    }
  
    // Date range
    if (filters.startDate || filters.endDate) {
      query.placedAt = {};
      if (filters.startDate) {
        query.placedAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.placedAt.$lte = new Date(filters.endDate);
      }
    }
  
    // Pagination
    const limit = filters.limit || 50;
    const page = filters.page || 1;
    const skip = (page - 1) * limit;
  
    const totalCount = await this.orderModel.countDocuments(query);
  
    const data = await this.orderModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  
    return {
      data: {
        totalCount,
        data,
      },
      success: true,
      code: HttpStatus.OK,
      message: 'Orders fetched',
      limit,
      page,
      search: filters.search,
    };
  }
  
  async findOne(userId: string, id: string): Promise<BaseResponseTypeDTO> {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    // Convert both to strings for comparison (userId from JWT might be ObjectId, order.userId is string)
    const userIdStr = userId?.toString();
    const orderUserIdStr = order.userId?.toString();
    
    if (orderUserIdStr !== userIdStr) {
      throw new ForbiddenException('You are not authorized to access this order.');
    }

    return {
      data: order,
      success: true,
      code: HttpStatus.OK,
      message: 'Order fetched',
    };
  }

  async update(id: string, payload: UpdateOrderDto): Promise<BaseResponseTypeDTO> {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    if (payload.status) {
      order.status = payload.status;
    }

    if (payload.shippingAddress) {
      order.shippingAddress = payload.shippingAddress;
    }

    if (payload.notes) {
      order.notes = payload.notes;
    }

    const updated = await order.save();

    return {
      data: updated,
      success: true,
      code: HttpStatus.OK,
      message: 'Order updated',
    };
  }

  async remove(userId: string, id: string): Promise<BaseResponseTypeDTO> {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    await this.orderModel.findByIdAndDelete(id);

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Order deleted',
    };
  }

  async initiatePaystackPayment(userId: string, orderId: string): Promise<BaseResponseTypeDTO> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found.');
    }
    if (order.userId !== userId.toString()) {
      throw new ForbiddenException('You are not authorized to pay for this order.');
    }
    if (order.paymentStatus === 'paid') {
      return {
        data: { authorizationUrl: order.paymentAuthorizationUrl, reference: order.paymentReference },
        success: true,
        code: HttpStatus.OK,
        message: 'Order already paid',
      };
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new BadRequestException('PAYSTACK_SECRET_KEY not configured');
    }

    const reference = `FLX-${order.orderNumber}-${Date.now()}`;
    const payload = {
      amount: Math.round(order.totalAmount * 100), // kobo
      email: order.contactEmail || 'customer@feeluxe.ng',
      reference,
      currency: 'NGN',
      metadata: {
        orderId: order._id.toString(),
        userId,
        orderNumber: order.orderNumber,
      },
      callback_url: process.env.PAYSTACK_CALLBACK_URL,
    };

    const resp = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const respData = await resp.json();
    const authorizationUrl = respData?.data?.authorization_url;
    if (!resp.ok || !authorizationUrl) {
      throw new BadRequestException('Unable to initialize Paystack payment');
    }

    order.paymentStatus = 'initiated';
    order.paymentReference = reference;
    order.paymentProvider = 'paystack';
    order.paymentAuthorizationUrl = authorizationUrl;
    await order.save();

    return {
      data: {
        authorizationUrl,
        reference,
      },
      success: true,
      code: HttpStatus.OK,
      message: 'Paystack payment initialized',
    };
  }

  async handlePaystackWebhook(signature: string, body: any): Promise<void> {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new BadRequestException('PAYSTACK_SECRET_KEY not configured');
    }

    const computed = crypto
      .createHmac('sha512', secretKey)
      .update(JSON.stringify(body))
      .digest('hex');

    if (computed !== signature) {
      throw new ForbiddenException('Invalid signature');
    }

    const event = body?.event;
    const data = body?.data;
    if (event !== 'charge.success' || !data?.reference) {
      return;
    }

    const reference = data.reference;
    const orderId = data.metadata?.orderId;
    if (!orderId) {
      return;
    }

    const order = await this.orderModel.findOne({ _id: orderId, paymentReference: reference });
    if (!order) return;

    order.paymentStatus = 'paid';
    await order.save();
  }

  async calculateShippingEstimate(userId: string, cartItemIds: string[]): Promise<BaseResponseTypeDTO> {
    if (!cartItemIds || cartItemIds.length === 0) {
      return {
        data: { shippingCost: 0 },
        success: true,
        code: HttpStatus.OK,
        message: 'Shipping estimate calculated',
      };
    }

    // Verify cart items belong to user
    const cartItems = await this.cartItemModel
      .find({
        _id: { $in: cartItemIds.map((id) => new Types.ObjectId(id)) },
        customerId: new Types.ObjectId(userId),
      })
      .lean();

    if (!cartItems.length) {
      throw new NotFoundException('No cart items found');
    }

    // Dynamic shipping: pull latest configured cost
    const shippingCost = await this.shippingService.getCurrentCostValue();

    return {
      data: { shippingCost },
      success: true,
      code: HttpStatus.OK,
      message: 'Shipping estimate calculated',
    };
  }
}

