import {
  BadRequestException, Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import * as crypto from 'node:crypto';

import { CartItem } from './entities/cart-item.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { OrdersService } from 'src/order/order.service';

@Injectable()
export class CartItemService {
  constructor(
    @InjectRepository(CartItem) private repo: Repository<CartItem>,
    private readonly ordersService: OrdersService,
  ) {}

  /* ───────────────────────── add / update / delete ───────────────────────── */

  async add(userId: string, dto: AddCartItemDto) {
    const qty = dto.qty ?? 1;

    // Check if user already purchased this course
    const alreadyOrdered = await this.ordersService.hasUserOrderedCourse(userId, dto.courseId);
    if (alreadyOrdered) {
      throw new BadRequestException('You have already purchased this course.');
    }

    return this.repo.manager.transaction(async mgr => {
      const existing = await mgr.findOne(CartItem, {
        where: { user: { id: userId }, course: { id: dto.courseId } },
        relations: ['course'],
      });
      if (existing) return existing;

      return mgr.save(CartItem, {
        user:   { id: userId }    as any,
        course: { id: dto.courseId } as any,
        ...(qty !== 1 ? { qty } : {}),
      });
    });
  }

  findAll(userId: string) {
    return this.repo.find({
      where:     { user: { id: userId } },
      relations: ['course'],
      order:     { createdAt: 'DESC' },
    });
  }

  updateQty(userId: string, courseId: string, qty: number) {
    return this.repo.update(
      { user: { id: userId }, course: { id: courseId } },
      { qty },
    );
  }

  remove(userId: string, courseId: string) {
    return this.repo.delete({ user: { id: userId }, course: { id: courseId } });
  }

  clear(userId: string) {
    return this.repo.delete({ user: { id: userId } });
  }

  /* ──────────────────────────── checkout (no new entity) ─────────────────── */

  private findLinesByUser(userId: string) {
    return this.repo.find({
      where:     { user: { id: userId } },
      relations: ['course'],
    });
  }

  async checkout(userId: string) {
    return this.repo.manager.transaction(async mgr => {
      // 1) fetch only IN_CART lines
      const lines = await mgr.find(CartItem, {
        where: { user: { id: userId }, status: 'IN_CART' },
        relations: ['course'],
      });
      if (!lines.length) throw new BadRequestException('Cart is empty');
  
      // 2) compute total
      const total = lines.reduce((sum, l) => sum + l.course.price * l.qty, 0);
  
      // 3) mark as paid
      await Promise.all(
        lines.map(l =>
          mgr.update(
            CartItem,
            { id: l.id },
            { status: 'PAID' },
          )
        )
      );
  
      // 4) return a simple receipt
      return {
        paid: total,
        count: lines.length,
        items: lines.map(l => ({
          courseId: l.course.id,
          title:    l.course.title,
          price:    l.course.price,
        })),
      };
    });
  }
}
