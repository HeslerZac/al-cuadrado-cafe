import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.toSafeUser(await this.usersRepository.save(user));
  }

  findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findOneByEmail(email: string) {
    return this.usersRepository.findOne({ 
      where: { email, isActive: true },
      select: ['id', 'email', 'password', 'role', 'name'] 
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.toSafeUser(await this.usersRepository.save(user));
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    user.isActive = false;
    return this.toSafeUser(await this.usersRepository.save(user));
  }

  private toSafeUser(user: User) {
    const { password, ...safeUser } = user as User & { password?: string };
    void password;
    return safeUser;
  }
}
