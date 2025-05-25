import 'dotenv/config'; // ✅ This will load the .env file automatically
import { DataSource } from 'typeorm';
import { User } from './user/entities/user.entity';
import { Instructor } from './instructor/entities/instructor.entity'; 
import { GymOwner } from './gym-owner/entities/gym-owner.entity';
import { Location } from './location/entities/location.entity';

import { Course }     from './course/entities/course.entity';
import { Program }    from './program/entities/program.entity';
import { CartItem } from './cart-item/entities/cart-item.entity';
import { Order } from './order/entities/order.entity';
import { OrderItem } from './order-item/entities/order-item.entity';
import { PromoCode } from './promo-code/entities/promo-code.entity';


export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, 
  entities: [User,Instructor,GymOwner,Location,
    Course, Program,
    CartItem, Order, OrderItem, PromoCode,
  ],
  migrations: ['src/migrations/*{.ts,.js}'],
});

