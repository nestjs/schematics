import { faker } from '@faker-js/faker';

import { getDataSource } from '@vori/providers/database';

import { make<%= singular(classify(name)) %> } from '../fakers/<%= singular(name) %>.faker';
import { <%= singular(classify(name)) %>Dto } from './<%= singular(name) %>.dto';

describe('<%= singular(classify(name)) %>Dto', () => {
  beforeAll(async () => {
    await getDataSource();
  });

  describe('from', () => {
    it('converts an entity to a DTO', () => {
      const <%= singular(camelize(name)) %> = make<%= singular(classify(name)) %>({
        id: faker.datatype.number({ min: 1 }).toString(),
      });
      const dto = <%= singular(classify(name)) %>Dto.from(<%= singular(camelize(name)) %>);

      expect(dto).toMatchObject({
        id: <%= singular(camelize(name)) %>.id,
        created_at: <%= singular(camelize(name)) %>.createdAt.toISOString(),
        updated_at: <%= singular(camelize(name)) %>.updatedAt.toISOString(),
      });
    });
  });
});
