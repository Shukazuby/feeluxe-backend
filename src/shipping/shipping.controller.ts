import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BaseResponseTypeDTO } from 'src/utils';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { ShippingService } from './shipping.service';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update shipping cost' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Shipping cost saved' })
  create(@Body() payload: CreateShippingDto): Promise<BaseResponseTypeDTO> {
    return this.shippingService.create(payload);
  }

  @Get()
  @ApiOperation({ summary: 'Get current shipping cost' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Shipping cost fetched' })
  getCurrent(): Promise<BaseResponseTypeDTO> {
    return this.shippingService.getCurrent();
  }
}

