import { Test } from '@nestjs/testing';
import { <%= classify(name) %>Service } from './<%= name %>.service';

describe('<%= classify(name) %>Service', () => {
  let service;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [<%= classify(name) %>Service],
    }).compile();

    service = module.get(<%= classify(name) %>Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
