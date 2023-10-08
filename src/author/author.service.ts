import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from './entities/author.entity';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  async create(createClientDto: CreateAuthorDto): Promise<Author> {
    const entity = this.authorRepository.create(createClientDto);

    return this.authorRepository.save(entity);
  }

  async findAll(): Promise<Author[]> {
    return this.authorRepository.find({});
  }
  async findOne(id: number): Promise<Author> {
    const entity = await this.authorRepository.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException();
    }

    return entity;
  }

  async update(id: number, updateClientDto: UpdateAuthorDto) {
    const result = await this.authorRepository.update({ id }, updateClientDto);

    if (!result?.affected) {
      throw new NotFoundException();
    }

    return;
  }

  async remove(id: number) {
    const result = await this.authorRepository.delete({ id });

    if (!result.affected) {
      throw new NotFoundException();
    }

    return;
  }
}
