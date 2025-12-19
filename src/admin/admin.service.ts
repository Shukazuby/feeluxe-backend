import { Injectable, UnauthorizedException, HttpStatus, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { Model } from 'mongoose';
import { BaseResponseTypeDTO } from 'src/utils';
import { Admin, AdminDocument } from './entities/admin.entity';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminRegisterDto } from './dto/admin-register.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name)
    private readonly adminModel: Model<AdminDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(payload: AdminRegisterDto): Promise<BaseResponseTypeDTO> {
    const email = payload.email.toLowerCase().trim();

    const existing = await this.adminModel.findOne({ email });
    if (existing) {
      throw new ConflictException('An admin with this email already exists');
    }

    const admin = new this.adminModel({
      name: payload.name,
      email,
      passwordHash: this.hashPassword(payload.password),
      isActive: true,
    });

    const saved = await admin.save();

    return {
      data: this.mapProfile(saved),
      success: true,
      code: HttpStatus.CREATED,
      message: 'Admin created successfully',
    };
  }

  async login(payload: AdminLoginDto): Promise<BaseResponseTypeDTO> {
    const email = payload.email.toLowerCase();
    const admin = await this.adminModel.findOne({ email, isActive: true });


    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordHash = this.hashPassword(payload.password);
    if (admin.passwordHash !== passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = this.signToken(admin._id.toString());

    return {
      data: {
        token,
        admin: this.mapProfile(admin),
      },
      success: true,
      code: HttpStatus.OK,
      message: 'Login successful',
    };
  }

  async findById(adminId: string): Promise<AdminDocument | null> {
    return this.adminModel.findById(adminId);
  }

  async me(adminId: string): Promise<BaseResponseTypeDTO> {
    const admin = await this.adminModel.findById(adminId);
    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    return {
      data: this.mapProfile(admin),
      success: true,
      code: HttpStatus.OK,
      message: 'Profile fetched',
    };
  }

  private mapProfile(admin: AdminDocument) {
    return {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      lastLogin: admin.lastLogin,
    };
  }

  private signToken(adminId: string): string {
    return this.jwtService.sign(
      { sub: adminId, role: 'admin' },
      {
        expiresIn: '7d',
      },
    );
  }

  private hashPassword(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }
}

