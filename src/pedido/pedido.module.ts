import { forwardRef, Module } from '@nestjs/common';
import { PedidoController } from './pedido.controller';
import { PedidoService } from './pedido.service';
import { Pedido } from './entidad/pedido.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Persona } from 'src/persona/entidad/persona.entity';
import { LibroPedido } from 'src/libro-pedido/entidad/libroPedido.entity';
import { EstadoPedidoModule } from 'src/estado-pedido/estado-pedido.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, Persona, LibroPedido]),
  forwardRef(() => EstadoPedidoModule)
],
  controllers: [PedidoController],
  providers: [PedidoService],
  exports: [PedidoService],
})
export class PedidoModule {}
