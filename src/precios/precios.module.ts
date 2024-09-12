import { Module } from '@nestjs/common';
import { PreciosController } from './precios.controller';
import { PreciosService } from './precios.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Precios } from './entidad/precios.entity';
import { PreciosGateway } from './gateway/precios.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Precios])],
  controllers: [PreciosController],
  providers: [PreciosService, PreciosGateway],
  exports: [PreciosService],
})
export class PreciosModule {}
