// src/course/course.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository }             from '@nestjs/typeorm';
import { Repository }                   from 'typeorm';
import { Course }                       from './entities/course.entity';
import { CreateCourseDto }              from './dto/create-course.dto';
import { UpdateCourseDto }              from './dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly repo: Repository<Course>,
  ) {}

  async create(dto: CreateCourseDto): Promise<Course> {
    const course = this.repo.create({
      ...dto,
      instructor: { id: dto.instructorId } as any,
      location:   dto.locationId ? { id: dto.locationId } as any : null,
    });
    return this.repo.save(course);
  }

  async findAll(
    page = 0,
    pageSize = 12,
    search = '',
  ): Promise<{
    courses: Course[];
    totalCount: number;
    page: number;
    pageSize: number;
  }> {
    const qb = this.repo
      .createQueryBuilder('c')
      // join instructor **and** the nested user
      .leftJoinAndSelect('c.instructor', 'instr')
      .leftJoinAndSelect('instr.user', 'user')
      .leftJoinAndSelect('c.location', 'loc');

    if (search) {
      qb.where('c.title ILIKE :s', { s: `%${search}%` });
    }

    const totalCount = await qb.getCount();
    const courses = await qb
      .orderBy('c.date', 'DESC')
      .skip(page * pageSize)
      .take(pageSize)
      .getMany();

    return { courses, totalCount, page, pageSize };
  }
  async findOne(id: string): Promise<Course> {
    const course = await this.repo.findOne({
      where: { id },
      relations: [
        'instructor',        // join the instructor relation
        'instructor.user',   // join the nested user on instructor
        'location',          // join location
      ],
    });
    if (!course) throw new NotFoundException(`Course ${id} not found`);
    return course;
  }

  async update(id: string, dto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);

    // handle relations
    if (dto.instructorId) {
      course.instructor = { id: dto.instructorId } as any;
    }
    if ('locationId' in dto) {
      course.location = dto.locationId
        ? ({ id: dto.locationId } as any)
        : null;
    }

    Object.assign(course, dto);
    delete (course as any).instructorId;
    delete (course as any).locationId;

    return this.repo.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    await this.repo.remove(course);
  }
}
