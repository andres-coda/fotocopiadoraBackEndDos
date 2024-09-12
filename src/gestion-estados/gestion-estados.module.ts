import { forwardRef, Module } from '@nestjs/common';
import { GestionEstadosController } from './gestion-estados.controller';
import { GestionEstadosService } from './gestion-estados.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoModule } from 'src/pedido/pedido.module';
import { LibroPedidoModule } from 'src/libro-pedido/libro-pedido.module';
import { StockModule } from 'src/stock/stock.module';
import { LibroModule } from 'src/libro/libro.module';
import { PersonaModule } from 'src/persona/persona.module';
import { PersonaGateway } from 'src/persona/gateway/persona.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([]),
  forwardRef(() => PedidoModule),
  forwardRef(() => LibroPedidoModule),
  forwardRef(() => StockModule),
  forwardRef(() => LibroModule),
  forwardRef(() => PersonaModule),
],
  controllers: [GestionEstadosController],
  providers: [GestionEstadosService],
  exports: [GestionEstadosService],
})
export class GestionEstadosModule {}
