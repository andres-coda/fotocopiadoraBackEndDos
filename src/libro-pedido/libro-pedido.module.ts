import { forwardRef, Module } from '@nestjs/common';
import { LibroPedidoController } from './libro-pedido.controller';
import { LibroPedidoService } from './libro-pedido.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibroPedido } from './entidad/libroPedido.entity';
import { Libro } from 'src/libro/entidad/libro.entity';
import { Pedido } from 'src/pedido/entidad/pedido.entity';
import { Especificaciones } from 'src/especificaciones/entidad/especificaciones.entity';
import { EstadoPedido } from 'src/estado-pedido/entidad/estadoPedido.entity';
import { EstadoPedidoModule } from 'src/estado-pedido/estado-pedido.module';
import { StockModule } from 'src/stock/stock.module';
import { PedidoModule } from 'src/pedido/pedido.module';
import { EspecificacionesModule } from 'src/especificaciones/especificaciones.module';
import { LibroModule } from 'src/libro/libro.module';
import { PersonaModule } from 'src/persona/persona.module';
import { LibroPedidoGateway } from './gateway/libroPedido.gateway';
import { PersonaGateway } from 'src/persona/gateway/persona.gateway';
import { PedidoGateway } from 'src/pedido/gateway/pedido.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([LibroPedido, Libro, Pedido, Especificaciones, EstadoPedido]),
  forwardRef(() => EstadoPedidoModule),
  forwardRef(() => StockModule),
  forwardRef(() => PedidoModule),
  forwardRef(() => EspecificacionesModule),
  forwardRef(() => LibroModule),
  forwardRef(() => PersonaModule),
],
  controllers: [LibroPedidoController],
  providers: [LibroPedidoService, LibroPedidoGateway, PersonaGateway],
  exports: [LibroPedidoService]
})
export class LibroPedidoModule {}
