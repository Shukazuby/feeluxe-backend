import { ApiProperty } from '@nestjs/swagger';

export class CreateNewsletterDto {
  @ApiProperty({ example: 'subscriber@example.com', description: 'Email address to subscribe' })
  email: string;
}

