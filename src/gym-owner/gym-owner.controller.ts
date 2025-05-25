// src/gym-owner/gym-owner.controller.ts

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard }   from '../auth/roles.guard';
import { Roles }        from '../auth/roles.decorator';
import { Role }         from '../auth/roles.enum';

import { GymOwnerService }   from './gym-owner.service';
import { CreateGymOwnerDto } from './dto/create-gym-owner.dto';
import { UpdateGymOwnerDto } from './dto/update-gym-owner.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('gym-owners')
export class GymOwnerController {
  constructor(private readonly svc: GymOwnerService) {}

  /** public: create (you probably guard this in frontend) */
  @Post()
  async create(@Body() dto: CreateGymOwnerDto) {
    return this.svc.create(dto);
  }

  /** public: list all owners (for your “Find a Studio” page) */
  @Public()
  @Get()
  findAll(
    @Query('page')    page     = '0',
    @Query('pageSize')size     = '12',
    @Query('search')  search   = '',
  ) {
    return this.svc.findAll(+page, +size, search);
  }

  /** public: single owner by profile-id */
  @Get(':id')
  async publicFindOne(@Param('id') id: string) {
    const owner = await this.svc.findOne(id);
    if (!owner) throw new NotFoundException(`Gym owner ${id} not found`);
    // strip out the nested user if you like:
    return {
      id:         owner.id,
      full_name:  owner.user.full_name,
      email:      owner.user.email,
      bio:        owner.bio,
      phone:      owner.phone,
      address:    owner.address,
      mapLink:    owner.address?.mapLink,
      created_at: owner.user.created_at,
    };
  }

  // /** authenticated: “/me” for the logged‐in owner */
  // @UseGuards(JwtAuthGuard)
  // @Get('me')
  // me(@Req() req: any) {
  //   return this.svc.findByUserId(req.user.id);
  // }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GYM_OWNER, Role.ADMIN, Role.SUPERADMIN)
  @Get('me')
  async getMyProfile(@Req() req: any) {
    const owner = await this.svc.findByUserId(req.user.id);
    if (!owner) throw new NotFoundException('Profile not found');
    return {
      id:         owner.id,
      full_name:  owner.user.full_name,
      email:      owner.user.email,
      role:       owner.user.role,
      bio:        owner.bio,
      phone:      owner.phone,
      address:    owner.address.address,
      mapLink:    owner.address.mapLink,
      image:      owner.image,
      created_at: owner.user.created_at,
    };
  }
  
  /** authenticated+authorized: update by id */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GYM_OWNER, Role.ADMIN, Role.SUPERADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGymOwnerDto,
  ) {
    try {
      return await this.svc.update(id, dto);
    } catch (err) {
      if ((err as any).getStatus) throw err;
      throw new InternalServerErrorException(err.message);
    }
  }

  /** authenticated+authorized: delete by id */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Public()
  @Get('public/:id')
async publicFindOne1(@Param('id') id: string) {
  const owner = await this.svc.findOne(id)
  if (!owner) throw new NotFoundException()
  return {
    id:         owner.id,
    full_name:  owner.user.full_name,
    email:      owner.user.email,
    bio:        owner.bio,
    phone:      owner.phone,
    address:    owner.address,
    mapLink:    owner.address?.mapLink,
    created_at: owner.user.created_at,
  }
}



  // /** Soft-delete (admin or superadmin) */
  // @Delete(':id')
  // @Roles(Role.SUPERADMIN, Role.ADMIN)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // remove(@Param('id') id: string) {
  //   return this.svc.softDelete(id);
  // }

  // /** Hard-delete (superadmin only) */
  // @Delete(':id/hard')
  // @Roles(Role.SUPERADMIN)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // hardRemove(@Param('id') id: string) {
  //   return this.svc.hardDelete(id);
  // }

  // /** Restore soft-deleted (superadmin only) */
  // @Post(':id/restore')
  // @Roles(Role.SUPERADMIN)
  // restore(@Param('id') id: string) {
  //   return this.svc.restore(id);
  // }
}
