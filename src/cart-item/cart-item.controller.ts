import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Req,
} from '@nestjs/common';
import { JwtAuthGuard }   from '../auth/jwt-auth.guard';
import { CartItemService } from './cart-item.service';
import { AddCartItemDto }  from './dto/add-cart-item.dto';
import { UpdateQtyDto }    from './dto/update-qty.dto';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartItemController {
  constructor(private svc: CartItemService) {}

  @Get()
  me(@Req() r) { 
    console.log('cart: user in req:', r.user);
    return this.svc.findAll(r.user.id); }

  @Post()
  add(@Req() r, @Body() dto: AddCartItemDto) {
    console.log(dto)
    return this.svc.add(r.user.id, dto);
  }

  @Patch(':courseId')
  setQty(
    @Req() r,
    @Param('courseId') courseId: string,
    @Body() dto: UpdateQtyDto,
  ) {
    return this.svc.updateQty(r.user.id, courseId, dto.qty);
  }
  
  @Delete(':courseId')
  del(@Req() r, @Param('courseId') courseId: string) {
    return this.svc.remove(r.user.id, courseId);
  }

  @Post('checkout')
  checkout(
    @Req() r,) {
    return this.svc.checkout(r.user.id);
  }
}

