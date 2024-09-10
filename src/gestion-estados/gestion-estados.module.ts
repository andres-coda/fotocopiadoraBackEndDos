import { forwardRef, Module } from '@nestjs/common';
import { GestionEstadosController } from './gestion-estados.controller';
import { GestionEstadosService } from './gestion-estados.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoService } from 'src/pedido/pedido.service';
import { LibroPedidoService } from 'src/libro-pedido/libro-pedido.service';
import { StockService } from 'src/stock/stock.service';
import { PedidoModule } from 'src/pedido/pedido.module';
import { LibroPedidoModule } from 'src/libro-pedido/libro-pedido.module';
import { StockModule } from 'src/stock/stock.module';

@Module({
  imports: [TypeOrmModule.forFeature([]),
  forwardRef(() => PedidoModule),
  forwardRef(() => LibroPedidoModule),
  forwardRef(() => StockModule),
],
  controllers: [GestionEstadosController],
  providers: [GestionEstadosService],
  exports: [GestionEstadosService],
})
export class GestionEstadosModule {}
