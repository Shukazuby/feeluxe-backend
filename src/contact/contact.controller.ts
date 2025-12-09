import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BaseResponseTypeDTO } from 'src/utils';
import { ContactQueryDto, CreateContactDto } from './dto/create-contact.dto';
import { ContactService } from './contact.service';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a contact/feedback message' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Message received' })
  create(@Body() payload: CreateContactDto): Promise<BaseResponseTypeDTO> {
    return this.contactService.create(payload);
  }

  @Get()
  @ApiOperation({ summary: 'List contact submissions' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Messages fetched' })
  findAll(@Query() query: ContactQueryDto): Promise<BaseResponseTypeDTO> {
    return this.contactService.findAll(query);
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Mark a contact message as resolved' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Message resolved' })
  resolve(@Param('id') id: string): Promise<BaseResponseTypeDTO> {
    return this.contactService.resolve(id);
  }
}

