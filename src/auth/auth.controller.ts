import { Body, Controller, Get, HttpStatus, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BaseResponseTypeDTO } from 'src/utils';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login and retrieve JWT' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
  login(@Body() payload: LoginDto): Promise<BaseResponseTypeDTO> {
    return this.authService.login(payload);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send password reset email' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Reset email sent' })
  forgotPassword(@Body() payload: ForgotPasswordDto): Promise<BaseResponseTypeDTO> {
    return this.authService.forgotPassword(payload);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Password reset successful' })
  resetPassword(@Body() payload: ResetPasswordDto): Promise<BaseResponseTypeDTO> {
    return this.authService.resetPassword(payload);
  }
}

