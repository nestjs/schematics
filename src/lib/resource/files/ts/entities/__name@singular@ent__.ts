<% if (type === 'graphql-code-first') { %>import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class <%= singular(classify(name)) %> {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}<% } else { %>import { Entity } from 'typeorm';
import { BaseEntity } from '@vori/types/BaseEntity';

// TODO Remember to add your new entity to getDataBaseEntities.
@Entity('<%= underscore(name) %>')
export class <%= singular(classify(name)) %> extends BaseEntity {}<% } %>
