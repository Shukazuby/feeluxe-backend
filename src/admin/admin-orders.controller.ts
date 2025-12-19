import {
  Controller,
  Get,
  Patch,
  Param,
  HttpStatus,
  Query,
  UseGuards,
  Body,
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
import { OrderService } from 'src/order/order.service';
import { UpdateOrderDto } from 'src/order/dto/update-order.dto';
import { OrderFilterDto } from 'src/order/dto/create-order.dto';
import { Order, OrderDocument } from 'src/order/entities/order.entity';

@ApiTags('Admin - Orders')
@Controller('admin/orders')
@UseGuards(AdminJwtAuthGuard)
@ApiBearerAuth()
export class AdminOrdersController {
  constructor(
    private readonly orderService: OrderService,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders (paginated)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Orders fetched' })
  async findAll(@Query() filters: OrderFilterDto): Promise<BaseResponseTypeDTO> {
    // For admin, get all orders without userId filter
    const query: any = {};
    
    // Filter by status
    if (filters.status) {
      query.status = filters.status;
    }
    
    // Search
    if (filters.search) {
      query.orderNumber = { $regex: filters.search.trim(), $options: 'i' };
    }
    
    // Date range
    if (filters.startDate || filters.endDate) {
      query.placedAt = {};
      if (filters.startDate) {
        query.placedAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.placedAt.$lte = new Date(filters.endDate);
      }
    }
    
    // Pagination
    const limit = filters.limit || 50;
    const page = filters.page || 1;
    const skip = (page - 1) * limit;
    
    const totalCount = await this.orderModel.countDocuments(query);
    const data = await this.orderModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    return {
      data: {
        totalCount,
        data,
      },
      success: true,
      code: HttpStatus.OK,
      message: 'Orders fetched',
      limit,
      page,
      search: filters.search,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order fetched' })
  async getOne(@Param('id') id: string): Promise<BaseResponseTypeDTO> {
    const order = await this.orderModel.findById(id);
    if (!order) {
      return {
        success: false,
        code: HttpStatus.NOT_FOUND,
        message: 'Order not found',
      };
    }
    return {
      data: order,
      success: true,
      code: HttpStatus.OK,
      message: 'Order fetched',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order updated' })
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateOrderDto,
  ): Promise<BaseResponseTypeDTO> {
    return this.orderService.update(id, payload);
  }
}

