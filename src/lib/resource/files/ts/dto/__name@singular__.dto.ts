<% if (isSwaggerInstalled) { %>import { PartialType } from '@nestjs/swagger';<% } else { %>import { PartialType } from '@nestjs/mapped-types';<% } %>
import { BaseEntityDto } from '@vori/nest/libs/dto';
import { <%= classify(singular(name)) %> } from '../entities/<%= singular(name) %>.entity';

export class <%= singular(classify(name)) %>Dto extends BaseEntityDto {
  public static from(<%= singular(camelize(name)) %>: <%= singular(classify(name)) %>): <%= singular(classify(name)) %>Dto {
    return {
      ...BaseEntityDto.from(<%= singular(camelize(name)) %>),
    };
  }
}

export class Create<%= singular(classify(name)) %>Dto {}

export class Update<%= singular(classify(name)) %>Dto extends PartialType(Create<%= singular(classify(name)) %>Dto) {}
