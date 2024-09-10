import { forwardRef, Module } from '@nestjs/common';
import { LibroController } from './libro.controller';
import { LibroService } from './libro.service';
import { Libro } from './entidad/libro.entity';
import { Stock } from 'src/stock/entidad/stock.entity';
import { Materia } from 'src/materia/entidad/materia.entity';
import { LibroPedido } from 'src/libro-pedido/entidad/libroPedido.entity';
import { ProfeMateria } from 'src/profe-materia/entidad/profeMateria.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MateriaModule } from 'src/materia/materia.module';
import { LibroGateway } from './gateway/libro.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Libro, Stock, Materia, LibroPedido, ProfeMateria]),
  forwardRef(() => MateriaModule),
],
  controllers: [LibroController],
  providers: [LibroService, LibroGateway],
  exports: [LibroService]
})
export class LibroModule {}
