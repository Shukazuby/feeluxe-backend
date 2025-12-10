import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BaseResponseTypeDTO } from 'src/utils';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart-item.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { WishlistDto } from './dto/wishlist.dto';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a customer profile' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Customer created' })
  create(@Body() payload: CreateCustomerDto): Promise<BaseResponseTypeDTO> {
    return this.customerService.create(payload);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Profile fetched' })
  me(@Request() req): Promise<BaseResponseTypeDTO> {
    return this.customerService.findOne(req.user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update customer profile fields' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Profile updated' })
  update(
    @Request() req,
    @Body() payload: UpdateCustomerDto,
  ): Promise<BaseResponseTypeDTO> {
    return this.customerService.updateProfile(req.user.id, payload);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change account password' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Password updated' })
  changePassword(
    @Request() req,
    @Body() payload: ChangePasswordDto,
  ): Promise<BaseResponseTypeDTO> {
    return this.customerService.changePassword(req.user.id, payload);
  }

  @Get('wishlist')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get wishlist items' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Wishlist fetched' })
  getWishlist(@Request() req): Promise<BaseResponseTypeDTO> {
    return this.customerService.getWishlist(req.user.id);
  }

  @Post('wishlist')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add an item to wishlist' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Wishlist updated' })
  addToWishlist(
    @Request() req,
    @Body() payload: WishlistDto,
  ): Promise<BaseResponseTypeDTO> {
    return this.customerService.addToWishlist(req.user.id, payload);
  }

  @Delete('wishlist/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove an item from wishlist' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Wishlist updated' })
  removeFromWishlist(
    @Request() req,
    @Param('productId') productId: string,
  ): Promise<BaseResponseTypeDTO> {
    return this.customerService.removeFromWishlist(req.user.id, productId);
  }

  @Post('wishlist/remove')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove an item from wishlist (body payload)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Wishlist updated' })
  removeWishlistByBody(
    @Request() req,
    @Body() payload: WishlistDto,
  ): Promise<BaseResponseTypeDTO> {
    return this.customerService.removeFromWishlist(req.user.id, payload.productId);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete current customer account' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Account deleted' })
  deleteAccount(@Request() req): Promise<BaseResponseTypeDTO> {
    return this.customerService.deleteAccount(req.user.id);
  }
}

