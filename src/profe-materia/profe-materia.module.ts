import { forwardRef, Module } from '@nestjs/common';
import { ProfeMateriaController } from './profe-materia.controller';
import { ProfeMateriaService } from './profe-materia.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfeMateria } from './entidad/profeMateria.entity';
import { PersonaModule } from 'src/persona/persona.module';
import { MateriaModule } from 'src/materia/materia.module';
import { LibroModule } from 'src/libro/libro.module';
import { Persona } from 'src/persona/entidad/persona.entity';
import { Materia } from 'src/materia/entidad/materia.entity';
import { Libro } from 'src/libro/entidad/libro.entity';
import { Curso } from 'src/curso/entidad/curso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfeMateria, Persona, Materia, Libro, Curso]),
  forwardRef(() => PersonaModule),
  forwardRef(() => MateriaModule),
  forwardRef(() => LibroModule),
],
  controllers: [ProfeMateriaController],
  providers: [ProfeMateriaService],
  exports: [ProfeMateriaService],
})
export class ProfeMateriaModule {}
