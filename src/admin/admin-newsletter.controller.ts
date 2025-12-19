import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseResponseTypeDTO } from 'src/utils';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';
import { Newsletter, NewsletterDocument } from 'src/newsletter/entities/newsletter.entity';

@ApiTags('Admin - Newsletter')
@Controller('admin/newsletter')
@UseGuards(AdminJwtAuthGuard)
@ApiBearerAuth()
export class AdminNewsletterController {
  constructor(
    @InjectModel(Newsletter.name)
    private readonly newsletterModel: Model<NewsletterDocument>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get newsletter subscribers (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by email' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'active | inactive' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Subscribers fetched' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ): Promise<BaseResponseTypeDTO> {
    const query: any = {};

    if (search) {
      query.email = { $regex: search.trim(), $options: 'i' };
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const limitNum = limit || 50;
    const pageNum = page || 1;
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await this.newsletterModel.countDocuments(query);
    const subscribers = await this.newsletterModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    return {
      data: {
        totalCount,
        data: subscribers.map((s) => ({
          id: s._id.toString(),
          email: s.email,
          isActive: s.isActive,
          subscribedAt: s.subscribedAt,
          unsubscribedAt: s.unsubscribedAt,
          createdAt: s.createdAt,
        })),
      },
      success: true,
      code: HttpStatus.OK,
      message: 'Subscribers fetched',
      limit: limitNum,
      page: pageNum,
      search,
    };
  }
}


