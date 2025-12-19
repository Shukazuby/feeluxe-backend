import { Body, Controller, Get, HttpStatus, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BaseResponseTypeDTO } from 'src/utils';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminRegisterDto } from './dto/admin-register.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly dashboardService: AdminDashboardService,
  ) {}

  @Post('register')
  // @UseGuards(AdminJwtAuthGuard)
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new admin user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Admin created successfully' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Admin with this email already exists' })
  register(@Body() payload: AdminRegisterDto): Promise<BaseResponseTypeDTO> {
    return this.adminService.register(payload);
  }

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
  login(@Body() payload: AdminLoginDto): Promise<BaseResponseTypeDTO> {
    return this.adminService.login(payload);
  }

  @Get('me')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current admin profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Profile fetched' })
  me(@Request() req): Promise<BaseResponseTypeDTO> {
    return this.adminService.me(req.user.id);
  }

  @Get('dashboard/stats')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Statistics fetched' })
  getStats(): Promise<BaseResponseTypeDTO> {
    return this.dashboardService.getStats();
  }

  @Get('dashboard/recent-orders')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recent orders' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Recent orders fetched' })
  getRecentOrders(): Promise<BaseResponseTypeDTO> {
    return this.dashboardService.getRecentOrders();
  }
}

