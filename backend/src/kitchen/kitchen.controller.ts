import { Controller, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { KitchenService } from './kitchen.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { OrderStatus } from '../orders/entities/order-status.enum';

@Controller('kitchen')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.COCINA, UserRole.CAJERO)
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  @Get('orders')
  findAll() {
    return this.kitchenService.findAll();
  }

  @Get('orders/:id')
  findOne(@Param('id') id: string) {
    return this.kitchenService.findOne(+id);
  }

  @Patch('orders/:id/status')
  updateStatus(
    @Param('id') id: string, 
    @Body('status') status: OrderStatus,
    @Request() req: any
  ) {
    return this.kitchenService.updateStatus(+id, status, req.user);
  }
}
