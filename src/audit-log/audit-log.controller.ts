import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  HttpStatus,
  Req,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { BaseResponseTypeDTO } from 'src/utils';

@ApiTags('Audit Log')
@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Post()
  @ApiOperation({ summary: 'Create an audit log entry' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Audit log created successfully',
  })
  async create(
    @Body() createAuditLogDto: CreateAuditLogDto,
    @Req() req: any,
    @Headers('authorization') authHeader?: string,
  ): Promise<BaseResponseTypeDTO> {
    // Auto-fill IP address from request if not provided
    if (!createAuditLogDto.ipAddress) {
      createAuditLogDto.ipAddress =
        req.ip ||
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.connection?.remoteAddress ||
        'unknown';
    }

    // Auto-fill user agent if not provided
    if (!createAuditLogDto.userAgent) {
      createAuditLogDto.userAgent = req.headers['user-agent'] || 'unknown';
    }

    // Extract auth token from header
    const authToken = authHeader || req.headers?.authorization;

    return this.auditLogService.create(createAuditLogDto, authToken);
  }

  @Get()
  @ApiOperation({ summary: 'Get all audit logs (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiQuery({ name: 'activity', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audit logs fetched successfully',
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('customerId') customerId?: string,
    @Query('userId') userId?: string,
    @Query('email') email?: string,
    @Query('activity') activity?: string,
  ): Promise<BaseResponseTypeDTO> {
    return this.auditLogService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      customerId,
      userId,
      email,
      activity,
    });
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get audit logs for a specific customer' })
  @ApiParam({ name: 'customerId', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer audit logs fetched successfully',
  })
  async findByCustomerId(
    @Param('customerId') customerId: string,
  ): Promise<BaseResponseTypeDTO> {
    return this.auditLogService.findByCustomerId(customerId);
  }
}

