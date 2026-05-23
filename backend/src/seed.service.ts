import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { CategoriesService } from './categories/categories.service';
import { ProductsService } from './products/products.service';
import { ClientsService } from './clients/clients.service';
import { UserRole } from './users/entities/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private usersService: UsersService,
    private categoriesService: CategoriesService,
    private productsService: ProductsService,
    private clientsService: ClientsService,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
    await this.seedClients();
    await this.seedMenu();
  }

  private async seedUsers() {
    const admin = await this.usersService.findOneByEmail('admin@alcuadradocafe.com');
    if (!admin) {
      await this.usersService.create({
        name: 'Administrador',
        email: 'admin@alcuadradocafe.com',
        password: 'admin123',
        role: UserRole.ADMIN,
      });
      console.log('Seed: Admin user created');
    }
  }

  private async seedClients() {
    const client = await this.clientsService.findByPhone('50255555555');
    if (!client) {
      await this.clientsService.create({
        name: 'Cliente Demo',
        phone: '50255555555',
        address: 'Zona 1, Ciudad de Guatemala',
      });
      console.log('Seed: Demo client created');
    }

    const webClient = await this.clientsService.findByPhone('00000000');
    if (!webClient) {
      await this.clientsService.create({
        name: 'Cliente Web (Test)',
        phone: '00000000',
        address: 'Pedido desde la web',
      });
      console.log('Seed: Web client created');
    }
  }

  private async seedMenu() {
    const categories = await this.categoriesService.findAll();
    if (categories.length === 0) {
      const catH = await this.categoriesService.create({ name: 'Hamburguesas' });
      const catP = await this.categoriesService.create({ name: 'Pizzas' });
      const catB = await this.categoriesService.create({ name: 'Bebidas' });
      const catE = await this.categoriesService.create({ name: 'Extras' });

      await this.productsService.create({
        name: 'Hamburguesa clásica',
        description: 'Carne, queso, lechuga y tomate',
        price: 45.00,
        category_id: catH.id,
      });

      await this.productsService.create({
        name: 'Hamburguesa doble',
        description: 'Doble carne, doble queso',
        price: 65.00,
        category_id: catH.id,
      });

      await this.productsService.create({
        name: 'Pizza familiar',
        description: 'Pepperoni y jamón',
        price: 95.00,
        category_id: catP.id,
      });

      await this.productsService.create({
        name: 'Gaseosa',
        description: '350ml',
        price: 15.00,
        category_id: catB.id,
      });

      await this.productsService.create({
        name: 'Papas fritas',
        description: 'Porción grande',
        price: 25.00,
        category_id: catE.id,
      });

      console.log('Seed: Sample menu created');
    }
  }
}
