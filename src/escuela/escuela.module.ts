import { Module } from '@nestjs/common';
import { EscuelaController } from './escuela.controller';
import { EscuelaService } from './escuela.service';
import { EscuelaGateway } from './gateway/escuela.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curso } from 'src/curso/entidad/curso.entity';
import { Escuela } from './entidad/escuela.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Escuela, Curso])],
  controllers: [EscuelaController],
  providers: [EscuelaService, EscuelaGateway],
  exports: [EscuelaService],
})
export class EscuelaModule {}
