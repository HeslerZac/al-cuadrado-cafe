import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatusHistory } from './order-status-history.entity';
import { OrderStatus } from './order-status.enum';

export enum OrderSource {
  WHATSAPP = 'WHATSAPP',
  MANUAL = 'MANUAL',
}

export enum DeliveryType {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP',
}

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column()
  client_id: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.RECIBIDO,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: OrderSource,
    default: OrderSource.MANUAL,
  })
  source: OrderSource;

  @Column({ type: 'text', nullable: true })
  originalMessage: string;

  @Column({
    type: 'enum',
    enum: DeliveryType,
    default: DeliveryType.DELIVERY,
  })
  deliveryType: DeliveryType;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value),
  }})
  total: number;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => OrderStatusHistory, (history) => history.order, { cascade: true })
  statusHistory: OrderStatusHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
