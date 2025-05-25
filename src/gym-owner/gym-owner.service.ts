import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { GymOwner }           from './entities/gym-owner.entity';
import { User }               from '../user/entities/user.entity';
import { Location }           from '../location/entities/location.entity';
import { CreateGymOwnerDto }  from './dto/create-gym-owner.dto';
import { UpdateGymOwnerDto }  from './dto/update-gym-owner.dto';

@Injectable()
export class GymOwnerService {
  private readonly logger = new Logger(GymOwnerService.name);

  constructor(
    @InjectRepository(GymOwner) private readonly gymOwnerRepo: Repository<GymOwner>,
    @InjectRepository(User)     private readonly userRepo: Repository<User>,
    @InjectRepository(Location) private readonly locationRepo: Repository<Location>,
  ) {}

  /* ─────────────────────────────
     CREATE
  ───────────────────────────── */
  async create(dto: CreateGymOwnerDto): Promise<GymOwner> {
  try{  // email already in use?
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already in use');

    if (dto.role !== 'gym_owner')
      throw new BadRequestException('Role must be gym_owner');

    const rawPassword = dto.password?.trim() || dto.email;
    const hashed     = await bcrypt.hash(rawPassword, 10);

    // user
    const user = this.userRepo.create({
      full_name: dto.full_name,
      email:     dto.email,
      password:  hashed,
      role:      dto.role,
    });
    await this.userRepo.save(user);

    // optional location
    let location: Location | undefined;
if (dto.address && dto.address.trim() !== '') {
  location = this.locationRepo.create({
    address: dto.address,
    mapLink: dto.mapLink,
  });
  await this.locationRepo.save(location);
} else if (dto.mapLink) {
  // If mapLink exists but address doesn't, throw error or ignore mapLink
  throw new BadRequestException('Address is required when providing a map link');
}

    // gym-owner
    const gymOwner = this.gymOwnerRepo.create({
      user,
      bio:    dto.bio,
      phone:  dto.phone,
      image:  dto.image,   // ← just the *path*, not full URL
      address: location,
    });

    return await this.gymOwnerRepo.save(gymOwner);}
    catch(error){
      this.logger.error('Failed to create gym owner', error.stack);
    throw new BadRequestException(error.message);
    }
  }

  /* ─────────────────────────────
     READ – paginated list
  ───────────────────────────── */
  async findAll(page = 0, pageSize = 12, search = '') {
    const qb = this.gymOwnerRepo
      .createQueryBuilder('go')
      .leftJoinAndSelect('go.user', 'user')
      .leftJoinAndSelect('go.address', 'address');

    if (search) {
      qb.where('user.full_name ILIKE :s OR user.email ILIKE :s', {
        s: `%${search}%`,
      });
    }

    const totalCount = await qb.getCount();
    const rows = await qb
      .orderBy('user.created_at', 'DESC')
      .skip(page * pageSize)
      .take(pageSize)
      .getMany();

    return {
      users: rows
      .filter(p => p.user)
      .map((r) => ({
        id:         r.id,
        full_name:  r.user.full_name,
        email:      r.user.email,
        role:       r.user.role,
        bio:        r.bio,
        phone:      r.phone,
        image:      r.image,     // path, front-end converts to URL
        address:    r.address || null,
        deletedAt:  r.user.deletedAt,
        created_at: r.user.created_at!,
      })),
      totalCount,
      page,
      pageSize,
    };
  }

  /* ─────────────────────────────
     READ – single
  ───────────────────────────── */
  async findOne(id: string): Promise<GymOwner> {
    const gymOwner = await this.gymOwnerRepo.findOne({
      where: { id },
      relations: ['user', 'address'],
    });
    if (!gymOwner)
      throw new NotFoundException(`Gym owner with ID ${id} not found`);
    return gymOwner;
  }

  /* ─────────────────────────────
     UPDATE
  ───────────────────────────── */
  async update(id: string, dto: UpdateGymOwnerDto): Promise<GymOwner> {
    if (dto.password === '') delete dto.password   
    const gymOwner = await this.findOne(id);

    /* user-level updates */
    if (dto.password) {
      gymOwner.user.password = await bcrypt.hash(dto.password, 10);
    }
    if (dto.full_name) gymOwner.user.full_name = dto.full_name;

    if (dto.email && dto.email !== gymOwner.user.email) {
      const exists = await this.userRepo.findOne({ where: { email: dto.email } });
      if (exists && exists.id !== gymOwner.user.id)
        throw new BadRequestException('Email already in use');
      gymOwner.user.email = dto.email;
    }
    await this.userRepo.save(gymOwner.user);

    /* location */
    if (dto.address !== undefined || dto.mapLink !== undefined) {
      let loc = gymOwner.address;
      if (!loc) {
        loc = this.locationRepo.create();
      }
      if (dto.address !== undefined) loc.address = dto.address;
      if (dto.mapLink !== undefined) loc.mapLink = dto.mapLink;
      await this.locationRepo.save(loc);
      gymOwner.address = loc;
    }

    /* domain fields */
    if (dto.bio   !== undefined) gymOwner.bio   = dto.bio;
    if (dto.phone !== undefined) gymOwner.phone = dto.phone;
    if (dto.image !== undefined) gymOwner.image = dto.image;  // path

    return await this.gymOwnerRepo.save(gymOwner);
  }

  /* ─────────────────────────────
     DELETE (hard-delete user + profile)
  ───────────────────────────── */
  async remove(id: string) {
    const gymOwner = await this.findOne(id);

    await this.gymOwnerRepo.remove(gymOwner); // profile
    await this.userRepo.remove(gymOwner.user); // linked user

    return { message: 'Gym owner and user deleted successfully' };
  }
  // async findByUserId(uid: string): Promise<GymOwner | null> {
  //   return this.gymOwnerRepo.findOne({ where: { user: { id: uid } } });
  // }
  async findByUserId(uid: string): Promise<GymOwner | null> {
    return this.gymOwnerRepo.findOne({
      where: { user: { id: uid } },
      relations: ['user', 'address'],    // ← pull in both
    });
  }
}
