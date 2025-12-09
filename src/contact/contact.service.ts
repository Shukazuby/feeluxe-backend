import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseResponseTypeDTO, sendEmail } from 'src/utils';
import { ContactQueryDto, CreateContactDto } from './dto/create-contact.dto';
import { Contact, ContactDocument } from './entities/contact.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,
  ) {}

  async create(payload: CreateContactDto): Promise<BaseResponseTypeDTO> {
    const message = new this.contactModel({
      ...payload,
      status: 'open',
    });

    const saved = await message.save();

    // fire and forget email; failure should not block API
    if (payload.email) {
      sendEmail(
        `<p>Hi ${payload.name || 'there'},</p><p>We received your message and will respond shortly.</p>`,
        `Feeluxe.ng - ${payload.subject}`,
        payload.email,
      ).catch((err) => console.error('Contact acknowledgement failed', err));
    }

    return {
      data: saved,
      success: true,
      code: HttpStatus.CREATED,
      message: 'Message received',
    };
  }

  async findAll(filters: ContactQueryDto): Promise<BaseResponseTypeDTO> {
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$or = [
        { subject: { $regex: filters.search.trim(), $options: 'i' } },
        { email: { $regex: filters.search.trim(), $options: 'i' } },
      ];
    }

    const limit = filters.limit || 50;
    const page = filters.page || 1;
    const skip = (page - 1) * limit;

    const totalCount = await this.contactModel.countDocuments(query);
    const data = await this.contactModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });

    return {
      data: {
        totalCount,
        data,
      },
      success: true,
      code: HttpStatus.OK,
      message: 'Messages fetched',
      limit,
      page,
      search: filters.search,
    };
  }

  async resolve(id: string): Promise<BaseResponseTypeDTO> {
    const message = await this.contactModel.findById(id);
    if (!message) throw new NotFoundException('Message not found.');

    message.status = 'resolved';
    const updated = await message.save();

    return {
      data: updated,
      success: true,
      code: HttpStatus.OK,
      message: 'Message marked as resolved',
    };
  }
}

