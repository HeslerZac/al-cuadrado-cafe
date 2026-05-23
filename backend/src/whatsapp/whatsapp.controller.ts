import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @UseGuards(JwtAuthGuard)
  @Get('status')
  getStatus() {
    return this.whatsappService.getStatus();
  }

  @UseGuards(JwtAuthGuard)
  @Post('disconnect')
  disconnect() {
    return this.whatsappService.disconnect();
  }

  @Post('webhook')
  handleWebhook(@Body() data: any) {
    return this.whatsappService.handleWebhook(data);
  }

  @Post('web-chat')
  handleWebChat(@Body() data: { telefono: string; nombre: string; mensaje: string }) {
    return this.whatsappService.handleWebChat(data);
  }

  @Get('webhook')
  verifyWebhook(@Query() query: any) {
    return this.whatsappService.verifyWebhook(query);
  }
}
