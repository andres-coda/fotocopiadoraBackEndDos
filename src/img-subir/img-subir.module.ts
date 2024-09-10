import { Module } from '@nestjs/common';
import { ImgSubirController } from './img-subir.controller';
import { ImgSubirService } from './img-subir.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [ImgSubirController],
  providers: [ImgSubirService]
})
export class ImgSubirModule {}
