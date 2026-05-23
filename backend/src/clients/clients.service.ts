import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  create(createClientDto: CreateClientDto) {
    const client = this.clientsRepository.create(createClientDto);
    return this.clientsRepository.save(client);
  }

  findAll() {
    return this.clientsRepository.find();
  }

  async findOne(id: number) {
    const client = await this.clientsRepository.findOne({ where: { id } });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async findByPhone(phone: string) {
    return this.clientsRepository.findOne({ where: { phone } });
  }

  async upsertClient(data: { phone: string; name?: string; address?: string }) {
    const upsertData: any = { phone: data.phone };
    if (data.name) upsertData.name = data.name;
    if (data.address) upsertData.address = data.address;

    await this.clientsRepository.upsert(upsertData, ['phone']);

    return this.clientsRepository.findOne({ where: { phone: data.phone } });
  }

  async loginOrCreate(loginDto: CreateClientDto) {
    return this.upsertClient({
      phone: loginDto.phone,
      name: loginDto.name,
      address: loginDto.address,
    });
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    const client = await this.findOne(id);
    Object.assign(client, updateClientDto);
    return this.clientsRepository.save(client);
  }

  async remove(id: number) {
    const client = await this.findOne(id);
    return this.clientsRepository.remove(client);
  }
}
