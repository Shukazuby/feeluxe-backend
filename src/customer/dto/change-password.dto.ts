import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password for validation' })
  currentPassword: string;

  @ApiProperty({ description: 'New password to set for the customer' })
  newPassword: string;
}

