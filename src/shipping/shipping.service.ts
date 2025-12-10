import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseResponseTypeDTO } from 'src/utils';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { Shipping, ShippingDocument } from './entities/shipping.entity';

@Injectable()
export class ShippingService {
  constructor(
    @InjectModel(Shipping.name)
    private readonly shippingModel: Model<ShippingDocument>,
  ) {}

  async create(payload: CreateShippingDto): Promise<BaseResponseTypeDTO> {
    if (payload.cost <= 0) {
      throw new BadRequestException('Shipping cost must be greater than zero');
    }
    const record = new this.shippingModel({
      cost: payload.cost,
      name: payload.name,
    });
    const saved = await record.save();
    return {
      data: saved,
      success: true,
      code: HttpStatus.CREATED,
      message: 'Shipping cost saved',
    };
  }

  async getCurrent(): Promise<BaseResponseTypeDTO> {
    const latest = await this.shippingModel.findOne().sort({ createdAt: -1 });
    return {
      data: { cost: latest?.cost || 0 },
      success: true,
      code: HttpStatus.OK,
      message: 'Shipping cost fetched',
    };
  }

  async getCurrentCostValue(): Promise<number> {
    const latest = await this.shippingModel.findOne().sort({ createdAt: -1 });
    return latest?.cost ?? 0;
  }
}

