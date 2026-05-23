import { 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  IsNumber, 
  IsEnum, 
  IsArray, 
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryType } from '../entities/order.entity';
import { OrderStatus } from '../entities/order-status.enum';

class OrderItemDto {
  @IsNotEmpty()
  @IsNumber()
  product_id: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @IsOptional()
  @IsNumber()
  client_id?: number;

  @IsOptional()
  @IsString()
  client_name?: string;

  @IsOptional()
  @IsString()
  client_phone?: string;

  @IsOptional()
  @IsEnum(DeliveryType)
  deliveryType?: DeliveryType;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  statusComment?: string;
}
