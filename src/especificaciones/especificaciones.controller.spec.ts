import { Test, TestingModule } from '@nestjs/testing';
import { EspecificacionesController } from './especificaciones.controller';

describe('EspecificacionesController', () => {
  let controller: EspecificacionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EspecificacionesController],
    }).compile();

    controller = module.get<EspecificacionesController>(EspecificacionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
