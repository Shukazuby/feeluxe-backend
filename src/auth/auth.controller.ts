import { Body, Controller, Get, HttpStatus, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BaseResponseTypeDTO } from 'src/utils';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
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

}

