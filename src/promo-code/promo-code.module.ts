import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoCode } from './entities/promo-code.entity';
import { PromoCodeService } from './promo-code.service';
import { PromoCodeController } from './promo-code.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PromoCode])],
  providers: [PromoCodeService],
  controllers: [PromoCodeController],
  exports: [PromoCodeService],
})
export class PromoCodeModule {}
