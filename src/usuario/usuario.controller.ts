import { Controller, Get, Post, Put, Patch, Delete, UseGuards, ParseIntPipe, Param, Body, HttpCode, HttpStatus, NotFoundException, Request } from '@nestjs/common';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { DtoUsuario } from './dto/DtoUsuario.dto';
import { DtoUserParcial } from 'src/auth/dto/DtoUserParcial.dto';
import { UsuarioService } from './usuario.service';
import { Usuario } from './entidad/Usuario.entity';
import { UsuarioGuard } from 'src/auth/guard/usuario.guard';
import { DtoRole } from './dto/DtoRole.dto';

@Controller('usuario')
export class UsuarioController {
    constructor(private readonly usuariosService: UsuarioService) {}

@Get()
@UseGuards(AdminGuard)
@HttpCode(200)
async getUsuarios(): Promise<Usuario[]> {
    return await this.usuariosService.getUsuarios();
}

@Get(':id')
@UseGuards(UsuarioGuard)
@HttpCode(200)
async getUsuarioById(
    @Request() req: Request & {user:DtoUserParcial},
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number
): Promise<Usuario> {
    const usuario = req.user;
    if(usuario && id === usuario.sub || usuario && usuario.role == 'admin') return await this.usuariosService.getUsuarioById(id);
    throw new NotFoundException("Acción prohibida. Solo puedes acceder a tus datos")
}

@Post()
async crearUsuario(@Body() datos: DtoUsuario): Promise<Usuario> {
    return await this.usuariosService.crearUsuario(datos);
}

@Put(':id')
@UseGuards(AdminGuard)
async actualizarUsuario(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Body() datos: DtoUsuario): Promise<Usuario> {
    return await this.usuariosService.actualizarUsuario(id, datos);
}

@Delete(':id')
@UseGuards(AdminGuard)
async eliminarUsuario(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
    return await this.usuariosService.eliminarUsuario(id);
}

@Patch(':id')
@UseGuards(AdminGuard)
async cambairRole(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Body() role: DtoRole): Promise<Boolean> {
    return await this.usuariosService.cambiarRole(id,role);
}
}
