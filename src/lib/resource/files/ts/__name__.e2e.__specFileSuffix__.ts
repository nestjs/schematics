import { faker } from '@faker-js/faker';
import { INestApplication, Injectable } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { orderBy, times } from 'lodash';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { TransactionalTestContext } from 'typeorm-transactional-tests';

import { Banner } from '@vori/types/Banner';
import { APIBannerUser } from '@vori/types/User';

import { makeAndSaveBanner } from '@vori/utils/VoriRandom/Banner.random';

import { configureApp } from '@vori/nest/bootstrap';
import { FirebaseAuthStrategy } from '@vori/nest/libs/auth/firebase-auth.strategy';
import {
  createAnnotatedUser,
  createE2ETestingModule,
  mockTemporalSetupAndShutdown,
} from '@vori/nest/libs/test_helpers';

// TODO Adjust depending on which service primarily uses the newly-created module.
import { AppModule } from '../../../../services/graphql-api/src/app.module';
import {
  Create<%= singular(classify(name)) %>Dto,
  <%= singular(classify(name)) %>Dto,
} from './dto/<%= singular(name) %>.dto';
import { <%= classify(singular(name)) %> } from './entities/<%= singular(name) %>.entity';
import { make<%= singular(classify(name)) %>, makeAndSave<%= singular(classify(name)) %> } from './fakers/<%= singular(name) %>.faker';
import { <%= classify(name) %>Service } from './<%= name %>.service';

