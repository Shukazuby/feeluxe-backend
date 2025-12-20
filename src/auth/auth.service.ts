import { ConflictException, HttpStatus, Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { Model } from 'mongoose';
import { BaseResponseTypeDTO, sendEmail } from 'src/utils';
import { Customer, CustomerDocument } from 'src/customer/entities/customer.entity';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { randomBytes, createHash as nodeCreateHash } from 'crypto';

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

    // Update last login
    customer.lastLogin = new Date();
    await customer.save();

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

  async forgotPassword(payload: ForgotPasswordDto): Promise<BaseResponseTypeDTO> {
    const email = payload.email.toLowerCase().trim();
    const customer = await this.customerModel.findOne({ email });
    if (!customer) {
      throw new NotFoundException('No account found with this email');
    }

    const code = (Math.floor(1000 + Math.random() * 9000)).toString(); // 4-digit code
    const hashed = nodeCreateHash('sha256').update(code).digest('hex');
    customer.resetPasswordCode = hashed;
    customer.resetPasswordCodeExpires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
    await customer.save();

    sendEmail(
      `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0f172a;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
        <tr>
          <td align="center">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="520" style="background:#0b1220;border-radius:18px;overflow:hidden;box-shadow:0 18px 38px rgba(0,0,0,0.35);">
              <tr>
                <td style="padding:24px 26px 28px;background:linear-gradient(145deg,#F4C2C2, #F9A8D4);color:#fff;">
                  <div style="font-size:21px;font-weight:800;">Reset your password</div>
                  <div style="margin-top:6px;font-size:13px;opacity:0.9;">Use the 4-digit code below to reset your password.</div>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 22px;color:#e2e8f0;">
                  <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#cbd5e1;">
                    We received a request to reset your Feeluxe.ng account password. Enter this code in the reset form:
                  </p>
                  <div style="margin:12px 0;padding:14px 16px;border:1px dashed #1f2937;border-radius:12px;background:rgba(148,163,184,0.08);text-align:center;font-size:22px;font-weight:800;letter-spacing:6px;color:#e2e8f0;">
                    ${code}
                  </div>
                  <p style="margin:12px 0 0;font-size:13px;color:#94a3b8;line-height:1.5;">
                    This code expires in 15 minutes. If you did not request this, you can ignore this email—your password will remain unchanged.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      `,
      'Your Feeluxe.ng password reset code',
      email,
    ).catch((err) => console.error('Forgot password email failed', err));

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Password reset email sent',
    };
  }

  async resetPassword(payload: ResetPasswordDto): Promise<BaseResponseTypeDTO> {
    const hashed = nodeCreateHash('sha256').update(payload.code).digest('hex');
    const now = new Date();
    const customer = await this.customerModel.findOne({
      email: payload.email.toLowerCase().trim(),
      resetPasswordCode: hashed,
      resetPasswordCodeExpires: { $gt: now },
    });

    if (!customer) {
      throw new BadRequestException('Reset token is invalid or has expired');
    }

    customer.passwordHash = this.hashPassword(payload.password);
    customer.resetPasswordCode = undefined;
    customer.resetPasswordCodeExpires = undefined;
    await customer.save();

    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Password reset successful. You can now log in.',
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
      lastLogin: customer.lastLogin,
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

