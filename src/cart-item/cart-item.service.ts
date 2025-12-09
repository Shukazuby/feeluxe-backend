import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseResponseTypeDTO } from 'src/utils';
import { Product, ProductDocument } from 'src/product/entities/product.entity';
import { CartItem, CartItemDocument } from './entities/cart-item.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';

@Injectable()
export class CartItemService {
  constructor(
    @InjectModel(CartItem.name)
    private readonly cartItemModel: Model<CartItemDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async add(customerId: string, dto: CreateCartItemDto): Promise<BaseResponseTypeDTO> {
    const product = await this.productModel.findById(dto.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.cartItemModel.findOne({
      customerId: new Types.ObjectId(customerId),
      productId: new Types.ObjectId(dto.productId),
    });

    if (existing) {
      existing.quantity += dto.quantity || 1;
      await existing.save();
      return this.getCart(customerId);
    }

    const cartItem = new this.cartItemModel({
      customerId: new Types.ObjectId(customerId),
      productId: new Types.ObjectId(dto.productId),
      quantity: dto.quantity || 1,
    });
    await cartItem.save();
    return this.getCart(customerId);
  }

  async remove(customerId: string, cartItemId: string): Promise<BaseResponseTypeDTO> {
    const item = await this.cartItemModel.findOne({
      _id: new Types.ObjectId(cartItemId),
      customerId: new Types.ObjectId(customerId),
    });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }
    await this.cartItemModel.deleteOne({ _id: item._id });
    return this.getCart(customerId);
  }

  async clear(customerId: string): Promise<void> {
    await this.cartItemModel.deleteMany({ customerId: new Types.ObjectId(customerId) });
  }

  async getCart(customerId: string): Promise<BaseResponseTypeDTO> {
    const items = await this.cartItemModel
      .find({ customerId: new Types.ObjectId(customerId) })
      .sort({ createdAt: -1 });

    const productIds = items.map((i) => i.productId);
    const products = await this.productModel.find({ _id: { $in: productIds } });
    const productMap = new Map<string, ProductDocument>();
    products.forEach((p) => productMap.set(p._id.toString(), p));

    let total = 0;
    const cart = items.map((item) => {
      const product = productMap.get(item.productId.toString());
      const price = product ? product.amount ?? product.price ?? 0 : 0;
      const lineTotal = price * item.quantity;
      total += lineTotal;
      return {
        id: item._id.toString(),
        productId: item.productId.toString(),
        quantity: item.quantity,
        product: product
          ? {
              id: product._id.toString(),
              name: product.name,
              price,
              image: product.imageurl,
              category: product.category,
            }
          : null,
        lineTotal,
      };
    });

    return {
      data: { cart, total },
      success: true,
      code: 200,
      message: 'Cart fetched',
    };
  }

  async findByIds(customerId: string, ids: string[]) {
    const objectIds = ids.map((id) => new Types.ObjectId(id));
    return this.cartItemModel.find({
      _id: { $in: objectIds },
      customerId: new Types.ObjectId(customerId),
    });
  }
}

