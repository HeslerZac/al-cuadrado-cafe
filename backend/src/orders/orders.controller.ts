import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Query, 
  Request 
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { OrderStatus } from './entities/order-status.enum';
import { DeliveryType, OrderSource } from './entities/order.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CAJERO)
  create(@Body() createOrderDto: CreateOrderDto, @Request() req: any) {
    return this.ordersService.create(createOrderDto, undefined, req.user);
  }

  @Get()
  findAll(@Query('status') status?: OrderStatus) {
    return this.ordersService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.CAJERO, UserRole.COCINA, UserRole.REPARTIDOR)
  updateStatus(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto, @Request() req: any) {
    return this.ordersService.update(+id, updateOrderDto, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.CAJERO)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto, @Request() req: any) {
    return this.ordersService.update(+id, updateOrderDto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.CAJERO)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.ordersService.remove(+id, req.user);
  }
}
