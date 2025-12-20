import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { AuditLog, AuditLogDocument } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { BaseResponseTypeDTO } from 'src/utils';
import { Customer, CustomerDocument } from 'src/customer/entities/customer.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async create(dto: CreateAuditLogDto, authToken?: string): Promise<BaseResponseTypeDTO> {
    try {
      let authenticatedCustomer: CustomerDocument | null = null;

      // Try to get authenticated customer from token
      if (authToken) {
        try {
          const tokenString = authToken.replace('Bearer ', '').trim();
          if (tokenString) {
            const decoded = this.jwtService.decode(tokenString) as any;
            if (decoded && decoded.sub) {
              authenticatedCustomer = await this.customerModel.findById(decoded.sub);
            }
          }
        } catch (error) {
          // Silently fail - token might be invalid or expired
          console.error('Error decoding token:', error);
        }
      }

      // Only save customer info if user is authenticated
      if (authenticatedCustomer) {
        // User is authenticated - save their info
        dto.customerId = authenticatedCustomer._id.toString();
        dto.userId = authenticatedCustomer._id.toString();
        dto.email = authenticatedCustomer.email;
        
        if (authenticatedCustomer.lastLogin) {
          dto.lastLogged = authenticatedCustomer.lastLogin.toISOString();
        }

        // Add customer info to metadata
        if (!dto.metadata) {
          dto.metadata = {};
        }
        dto.metadata.customerId = authenticatedCustomer._id.toString();
        dto.metadata.customerEmail = authenticatedCustomer.email;
      } else {
        // User is NOT authenticated - clear any customer-related fields
        // Don't save userId, customerId, or email for unauthenticated users
        delete dto.customerId;
        delete dto.userId;
        delete dto.email;
        delete dto.lastLogged;

        // Remove customer info from metadata if present
        if (dto.metadata) {
          delete dto.metadata.customerId;
          delete dto.metadata.customerEmail;
        }
      }

      // Convert lastLogged string to Date if provided
      const auditLogData: any = { ...dto };
      if (dto.lastLogged) {
        auditLogData.lastLogged = new Date(dto.lastLogged);
      }

      const auditLog = new this.auditLogModel(auditLogData);
      await auditLog.save();

      return {
        data: auditLog,
        success: true,
        code: 201,
        message: 'Audit log created successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        code: 500,
        message: 'Failed to create audit log',
      };
    }
  }

  async findAll(filters?: {
    page?: number;
    limit?: number;
    customerId?: string;
    userId?: string;
    email?: string;
    activity?: string;
  }): Promise<BaseResponseTypeDTO> {
    try {
      const query: any = {};

      if (filters?.customerId) {
        query.customerId = filters.customerId;
      }

      if (filters?.userId) {
        query.userId = filters.userId;
      }

      if (filters?.email) {
        query.email = filters.email;
      }

      if (filters?.activity) {
        query.activity = { $regex: filters.activity, $options: 'i' };
      }

      const limit = filters?.limit || 50;
      const page = filters?.page || 1;
      const skip = (page - 1) * limit;

      const totalCount = await this.auditLogModel.countDocuments(query);

      const data = await this.auditLogModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return {
        data: {
          totalCount,
          data,
          page,
          limit,
        },
        success: true,
        code: 200,
        message: 'Audit logs fetched successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        code: 500,
        message: 'Failed to fetch audit logs',
      };
    }
  }

  async findByCustomerId(customerId: string): Promise<BaseResponseTypeDTO> {
    try {
      const data = await this.auditLogModel
        .find({ customerId })
        .sort({ createdAt: -1 })
        .limit(100);

      return {
        data,
        success: true,
        code: 200,
        message: 'Customer audit logs fetched successfully',
      };
    } catch (error) {
      return {
        data: null,
        success: false,
        code: 500,
        message: 'Failed to fetch customer audit logs',
      };
    }
  }
}

