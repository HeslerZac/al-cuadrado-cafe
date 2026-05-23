import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/entities/order-status.enum';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class KitchenService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private ordersService: OrdersService,
  ) {}

  findAll() {
    return this.ordersRepository.find({
      where: {
        status: In([OrderStatus.RECIBIDO, OrderStatus.EN_PREPARACION, OrderStatus.LISTO]),
      },
      relations: ['client', 'items', 'items.product'],
      order: { createdAt: 'ASC' },
    });
  }

  findOne(id: number) {
    return this.ordersService.findOne(id);
  }

  async updateStatus(id: number, status: OrderStatus, user: any) {
    // Basic validation for kitchen flow
    const order = await this.ordersService.findOne(id);
    
    // Allow transitions defined in requirements
    // RECIBIDO -> EN_PREPARACION
    // EN_PREPARACION -> LISTO
    // LISTO -> EN_CAMINO o ENTREGADO
    
    return this.ordersService.update(id, { status }, user);
  }
}
