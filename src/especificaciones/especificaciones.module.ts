import { Module } from '@nestjs/common';
import { EspecificacionesController } from './especificaciones.controller';
import { EspecificacionesService } from './especificaciones.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Especificaciones } from './entidad/especificaciones.entity';
import { LibroPedido } from 'src/libro-pedido/entidad/libroPedido.entity';
import { Stock } from 'src/stock/entidad/stock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Especificaciones, LibroPedido,Stock])],
  controllers: [EspecificacionesController],
  providers: [EspecificacionesService],
  exports: [EspecificacionesService]
})
export class EspecificacionesModule {}
