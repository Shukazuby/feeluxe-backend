import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import { createReadStream } from 'streamifier';

type ResourceType = 'image' | 'video' | 'raw' | 'auto';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret:process.env.CLOUDINARY_API_SECRET, 
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    options: { folder?: string; resource_type?: ResourceType } = {}
  ): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || 'inflow',
          resource_type: options.resource_type || 'auto'
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            asset_id: result.asset_id,
            public_id: result.public_id,
            version: result.version,
            version_id: result.version_id,
            signature: result.signature,
            width: result.width,
            height: result.height,
            format: result.format,
            resource_type: result.resource_type,
            created_at: result.created_at,
            bytes: result.bytes,
            type: result.type,
            url: result.url,
            secure_url: result.secure_url,
            folder: result.folder,
            original_filename: result.original_filename,
            api_key: result.api_key
          } as CloudinaryResponse);
        }
      );

      createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'inflow/images'
  ): Promise<CloudinaryResponse> {
    return this.uploadFile(file, { folder, resource_type: 'image' });
  }

  async uploadVideo(
    file: Express.Multer.File,
    folder: string = 'inflow/videos'
  ): Promise<CloudinaryResponse> {
    return this.uploadFile(file, { folder, resource_type: 'video' });
  }

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
