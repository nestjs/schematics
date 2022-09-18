<% if (type === 'graphql-code-first') { %>import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class <%= singular(classify(name)) %> {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}<% } if (type !== 'graphql-code-first' && type !== 'cqrs') { %>export class <%= singular(classify(name)) %> {}<% } %><% if (type === 'cqrs') { %>import { AggregateRoot } from '@nestjs/cqrs';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class <%= singular(classify(name)) %> extends AggregateRoot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;
}
<% } %>