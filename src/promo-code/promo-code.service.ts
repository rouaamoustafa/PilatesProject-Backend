import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCode } from './entities/promo-code.entity';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';

@Injectable()
export class PromoCodeService {
  constructor(
    @InjectRepository(PromoCode) private repo: Repository<PromoCode>,
  ) {}

  create(dto: CreatePromoCodeDto) {
    return this.repo.save({
      ...dto,
      instructor: { id: dto.instructorId } as any,
    });
  }

  findOneByCode(code: string) {
    return this.repo.findOne({ where: { code }, relations: ['instructor'] });
  }

  incrementUses(id: string) { return this.repo.increment({ id }, 'uses', 1); }
}
