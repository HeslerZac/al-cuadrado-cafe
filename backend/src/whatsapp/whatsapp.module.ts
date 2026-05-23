import { Module, forwardRef } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { ClientsModule } from '../clients/clients.module';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { OllamaAssistantService } from './ollama-assistant.service';

@Module({
  imports: [
    ClientsModule, 
    forwardRef(() => OrdersModule), 
    ProductsModule
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService, OllamaAssistantService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
