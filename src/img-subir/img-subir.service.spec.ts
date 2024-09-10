import { Test, TestingModule } from '@nestjs/testing';
import { ImgSubirService } from './img-subir.service';

describe('ImgSubirService', () => {
  let service: ImgSubirService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImgSubirService],
    }).compile();

    service = module.get<ImgSubirService>(ImgSubirService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
