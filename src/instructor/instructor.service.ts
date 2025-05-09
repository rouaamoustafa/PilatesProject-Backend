import {
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'

import { Instructor } from './entities/instructor.entity'
import { User }       from '../user/entities/user.entity'
import { CreateInstructorDto } from './dto/create-instructor.dto'
import { UpdateInstructorDto } from './dto/update-instructor.dto'

@Injectable()
export class InstructorService {
  constructor(
    @InjectRepository(Instructor)
    private instRepo: Repository<Instructor>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  /** Create user + profile */
  async create(dto: CreateInstructorDto): Promise<Instructor> {
    const hashed = await bcrypt.hash(dto.password, 10)
    const user = this.userRepo.create({
      full_name: dto.full_name,
      email:     dto.email,
      password:  hashed,
      role:      dto.role,
    })
    await this.userRepo.save(user)

    const inst = this.instRepo.create({
      user,
      bio:   dto.bio,
      link:  dto.link,
      image: dto.image,
      cv:    dto.cv,
    })
    return this.instRepo.save(inst)
  }

  /** Paging + search */
 // … inside InstructorService …

/** Paging + search */
async findAll(
  page = 0,
  pageSize = 12,
  search = '',
): Promise<{
  users: Instructor[]       // <-- renamed here
  totalCount: number
  page: number
  pageSize: number
}> {
  const qb = this.instRepo
    .createQueryBuilder('inst')
    .leftJoinAndSelect('inst.user', 'user')

  if (search) {
    qb.where(
      'user.full_name ILIKE :s OR user.email ILIKE :s',
      { s: `%${search}%` },
    )
  }

  const totalCount = await qb.getCount()
  const profiles = await qb
    .orderBy('user.created_at', 'DESC')
    .skip(page * pageSize)
    .take(pageSize)
    .getMany()

  // flatten into front-end shape
  const users = profiles.map(p => ({
    id:          p.id,
    full_name:   p.user.full_name,
    email:       p.user.email,
    role:        p.user.role,
    deletedAt:   p.user.deletedAt,
    created_at:  p.user.created_at!,
    bio:         p.bio,
    image:       p.image,
    cv:          p.cv,
    link:        p.link,
    // if you need nested user object:
    user:        p.user,
  }))

  return { users, totalCount, page, pageSize }
}


  async findOne(id: string): Promise<Instructor> {
    const r = await this.instRepo.findOne({
      where: { id },
      relations: ['user'],
    })
    if (!r) throw new NotFoundException('Instructor not found')
    return r
  }

  async findByUserId(uid: string): Promise<Instructor | null> {
    return this.instRepo.findOne({
      where: { user: { id: uid } },
      relations: ['user'],
    })
  }

  async update(
    id: string,
    dto: UpdateInstructorDto,
  ): Promise<Instructor> {
    const inst = await this.findOne(id)
    Object.assign(inst, dto)
    if (dto.password) {
      inst.user.password = await bcrypt.hash(dto.password, 10)
    }
    return this.instRepo.save(inst)
  }

  async remove(id: string): Promise<{ message: string }> {
    const inst = await this.findOne(id)
    await this.instRepo.remove(inst)
    await this.userRepo.remove(inst.user)
    return { message: 'Instructor and user deleted' }
  }
}
