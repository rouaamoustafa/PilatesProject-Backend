import {
  Controller, Post, Body, UseGuards, Req,
  Query, Get,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from './order.service';

@UseGuards(JwtAuthGuard)
@Controller('orders') // Correct: /api/orders
export class OrderController {
  constructor(private readonly svc: OrdersService) {}

  @Post('/checkout')
  checkout(
    @Req() req: any,
    @Body() dto: { promoCode?: string },
  ) {
    return this.svc.createFromCart(req.user.id, dto?.promoCode);
  }

  @Get('check')
  async checkIfPurchased(
    @Req() req: any,
    @Query('courseId') courseId: string,
  ) {
    console.log('Checking if purchased:', { userId: req.user.id, courseId });
    if (!courseId) return { purchased: false };
    const purchased = await this.svc.hasUserOrderedCourse(
      req.user.id,
      courseId,
    );
    console.log('Purchased result:', purchased);
    return { purchased }; // <- frontend expects {purchased: boolean}
  }
}
