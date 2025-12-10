import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProductService } from './product.service';
import {
  CreateProductDto,
  PaginationFilterDTO,
} from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BaseResponseTypeDTO } from 'src/utils';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}


  @Post('upload/img')
  @ApiOperation({ summary: 'Create a Product' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Product created',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Scarf' },
        amount: { type: 'number',  format: 'float', example: 999.99},
        description: { type: 'string', example: 'Vintage Scarf for women' },
        category: { type: 'string', example: 'Vintage'},
        isNew: { type: 'boolean', example: 'false'},
        isFeatured: { type: 'boolean', example: 'false'},
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      // required: ['name', 'amount', 'productType', 'category', 'image']
    },
  })
  create(
    @Body() createPostDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productService.create(createPostDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Admin find all products' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Get all products' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @ApiQuery({
    name: 'productType',
    required: false,
    description: 'Filter by product type (optional)',
  })
  async findByProductTypes(
    @Query() filters: PaginationFilterDTO,
  ): Promise<BaseResponseTypeDTO> {
    const result = await this.productService.findByProductTypes(
      filters,
    );
    return result;
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by keyword' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Search results' })
  async search(@Query() filters: PaginationFilterDTO): Promise<BaseResponseTypeDTO> {
    return this.productService.findByProductTypes(filters);
  }

  @Get('featured/list')
  @ApiOperation({ summary: 'Frontend: get featured products' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Featured products' })
  async featured(): Promise<BaseResponseTypeDTO> {
    return this.productService.findFeatured();
  }

  @Get('new-arrivals')
  @ApiOperation({ summary: 'Frontend: get new arrivals' })
  @ApiResponse({ status: HttpStatus.OK, description: 'New arrivals' })
  async newArrivals(): Promise<BaseResponseTypeDTO> {
    return this.productService.findNewArrivals();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by  Id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product fetched',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async getAProduct(@Param('id') id: string): Promise<BaseResponseTypeDTO> {
    const result = await this.productService.getAProduct(id);
    return result;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product update their account',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async updateProduct(
    @Param('id') id: string,
    @Body() payload: UpdateProductDto,
  ): Promise<BaseResponseTypeDTO> {
    const result = await this.productService.updateProduct(id, payload);
    return result;
  }

  @Patch(':id/product/image')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product update their account',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Chicken Wings(Feeds 45)' },
        amount: { type: 'number',  format: 'float', example: 143.99},
        description: { type: 'string', example: 'Yum and succlent' },
        category: { type: 'string', example: 'Main'},
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      // required: ['name', 'amount', 'productType', 'category', 'image']
    },
  })
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ){
    const result = await this.productService.update(id, payload, file);
    return result;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'delete product with a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'product deleted',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async deleteProduct(@Param('id') id: string): Promise<BaseResponseTypeDTO> {
    const result = await this.productService.deleteProduct(id);
    return result;
  }
}
