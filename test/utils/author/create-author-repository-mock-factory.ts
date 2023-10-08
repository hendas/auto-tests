import { Repository } from 'typeorm';
import { CreateAuthorDto } from '../../../src/author/dto/create-author.dto';
import { UpdateAuthorDto } from '../../../src/author/dto/update-author.dto';
import { Author } from '../../../src/author/entities/author.entity';
import { MockType } from '../mock.type';

export const createAuthorRepositoryMockFactory: (
  authors: Author[],
) => () => MockType<Repository<Author>> = (authors: Author[]) =>
  jest.fn(() => ({
    find: jest.fn(() => authors),
    findOneBy: jest.fn(({ id }) => authors.find((author) => author.id === id)),
    update: jest.fn(({ id }, updateAuthorDto: UpdateAuthorDto) => {
      let affected = 0;
      authors.forEach((author) => {
        if (author.id === id) {
          author.updatedAt = new Date();
          author.firstName = updateAuthorDto.firstName ?? author.firstName;
          author.lastName = updateAuthorDto.lastName ?? author.lastName;
          affected++;
        }
      });
      return { affected };
    }),
    delete: jest.fn(({ id }) => {
      const index = authors.findIndex((author) => author.id === id);

      if (index < 0) {
        return { affected: 0 };
      }

      const { length } = authors.splice(index, 1);
      return { affected: length };
    }),
    create: jest.fn((createAuthorDto: CreateAuthorDto) => {
      const entity = new Author();
      const date = new Date();
      entity.id = authors.length + 1;
      entity.firstName = createAuthorDto.firstName;
      entity.lastName = createAuthorDto.lastName;
      entity.createdAt = date;
      entity.updatedAt = date;
      return entity;
    }),
    save: jest.fn((author) => {
      authors.push(author);
      return author;
    }),
  }));
