import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseResponseTypeDTO } from 'src/utils';
import { Order, OrderDocument } from 'src/order/entities/order.entity';
import { Product, ProductDocument } from 'src/product/entities/product.entity';
import { Customer, CustomerDocument } from 'src/customer/entities/customer.entity';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Customer.name) private readonly customerModel: Model<CustomerDocument>,
  ) {}

  async getStats(): Promise<BaseResponseTypeDTO> {
    const [
      totalOrders,
      totalProducts,
      totalCustomers,
      totalRevenue,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      recentOrdersCount,
    ] = await Promise.all([
      this.orderModel.countDocuments(),
      this.productModel.countDocuments(),
      this.customerModel.countDocuments(),
      this.orderModel.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      this.orderModel.countDocuments({ status: 'pending' }),
      this.orderModel.countDocuments({ status: 'shipped' }),
      this.orderModel.countDocuments({ status: 'delivered' }),
      this.orderModel.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    const revenue = totalRevenue[0]?.total || 0;

    return {
      data: {
        totalOrders,
        totalProducts,
        totalCustomers,
        totalRevenue: revenue,
        pendingOrders,
        shippedOrders,
        deliveredOrders,
        recentOrdersCount,
      },
      success: true,
      code: HttpStatus.OK,
      message: 'Statistics fetched',
    };
  }

  async getRecentOrders(): Promise<BaseResponseTypeDTO> {
    const orders = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return {
      data: orders,
      success: true,
      code: HttpStatus.OK,
      message: 'Recent orders fetched',
    };
  }
}

