import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CartItem }   from '../cart-item/entities/cart-item.entity';
import { Order }      from './entities/order.entity';
import { OrderItem }  from '../order-item/entities/order-item.entity'; // fixed import

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(CartItem)   private cartRepo:      Repository<CartItem>,
    @InjectRepository(Order)      private orderRepo:     Repository<Order>,
    @InjectRepository(OrderItem)  private orderItemRepo: Repository<OrderItem>,
  ) {}

  async createFromCart(userId: string, promo?: string) {
    // 1) gather cart rows
    const lines = await this.cartRepo.find({
      where: { user: { id: userId } },
      relations: { course: true },
      order: { createdAt: 'ASC' },
    });
    if (!lines.length) throw new BadRequestException('Cart is empty');

    // 2) compute total
    let total = lines.reduce((s, l) => s + +l.course.price * l.qty, 0);
    if (promo === 'FREE100') total = 0;

    // 3) build order items
    const items = lines.map(l =>
      this.orderItemRepo.create({
        course: { id: l.course.id } as any,
        qty: l.qty,
        price: l.course.price,
      })
    );

    // 4) build and save the order (cascades order items)
    const order = this.orderRepo.create({
      user: { id: userId } as any,
      promoCode: promo,
      total,
      items,
    });
    await this.orderRepo.save(order);

    // 5) clear cart
    await this.cartRepo.delete({ user: { id: userId } });

    return order;
  }

  async hasUserOrderedCourse(userId: string, courseId: string) {
    const existing = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.items', 'item')
      .where('order.user = :userId', { userId })
      .andWhere('item.course = :courseId', { courseId })
      .getOne();
    return !!existing;
  }
}
