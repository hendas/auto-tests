import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AuthorModule } from '../src/author/author.module';
import { AuthorService } from '../src/author/author.service';
import {
  authorsMock,
  notFound,
  badRequest,
  createAuthorRepositoryMockFactory,
} from './utils';
import { Author } from '../src/author/entities/author.entity';
import { AuthorController } from '../src/author/author.controller';
import { CreateAuthorDto } from 'src/author/dto/create-author.dto';
import { UpdateAuthorDto } from 'src/author/dto/update-author.dto';

const isoStringRegex =
  /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

describe('AuthorController (e2e)', () => {
  let app: INestApplication;
  let authors: Author[];
  let authorsResponse: Author[];

  beforeEach(async () => {
    authors = structuredClone(authorsMock);
    authorsResponse = JSON.parse(JSON.stringify(authors));

    const authorRepositoryMockFactory =
      createAuthorRepositoryMockFactory(authors);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot({ type: 'sqljs' }), AuthorModule],
      controllers: [AuthorController],
      providers: [
        AuthorService,
        {
          provide: getRepositoryToken(Author),
          useFactory: authorRepositoryMockFactory,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  describe('/author/ (GET)', () => {
    it('200', async () => {
      const result = await request(app.getHttpServer()).get('/author');

      expect(result.status).toBe(200);
      expect(result.body).toEqual(authorsResponse);
    });
  });

  describe('/author/ (POST)', () => {
    it('201', async () => {
      const dto: CreateAuthorDto = {
        lastName: 'LastName',
        firstName: 'FirstName',
      };
      const result = await request(app.getHttpServer())
        .post('/author')
        .send(dto);

      const expectedAuthor = {
        ...dto,
        id: 6,
        createdAt: expect.stringMatching(isoStringRegex),
        updatedAt: expect.stringMatching(isoStringRegex),
      };

      expect(result.status).toBe(201);
      expect(result.body).toEqual(expectedAuthor);
      expect(authors[5]).toBeDefined();
    });

    it('400 - lack of firstName', async () => {
      const dto = {
        lastName: 'LastName',
      };
      const result = await request(app.getHttpServer())
        .post('/author')
        .send(dto);

      expect(result.status).toBe(400);
      expect(result.body).toEqual({
        ...badRequest,
        message: ['firstName must be a string'],
      });
    });

    it('400 - lack of lastName', async () => {
      const dto = {
        firstName: 'FirstName',
      };
      const result = await request(app.getHttpServer())
        .post('/author')
        .send(dto);

      expect(result.status).toBe(400);
      expect(result.body).toEqual({
        ...badRequest,
        message: ['lastName must be a string'],
      });
    });

    it('400 - lack of body', async () => {
      const result = await request(app.getHttpServer()).post('/author');

      expect(result.status).toBe(400);
      expect(result.body).toEqual({
        ...badRequest,
        message: ['firstName must be a string', 'lastName must be a string'],
      });
    });
  });

  describe('/author/:id/ (GET)', () => {
    it('200', async () => {
      const result = await request(app.getHttpServer()).get('/author/1');

      expect(result.status).toBe(200);
      expect(result.body).toEqual(authorsResponse[0]);
    });

    it('404', async () => {
      const result = await request(app.getHttpServer()).get('/author/7');

      expect(result.status).toBe(404);
      expect(result.body).toEqual(notFound);
    });
  });

  describe('/author/:id/ (PATCH)', () => {
    it('204 - firstName', async () => {
      const dto: UpdateAuthorDto = {
        firstName: 'EditedFirstName',
      };
      const foundBefore = structuredClone(
        authors.find((author) => author.id === 1),
      );
      const result = await request(app.getHttpServer())
        .patch('/author/1')
        .send(dto);

      const foundAfter = structuredClone(
        authors.find((author) => author.id === 1),
      );

      expect(result.status).toBe(204);
      expect(foundBefore.firstName).not.toBe(foundAfter.firstName);
      expect(foundAfter.firstName).toBe(dto.firstName);
    });

    it('204 - lastName', async () => {
      const dto: UpdateAuthorDto = {
        lastName: 'EditedLastName',
      };
      const foundBefore = structuredClone(
        authors.find((author) => author.id === 1),
      );
      const result = await request(app.getHttpServer())
        .patch('/author/1')
        .send(dto);

      const foundAfter = structuredClone(
        authors.find((author) => author.id === 1),
      );

      expect(result.status).toBe(204);
      expect(foundBefore.lastName).not.toBe(foundAfter.lastName);
      expect(foundAfter.lastName).toBe(dto.lastName);
    });

    it('204 - firstName and lastName', async () => {
      const dto: UpdateAuthorDto = {
        firstName: 'EditedFirstName',
        lastName: 'EditedLastName',
      };
      const foundBefore = structuredClone(
        authors.find((author) => author.id === 1),
      );
      const result = await request(app.getHttpServer())
        .patch('/author/1')
        .send(dto);

      const foundAfter = structuredClone(
        authors.find((author) => author.id === 1),
      );

      expect(result.status).toBe(204);
      expect(foundBefore.firstName).not.toBe(foundAfter.firstName);
      expect(foundBefore.lastName).not.toBe(foundAfter.lastName);
      expect(foundAfter.firstName).toBe(dto.firstName);
      expect(foundAfter.lastName).toBe(dto.lastName);
    });

    it('400 - incorrect firstName', async () => {
      const dto = {
        firstName: 1,
      };

      const result = await request(app.getHttpServer())
        .patch('/author/1')
        .send(dto);

      expect(result.status).toBe(400);
      expect(result.body).toEqual({
        ...badRequest,
        message: ['firstName must be a string'],
      });
    });

    it('400 - incorrect lastName', async () => {
      const dto = {
        lastName: 1,
      };

      const result = await request(app.getHttpServer())
        .patch('/author/1')
        .send(dto);

      expect(result.status).toBe(400);
      expect(result.body).toEqual({
        ...badRequest,
        message: ['lastName must be a string'],
      });
    });

    it('400 - incorrect firstName and lastName', async () => {
      const dto = {
        firstName: 1,
        lastName: 1,
      };

      const result = await request(app.getHttpServer())
        .patch('/author/1')
        .send(dto);

      expect(result.status).toBe(400);
      expect(result.body).toEqual({
        ...badRequest,
        message: ['firstName must be a string', 'lastName must be a string'],
      });
    });

    it('404', async () => {
      const result = await request(app.getHttpServer()).patch('/author/7');

      expect(result.status).toBe(404);
      expect(result.body).toEqual(notFound);
    });
  });

  describe('/author/:id/ (DELETE)', () => {
    it('200', async () => {
      const countBefore = authors.length;
      const foundBefore = structuredClone(
        authors.find((author) => author.id === 1),
      );
      const result = await request(app.getHttpServer()).delete('/author/1');
      const foundAfter = structuredClone(
        authors.find((author) => author.id === 1),
      );

      expect(result.status).toBe(204);
      expect(foundBefore).toBeDefined();
      expect(foundAfter).not.toBeDefined();
      expect(authors.length).not.toBe(countBefore);
      expect(authors.length).toBe(countBefore - 1);
    });

    it('404', async () => {
      const result = await request(app.getHttpServer()).delete('/author/7');

      expect(result.status).toBe(404);
      expect(result.body).toEqual(notFound);
    });
  });
});
