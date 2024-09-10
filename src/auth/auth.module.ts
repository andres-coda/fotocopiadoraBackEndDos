import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entidad/Usuario.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { jwtConstants } from './constants';

@Module({
  imports: [
  TypeOrmModule.forFeature([Usuario]),
  JwtModule.register({
    global: true,
    secret: jwtConstants.secret,
    signOptions: { expiresIn: '1d' },
  }),
  forwardRef(() => UsuarioModule),
],
providers: [AuthService],
controllers: [AuthController],
exports: [AuthService],
})
export class AuthModule {}