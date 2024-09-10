import { Module } from '@nestjs/common';
import { PreciosController } from './precios.controller';
import { PreciosService } from './precios.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Precios } from './entidad/precios.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Precios])],
  controllers: [PreciosController],
  providers: [PreciosService],
  exports: [PreciosService],
})
export class PreciosModule {}
