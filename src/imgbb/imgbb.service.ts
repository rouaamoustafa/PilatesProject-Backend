// imgbb.service.ts
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class ImgbbService {
  private readonly apiKey: string;
  private readonly uploadUrl: string;
  private readonly logger = new Logger(ImgbbService.name);

  constructor(private config: ConfigService) {
    // pull these from your .env (make sure ConfigModule is imported in your AppModule)
    this.apiKey    = this.config.get<string>('IMGBB_API_KEY')!;
    this.uploadUrl = this.config.get<string>('IMGBB_UPLOAD_URL')!;
    if (!this.apiKey || !this.uploadUrl) {
      throw new InternalServerErrorException('ImgBB configuration missing');
    }
  }

  async uploadImage(buffer: Buffer, filename: string): Promise<string> {
    const form = new FormData();
    form.append('key', this.apiKey);
    form.append('image', buffer, { filename });
    form.append('name', filename);

    try {
      const response = await axios.post(this.uploadUrl, form, {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
      });

      if (response.data.success) {
        return response.data.data.url;
      }
      throw new InternalServerErrorException('ImgBB responded with an error');
    } catch (err) {
      this.logger.error('ImgBB upload error', err);
      throw new InternalServerErrorException(`ImgBB upload error: ${err.message}`);
    }
  }
}
