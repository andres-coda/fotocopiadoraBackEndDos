import { forwardRef, Module } from '@nestjs/common';
import { CursoController } from './curso.controller';
import { CursoService } from './curso.service';
import { CursosGateway } from './gateway/cursos.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curso } from './entidad/curso.entity';
import { Escuela } from 'src/escuela/entidad/escuela.entity';
import { ProfeMateria } from 'src/profe-materia/entidad/profeMateria.entity';
import { Libro } from 'src/libro/entidad/libro.entity';
import { ProfeMateriaModule } from 'src/profe-materia/profe-materia.module';
import { LibroModule } from 'src/libro/libro.module';
import { LibroPedidoModule } from 'src/libro-pedido/libro-pedido.module';
import { EscuelaModule } from 'src/escuela/escuela.module';

@Module({
  imports: [TypeOrmModule.forFeature([Curso, Escuela, ProfeMateria, Libro]),
  forwardRef(() => ProfeMateriaModule),
  forwardRef(() => EscuelaModule)
],
  controllers: [CursoController],
  providers: [CursoService, CursosGateway],
  exports: [CursoService],
})
export class CursoModule {}
