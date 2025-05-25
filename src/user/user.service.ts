import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from './entities/user.entity';
import { Role } from '../auth/roles.enum'; // Relative import
import { CreateAdminDto } from './dto/create-admin.dto';

// ─── Add these two interfaces ────────────────────────────────────────
export interface PaginateParams {
  page: number;
  pageSize: number;
  filter: string;
}

export interface UsersResponse {
  users: User[];
  totalCount: number;
  page: number;
  pageSize: number;
}
// ─────────────────────────────────────────────────────────────────────

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  
  constructor(
    @InjectRepository(User)
    private  userRepo: Repository<User>,
  ) {}

  async createUser(data: RegisterUserDto, creatorRole: Role) {
    const allowed: Record<Role, Role[]> = {
      [Role.SUPERADMIN]: [Role.SUPERADMIN, Role.ADMIN, Role.GYM_OWNER, Role.INSTRUCTOR, Role.SUBSCRIBER],
      [Role.ADMIN]:      [Role.GYM_OWNER,  Role.INSTRUCTOR, Role.SUBSCRIBER],
      [Role.GYM_OWNER]:  [],
      [Role.INSTRUCTOR]: [],
      [Role.SUBSCRIBER]: [],
    };

    if (!allowed[creatorRole]?.includes(data.role)) {
      throw new ForbiddenException(`Creator role ${creatorRole} cannot assign role ${data.role}`);
    }

    const exists = await this.userRepo.findOne({ where: { email: data.email } });
    if (exists) throw new ConflictException('Email already exists');

    const hash = await bcrypt.hash(data.password, 10);
    const user = this.userRepo.create({ ...data, password: hash });
    return this.userRepo.save(user);
  }
   /** Create an ADMIN user (superadmin only) */
   async createAdmin(dto: CreateAdminDto): Promise<User> {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already exists');

    const hash = await bcrypt.hash(dto.password, 10);
    const admin = this.userRepo.create({
      full_name: dto.full_name,
      email: dto.email,
      password: hash,
      role: Role.ADMIN,
    });
    return this.userRepo.save(admin);
  }

  // /** Hard-delete an ADMIN user (superadmin only) */
  // async deleteAdminHard(id: string): Promise<void> {
  //   const user = await this.userRepo.findOne({ where: { id } });
  //   if (!user || user.role !== Role.ADMIN) {
  //     throw new NotFoundException('Admin not found');
  //   }
  //   await this.userRepo.remove(user);
  // }

  async getAllUsers(params: PaginateParams): Promise<UsersResponse> {
    const { page, pageSize, filter } = params;
    try {
      const qb = this.userRepo.createQueryBuilder('user');

      if (filter) {
        qb.where(
          'user.full_name ILIKE :f OR user.email ILIKE :f OR CAST(user.role AS TEXT) ILIKE :f',
        { f: `%${filter}%` },
        );
      }

      const totalCount = await qb.getCount();

      const users = await qb
        .orderBy('user.created_at', 'DESC')
        .skip(page * pageSize)
        .take(pageSize)
        .getMany();

      return { users, totalCount, page, pageSize };
    } catch (err) {
      this.logger.error(`Failed to get users: ${err.message}`, err.stack);
      throw err;
    }
  }

  async findUsersByRole(params: { role: Role; page: number; pageSize: number }) {
    const { role, page, pageSize } = params;
    try {
      const qb = this.userRepo.createQueryBuilder('user')
        .where('user.role = :role', { role });

      const totalCount = await qb.getCount();
      const users = await qb
        .orderBy('user.created_at', 'DESC')
        .skip(page * pageSize)
        .take(pageSize)
        .getMany();

      return { users, totalCount, page, pageSize };
    } catch (err) {
      this.logger.error(`Failed to find users by role: ${err.message}`, err.stack);
      throw err;
    }
  }

  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }
  
  async findByEmailWithRelations(email:string):Promise<User |null >{
    try{
      const user = await this.userRepo
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.instructor","instructor")
      .leftJoinAndSelect("user.gymOwner","gymOwner")
      .where("user.email = email",{email})
      .getOne()

      console.log(
        'User query result for ${email}:',user?'Found user with ID ${user.id},role ${user.role}':
        "No user found",
      )
      return user
    }
    catch(error){
      console.error("Error finding user by email with relations: $ {email}",
        error.stack || error 
      )
      return null
    }
  }
  findById(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  async findOneWithProfile(id: string): Promise<User> {
    return this.userRepo.findOneOrFail({
      where: { id },
      relations: ['instructorProfile', 'gymOwnerProfile', 'gymOwnerProfile.address'],
      withDeleted: true,
    });
  }

  async updateUser(id: string, data: Partial<RegisterUserDto>) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    Object.assign(user, data);
    return this.userRepo.save(user);
  }

  async deleteUser(id: string, hard = false) {
    if (hard) return this.hardDelete(id);
    return this.softDelete(id);
  }
  
  async softDelete(id: string) {
    const res = await this.userRepo.softDelete(id);
    if (!res.affected) throw new NotFoundException(`User ${id} not found`);
    return { message: 'User soft-deleted successfully' };
  }

  async hardDelete(id: string) {
    const user = await this.findOneWithProfile(id);
    await this.userRepo.remove(user);
    return { message: 'User hard-deleted successfully' };
  }

  async restore(id: string) {
    const res = await this.userRepo.restore(id);
    if (!res.affected) throw new NotFoundException(`Cannot restore ${id}`);
    return { message: 'User restored successfully' };
  }


}
