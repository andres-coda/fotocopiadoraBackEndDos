import { Test, TestingModule } from '@nestjs/testing';
import { GestionEstadosController } from './gestion-estados.controller';

describe('GestionEstadosController', () => {
  let controller: GestionEstadosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GestionEstadosController],
    }).compile();

    controller = module.get<GestionEstadosController>(GestionEstadosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
