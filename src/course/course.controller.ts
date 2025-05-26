// src/course/course.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  ValidationPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CourseService,CourseGym }    from './course.service';
import { CreateCourseDto }  from './dto/create-course.dto';
import { UpdateCourseDto }  from './dto/update-course.dto';
import { Public }           from '../common/decorators/public.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/roles.enum';
import { Roles } from 'src/auth/roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';


@Controller('courses')
export class CourseController {
  constructor(private readonly svc: CourseService,
   
  ) {}

  @Post()
@UseGuards(JwtAuthGuard)
async create(@Body() dto: CreateCourseDto, @Req() req) {
  return this.svc.create(dto, req.user);
}


  
  @Public()
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
    );
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  
  @Public()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe({
      transform: true,            // <-- transforms payload types
      whitelist: true,            // strips out unknown props
      skipMissingProperties: true // lets you send only the fields you want
    }))
    dto: UpdateCourseDto,
  ) {
    return this.svc.update(id, dto);
  }
 
  @Public()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    // service remove should throw if not found
    return this.svc.remove(id).then(() => undefined);
  }
  @Public()
@Get('instructor/:instructorId')
getCoursesByInstructor(@Param('instructorId') instructorId: string) {
  return this.svc.findByInstructor(instructorId);
}


@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.GYM_OWNER)
@Post('me')
createAsGymOwner(@Req() req: any, @Body() dto: CreateCourseDto) {
  return this.svc.createByGymOwner(dto, req.user.id);
}

@UseGuards(JwtAuthGuard)
  @Get('gym-owner/me')
  async getCoursesForGymOwner(
    @Req() req,
    @Query('page') page = '0',
    @Query('pageSize') pageSize = '12',
    @Query('search') search = '',
  ) {
    return this.svc.findCoursesForGymOwner(
      req.user.id,
      Number(page),
      Number(pageSize),
      search,
    );
  }

  @Public()
  @Get('gym-owner/:id/courses-gym')
  async getCoursesGym(@Param('id') id: string): Promise<CourseGym[]> {
    return this.svc.getCoursesGym(id);
  }
@Get('instructor/me')
@UseGuards(JwtAuthGuard)
async getCoursesForInstructor(@Req() req, @Query('page') page = '0', @Query('pageSize') pageSize = '12', @Query('search') search = '') {
  console.log('Instructor ID from req.user.id:', req.user.id);
  return this.svc.findCoursesForInstructor(req.user.id, Number(page), Number(pageSize), search);
}

}
