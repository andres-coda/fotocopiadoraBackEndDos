import { Test, TestingModule } from '@nestjs/testing';
import { GestionEstadosService } from './gestion-estados.service';

describe('GestionEstadosService', () => {
  let service: GestionEstadosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GestionEstadosService],
    }).compile();

    service = module.get<GestionEstadosService>(GestionEstadosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
