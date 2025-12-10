import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';
import { Shipping, ShippingSchema } from './entities/shipping.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Shipping.name, schema: ShippingSchema }])],
  controllers: [ShippingController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}

