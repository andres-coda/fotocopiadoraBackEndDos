import { Test, TestingModule } from '@nestjs/testing';
import { EscuelaController } from './escuela.controller';

describe('EscuelaController', () => {
  let controller: EscuelaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EscuelaController],
    }).compile();

    controller = module.get<EscuelaController>(EscuelaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
