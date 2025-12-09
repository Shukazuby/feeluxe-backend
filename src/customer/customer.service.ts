import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHash } from 'crypto';
import { Model, Types } from 'mongoose';
import { BaseResponseTypeDTO } from 'src/utils';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart-item.dto';
import { WishlistDto } from './dto/wishlist.dto';
import { Customer, CustomerDocument } from './entities/customer.entity';
import { Product, ProductDocument } from 'src/product/entities/product.entity';

type ProductSnapshot = {
  id: string;
  name: string;
  price: number;
  image: string | undefined;
  category?: string;
};

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(payload: CreateCustomerDto): Promise<BaseResponseTypeDTO> {
    const existing = await this.customerModel.findOne({ email: payload.email.toLowerCase() });
    if (existing) {
      return {
        data: existing,
        success: true,
        code: HttpStatus.OK,
        message: 'Customer already exists',
      };
    }

    const customer = new this.customerModel({
      name: payload.name,
      email: payload.email.toLowerCase(),
      phone: payload.phone,
      address: payload.address,
      avatarUrl: payload.avatarUrl,
      passwordHash: payload.password ? this.hashPassword(payload.password) : undefined,
    });

    const saved = await customer.save();

    return {
      data: saved,
      success: true,
      code: HttpStatus.CREATED,
      message: 'Customer created',
    };
  }

  async findCus(id: string) {
    return this.customerModel.findById(id).exec();
  }

  async findOne(id: string): Promise<BaseResponseTypeDTO> {
    const customer = await this.customerModel.findById(id);
    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }

    return {
      data: customer,
      success: true,
      code: HttpStatus.OK,
      message: 'Customer fetched',
    };
  }

  async updateProfile(userId: string, payload: UpdateCustomerDto): Promise<BaseResponseTypeDTO> {
    const customer = await this.customerModel.findById(userId);
    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }

    if (payload.name) customer.name = payload.name;
    if (payload.phone) customer.phone = payload.phone;
    if (payload.address) customer.address = payload.address;
    if (payload.avatarUrl) customer.avatarUrl = payload.avatarUrl;

    const updated = await customer.save();

    return {
      data: updated,
      success: true,
      code: HttpStatus.OK,
      message: 'Profile updated',
    };
  }

  async changePassword(userId: string, payload: ChangePasswordDto): Promise<BaseResponseTypeDTO> {
    const customer = await this.customerModel.findById(userId);
    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }

    if (customer.passwordHash && customer.passwordHash !== this.hashPassword(payload.currentPassword)) {
      throw new BadRequestException('Current password is incorrect');
    }

    customer.passwordHash = this.hashPassword(payload.newPassword);
    await customer.save();

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Password updated',
    };
  }

    async getWishlist(userId: string): Promise<BaseResponseTypeDTO> {
    const customer = await this.customerModel.findById(userId);
    if (!customer) throw new NotFoundException('Customer not found.');

    const products = await this.productModel.find({
      _id: { $in: customer.wishlist },
    });

    return {
      data: products,
      success: true,
      code: HttpStatus.OK,
      message: 'Wishlist fetched',
    };
  }

  async addToWishlist(userId: string, dto: WishlistDto): Promise<BaseResponseTypeDTO> {
    const customer = await this.customerModel.findById(userId);
    if (!customer) throw new NotFoundException('Customer not found.');

    const product = await this.productModel.findById(dto.productId);
    if (!product) throw new NotFoundException('Product not found.');

    const targetId = new Types.ObjectId(dto.productId);
    if (!customer.wishlist.find((p) => p.equals(targetId))) {
      customer.wishlist.push(targetId);
    }

    await customer.save();

    const products = await this.productModel.find({ _id: { $in: customer.wishlist } });
    return {
      data: products,
      success: true,
      code: HttpStatus.OK,
      message: 'Wishlist updated',
    };
  }

  async removeFromWishlist(userId: string, productId: string): Promise<BaseResponseTypeDTO> {
    const customer = await this.customerModel.findById(userId);
    if (!customer) throw new NotFoundException('Customer not found.');

    const targetId = new Types.ObjectId(productId);
    customer.wishlist = customer.wishlist.filter((p) => !p.equals(targetId));
    await customer.save();

    const products = await this.productModel.find({ _id: { $in: customer.wishlist } });
    return {
      data: products,
      success: true,
      code: HttpStatus.OK,
      message: 'Item removed from wishlist',
    };
  }

  private hashPassword(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }

  private async buildCartPayload(customer: CustomerDocument) {
    const ids = customer.cart.map((c) => c.productId);
    const products = await this.productModel.find({ _id: { $in: ids } });
    const productMap = new Map<string, ProductSnapshot>();

    products.forEach((p) => {
      productMap.set(p._id.toString(), {
        id: p._id.toString(),
        name: p.name,
        price: p.amount ?? p.price ?? 0,
        image: p.imageurl,
        category: p.category,
      });
    });

    let total = 0;
    const cart = customer.cart.map((item) => {
      const product = productMap.get(item.productId.toString());
      const lineTotal = (product?.price || 0) * item.quantity;
      total += lineTotal;
      return {
        product,
        quantity: item.quantity,
        lineTotal,
      };
    });

    return { cart, total };
  }
}

