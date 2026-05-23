import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { ClientsModule } from './clients/clients.module';
import { KitchenModule } from './kitchen/kitchen.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

import { Category } from './categories/entities/category.entity';
import { Product } from './products/entities/product.entity';
import { User } from './users/entities/user.entity';
import { Client } from './clients/entities/client.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { OrderStatusHistory } from './orders/entities/order-status-history.entity';

import { SeedService } from './seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST') ?? configService.get<string>('DB_HOST', 'postgres'),
        port: Number(configService.get<string>('DATABASE_PORT') ?? configService.get<string>('DB_PORT', '5432')),
        username: configService.get<string>('DATABASE_USER') ?? configService.get<string>('DB_USERNAME', 'admin'),
        password: configService.get<string>('DATABASE_PASSWORD') ?? configService.get<string>('DB_PASSWORD', 'admin123'),
        database: configService.get<string>('DATABASE_NAME') ?? configService.get<string>('DB_NAME', 'al_cuadrado_cafe_db'),
        entities: [Category, Product, User, Client, Order, OrderItem, OrderStatusHistory],
        synchronize: configService.get<string>('TYPEORM_SYNC', 'true') === 'true',
      }),
    }),
    AuthModule,
    UsersModule,
    ClientsModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    KitchenModule,
    WhatsappModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}
