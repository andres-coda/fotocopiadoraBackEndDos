import { Module } from '@nestjs/common';
import { EstadoPedidoController } from './estado-pedido.controller';
import { EstadoPedidoService } from './estado-pedido.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoPedido } from './entidad/estadoPedido.entity';
import { Stock } from 'src/stock/entidad/stock.entity';
import { LibroPedido } from 'src/libro-pedido/entidad/libroPedido.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EstadoPedido, Stock, LibroPedido])],
  controllers: [EstadoPedidoController],
  providers: [EstadoPedidoService],
  exports: [EstadoPedidoService],
})
export class EstadoPedidoModule {}
