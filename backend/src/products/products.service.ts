import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  create(createProductDto: CreateProductDto) {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  findAll(category_id?: number, availableOnly?: boolean) {
    const where: any = {};
    if (category_id) where.category_id = category_id;
    if (availableOnly !== undefined) where.isAvailable = availableOnly;
    
    return this.productsRepository.find({ 
      where,
      relations: ['category'] 
    });
  }

  async findOne(id: number) {
    const product = await this.productsRepository.findOne({ 
      where: { id },
      relations: ['category'] 
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    product.isAvailable = false;
    return this.productsRepository.save(product);
  }
}
