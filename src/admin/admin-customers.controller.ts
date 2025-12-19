import {
  Controller,
  Get,
  Param,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseResponseTypeDTO } from 'src/utils';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';
import { Customer, CustomerDocument } from 'src/customer/entities/customer.entity';

@ApiTags('Admin - Customers')
@Controller('admin/customers')
@UseGuards(AdminJwtAuthGuard)
@ApiBearerAuth()
export class AdminCustomersController {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all customers (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Customers fetched' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ): Promise<BaseResponseTypeDTO> {
    const searchFilter: any = {};
    
    if (search) {
      searchFilter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const limitNum = limit || 50;
    const pageNum = page || 1;
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await this.customerModel.countDocuments(searchFilter);
    const customers = await this.customerModel
      .find(searchFilter)
      .select('-passwordHash -resetPasswordCode -resetPasswordCodeExpires')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 })
      .lean();

    return {
      data: {
        totalCount,
        data: customers.map((c) => ({
          id: c._id.toString(),
          name: c.name,
          email: c.email,
          phone: c.phone,
          address: c.address,
          createdAt: c.createdAt,
        })),
      },
      success: true,
      code: HttpStatus.OK,
      message: 'Customers fetched',
      limit: limitNum,
      page: pageNum,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Customer fetched' })
  async getOne(@Param('id') id: string): Promise<BaseResponseTypeDTO> {
    const customer = await this.customerModel.findById(id).select('-passwordHash -resetPasswordCode -resetPasswordCodeExpires');
    if (!customer) {
      return {
        success: false,
        code: HttpStatus.NOT_FOUND,
        message: 'Customer not found',
      };
    }
    return {
      data: {
        id: customer._id.toString(),
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        createdAt: customer.createdAt,
      },
      success: true,
      code: HttpStatus.OK,
      message: 'Customer fetched',
    };
  }
}

