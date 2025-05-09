// src/instructor/instructor.controller.ts
import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  NotFoundException,
} from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { MultipartFile, Multipart } from '@fastify/multipart'
import { Readable } from 'stream'
import { createWriteStream, mkdirSync, existsSync } from 'fs'
import { join, extname } from 'path'

import { InstructorService }    from './instructor.service'
import { CreateInstructorDto }   from './dto/create-instructor.dto'
import { UpdateInstructorDto }   from './dto/update-instructor.dto'
import { JwtAuthGuard }          from '../auth/jwt-auth.guard'
import { RolesGuard }            from '../auth/roles.guard'
import { Roles }                 from '../auth/roles.decorator'
import { Role }                  from '../auth/roles.enum'

type ParsedFiles = { imagePath?: string; cvPath?: string }
const UPLOAD_DIR = 'uploads/instructors'
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true })

@Controller('instructors')
export class InstructorController {
  constructor(private readonly svc: InstructorService) {}

  private async parseMultipart(
    req: FastifyRequest,
  ): Promise<{ fields: Record<string, any>; files: ParsedFiles }> {
    const parts   = await (req as any).parts()
    const fields: Record<string, any> = {}
    const files:  ParsedFiles         = {}

    for await (const part of parts as AsyncIterableIterator<Multipart>) {
      if ((part as MultipartFile).file) {
        const f        = part as MultipartFile
        const fileName = `${f.fieldname}-${Date.now()}${extname(f.filename)}`
        const savePath = join(UPLOAD_DIR, fileName)

        await new Promise<void>((resolve, reject) => {
          ;(f.file as Readable)
            .pipe(createWriteStream(savePath))
            .on('close', () => resolve())
            .on('error', err => reject(err))
        })

        if (f.mimetype.startsWith('image/'))       files.imagePath = fileName
        else if (f.mimetype === 'application/pdf') files.cvPath    = fileName
      } else {
        fields[part.fieldname] = (part as any).value
      }
    }

    return { fields, files }
  }

  /** Create a user + instructor in one request (any authenticated) */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: FastifyRequest) {
    const { fields, files } = await this.parseMultipart(req)
    const dto: CreateInstructorDto = {
      ...(fields as any),
      image: files.imagePath,
      cv:    files.cvPath,
    }
    return this.svc.create(dto)
  }

  /** List with pagination & search – only SUPERADMIN & ADMIN */
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get()
  findAll(
    @Query('page') page = '0',
    @Query('pageSize') pageSize = '12',
    @Query('search') search = '',
  ) {
    return this.svc.findAll(
      Number(page),
      Number(pageSize),
      search,
    )
  }

  /** Expand row by user ID – only SUPERADMIN & ADMIN */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('user/:uid')
  async byUser(@Param('uid') uid: string) {
    const prof = await this.svc.findByUserId(uid)
    if (!prof) throw new NotFoundException('Profile not found')
    return prof
  }

  /** Get single by profile ID – only SUPERADMIN & ADMIN */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id)
  }

  /** Update both user and instructor fields – any authenticated */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Req() req: FastifyRequest) {
    const { fields, files } = await this.parseMultipart(req)
    const dto: UpdateInstructorDto = {
      ...(fields as any),
      ...(files.imagePath && { image: files.imagePath }),
      ...(files.cvPath    && { cv:    files.cvPath    }),
    }
    return this.svc.update(id, dto)
  }

  
  /** Delete instructor (and its user) – any authenticated */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id)
  }
}
