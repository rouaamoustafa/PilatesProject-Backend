// src/course/course.service.ts
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository }             from '@nestjs/typeorm';
import { In, Repository }                   from 'typeorm';
import { Course }                       from './entities/course.entity';
import { CreateCourseDto }              from './dto/create-course.dto';
import { UpdateCourseDto }              from './dto/update-course.dto';
import { GymOwner } from '../gym-owner/entities/gym-owner.entity';
import { Instructor } from '../instructor/entities/instructor.entity';

export interface CourseGym {
  id: string;
  title: string;
  days: string;         // e.g. "Mondays & Wednesdays" or recurrence pattern
  time: string;         // e.g. "09.00am - 10.00am"
  instructorName: string;
  bookUrl: string;      // /book/...
}
@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly repo: Repository<Course>,

    @InjectRepository(GymOwner)
    private readonly gymOwnerRepo: Repository<GymOwner>,

    @InjectRepository(Instructor)
    private readonly instructorRepo: Repository<Instructor>,
  ) {}

  async create(dto: CreateCourseDto, user: any): Promise<Course> {
  if (user.role === 'gym_owner') {
    const instructor = await this.instructorRepo.findOne({
      where: { id: dto.instructorId },
      relations: ['gymOwner'],
    });
   
  }
  const course = this.repo.create({
    ...dto,
    instructor: { id: dto.instructorId } as any,
    location: dto.locationId ? { id: dto.locationId } as any : null,
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

  async findByInstructor(instructorId: string): Promise<Course[]> {
  const courses = await this.repo.find({
    where: {
      instructor: { id: instructorId },
    },
    relations: ['instructor', 'instructor.user', 'location'],
    order: {
      date: 'DESC',
    },
  });

  return courses;
}


// Inject GymOwnerRepository and InstructorRepository if needed

async createByGymOwner(dto: CreateCourseDto, gymOwnerUserId: string): Promise<Course> {
  // 1. Find gym owner by user id
  const owner = await this.gymOwnerRepo.findOne({
    where: { user: { id: gymOwnerUserId } },
    relations: ['instructors', 'user'], // Add 'user' relation if missing
  });
  if (!owner) throw new BadRequestException('Gym owner not found');

  // 2. Check that instructorId is in their instructors
  const instructorOk = owner.instructors.some(inst => inst.id === dto.instructorId);
  if (!instructorOk) throw new BadRequestException('Instructor does not belong to this gym owner');

  // 3. Proceed as normal
  return this.create(dto, owner.user);
}

// async findByGymOwner(gymOwnerUserId: string): Promise<Course[]> {
//   // Find the gym owner by user id
//   const gymOwner = await this.gymOwnerRepo.findOne({
//     where: { user: { id: gymOwnerUserId } },
//     relations: ['instructors'],
//   });
//   if (!gymOwner) return [];

//   // Get all instructor IDs for this gym owner
//   const instructorIds = gymOwner.instructors.map(i => i.id);

//   // Get all courses for these instructors
//   return this.repo.find({
//     where: {
//       instructor: { id: In(instructorIds) },
//     },
//     relations: ['instructor', 'instructor.user', 'location'],
//     order: { date: 'DESC' }
//   });
// }
async findByGymOwner(gymOwnerId: string): Promise<Course[]> {
  return this.repo.createQueryBuilder('course')
    .leftJoinAndSelect('course.instructor', 'instructor')
    .leftJoinAndSelect('instructor.user', 'user')
    .leftJoinAndSelect('course.location', 'location')
    .where('instructor.gymOwner = :gymOwnerId', { gymOwnerId })
    .orderBy('course.date', 'DESC')
    .getMany();
}

async findCoursesForGymOwner(
    gymOwnerUserId: string,
    page = 0,
    pageSize = 12,
    search = ''
  ) {
    const gymOwner = await this.gymOwnerRepo.findOne({
      where: { user: { id: gymOwnerUserId } },
      relations: ['instructors'],
    });
    if (!gymOwner) return { courses: [], totalCount: 0, page, pageSize };

    const instructorIds = gymOwner.instructors.map(i => i.id);

    const qb = this.repo.createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('instructor.user', 'user')
      .leftJoinAndSelect('course.location', 'location')
      .where('course.instructorId IN (:...ids)', { ids: instructorIds });

    if (search) {
      qb.andWhere('course.title ILIKE :search', { search: `%${search}%` });
    }

    const totalCount = await qb.getCount();

    const courses = await qb
      .orderBy('course.date', 'DESC')
      .skip(page * pageSize)
      .take(pageSize)
      .getMany();

    return { courses, totalCount, page, pageSize };
  }

  // src/course/course.service.ts
async getCoursesGym(gymOwnerId: string): Promise<CourseGym[]> {
  // 1. Find owner
  const owner = await this.gymOwnerRepo.findOne({
    where: { id: gymOwnerId },
    relations: ['instructors'],
  });
  if (!owner) return [];

  // 2. Get instructor IDs
  const instructorIds = owner.instructors.map(i => i.id);

  // 3. Get courses for these instructors
  const courses = await this.repo.find({
    where: { instructor: { id: In(instructorIds) } },
    relations: ['instructor', 'instructor.user'],
    order: { date: 'ASC', startTime: 'ASC' },
  });

  // 4. Transform
  return courses.map(c => ({
    id: c.id,
    title: c.title,
    days: formatRecurrence(c), // See helper below
    time: formatTimeRange(c.startTime, c.durationMinutes),
    instructorName: c.instructor?.user?.full_name || '',
    bookUrl: `/book/${c.id}`,
  }));

  // Helper: time formatting (returns "09.00am - 10.00am")
  function formatTimeRange(start: string, duration: number): string {
    const [h, m] = start.split(':').map(Number);
    const startDate = new Date(0, 0, 0, h, m);
    const endDate = new Date(startDate.getTime() + duration * 60000);
    const fmt = (d: Date) =>
      `${String((d.getHours() % 12) || 12).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}${d.getHours() < 12 ? 'am' : 'pm'}`;
    return `${fmt(startDate)} - ${fmt(endDate)}`;
  }

  // Helper: days/recurrence
  function formatRecurrence(course: any): string {
    // Adjust logic based on your data model
    // e.g., if you have c.recurrence, use it, otherwise use c.date
    if (course.recurrence) return course.recurrence;
    if (course.days) return course.days;
    if (course.date) {
      // Format YYYY-MM-DD to readable day, e.g., "Monday"
      try {
        const d = new Date(course.date);
        return d.toLocaleDateString('en-US', { weekday: 'long' });
      } catch {
        return course.date;
      }
    }
    return '';
  }
}



// src/course/course.service.ts
async findCoursesForInstructor(
  instructorId: string,
  page = 0,
  pageSize = 12,
  search = ''
) {
  const qb = this.repo.createQueryBuilder('course')
    .leftJoinAndSelect('course.instructor', 'instructor')
    .leftJoinAndSelect('instructor.user', 'user')
    .leftJoinAndSelect('course.location', 'location')
    .where('course.instructorId = :id', { id: instructorId });

  if (search) {
    qb.andWhere('course.title ILIKE :search', { search: `%${search}%` });
  }

  const totalCount = await qb.getCount();

  const courses = await qb
    .orderBy('course.date', 'DESC')
    .skip(page * pageSize)
    .take(pageSize)
    .getMany();

  return { courses, totalCount, page, pageSize };
}

}
