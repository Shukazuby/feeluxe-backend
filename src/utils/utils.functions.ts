import { HttpStatus } from "@nestjs/common";
import { BaseResponseTypeDTO, EmailAttachmentDTO } from "./utils.types";
const nodemailer = require('nodemailer');


export const generateUniqueKey = (length = 5): string => {
    let key = '';
    for (let i = 0; i < length; i++) {
      key += Math.floor(Math.random() * 10); 
    }
    return key;
  };
  
  export const sendEmail = async (
    html: string,
    subject: string,
    recipientEmail: string,
    attachments?: EmailAttachmentDTO[],
  ): Promise<BaseResponseTypeDTO> => {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
          user: process.env.EMAIL_ADMIN,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      const info = await transporter.sendMail({
        from: `"Feeluxe.ng" <${process.env.EMAIL_ADMIN}>`,
        to: recipientEmail,
        subject,
        html,
        attachments,
      });
  
      console.log(`✅ Email sent successfully: ${info.messageId}`);
  
      return {
        message: `Nodemailer sent message: ${info.messageId}`,
        code: HttpStatus.OK,
        success: true,
      };
    } catch (error) {
      console.error(`❌ Email sending failed:`, error);
  
      return {
        success: false,
        message: 'Email not sent',
        code: HttpStatus.BAD_GATEWAY,
      };
    }
  };
  