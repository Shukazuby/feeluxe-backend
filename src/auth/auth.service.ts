import { ConflictException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { Model } from 'mongoose';
import { BaseResponseTypeDTO } from 'src/utils';
import { Customer, CustomerDocument } from 'src/customer/entities/customer.entity';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async login(payload: LoginDto): Promise<BaseResponseTypeDTO> {
    const email = payload.email.toLowerCase();
    const customer = await this.customerModel.findOne({ email });

    if (!customer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordHash = this.hashPassword(payload.password);
    if (customer.passwordHash !== passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.signToken(customer._id.toString());

    return {
      data: {
        token,
        customer: this.mapProfile(customer),
      },
      success: true,
      code: HttpStatus.OK,
      message: 'Login successful',
    };
  }

  async me(userId: string): Promise<BaseResponseTypeDTO> {
    const customer = await this.customerModel.findById(userId);
    if (!customer) {
      throw new UnauthorizedException('User not found');
    }

    return {
      data: this.mapProfile(customer),
      success: true,
      code: HttpStatus.OK,
      message: 'Profile fetched',
    };
  }

  private mapProfile(customer: CustomerDocument) {
    return {
      id: customer._id.toString(),
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      avatarUrl: customer.avatarUrl,
    };
  }

  private signToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId },
      {
        expiresIn: '7d',
      },
    );
  }

  private hashPassword(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }
}