describe('/v1/<%= dasherize(name) %>', () => {
  let app: INestApplication;
  let db: DataSource;
  let transactionalContext: TransactionalTestContext;
  let banner: Banner;
  let user: APIBannerUser | undefined;
  let <%= lowercased(name) %>Service: <%= classify(name) %>Service;

  @Injectable()
  class MockFirebaseAuthStrategy extends FirebaseAuthStrategy {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    async validate(token): Promise<APIBannerUser | undefined> {
      return user;
    }
  }

  beforeAll(async () => {
    mockTemporalSetupAndShutdown();

    const moduleRef = await createE2ETestingModule({
      // TODO Remember to import <%= classify(name) %>Module into AppModule
      imports: [AppModule],
    })
      .overrideProvider(FirebaseAuthStrategy)
      .useClass(MockFirebaseAuthStrategy)
      .compile();

    app = moduleRef.createNestApplication();
    app = configureApp(app);
    await app.init();

    db = app.get<DataSource>(DataSource);
    <%= lowercased(name) %>Service = app.get<<%= classify(name) %>Service>(
      <%= classify(name) %>Service
    );
  });

  beforeEach(async () => {
    transactionalContext = new TransactionalTestContext(db);
    await transactionalContext.start();

    banner = await makeAndSaveBanner(db);
    user = <APIBannerUser>await createAnnotatedUser({ db, banner });
  });

  afterEach(async () => {
    await transactionalContext.finish();
  });

  describe('POST /v1/<%= dasherize(name) %>', () => {
    it('requires authorization', async () => {
      user = undefined;
      await request(app.getHttpServer())
        .post('/v1/<%= dasherize(name) %>')
        .set('Authorization', 'Bearer FAKE')
        .expect(401);
    });

    it('creates a new <%= singular(classify(name)) %>', async () => {
      // TODO Add fields
      const body: Create<%= singular(classify(name)) %>Dto = {};

      const response = await request(app.getHttpServer())
        .post('/v1/<%= dasherize(name) %>')
        .set('Authorization', 'Bearer FAKE')
        .send(instanceToPlain(body))
        .expect(201);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const <%= singular(camelize(name)) %> = await <%= lowercased(name) %>Service.findOne(
        user!,
        response.body.id
      );
      // TODO Assert values stored in database

      expect(response.body).toEqual(
        instanceToPlain(<%= singular(classify(name)) %>Dto.from(<%= singular(camelize(name)) %>))
      );
    });
  });

  describe('GET /v1/<%= dasherize(name) %>', () => {
    // TODO Modify if the entity is not attached to a banner
    it('returns all <%= singular(classify(name)) %>s for the authenticated banner', async () => {
      // No data exists, so nothing returned
      let response = await request(app.getHttpServer())
        .get('/v1/<%= dasherize(name) %>')
        .set('Authorization', 'Bearer FAKE')
        .expect(200);
      expect(response.body).toEqual([]);

      // Data belonging to other banners should never be returned
      const otherBanner = await makeAndSaveBanner(db);
      await makeAndSave<%= singular(classify(name)) %>(db, { banner: otherBanner });
      response = await request(app.getHttpServer())
        .get('/v1/<%= dasherize(name) %>')
        .set('Authorization', 'Bearer FAKE')
        .expect(200);
      expect(response.body).toEqual([]);

      // Response should include data belonging to this banner
      const <%= camelize(name) %> = await Promise.all(
        times(3, async () => makeAndSave<%= singular(classify(name)) %>(db, { banner }))
      );
      response = await request(app.getHttpServer())
        .get('/v1/<%= dasherize(name) %>')
        .set('Authorization', 'Bearer FAKE')
        .expect(200);
      expect(response.body).toEqual(
        orderBy(<%= camelize(name) %>, 'createdAt', 'desc').map(
          <%= singular(classify(name)) %>Dto.from
        )
      );
    });
  });

  describe('GET /v1/<%= dasherize(name) %>/:id', () => {
    // TODO Update if data is not associated with a banner
    it('does NOT return data belonging to other banners', async () => {
      const otherBanner = await makeAndSaveBanner(db);
      const other<%= singular(classify(name)) %> = await makeAndSave<%= singular(classify(name)) %>(
        db,
        { banner: otherBanner }
      );

      await request(app.getHttpServer())
        .get(`/v1/<%= dasherize(name) %>/${other<%= singular(classify(name)) %>.id}`)
        .set('Authorization', 'Bearer FAKE')
        .expect(404);
    });

    it('returns the <%= singular(classify(name)) %>', async () => {
      const <%= singular(camelize(name)) %> = await makeAndSave<%= singular(classify(name)) %>(db, {
        banner,
      });

      const response = await request(app.getHttpServer())
        .get(`/v1/<%= dasherize(name) %>/${<%= singular(camelize(name)) %>.id}`)
        .set('Authorization', 'Bearer FAKE')
        .expect(200);

      expect(response.body).toEqual(
        instanceToPlain(<%= singular(classify(name)) %>Dto.from(<%= singular(camelize(name)) %>))
      );
    });
  });

  describe('PATCH /v1/<%= dasherize(name) %>/:id', () => {
    // TODO Update if data is not associated with a banner
    it('does NOT permit modifying data belonging to other banners', async () => {
      const otherBanner = await makeAndSaveBanner(db);
      const other<%= singular(classify(name)) %> = await makeAndSave<%= singular(classify(name)) %>(
        db,
        { banner: otherBanner }
      );

      await request(app.getHttpServer())
        .patch(`/v1/<%= dasherize(name) %>/${other<%= singular(classify(name)) %>.id}`)
        .set('Authorization', 'Bearer FAKE')
        .send({
          // TODO Add a body
        })
        .expect(404);

      const reloaded<%= singular(classify(name)) %> = await db
        .getRepository(<%= singular(classify(name)) %>)
        .findOneOrFail({ where: { id: other<%= singular(classify(name)) %>.id } });
      expect(reloaded<%= singular(classify(name)) %>.updatedAt).toEqual(
        other<%= singular(classify(name)) %>.updatedAt
      );
      // TODO Assert fields are unchanged
    });

    it('updates the <%= singular(classify(name)) %>', async () => {
      const <%= singular(camelize(name)) %> = await makeAndSave<%= singular(classify(name)) %>(db, {
        banner,
      });

      // TODO Add a body
      const body = {};
      const response = await request(app.getHttpServer())
        .patch(`/v1/<%= dasherize(name) %>/${<%= singular(camelize(name)) %>.id}`)
        .set('Authorization', 'Bearer FAKE')
        .send(body)
        .expect(200);

      const reloaded<%= singular(classify(name)) %> = await db
        .getRepository(<%= singular(classify(name)) %>)
        .findOneOrFail({ where: { id: <%= singular(camelize(name)) %>.id } });

      // TODO Assert database fields updated

      expect(response.body).toEqual(
        instanceToPlain(
          <%= singular(classify(name)) %>Dto.from(reloaded<%= singular(classify(name)) %>)
        )
      );
    });
  });

  describe('DELETE /v1/<%= dasherize(name) %>/:id', () => {
    // TODO Update if data is not associated with a banner
    it('does NOT permit modifying data belonging to other banners', async () => {
      const otherBanner = await makeAndSaveBanner(db);
      const other<%= singular(classify(name)) %> = await makeAndSave<%= singular(classify(name)) %>(
        db,
        { banner: otherBanner }
      );

      await request(app.getHttpServer())
        .delete(`/v1/<%= dasherize(name) %>/${other<%= singular(classify(name)) %>.id}`)
        .set('Authorization', 'Bearer FAKE')
        .expect(404);

      await db
        .getRepository(<%= singular(classify(name)) %>)
        .findOneOrFail({ where: { id: other<%= singular(classify(name)) %>.id } });
    });

    it('deletes the <%= singular(classify(name)) %>', async () => {
      const <%= singular(camelize(name)) %> = await makeAndSave<%= singular(classify(name)) %>(db, {
        banner,
      });

      await request(app.getHttpServer())
        .delete(`/v1/<%= dasherize(name) %>/${<%= singular(camelize(name)) %>.id}`)
        .set('Authorization', 'Bearer FAKE')
        .expect(200);

      expect(
        await db
          .getRepository(<%= singular(classify(name)) %>)
          .exist({ where: { id: <%= singular(camelize(name)) %>.id } })
      ).toEqual(false);
    });
  });
});
