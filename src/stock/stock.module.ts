import { forwardRef, Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stock } from './entidad/stock.entity';
import { EstadoPedido } from 'src/estado-pedido/entidad/estadoPedido.entity';
import { Libro } from 'src/libro/entidad/libro.entity';
import { Especificaciones } from 'src/especificaciones/entidad/especificaciones.entity';
import { EspecificacionesModule } from 'src/especificaciones/especificaciones.module';
import { LibroModule } from 'src/libro/libro.module';
import { EstadoPedidoModule } from 'src/estado-pedido/estado-pedido.module';

@Module({
  imports: [TypeOrmModule.forFeature([Stock, EstadoPedido, Libro, Especificaciones,]),
  forwardRef(() => EspecificacionesModule),
  forwardRef(() => LibroModule),
  forwardRef(() => EstadoPedidoModule),
],
  controllers: [StockController],
  providers: [StockService],
  exports:[StockService],
})
export class StockModule {}
