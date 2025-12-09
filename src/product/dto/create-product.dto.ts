import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Rice' })
  name: string;

  @ApiProperty({ example: 100 })
  amount: number;

  @ApiProperty({ example: 'Rice is good' })
  description?: string;

  @ApiProperty({ example: 'Main' })
  category?: string;

  @ApiProperty({ example: 'https://cloudinary.com/image' })
  imageUrl?: string;

  @ApiProperty({ required: false, example: 15000, description: 'Alias for amount used by the frontend' })
  price?: number;

  @ApiProperty({ required: false, example: true })
  isNew?: boolean;

  @ApiProperty({ required: false, example: true })
  isFeatured?: boolean;

}

export class PaginationFilterDTO {
  @ApiProperty({
    required: false,
    description: 'Number of records per page',
    type: Number,
  })
  limit?: number;

  @ApiProperty({
    required: false,
    description: 'Page number for pagination',
    type: Number,
  })
  page?: number;

  @ApiProperty({
    required: false,
    description: 'Search term to filter the results',
    type: String,
  })
  search?: string;

  @ApiProperty({
    required: false,
    description: 'Category',
    type: String,
  })
  category?: string;


}
