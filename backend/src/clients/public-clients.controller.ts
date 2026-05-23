import { Body, Controller, Post } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/client.dto';

@Controller('public/clients')
export class PublicClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post('login')
  login(@Body() loginDto: CreateClientDto) {
    return this.clientsService.loginOrCreate(loginDto);
  }
}
