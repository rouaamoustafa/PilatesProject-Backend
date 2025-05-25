import {
  Entity, PrimaryGeneratedColumn, ManyToOne, Column,
} from 'typeorm';
import { Order }   from '../../order/entities/order.entity';
import { Course }  from '../../course/entities/course.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Order,  o => o.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Course, { eager: true, onDelete: 'CASCADE' })
  course: Course;

  @Column('numeric') price: number;
  @Column('int', { default: 1 }) qty: number;
}
