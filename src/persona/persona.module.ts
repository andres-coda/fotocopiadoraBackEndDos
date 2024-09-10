import { forwardRef, Module } from '@nestjs/common';
import { PersonaController } from './persona.controller';
import { PersonaService } from './persona.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Persona } from './entidad/persona.entity';
import { Pedido } from 'src/pedido/entidad/pedido.entity';
import { ProfeMateria } from 'src/profe-materia/entidad/profeMateria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Persona, Pedido, ProfeMateria])],
  controllers: [PersonaController],
  providers: [PersonaService],
  exports: [PersonaService],
})
export class PersonaModule {}
