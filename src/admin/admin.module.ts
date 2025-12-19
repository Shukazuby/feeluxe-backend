import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Admin, AdminSchema } from './entities/admin.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminProductsController } from './admin-products.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminCustomersController } from './admin-customers.controller';
import { AdminNewsletterController } from './admin-newsletter.controller';
import { ProductModule } from 'src/product/product.module';
import { OrderModule } from 'src/order/order.module';
import { CustomerModule } from 'src/customer/customer.module';
import { Product, ProductSchema } from 'src/product/entities/product.entity';
import { Order, OrderSchema } from 'src/order/entities/order.entity';
import { Customer, CustomerSchema } from 'src/customer/entities/customer.entity';
import { Newsletter, NewsletterSchema } from 'src/newsletter/entities/newsletter.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Newsletter.name, schema: NewsletterSchema },
    ]),
    ProductModule,
    OrderModule,
    CustomerModule,
  ],
  controllers: [
    AdminController,
    AdminProductsController,
    AdminOrdersController,
    AdminCustomersController,
    AdminNewsletterController,
  ],
  providers: [AdminService, AdminJwtStrategy, AdminDashboardService],
  exports: [AdminService],
})
export class AdminModule {}

