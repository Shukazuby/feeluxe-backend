import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';
import { AuditLog, AuditLogSchema } from './entities/audit-log.entity';
import { Customer, CustomerSchema } from 'src/customer/entities/customer.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Customer.name, schema: CustomerSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
    }),
  ],
  controllers: [AuditLogController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}

