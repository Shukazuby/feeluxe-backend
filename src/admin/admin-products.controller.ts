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
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BaseResponseTypeDTO } from 'src/utils';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';
import { ProductService } from 'src/product/product.service';
import { CreateProductDto, PaginationFilterDTO } from 'src/product/dto/create-product.dto';
import { UpdateProductDto } from 'src/product/dto/update-product.dto';

@ApiTags('Admin - Products')
@Controller('admin/products')
@UseGuards(AdminJwtAuthGuard)
@ApiBearerAuth()
export class AdminProductsController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a product' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Scarf' },
        amount: { type: 'number', format: 'float', example: 999.99 },
        price: { type: 'number', format: 'float', example: 999.99 },
        description: { type: 'string', example: 'Vintage Scarf for women' },
        category: { type: 'string', example: 'Vintage' },
        isNew: { type: 'boolean', example: false },
        isFeatured: { type: 'boolean', example: false },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Product created' })
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productService.create(createProductDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products (paginated)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Products fetched' })
  async findAll(@Query() filters: PaginationFilterDTO): Promise<BaseResponseTypeDTO> {
    return this.productService.findAllProducts(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product fetched' })
  async getOne(@Param('id') id: string): Promise<BaseResponseTypeDTO> {
    return this.productService.getAProduct(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product updated' })
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateProductDto,
  ): Promise<BaseResponseTypeDTO> {
    return this.productService.updateProduct(id, payload);
  }

  @Patch(':id/image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update product image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product image updated' })
  async updateImage(
    @Param('id') id: string,
    @Body() payload: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productService.update(id, payload, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Product deleted' })
  async delete(@Param('id') id: string): Promise<BaseResponseTypeDTO> {
    return this.productService.deleteProduct(id);
  }
}

