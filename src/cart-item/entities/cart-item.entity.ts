// src/cart-item/entities/cart-item.entity.ts
import {
  Entity, PrimaryGeneratedColumn, ManyToOne,
  CreateDateColumn, Column, Unique,
} from 'typeorm';
import { User }   from '../../user/entities/user.entity';
import { Course } from '../../course/entities/course.entity';

export type CartStatus = 'IN_CART' | 'PAID';

@Entity('cart_items')
@Unique(['user','course'])
export class CartItem {
  @PrimaryGeneratedColumn('uuid')    id: string;

  @ManyToOne(() => User, u => u.id, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Course, c => c.id, { eager: true, onDelete: 'CASCADE' })
  course: Course;

  @Column('int',    { default: 1      })            qty: number;

  // ← NEW: add this
  @Column({
    type:    'enum',
    enum:    ['IN_CART','PAID'],
    default: 'IN_CART',
  })
  status: CartStatus;

  @CreateDateColumn() createdAt: Date;
}
