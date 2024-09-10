import { forwardRef, Module } from '@nestjs/common';
import { MateriaController } from './materia.controller';
import { MateriaService } from './materia.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Materia } from './entidad/materia.entity';
import { ProfeMateria } from 'src/profe-materia/entidad/profeMateria.entity';
import { Libro } from 'src/libro/entidad/libro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Materia, Libro, ProfeMateria])],
  controllers: [MateriaController],
  providers: [MateriaService],
  exports: [MateriaService],
})
export class MateriaModule {}
