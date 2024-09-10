import { Test, TestingModule } from '@nestjs/testing';
import { EspecificacionesService } from './especificaciones.service';

describe('EspecificacionesService', () => {
  let service: EspecificacionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EspecificacionesService],
    }).compile();

    service = module.get<EspecificacionesService>(EspecificacionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
