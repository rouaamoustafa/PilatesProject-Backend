import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { CartItemService } from './cart-item.service';
import { CartItemController } from './cart-item.controller';
import { CoursesModule } from '../course/course.module';
import { UserModule } from '../user/user.module';
import { OrdersModule } from '../order/order.module'; // <<< import OrdersModule

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItem]),
    forwardRef(() => CoursesModule),
    UserModule,
    forwardRef(() => OrdersModule), // <<< wrap in forwardRef
  ],
  controllers: [CartItemController],
  providers: [CartItemService],
  exports: [CartItemService],
})
export class CartItemModule {}
