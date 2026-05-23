import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KitchenService } from './kitchen.service';
import { KitchenController } from './kitchen.controller';
import { Order } from '../orders/entities/order.entity';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    OrdersModule,
  ],
  controllers: [KitchenController],
  providers: [KitchenService],
})
export class KitchenModule {}
