import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHash } from 'crypto';
import { Model, Types } from 'mongoose';
import { BaseResponseTypeDTO, sendEmail } from 'src/utils';
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
      throw new BadRequestException('An account with this email already exists. Please log in.');
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

    // Fire-and-forget welcome email; do not block signup if it fails
    sendEmail(
      `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0f172a;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
        <tr>
          <td align="center">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="background:#0b1220;border-radius:18px;overflow:hidden;box-shadow:0 18px 38px rgba(0,0,0,0.35);">
              <tr>
                <td style="padding:28px 30px 34px;background:linear-gradient(145deg,#F4C2C2, #F9A8D4);color:#fff;">
                  <div style="display:flex;align-items:center;gap:14px;">
                    <div style="font-size:21px;font-weight:800;letter-spacing:0.3px;">Feeluxe.ng</div>
                  </div>
                  <div style="margin-top:18px;font-size:28px;font-weight:800;line-height:1.3;">
                    Welcome${payload.name ? `, ${payload.name.split(' ')[0]}` : ''}!
                  </div>
                  <div style="margin-top:8px;font-size:14px">Timeless luxury, inspired by heritage.</div>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 30px;background:#0b1220;color:#e2e8f0;">
                  <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#cbd5e1;">
                    We’re thrilled to have you at Feeluxe.ng. Explore curated pieces, save your wishlist,
                    and check out seamlessly.
                  </p>
                  <div style="margin:18px 0;padding:18px;border:1px solid #1f2937;border-radius:14px;background:linear-gradient(135deg,rgba(236,72,153,0.08),rgba(168,85,247,0.08));">
                    <div style="font-weight:800;color:#e879f9;font-size:14px;margin-bottom:8px;">Get started</div>
                    <ul style="margin:0;padding-left:18px;color:#cbd5e1;font-size:14px;line-height:1.6;">
                      <li>Browse new arrivals and featured drops.</li>
                      <li>Save favorites to your wishlist.</li>
                      <li>Checkout securely with Paystack.</li>
                    </ul>
                  </div>
                  <a href="https://feeluxe-frontend.vercel.app" style="display:inline-block;margin-top:6px;background: #F9A8D4;color:#fff;text-decoration:none;font-weight:800;padding:13px 18px;border-radius:12px;box-shadow:0 10px 24px rgb(232, 162, 197);">
                    Start exploring
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 28px 22px;border-top:1px solid #111827;color:#94a3b8;font-size:12px;text-align:center;background:#0b1220;">
                  You’re receiving this email because you created an account on Feeluxe.ng.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      `,
      'Welcome to Feeluxe.ng',
      payload.email,
    ).catch((err) => console.error('Welcome email failed', err));

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

  async deleteAccount(userId: string): Promise<BaseResponseTypeDTO> {
    const customer = await this.customerModel.findById(userId);
    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }

    await this.customerModel.deleteOne({ _id: userId });

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Account deleted',
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

