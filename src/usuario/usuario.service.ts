import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Usuario } from './entidad/Usuario.entity';
import { DtoRole } from './dto/DtoRole.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { DtoUsuario } from './dto/DtoUsuario.dto';
import { Role } from 'src/auth/rol/rol.enum';

@Injectable()
export class UsuarioService {
    constructor(@InjectRepository(Usuario) private readonly usuarioRepository: Repository<Usuario>) {}

    async getUsuarios(): Promise<Usuario[]> {
        try {
            const usuario: Usuario[] = await this.usuarioRepository.find();
            if (usuario) return usuario;
            throw new NotFoundException(`No hay usuarios registrados en la base de datos`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer los usuarios`);
        }
    }

    async getUsuarioById(id: number): Promise<Usuario> {
        try {
            const criterio: FindOneOptions = { where: { idUsuario: id } };
            const usuario: Usuario = await this.usuarioRepository.findOne(criterio);
            if (usuario) return usuario;
            throw new NotFoundException(`No se encontró el usuario con el id ${id}`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer el usuario ${id}`);
        }
    }

    async getUsuarioByEmail(email: string): Promise<Usuario> {
        try {
            const criterio: FindOneOptions = { where: { email: email } };
            const usuario: Usuario = await this.usuarioRepository.findOne(criterio);
            if (usuario) return usuario;
            throw new NotFoundException(`El email: ${email} o la contraseña son invalidos`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer el usuario con email:  ${email}`);
        }
    }

    async crearUsuario(datos: DtoUsuario): Promise<Usuario> {
        try {
            const nuevoUsuario: Usuario = await this.usuarioRepository.save(
                new Usuario(datos.email, datos.password, Role.User));
            if (nuevoUsuario) return nuevoUsuario;
            throw new NotFoundException(`No se pudo crear el usuario`);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
                throw new ConflictException(`El usuario con el email ${datos.email} ya está registrado`);
            } else if (error.code === 'ER_BAD_NULL_ERROR' || error.code === '23502') {
                throw new BadRequestException(`Datos incompletos: ${error.message}`);
            } else {
                throw this.handleExceptions(error, `Error al intentar crear el usuario`);
            }
        }
    }

    async actualizarUsuario(id: number, datos: DtoUsuario): Promise<Usuario> {
        try {
            let usuarioActualizar: Usuario = await this.getUsuarioById(id);
            if (usuarioActualizar) {
                usuarioActualizar.email = datos.email;
                usuarioActualizar.password = datos.password;
                usuarioActualizar = await this.usuarioRepository.save(usuarioActualizar);
                return usuarioActualizar;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar actualizar el usuario con id ${id}`);
        }
    }

    async eliminarUsuario(id: number): Promise<Boolean> {
        try {
            const usuarioEliminar: Usuario = await this.getUsuarioById(id);
            if (usuarioEliminar) {
                await this.usuarioRepository.remove(usuarioEliminar);
                return true;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar eliminar el usuario con id ${id}`);
        }
    }

    async cambiarRole(id:number, role:DtoRole):Promise<Boolean>{
        try {
            const usuario: Usuario = await this.getUsuarioById(id);
            if(usuario) {
                usuario.role=role.role;
                const usuarioActualizado= await this.usuarioRepository.save(usuario);
                return true;  
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar cambiar el rol al usuario con id ${id}`);
        }
        
    }

    private handleExceptions(error: any, customMessage: string): never {
        if (error instanceof HttpException) {
            throw error;
        } else if (error instanceof ConflictException) {
            throw new HttpException({ status: HttpStatus.CONFLICT, error: error.message }, HttpStatus.CONFLICT);
        } else {
            throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, error: `${customMessage}: ${error}` }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
