import { Module, forwardRef }      from '@nestjs/common';
import { TypeOrmModule }           from '@nestjs/typeorm';
import { Order }                   from './entities/order.entity';
import { OrderItem }               from '../order-item/entities/order-item.entity';
import { OrdersService }           from './order.service';
import { CartItemModule } from 'src/cart-item/cart-item.module';
import { CartItem } from 'src/cart-item/entities/cart-item.entity';
import { OrderController } from './order.controller';

/* no controller – the cart service creates orders */
@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem,CartItem]),
    forwardRef(() => /* circular-safe */ CartItemModule),
  ],
  controllers: [OrderController],
  providers: [OrdersService],
  exports:   [OrdersService],
})
export class OrdersModule {}
