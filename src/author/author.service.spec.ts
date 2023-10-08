import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Author } from './entities/author.entity';
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import {
  MockType,
  authorsMock,
  notFound,
  createAuthorRepositoryMockFactory,
} from '../../test/utils/';

describe('AuthorService', () => {
  let authorService: AuthorService;
  let authorRepositoryMock: MockType<Repository<Author>>;
  let authors: Author[];

  beforeEach(async () => {
    authors = structuredClone(authorsMock);

    const authorRepositoryMockFactory =
      createAuthorRepositoryMockFactory(authors);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorService,
        {
          provide: getRepositoryToken(Author),
          useFactory: authorRepositoryMockFactory,
        },
      ],
    }).compile();

    authorService = module.get<AuthorService>(AuthorService);
    authorRepositoryMock = module.get(getRepositoryToken(Author));
  });

  it('should be defined', () => {
    expect(authorService).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(authorService.create).toBeDefined();
    });

    it('create correct author', async () => {
      const countBefore = authors.length;
      const createAuthorDto: CreateAuthorDto = {
        firstName: 'FirstName',
        lastName: 'LastName',
      };

      const expectedAuthor = {
        id: countBefore + 1,
        firstName: createAuthorDto.firstName,
        lastName: createAuthorDto.lastName,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      expect(await authorService.create(createAuthorDto)).toEqual(
        expectedAuthor,
      );

      expect(authors.length).not.toEqual(countBefore);
      expect(authors.length).toEqual(countBefore + 1);

      expect(authorRepositoryMock.create).toHaveBeenCalledTimes(1);
      expect(authorRepositoryMock.create).toHaveBeenCalledWith(createAuthorDto);

      expect(authorRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(authorRepositoryMock.save).toHaveBeenCalledWith(expectedAuthor);
    });
  });

  describe('findAll', () => {
    it('should be defined', () => {
      expect(authorService.findAll).toBeDefined();
    });

    it('return correct values', async () => {
      expect(await authorService.findAll()).toEqual(authors);

      expect(authorRepositoryMock.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should be defined', () => {
      expect(authorService.findOne).toBeDefined();
    });

    it('return correct value', async () => {
      const author = authors[0];

      expect(await authorService.findOne(author.id)).toEqual(author);

      expect(authorRepositoryMock.findOneBy).toHaveBeenCalledTimes(1);
      expect(authorRepositoryMock.findOneBy).toHaveBeenCalledWith({
        id: author.id,
      });
    });

    it('throw 404 exception', async () => {
      let message: string;
      let statusCode: number;

      const incorrectIndex = authors.length + 1;

      try {
        await authorService.findOne(incorrectIndex);
      } catch (e) {
        statusCode = e.response.statusCode;
        message = e.response.message;
      }

      expect(message).toEqual(notFound.message);
      expect(statusCode).toEqual(notFound.statusCode);

      expect(authorRepositoryMock.findOneBy).toHaveBeenCalledTimes(1);
      expect(authorRepositoryMock.findOneBy).toHaveBeenCalledWith({
        id: incorrectIndex,
      });
    });
  });

  describe('update', () => {
    let author: Author;
    let authorCopy: Author;

    beforeEach(() => {
      author = authors[0];
      authorCopy = structuredClone(author);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should be defined', () => {
      expect(authorService.update).toBeDefined();
    });

    it('update firstName', async () => {
      const updateAuthorDto: UpdateAuthorDto = {
        firstName: 'UpdatedName',
      };
      const fakeUpdatedDate = new Date('2023-10-08T09:48:39.599Z');
      jest.useFakeTimers().setSystemTime(fakeUpdatedDate);

      await authorService.update(author.id, updateAuthorDto);
      expect(author).toEqual({
        createdAt: authorCopy.createdAt,
        firstName: updateAuthorDto.firstName,
        id: authorCopy.id,
        lastName: authorCopy.lastName,
        updatedAt: fakeUpdatedDate,
      });

      expect(author.firstName).not.toBe(authorCopy.firstName);
      expect(author.updatedAt).not.toBe(authorCopy.updatedAt);

      expect(authorRepositoryMock.update).toHaveBeenCalledTimes(1);
      expect(authorRepositoryMock.update).toHaveBeenCalledWith(
        {
          id: author.id,
        },
        updateAuthorDto,
      );
    });

    it('update lastName', async () => {
      const updateAuthorDto: UpdateAuthorDto = {
        lastName: 'UpdatedLastName',
      };
      const fakeUpdatedDate = new Date('2023-10-08T09:48:39.599Z');
      jest.useFakeTimers().setSystemTime(fakeUpdatedDate);

      await authorService.update(author.id, updateAuthorDto);
      expect(author).toEqual({
        createdAt: authorCopy.createdAt,
        lastName: updateAuthorDto.lastName,
        id: authorCopy.id,
        firstName: authorCopy.firstName,
        updatedAt: fakeUpdatedDate,
      });

      expect(author.lastName).not.toBe(authorCopy.lastName);
      expect(author.updatedAt).not.toBe(authorCopy.updatedAt);

      expect(authorRepositoryMock.update).toHaveBeenCalledTimes(1);
      expect(authorRepositoryMock.update).toHaveBeenCalledWith(
        {
          id: author.id,
        },
        updateAuthorDto,
      );
    });

    it('update firstName and lastName', async () => {
      const updateAuthorDto: UpdateAuthorDto = {
        lastName: 'UpdatedLastName',
        firstName: 'UpdatedFirstName',
      };
      const fakeUpdatedDate = new Date('2023-10-08T09:48:39.599Z');
      jest.useFakeTimers().setSystemTime(fakeUpdatedDate);

      await authorService.update(author.id, updateAuthorDto);
      expect(author).toEqual({
        createdAt: authorCopy.createdAt,
        lastName: updateAuthorDto.lastName,
        id: authorCopy.id,
        firstName: updateAuthorDto.firstName,
        updatedAt: fakeUpdatedDate,
      });

      expect(author.lastName).not.toBe(authorCopy.lastName);
      expect(author.firstName).not.toBe(authorCopy.firstName);
      expect(author.updatedAt).not.toBe(authorCopy.updatedAt);

      expect(authorRepositoryMock.update).toHaveBeenCalledTimes(1);
      expect(authorRepositoryMock.update).toHaveBeenCalledWith(
        {
          id: author.id,
        },
        updateAuthorDto,
      );
    });

    it('throw 404 exception', async () => {
      let message: string;
      let statusCode: number;

      const incorrectIndex = authors.length + 1;

      const updateAuthorDto = {
        firstName: 'UpdatedName',
        lastName: 'UpdatedLastName',
      };

      try {
        await authorService.update(incorrectIndex, updateAuthorDto);
      } catch (e) {
        statusCode = e.response.statusCode;
        message = e.response.message;
      }

      expect(message).toEqual(notFound.message);
      expect(statusCode).toEqual(notFound.statusCode);

      expect(authorRepositoryMock.update).toHaveBeenCalledTimes(1);
      expect(authorRepositoryMock.update).toHaveBeenCalledWith(
        {
          id: incorrectIndex,
        },
        updateAuthorDto,
      );
    });
  });

  describe('remove', () => {
    it('should be defined', () => {
      expect(authorService.remove).toBeDefined();
    });

    it('delete correct author', async () => {
      const author = authors[0];

      await authorService.remove(author.id);

      expect(authors).not.toContain(author);

      expect(authorRepositoryMock.delete).toHaveBeenCalledTimes(1);
      expect(authorRepositoryMock.delete).toHaveBeenCalledWith({
        id: author.id,
      });
    });

    it('throw 404 exception', async () => {
      let message: string;
      let statusCode: number;

      const incorrectIndex = authors.length + 1;

      try {
        await authorService.remove(incorrectIndex);
      } catch (e) {
        statusCode = e.response.statusCode;
        message = e.response.message;
      }

      expect(message).toEqual(notFound.message);
      expect(statusCode).toEqual(notFound.statusCode);

      expect(authorRepositoryMock.delete).toHaveBeenCalledTimes(1);
      expect(authorRepositoryMock.delete).toHaveBeenCalledWith({
        id: incorrectIndex,
      });
    });
  });
});
