import { Controller, Post, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/order.dto';
import { OrderSource } from './entities/order.entity';

@Controller('public/orders')
export class PublicOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    // Orders from the web menu are marked as WHATSAPP source by default 
    // since they usually follow up on WhatsApp
    return this.ordersService.create(createOrderDto, OrderSource.WHATSAPP);
  }
}
