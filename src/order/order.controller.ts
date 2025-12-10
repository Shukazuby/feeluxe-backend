import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BaseResponseTypeDTO } from 'src/utils';
import { CreateOrderDto, OrderFilterDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ShippingEstimateDto } from './dto/shipping-estimate.dto';
import { OrderService } from './order.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new order from cart items' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Order created' })
  create(@Body() payload: CreateOrderDto, @Request() req,
): Promise<BaseResponseTypeDTO> {
    return this.orderService.create(req.user.id, payload);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List orders with filters for the frontend' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Orders fetched' })
  findAll(@Query() filters: OrderFilterDto, @Request() req): Promise<BaseResponseTypeDTO> {
    return this.orderService.findAll(req.user.id, filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single order by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order fetched' })
  findOne(@Param('id') id: string, @Request() req): Promise<BaseResponseTypeDTO> {
    return this.orderService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order status or address' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order updated' })
  update(
    @Param('id') id: string,
    @Body() payload: UpdateOrderDto,
  ): Promise<BaseResponseTypeDTO> {
    return this.orderService.update(id, payload);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove an order' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order deleted' })
  remove(@Param('id') id: string, @Request() req): Promise<BaseResponseTypeDTO> {
    return this.orderService.remove(req.user.id, id);
  }

  @Post(':id/paystack/initialize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize Paystack payment for an order' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment initialized' })
  paystackInitialize(@Param('id') id: string, @Request() req): Promise<BaseResponseTypeDTO> {
    return this.orderService.initiatePaystackPayment(req.user.id, id);
  }

  @Post('paystack/webhook')
  @ApiOperation({ summary: 'Paystack webhook handler' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Webhook received' })
  async paystackWebhook(@Body() body: any, @Request() req): Promise<BaseResponseTypeDTO> {
    const signature = req.headers['x-paystack-signature'] as string;
    await this.orderService.handlePaystackWebhook(signature, body);
    return {
      success: true,
      code: HttpStatus.OK,
      message: 'Webhook processed',
    };
  }

  @Post('shipping/estimate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shipping cost estimate for cart items' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Shipping estimate calculated' })
  async getShippingEstimate(@Body() payload: ShippingEstimateDto, @Request() req): Promise<BaseResponseTypeDTO> {
    return this.orderService.calculateShippingEstimate(req.user.id, payload.cartItemIds);
  }
}

