import { Test, TestingModule } from '@nestjs/testing';
import { ProfeMateriaController } from './profe-materia.controller';

describe('ProfeMateriaController', () => {
  let controller: ProfeMateriaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfeMateriaController],
    }).compile();

    controller = module.get<ProfeMateriaController>(ProfeMateriaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
