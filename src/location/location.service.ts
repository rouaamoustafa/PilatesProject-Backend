import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly repo: Repository<Location>,
  ) {}

  async create(dto: CreateLocationDto): Promise<Location> {
    const loc = this.repo.create(dto);
    return this.repo.save(loc);
  }

  async findAll(): Promise<Location[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Location> {
    const loc = await this.repo.findOneBy({ id });
    if (!loc) throw new NotFoundException(`Location ${id} not found`);
    return loc;
  }

  async update(
    id: string,
    dto: UpdateLocationDto,
  ): Promise<Location> {
    const loc = await this.findOne(id);
    Object.assign(loc, dto);
    return this.repo.save(loc);
  }

  async remove(id: string): Promise<{ message: string }> {
    const loc = await this.findOne(id);
    await this.repo.remove(loc);
    return { message: 'Location deleted successfully' };
  }
}
