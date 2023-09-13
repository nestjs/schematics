import { faker } from '@faker-js/faker';
import { merge } from 'lodash';
import { DataSource } from 'typeorm';

import { getRepository } from '@vori/providers/database';

import { <%= classify(singular(name)) %> } from '../entities/<%= singular(name) %>.entity';

export function make<%= singular(classify(name)) %>(
  overrides: Partial<<%= singular(classify(name)) %>> = {}
): <%= singular(classify(name)) %> {
  return getRepository(<%= singular(classify(name)) %>).create(
    merge(
      {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      overrides
    )
  );
}

export function makeAndSave<%= singular(classify(name)) %>(
  dataSource: DataSource,
  overrides: Partial<<%= singular(classify(name)) %>> = {}
): Promise<<%= singular(classify(name)) %>> {
  // TODO Add constraints, if necessary
  // const bannerID = overrides.bannerID || overrides.banner?.id;
  //
  // if (!bannerID) {
  //   throw new TypeError('banner or bannerID must be supplied!');
  // }

  return dataSource
    .getRepository(<%= singular(classify(name)) %>)
    .save(make<%= singular(classify(name)) %>(overrides));
}
