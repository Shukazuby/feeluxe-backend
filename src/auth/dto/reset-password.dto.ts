import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: '1234', description: '4-digit reset code' })
  code: string;

  @ApiProperty({ example: 'newStrongPassword123!' })
  password: string;
}


