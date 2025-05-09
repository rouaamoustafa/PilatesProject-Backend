import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GymOwner } from './entities/gym-owner.entity';
import { User } from '../user/entities/user.entity';
import { CreateGymOwnerDto } from './dto/create-gym-owner.dto';
import { UpdateGymOwnerDto } from './dto/update-gym-owner.dto';
import { Location } from '../location/entities/location.entity';

@Injectable()
export class GymOwnerService {
  private readonly logger = new Logger(GymOwnerService.name);

  constructor(
    @InjectRepository(GymOwner)
    private readonly gymOwnerRepo: Repository<GymOwner>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
  ) {}

  async create(data: CreateGymOwnerDto, files: { imagePath?: string }): Promise<GymOwner> {
    try {
      const user = await this.userRepo.findOneBy({ id: data.userId });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.role !== 'gym_owner') {
        throw new BadRequestException('User is not assigned the "gym_owner" role');
      }

      const existing = await this.gymOwnerRepo.findOne({ where: { user: { id: user.id } } });
      if (existing) {
        throw new BadRequestException('This user already has a gym owner profile');
      }

      const location = this.locationRepo.create({
        address: data.address,
        mapLink: data.mapLink, // Optional
      });
      await this.locationRepo.save(location);

      const gymOwner = this.gymOwnerRepo.create({
        bio: data.bio,
        image: files.imagePath,
        phone: data.phone,
        address: location,
        user,
      });

      return this.gymOwnerRepo.save(gymOwner);
    } catch (error) {
      this.logger.error(`Failed to create gym owner: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(page = 0, pageSize = 10): Promise<{ gymOwners: GymOwner[], totalCount: number }> {
    try {
      const [gymOwners, totalCount] = await this.gymOwnerRepo.findAndCount({
        relations: ['user', 'address'],
        skip: page * pageSize,
        take: pageSize,
      });
      
      return { gymOwners, totalCount };
    } catch (error) {
      this.logger.error(`Failed to find all gym owners: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByUserId(userId: string) {
    try {
      // Use a more efficient query
      const gymOwner = await this.gymOwnerRepo
        .createQueryBuilder('gymOwner')
        .select(['gymOwner.bio', 'gymOwner.image', 'gymOwner.phone'])
        .leftJoinAndSelect('gymOwner.address', 'address')
        .leftJoin('gymOwner.user', 'user')
        .where('user.id = :userId', { userId })
        .getOne();
        
      return gymOwner;
    } catch (error) {
      this.logger.error(`Failed to find gym owner by user ID: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  async findOne(id: string): Promise<GymOwner> {
    try {
      const gymOwner = await this.gymOwnerRepo.findOne({
        where: { id },
        relations: ['user', 'address'],
      });
      
      if (!gymOwner) {
        throw new NotFoundException('Gym owner not found');
      }
      
      return gymOwner;
    } catch (error) {
      this.logger.error(`Failed to find gym owner: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, data: UpdateGymOwnerDto): Promise<GymOwner> {
    try {
      const gymOwner = await this.findOne(id);

      if (data.address || data.mapLink) {
        const location = this.locationRepo.create({
          address: data.address,
          mapLink: data.mapLink,
        });
        await this.locationRepo.save(location);
        gymOwner.address = location;
      }

      Object.assign(gymOwner, data);
      return this.gymOwnerRepo.save(gymOwner);
    } catch (error) {
      this.logger.error(`Failed to update gym owner: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const gymOwner = await this.findOne(id);
      await this.gymOwnerRepo.remove(gymOwner);
      return { message: 'Gym owner profile deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to remove gym owner: ${error.message}`, error.stack);
      throw error;
    }
  }
}