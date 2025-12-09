import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './entities/product.entity';
import { Model } from 'mongoose';
import { BaseResponseTypeDTO, IPaginationFilter } from 'src/utils';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    dto: CreateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    const product = new this.productModel({
      ...dto,
      amount: dto.amount ?? dto.price,
      price: dto.price ?? dto.amount,
    });

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      product.imageurl = uploadResult.url;
    }

    return product.save();
  }

  async update(
    productId: string,
    payload: CreateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    const product = await this.productModel.findOne({ _id: productId });

    if (!product) {
      throw new NotFoundException(
        `Product not found, therefore cannot be updated.`,
      );
    }

    if ('name' in payload) {
      product.name = payload.name;
    }

    if ('amount' in payload) {
      product.amount = payload.amount;
    }

    if ('price' in payload) {
      product.price = payload.price;
      product.amount = payload.price ?? product.amount;
    }

    if ('description' in payload) {
      product.description = payload.description;
    }

    if ('category' in payload) {
      product.category = payload.category;
    }

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      product.imageurl = uploadResult.url;
    }

    if ('isNew' in payload) {
      product.isNew = payload.isNew;
    }

    if ('isFeatured' in payload) {
      product.isFeatured = payload.isFeatured;
    }
    const updatedProduct = await product.save();

    return updatedProduct.save();
  }

  async findAllProducts(
    filters: IPaginationFilter & { productType?: string },
  ): Promise<BaseResponseTypeDTO> {
    try {
      const searchFilter: any = {};
      if (filters.search) {
        const searchTerm = filters.search.trim();
        const userFields = Object.keys(this.productModel.schema.obj);

        searchFilter.$or = userFields
          .map((field) => {
            const fieldType = this.productModel.schema.obj[field]?.type;
            if (fieldType === String) {
              return {
                [field]: { $regex: searchTerm, $options: 'i' },
              };
            }
            return {};
          })
          .filter((condition) => Object.keys(condition).length > 0);
      }

      if (filters.productType === 'general') {
        searchFilter.productType = 'general';
      }

      if (filters.productType === 'mealprep') {
        searchFilter.productType = 'mealprep';
      }

      const limit = filters.limit || 100;
      const page = filters.page || 1;
      const skip = (page - 1) * limit;

      const totalCount = await this.productModel.countDocuments(searchFilter);

      const data = await this.productModel
        .find(searchFilter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      if (!data || data.length === 0) {
        return {
          data: [],
          success: true,
          code: HttpStatus.OK,
          message: 'Products Not Found',
          limit,
          page,
          search: filters?.search,
        };
      }

      return {
        data: {
          totalCount,
          data,
        },
        success: true,
        code: HttpStatus.OK,
        message: 'All Products Found',
        limit: filters.limit,
        page: filters.page,
        search: filters.search,
      };
    } catch (ex) {
      throw ex;
    }
  }

  async findByProductTypes(
    filters: IPaginationFilter,
    productType?: string,
  ): Promise<BaseResponseTypeDTO> {
    try {
      const searchFilter: any = {};

      // Search across string fields
      if (filters.search) {
        const searchTerm = filters.search.trim();
        const userFields = Object.keys(this.productModel.schema.obj);

        searchFilter.$or = userFields
          .map((field) => {
            const fieldType = this.productModel.schema.obj[field]?.type;
            if (fieldType === String) {
              return {
                [field]: { $regex: searchTerm, $options: 'i' },
              };
            }
            return {};
          })
          .filter((condition) => Object.keys(condition).length > 0);
      }

      // Filter by productType if provided
      if (productType) {
        searchFilter.productType = productType;
      }

      if (filters.category) {
        searchFilter.category = filters.category;
      }

      const limit = filters.limit || 100;
      const page = filters.page || 1;
      const skip = (page - 1) * limit;

      const totalCount = await this.productModel.countDocuments(searchFilter);

      const data = await this.productModel
        .find(searchFilter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      if (!data || data.length === 0) {
        return {
          data: [],
          success: true,
          code: HttpStatus.OK,
          message: 'Products Not Found',
          limit,
          page,
          search: filters?.search,
        };
      }

      return {
        data: {
          totalCount,
          data,
        },
        success: true,
        code: HttpStatus.OK,
        message: 'All Products Found',
        limit,
        page,
        search: filters.search,
      };
    } catch (ex) {
      throw ex;
    }
  }

  async getAProduct(productId: string): Promise<BaseResponseTypeDTO> {
    try {
      const product = await this.productModel.findOne({ _id: productId });

      if (!product) {
        throw new NotFoundException(`Product not found.`);
      }

      return {
        data: product,
        success: true,
        code: HttpStatus.OK,
        message: 'Product Fetched',
      };
    } catch (ex) {
      throw ex;
    }
  }

  async deleteProduct(productId: string): Promise<BaseResponseTypeDTO> {
    try {
      const product = await this.productModel.findOne({ _id: productId });

      if (!product) {
        throw new NotFoundException(`Product not found.`);
      }

      await this.productModel.findByIdAndDelete(productId);

      return {
        success: true,
        code: HttpStatus.OK,
        message: 'Product Deleted',
      };
    } catch (ex) {
      throw ex;
    }
  }

  async updateProduct(
    productId: string,
    payload: UpdateProductDto,
  ): Promise<BaseResponseTypeDTO> {
    try {
      const record = await this.productModel.findOne({ _id: productId });

      if (!record) {
        throw new NotFoundException(
          `Product not found, therefore cannot be updated.`,
        );
      }

      if ('name' in payload) {
        record.name = payload.name;
      }

      if ('amount' in payload) {
        record.amount = payload.amount;
      }

    if ('price' in payload) {
      record.price = payload.price;
      record.amount = payload.price ?? record.amount;
    }

      if ('description' in payload) {
        record.description = payload.description;
      }

      if ('category' in payload) {
        record.category = payload.category;
      }

    if ('isNew' in payload) {
      record.isNew = payload.isNew;
    }

    if ('isFeatured' in payload) {
      record.isFeatured = payload.isFeatured;
    }

      const updatedProduct = await record.save();

      return {
        data: updatedProduct,
        success: true,
        code: HttpStatus.OK,
        message: 'Product Updated',
      };
    } catch (ex) {
      throw ex;
    }
  }

  async createProduct(dto: CreateProductDto): Promise<BaseResponseTypeDTO> {
    const product = new this.productModel({
      ...dto,
      amount: dto.amount ?? dto.price,
      price: dto.price ?? dto.amount,
    });
    await product.save();
    return {
      data: product,
      success: true,
      code: HttpStatus.CREATED,
      message: 'Product Created',
    };
  }

  async findFeatured(): Promise<BaseResponseTypeDTO> {
    const data = await this.productModel
      .find({ isFeatured: true })
      .limit(8)
      .sort({ createdAt: -1 });

    return {
      data,
      success: true,
      code: HttpStatus.OK,
      message: 'Featured products',
    };
  }

  async findNewArrivals(): Promise<BaseResponseTypeDTO> {
    const data = await this.productModel
      .find({ isNew: true })
      .limit(12)
      .sort({ createdAt: -1 });

    return {
      data,
      success: true,
      code: HttpStatus.OK,
      message: 'New arrivals',
    };
  }
}
