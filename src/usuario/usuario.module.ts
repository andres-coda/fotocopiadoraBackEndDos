import { forwardRef, Module } from '@nestjs/common';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entidad/Usuario.entity';
import { UsuarioGuard } from 'src/auth/guard/usuario.guard';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario]),
  forwardRef(() => AuthModule),
],
  controllers: [UsuarioController],
  providers: [UsuarioService, UsuarioGuard],
  exports: [UsuarioService]
})
export class UsuarioModule {}
