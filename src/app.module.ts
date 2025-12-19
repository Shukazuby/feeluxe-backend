import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as dotenv from 'dotenv';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { CustomerModule } from './customer/customer.module';
import { ContactModule } from './contact/contact.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { CartItemModule } from './cart-item/cart-item.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { ShippingModule } from './shipping/shipping.module';
import { AdminModule } from './admin/admin.module';
dotenv.config();
@Module({
  imports: [
    MongooseModule.forRoot(String(process.env.MONGODB_URL).trim()),
    ProductModule,
    OrderModule,
    CustomerModule,
    ContactModule,
    AuthModule,
    CartModule,
    CartItemModule,
    NewsletterModule,
    ShippingModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
