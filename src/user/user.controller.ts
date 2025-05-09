import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Query,
  Patch,
  UseGuards,
  Req,
  Logger,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService, UsersResponse } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum'; // Relative import

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  create(
    @Body() dto: RegisterUserDto,
    @Query('creatorRole') creatorRole: Role, // e.g. passed from your JWT payload
  ) {
    return this.userService.createUser(dto, creatorRole);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: any) {
    return this.userService.findOneWithProfile(req.user.sub);
  }

  @Get()
@Roles(Role.SUPERADMIN, Role.ADMIN)
findAll(
  @Query('page') page = '0',
  @Query('pageSize') pageSize = '10',
  @Query('filter') filter = '',
): Promise<UsersResponse> {
  return this.userService.getAllUsers({
    page: Number(page),
    pageSize: Number(pageSize),
    filter,
  });
}

  @Get('role/:role')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  findByRole(
    @Param('role') role: Role,
    @Query('page') page = '0',
    @Query('pageSize') pageSize = '10',
  ) {
    return this.userService.findUsersByRole({
      role,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get(':id/profile')
  getUserProfile(@Param('id') id: string) {
    return this.userService.findOneWithProfile(id);
  }

  @Patch(':id')
  @Roles('admin', 'superadmin')
  update(@Param('id') id: string, @Body() data: Partial<RegisterUserDto>) {
    return this.userService.updateUser(id, data);
  }

  @Delete(':id')
  @Roles('admin', 'superadmin')
  delete(
    @Param('id') id: string,
    @Query('hard') hard: string,
  ) {
    return this.userService.deleteUser(id, hard === 'true');
  }

  @Post(':id/restore')
  @Roles('superadmin')
  restore(@Param('id') id: string) {
    return this.userService.restore(id);
  }
}
