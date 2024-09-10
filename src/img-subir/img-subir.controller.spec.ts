import { Test, TestingModule } from '@nestjs/testing';
import { ImgSubirController } from './img-subir.controller';

describe('ImgSubirController', () => {
  let controller: ImgSubirController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImgSubirController],
    }).compile();

    controller = module.get<ImgSubirController>(ImgSubirController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
