import { HttpStatus, Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseResponseTypeDTO, sendEmail } from 'src/utils';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { Newsletter, NewsletterDocument } from './entities/newsletter.entity';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(Newsletter.name)
    private readonly newsletterModel: Model<NewsletterDocument>,
  ) {}

  async subscribe(payload: CreateNewsletterDto): Promise<BaseResponseTypeDTO> {
    // Check if email already exists
    const existing = await this.newsletterModel.findOne({ email: payload.email.toLowerCase() });
    
    if (existing) {
      if (existing.isActive) {
        throw new BadRequestException('This email is already subscribed to our newsletter');
      } else {
        // Reactivate subscription
        existing.isActive = true;
        existing.subscribedAt = new Date();
        existing.unsubscribedAt = undefined;
        const updated = await existing.save();

        // Send welcome email
        sendEmail(
          `<p>Welcome back! You've been re-subscribed to Feeluxe.ng newsletter.</p><p>You'll receive exclusive offers and style tips.</p>`,
          'Welcome back to Feeluxe.ng Newsletter',
          payload.email,
        ).catch((err) => console.error('Newsletter welcome email failed', err));

        return {
          data: updated,
          success: true,
          code: HttpStatus.OK,
          message: 'Successfully re-subscribed to newsletter',
        };
      }
    }

    // Create new subscription
    const subscription = new this.newsletterModel({
      email: payload.email.toLowerCase(),
      isActive: true,
      subscribedAt: new Date(),
    });

    const saved = await subscription.save();

    // Send welcome email
    sendEmail(
      `<p>Thank you for subscribing to Feeluxe.ng newsletter!</p><p>You'll receive exclusive offers and style tips delivered to your inbox.</p>`,
      'Welcome to Feeluxe.ng Newsletter',
      payload.email,
    ).catch((err) => console.error('Newsletter welcome email failed', err));

    return {
      data: saved,
      success: true,
      code: HttpStatus.CREATED,
      message: 'Successfully subscribed to newsletter',
    };
  }
}

