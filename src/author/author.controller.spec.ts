import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Author } from './entities/author.entity';
import { AuthorController } from './author.controller';
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import {
  MockType,
  authorsMock,
  notFound,
  createAuthorRepositoryMockFactory,
} from '../../test/utils/';

describe('AuthorController', () => {
  let authorController: AuthorController;
  let authorService: AuthorService;
  let authorRepositoryMock: MockType<Repository<Author>>;
  let authors: Author[];

  beforeEach(async () => {
    authors = structuredClone(authorsMock);

    const authorRepositoryMockFactory =
      createAuthorRepositoryMockFactory(authors);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorController],
      providers: [
        AuthorService,
        {
          provide: getRepositoryToken(Author),
          useFactory: authorRepositoryMockFactory,
        },
      ],
    }).compile();

    authorController = module.get<AuthorController>(AuthorController);
    authorService = module.get<AuthorService>(AuthorService);
    authorRepositoryMock = module.get(getRepositoryToken(Author));
  });

  it('should be defined', () => {
    expect(authorController).toBeDefined();
  });

  describe('create', () => {
    let spyCreate: jest.SpyInstance;

    beforeEach(() => {
      spyCreate = jest.spyOn(authorService, 'create');
    });

    it('should be defined', () => {
      expect(authorController.create).toBeDefined();
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

      expect(await authorController.create(createAuthorDto)).toEqual(
        expectedAuthor,
      );

      expect(authors.length).not.toEqual(countBefore);
      expect(authors.length).toEqual(countBefore + 1);

      expect(spyCreate).toHaveBeenCalledTimes(1);

      expect(authorRepositoryMock.create).toHaveBeenCalledTimes(1);
      expect(authorRepositoryMock.create).toHaveBeenCalledWith(createAuthorDto);

      expect(authorRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(authorRepositoryMock.save).toHaveBeenCalledWith(expectedAuthor);
    });
  });

  describe('findAll', () => {
    let spyFindAll: jest.SpyInstance;

    beforeEach(() => {
      spyFindAll = jest.spyOn(authorService, 'findAll');
    });

    it('should be defined', () => {
      expect(authorController.findAll).toBeDefined();
    });

    it('return correct values', async () => {
      expect(await authorController.findAll()).toEqual(authors);

      expect(spyFindAll).toHaveBeenCalledTimes(1);

      expect(authorRepositoryMock.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    let spyFindOne: jest.SpyInstance;

    beforeEach(() => {
      spyFindOne = jest.spyOn(authorService, 'findOne');
    });

    it('should be defined', () => {
      expect(authorController.findOne).toBeDefined();
    });

    it('return correct value', async () => {
      const author = authors[0];

      expect(await authorController.findOne(author.id.toString())).toEqual(
        author,
      );

      expect(spyFindOne).toHaveBeenCalledTimes(1);
      expect(spyFindOne).toHaveBeenCalledWith(author.id);

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
        await authorController.findOne(incorrectIndex.toString());
      } catch (e) {
        statusCode = e.response.statusCode;
        message = e.response.message;
      }

      expect(message).toEqual(notFound.message);
      expect(statusCode).toEqual(notFound.statusCode);

      expect(spyFindOne).toHaveBeenCalledTimes(1);
      expect(spyFindOne).toHaveBeenCalledWith(incorrectIndex);

      expect(authorRepositoryMock.findOneBy).toHaveBeenCalledTimes(1);
      expect(authorRepositoryMock.findOneBy).toHaveBeenCalledWith({
        id: incorrectIndex,
      });
    });
  });

  describe('update', () => {
    let spyUpdate: jest.SpyInstance;
    let author: Author;
    let authorCopy: Author;

    beforeEach(() => {
      spyUpdate = jest.spyOn(authorService, 'update');
      author = authors[0];
      authorCopy = structuredClone(author);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should be defined', () => {
      expect(authorController.update).toBeDefined();
    });

    it('update firstName', async () => {
      const updateAuthorDto: UpdateAuthorDto = {
        firstName: 'UpdatedName',
      };
      const fakeUpdatedDate = new Date('2023-10-08T09:48:39.599Z');
      jest.useFakeTimers().setSystemTime(fakeUpdatedDate);

      await authorController.update(author.id.toString(), updateAuthorDto);
      expect(author).toEqual({
        createdAt: authorCopy.createdAt,
        firstName: updateAuthorDto.firstName,
        id: authorCopy.id,
        lastName: authorCopy.lastName,
        updatedAt: fakeUpdatedDate,
      });

      expect(spyUpdate).toHaveBeenCalledTimes(1);
      expect(spyUpdate).toHaveBeenCalledWith(author.id, updateAuthorDto);

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

      await authorController.update(author.id.toString(), updateAuthorDto);
      expect(author).toEqual({
        createdAt: authorCopy.createdAt,
        lastName: updateAuthorDto.lastName,
        id: authorCopy.id,
        firstName: authorCopy.firstName,
        updatedAt: fakeUpdatedDate,
      });

      expect(spyUpdate).toHaveBeenCalledTimes(1);
      expect(spyUpdate).toHaveBeenCalledWith(author.id, updateAuthorDto);

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

      await authorController.update(author.id.toString(), updateAuthorDto);
      expect(author).toEqual({
        createdAt: authorCopy.createdAt,
        lastName: updateAuthorDto.lastName,
        id: authorCopy.id,
        firstName: updateAuthorDto.firstName,
        updatedAt: fakeUpdatedDate,
      });

      expect(spyUpdate).toHaveBeenCalledTimes(1);
      expect(spyUpdate).toHaveBeenCalledWith(author.id, updateAuthorDto);

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

      const spyUpdate = jest.spyOn(authorService, 'update');

      const incorrectIndex = authors.length + 1;

      const updateAuthorDto = {
        firstName: 'UpdatedName',
        lastName: 'UpdatedLastName',
      };

      try {
        await authorController.update(
          incorrectIndex.toString(),
          updateAuthorDto,
        );
      } catch (e) {
        statusCode = e.response.statusCode;
        message = e.response.message;
      }

      expect(message).toEqual(notFound.message);
      expect(statusCode).toEqual(notFound.statusCode);

      expect(spyUpdate).toHaveBeenCalledTimes(1);
      expect(spyUpdate).toHaveBeenCalledWith(incorrectIndex, updateAuthorDto);

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
    let spyRemove: jest.SpyInstance;

    beforeEach(() => {
      spyRemove = jest.spyOn(authorService, 'remove');
    });

    it('should be defined', () => {
      expect(authorController.remove).toBeDefined();
    });

    it('delete correct author', async () => {
      const author = authors[0];

      await authorController.remove(author.id.toString());

      expect(authors).not.toContain(author);

      expect(spyRemove).toHaveBeenCalledTimes(1);
      expect(spyRemove).toHaveBeenCalledWith(author.id);

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
        await authorController.remove(incorrectIndex.toString());
      } catch (e) {
        statusCode = e.response.statusCode;
        message = e.response.message;
      }

      expect(message).toEqual(notFound.message);
      expect(statusCode).toEqual(notFound.statusCode);

      expect(spyRemove).toHaveBeenCalledTimes(1);
      expect(spyRemove).toHaveBeenCalledWith(incorrectIndex);

      expect(authorRepositoryMock.delete).toHaveBeenCalledTimes(1);
      expect(authorRepositoryMock.delete).toHaveBeenCalledWith({
        id: incorrectIndex,
      });
    });
  });
});
