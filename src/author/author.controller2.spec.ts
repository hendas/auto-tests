import { Test, TestingModule } from '@nestjs/testing';

import { Author } from './entities/author.entity';
import { AuthorController } from './author.controller';
import { AuthorService } from './author.service';
import { authorsMock } from '../../test/utils';

// Przykład jak można testować controller mockując service

describe('AuthorController', () => {
  let authorController: AuthorController;
  let authorService: AuthorService;
  let authors: Author[];

  beforeEach(async () => {
    authors = structuredClone(authorsMock);

    const mockAuthorService = {
      findAll: jest.fn(() => authors),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorController],
      providers: [
        {
          provide: AuthorService,
          useValue: mockAuthorService,
        },
      ],
    }).compile();

    authorController = module.get<AuthorController>(AuthorController);
    authorService = module.get<AuthorService>(AuthorService);
  });

  it('should be defined', () => {
    expect(authorController).toBeDefined();
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
    });
  });
});
