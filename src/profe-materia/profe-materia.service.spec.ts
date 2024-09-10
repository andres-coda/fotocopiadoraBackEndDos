import { Test, TestingModule } from '@nestjs/testing';
import { ProfeMateriaService } from './profe-materia.service';

describe('ProfeMateriaService', () => {
  let service: ProfeMateriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfeMateriaService],
    }).compile();

    service = module.get<ProfeMateriaService>(ProfeMateriaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
