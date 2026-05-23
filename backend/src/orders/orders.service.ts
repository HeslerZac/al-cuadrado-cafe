import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderSource } from './entities/order.entity';
import { OrderStatus } from './entities/order-status.enum';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { ClientsService } from '../clients/clients.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(OrderStatusHistory)
    private historyRepository: Repository<OrderStatusHistory>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private clientsService: ClientsService,
    private dataSource: DataSource,
    @Inject(forwardRef(() => WhatsappService))
    private whatsappService: WhatsappService,
  ) {}

  async create(createOrderDto: CreateOrderDto, source: OrderSource = OrderSource.MANUAL, user?: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { items: orderItems, client_name, client_phone, ...orderData } = createOrderDto;

      let clientId = createOrderDto.client_id;

      // Si no hay ID de cliente pero hay datos de contacto, hacemos upsert
      if (!clientId && client_phone) {
        const client = await this.clientsService.upsertClient({
          phone: client_phone,
          name: client_name,
          address: orderData.address,
        });
        if (!client) {
          throw new Error('No se pudo encontrar ni crear el cliente para esta orden.');
        }
        clientId = client.id;
      }

      let total = 0;
      const order = this.ordersRepository.create({
        ...orderData,
        client_id: clientId,
        source,
        total: 0,
        status: OrderStatus.RECIBIDO,
      });

      const savedOrder = await queryRunner.manager.save(order);
      const items: OrderItem[] = [];

      for (const itemDto of orderItems) {
        const product = await queryRunner.manager.findOne(Product, { where: { id: itemDto.product_id } });
        if (!product) throw new NotFoundException(`Product ${itemDto.product_id} not found`);

        const unitPrice = Number(product.price);
        const quantity = Number(itemDto.quantity);
        const subtotal = unitPrice * quantity;
        total += subtotal;

        const orderItem = queryRunner.manager.create(OrderItem, {
          order: savedOrder,
          product,
          product_id: product.id,
          quantity,
          unitPrice,
          subtotal,
          notes: itemDto.notes,
        });
        items.push(orderItem);
      }

      await queryRunner.manager.save(items);
      savedOrder.total = total;
      await queryRunner.manager.save(savedOrder);

      const history = this.historyRepository.create({
        order: savedOrder,
        status: OrderStatus.RECIBIDO,
        changedBy: user ? user.name : (source === OrderSource.WHATSAPP ? 'SYSTEM' : 'UNKNOWN'),
        comment: 'Pedido recibido',
      });
      await queryRunner.manager.save(history);

      await queryRunner.commitTransaction();
      return this.findOne(savedOrder.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  findAll(status?: OrderStatus) {
    const where: any = {};
    if (status) where.status = status;
    return this.ordersRepository.find({
      where,
      relations: ['client', 'items', 'items.product', 'statusHistory'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['client', 'items', 'items.product', 'statusHistory'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto, user?: any) {
    const order = await this.findOne(id);
    const oldStatus = order.status;

    if (updateOrderDto.status && updateOrderDto.status !== oldStatus) {
      const history = this.historyRepository.create({
        order,
        status: updateOrderDto.status,
        changedBy: user ? user.name : 'UNKNOWN',
        comment: updateOrderDto.statusComment || `Estado cambiado de ${oldStatus} a ${updateOrderDto.status}`,
      });
      await this.historyRepository.save(history);
      order.status = updateOrderDto.status;

      // Notificación automática si pasa a LISTO
      if (order.status === OrderStatus.LISTO && order.client?.phone) {
        const message = `✅ ¡Hola! Tu pedido *#${String(order.id).padStart(4, '0')}* en Al Cuadrado Cafe está *LISTO*. ¡Puedes pasar a recogerlo!`;
        this.whatsappService.sendNotification(order.client.phone, message).catch(err => {
          console.error('[SISTEMA] Error al enviar notificación de LISTO:', err);
        });
      }
    }

    if (updateOrderDto.address) order.address = updateOrderDto.address;
    if (updateOrderDto.notes) order.notes = updateOrderDto.notes;

    return this.ordersRepository.save(order);
  }

  async remove(id: number, user?: any) {
    return this.update(id, { status: OrderStatus.CANCELADO, statusComment: 'Pedido eliminado por usuario' }, user);
  }
}
