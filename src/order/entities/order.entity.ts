import {
  Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany,
  Column, CreateDateColumn,
} from 'typeorm';
import { User }       from '../../user/entities/user.entity';
import { OrderItem }  from '../../order-item/entities/order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @Column({ nullable: true }) promoCode?: string;
  @Column({ nullable: true }) paymentId?: string;
  @Column('numeric')          total: number;

  @OneToMany(() => OrderItem, i => i.order, {
    cascade: ['insert'],
    eager:   true,
  })
  items: OrderItem[];

  @CreateDateColumn() createdAt: Date;
}
