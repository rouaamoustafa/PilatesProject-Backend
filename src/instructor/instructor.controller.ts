// src/instructor/instructor.controller.ts

import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Req,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  Body,
} from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import type { MultipartValue, MultipartFile } from '@fastify/multipart'

import { InstructorService } from './instructor.service'
import { CreateInstructorDto } from './dto/create-instructor.dto'
import { UpdateInstructorDto } from './dto/update-instructor.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { Role } from '../auth/roles.enum'
import { ImgbbService } from '../imgbb/imgbb.service'
import { User } from '../user/entities/user.entity'
import { GymOwnerService }    from '../gym-owner/gym-owner.service'
import { Public } from 'src/common/decorators/public.decorator'

// Extend FastifyRequest with our injected `user`
type ReqWithUser = FastifyRequest & { user: User }

interface ParsedFiles {
  imageUrl?: string
  cvUrl?: string
}

// Type-guard: file parts have `.file`, field parts don't
function isFilePart(
  part: MultipartValue | MultipartFile,
): part is MultipartFile {
  return 'file' in part
}

@Controller('instructors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InstructorController {
  constructor(
    private readonly svc: InstructorService,
    private readonly imgbb: ImgbbService,
    private readonly gymOwnerSvc : GymOwnerService
  ) {}

  /** Read multipart, upload files to ImgBB, return text fields + URLs */
  private async parseMultipart(
    req: FastifyRequest,
  ): Promise<{ fields: Record<string, any>; files: ParsedFiles }> {
    const parts = (req as any).parts() as AsyncIterable<
      MultipartValue | MultipartFile
    >
    const fields: Record<string, any> = {}
    const files: ParsedFiles = {}

    for await (const part of parts) {
      if (isFilePart(part)) {
        // Buffer entire file
        const buffers: Buffer[] = []
        for await (const chunk of part.file as AsyncIterable<Buffer>) {
          buffers.push(chunk)
        }
        const buffer = Buffer.concat(buffers)

        // Upload to ImgBB
        const ext = part.filename?.split('.').pop() ?? 'bin'
        const filename = `${part.fieldname}-${Date.now()}.${ext}`
        const url = await this.imgbb.uploadImage(buffer, filename)

        if (part.fieldname === 'image') files.imageUrl = url
        if (part.fieldname === 'cv')    files.cvUrl    = url
      } else {
        fields[part.fieldname] = (part as MultipartValue).value
      }
    }

    return { fields, files }
  }

  /** Create – SUPERADMIN, ADMIN or GYM_OWNER (gym owners auto-link to themselves) */
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.GYM_OWNER)
  @Post()
  async create(@Req() req: ReqWithUser) {
    const user = req.user
    const { fields, files } = await this.parseMultipart(req)
    const raw = fields as CreateInstructorDto

    
    if (user.role === Role.GYM_OWNER) {  // translate the *user* id to the matching *gym_owner* id
    const owner = await this.gymOwnerSvc.findByUserId(user.id)
    if (!owner) throw new NotFoundException('Gym owner profile missing')
    raw.gymOwnerId = owner.id;
 }
    const dto: CreateInstructorDto = {
      ...raw,
      image: files.imageUrl,
      cv:    files.cvUrl,
     
    }

    return this.svc.create(dto)
  }

  /** List – SUPERADMIN/ADMIN get all; GYM_OWNER only theirs */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.GYM_OWNER)
  @Get()
  async findAll(
    @Req() req: ReqWithUser,
    @Query('page') page = '0',
    @Query('pageSize') pageSize = '12',
    @Query('search') search = '',
  ) {
    const user = req.user
    if (user.role === Role.GYM_OWNER) {
      const owner = await this.gymOwnerSvc.findByUserId(user.id);
      if (!owner) throw new NotFoundException('Gym owner profile missing');

      return this.svc.findByGymOwner(                 // ← RIGHT KEY
      owner.id,                                     // gymOwner.id
      Number(page), Number(pageSize), search,
      );
    }
    return this.svc.findAll(
      Number(page),
      Number(pageSize),
      search,
    )
  }

  /** Expand by user ID – only ADMIN & SUPERADMIN */
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get('user/:uid')
  async byUser(@Param('uid') uid: string) {
    const prof = await this.svc.findByUserId(uid)
    if (!prof) throw new NotFoundException('Profile not found')
    return prof
  }

  /** Get single by profile ID – only ADMIN & SUPERADMIN */
@Roles(Role.SUPERADMIN, Role.ADMIN, Role.GYM_OWNER)
@Get(':id')
async findOne(@Param('id') id: string, @Req() req: ReqWithUser) {
  const user = req.user;

  // If gym owner, only allow access to their own instructors
  if (user.role === Role.GYM_OWNER) {
    const instructor = await this.svc.findOne(id);
    if (!instructor) throw new NotFoundException('Instructor not found');
    // You MUST have a .gymOwner relation on Instructor entity!
    if (!instructor.gymOwner || instructor.gymOwner.id !== user.id) {
      throw new NotFoundException('Not your instructor');
    }
    return instructor;
  }

  // Admin and superadmin see anyone
  return this.svc.findOne(id);
}

  /** Update – SUPERADMIN, ADMIN or GYM_OWNER */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.GYM_OWNER)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: FastifyRequest,
  ) {
    const { fields, files } = await this.parseMultipart(req)
    const raw = fields as Partial<CreateInstructorDto>
    const dto: UpdateInstructorDto = {
      ...raw,
      ...(files.imageUrl && { image: files.imageUrl }),
      ...(files.cvUrl    && { cv:    files.cvUrl    }),
    }
    return this.svc.update(id, dto)
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INSTRUCTOR)
  @Patch('me')
  async updateMyProfile(
  @Req() req: any,
  @Body() dto: UpdateInstructorDto,
  ) {
  const inst = await this.svc.findByUserId(req.user.id);
  if (!inst) throw new NotFoundException('Instructor profile missing');

  return this.svc.update(inst.id, dto);
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.INSTRUCTOR, Role.GYM_OWNER, Role.ADMIN, Role.SUPERADMIN)
@Get('me')
async getMyProfile(@Req() req: any) {
  const inst = await this.svc.findByUserId(req.user.id);
  if (!inst) throw new NotFoundException('Profile not found');
  return {
    id:         inst.id,
    full_name:  inst.user.full_name,
    email:      inst.user.email,
    role:       inst.user.role,
    bio:        inst.bio,
    link:       inst.link,
    cv:         inst.cv,
    image:      inst.image,
    created_at: inst.user.created_at,
  };
}

@Public()
@Get('public/:id')
async findOnePublic(@Param('id') id: string) {
  const instructor = await this.svc.findOne(id)

  if (!instructor) throw new NotFoundException('Instructor not found')

  return {
    id: instructor.id,
    userId: instructor.user.id, // 🔥 ADD THIS
    full_name: instructor.user.full_name,
    email: instructor.user.email,
    bio: instructor.bio,
    link: instructor.link,
    cv: instructor.cv,
    image: instructor.image,
  }
}

@Public()
@Get('public')
async findAllPublic(
  @Query('page') page = '0',
  @Query('pageSize') size = '50',
  @Query('search') search = '',
) {
  return this.svc.findAll(
    Number(page),
    Number(size),
    search,
  )
}


  /** Delete – SUPERADMIN, ADMIN or GYM_OWNER */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.GYM_OWNER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id)
  }

   @UseGuards(JwtAuthGuard)
  @Get('mine')
  async getMine(@Req() req) {
    return this.svc.findByGymOwnerId(req.user.id);
  }
}
