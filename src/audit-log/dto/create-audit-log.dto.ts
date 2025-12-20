import { IsOptional, IsString, IsNumber, IsObject, IsDateString } from 'class-validator';

export class CreateAuditLogDto {
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  visitedPage?: string;

  @IsOptional()
  @IsString()
  activity?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsString()
  browser?: string;

  @IsOptional()
  @IsString()
  os?: string;

  @IsOptional()
  @IsString()
  customerId?: string; // Customer ID

  @IsOptional()
  @IsString()
  userId?: string; // Generic user ID (can be customer or admin)

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsDateString()
  lastLogged?: string; // User's last login timestamp

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsNumber()
  statusCode?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  referer?: string;
}

