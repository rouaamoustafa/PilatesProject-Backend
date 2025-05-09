import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Req,
  NotFoundException,
  Query,
  Logger,
} from '@nestjs/common';
import { GymOwnerService } from './gym-owner.service';
import { FastifyRequest } from 'fastify';
import { MultipartFile, Multipart } from '@fastify/multipart';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { CreateGymOwnerDto } from './dto/create-gym-owner.dto';
import { UpdateGymOwnerDto } from './dto/update-gym-owner.dto';
import { promisify } from 'util';

const pipeline = promisify(require('stream').pipeline);

@Controller('gym-owners')
export class GymOwnerController {
  private readonly logger = new Logger(GymOwnerController.name);

  constructor(private readonly gymOwnerService: GymOwnerService) {}

  @Post()
  async create(@Req() req: FastifyRequest): Promise<any> {
    try {
      const parts = await (req as any).parts();
      const formData: Record<string, any> = {};
      const files: { imagePath?: string } = {};

      for await (const part of parts as AsyncIterableIterator<Multipart>) {
        if ((part as MultipartFile).file) {
          const filePart = part as MultipartFile;
          const extension = path.extname(filePart.filename);
          const fileName = `${filePart.fieldname}-${Date.now()}${extension}`;
          const savePath = `uploads/gym-owners/${fileName}`;

          // Ensure directory exists
          const dir = path.dirname(savePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          // Use pipeline for more efficient file handling
          await pipeline(
            filePart.file,
            fs.createWriteStream(savePath)
          );

          if (filePart.mimetype.startsWith('image/')) {
            files.imagePath = fileName;
          }
        } else {
          const valuePart = part as Multipart;
          if ('value' in valuePart) {
            formData[valuePart.fieldname] = (valuePart as any).value;
          }
        }
      }

      return this.gymOwnerService.create(formData as CreateGymOwnerDto, files);
    } catch (error) {
      this.logger.error(`Failed to create gym owner: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get()
  findAll(
    @Query('page') page = '0',
    @Query('pageSize') pageSize = '10',
  ) {
    try {
      return this.gymOwnerService.findAll(
        parseInt(page, 10),
        parseInt(pageSize, 10)
      );
    } catch (error) {
      this.logger.error(`Failed to find all gym owners: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gymOwnerService.findOne(id);
  }

  @Get('user/:uid')
  async byUser(@Param('uid') uid: string) {
    try {
      const prof = await this.gymOwnerService.findByUserId(uid); 
      if (!prof) throw new NotFoundException('Profile not found');
      return prof;
    } catch (error) {
      this.logger.error(`Failed to find gym owner by user ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Req() req: FastifyRequest): Promise<any> {
    try {
      const parts = await (req as any).parts();
      const formData: Record<string, any> = {};
      const files: { imagePath?: string } = {};

      for await (const part of parts as AsyncIterableIterator<Multipart>) {
        if ((part as MultipartFile).file) {
          const filePart = part as MultipartFile;
          const extension = path.extname(filePart.filename);
          const fileName = `${filePart.fieldname}-${Date.now()}${extension}`;
          const savePath = `uploads/gym-owners/${fileName}`;

          // Ensure directory exists
          const dir = path.dirname(savePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          // Use pipeline for more efficient file handling
          await pipeline(
            filePart.file,
            fs.createWriteStream(savePath)
          );

          if (filePart.mimetype.startsWith('image/')) {
            files.imagePath = fileName;
          }
        } else {
          const valuePart = part as Multipart;
          if ('value' in valuePart) {
            formData[valuePart.fieldname] = (valuePart as any).value;
          }
        }
      }

      return this.gymOwnerService.update(id, {
        ...(formData as UpdateGymOwnerDto),
        ...(files.imagePath && { image: files.imagePath })
      });
    } catch (error) {
      this.logger.error(`Failed to update gym owner: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gymOwnerService.remove(id);
  }
}