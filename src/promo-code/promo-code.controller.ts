import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PromoCodeService } from './promo-code.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERADMIN, Role.INSTRUCTOR)
@Controller('promo-codes')
export class PromoCodeController {
  constructor(private svc: PromoCodeService) {}

  @Post()
  create(@Body() dto: CreatePromoCodeDto) { return this.svc.create(dto); }
}
