import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Escuela } from './entidad/escuela.entity';
import { FindManyOptions, FindOneOptions, QueryRunner, Repository, UpdateResult } from 'typeorm';
import { DtoEscuela } from './dto/DtoEscuela.dto';
import { EscuelaGateway } from './gateway/escuela.gateway';

@Injectable()
export class EscuelaService {
    constructor(
        @InjectRepository(Escuela) private readonly escuelaRepository: Repository<Escuela>,
        private readonly escuelaGateway:EscuelaGateway,
    ) {}

    async getEscuelas(): Promise<Escuela[]> {
        try {
            const criterio: FindManyOptions = { relations: ['cursos.profeMaterias.materia', 'cursos.profeMaterias.profesor'] };
            const escuelas: Escuela[] = await this.escuelaRepository.find(criterio);
            if (escuelas) return escuelas;
            throw new NotFoundException(`No hay escuelas registradas en la base de datos`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer las escuelas`);
        }
    }

    async getEscuelaById(id: number): Promise<Escuela> {
        try {
            const criterio: FindOneOptions = { relations: ['cursos'], where: { idEscuela: id } };
            const escuela: Escuela = await this.escuelaRepository.findOne(criterio);
            if (escuela) return escuela;
            throw new NotFoundException(`No se encontró la escuela con el id ${id}`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer la escuela ${id}`);
        }
    }

    async crearEscuela(datos: DtoEscuela, queryRunner?:QueryRunner): Promise<Escuela> {
        try {
            const newEscuela: Escuela = new Escuela(
                datos.nombre, 
                datos.direccion, 
                datos.numero, 
                datos.email
            );
            const saveMethod = queryRunner
                ? (entity: any) => queryRunner.manager.save(Escuela, entity) 
                : (entity: any) => this.escuelaRepository.save(entity);
            const escuelaGuardada: Escuela = await saveMethod(newEscuela);
            this.escuelaGateway.enviarCrearEscuela(escuelaGuardada);
            return escuelaGuardada;
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar crear la escuela ${datos.nombre}`);
        }
    }

    async actualizarEscuela(id: number, datos: DtoEscuela, queryRunner?:QueryRunner): Promise<Escuela> {
        try {
            const escuelaActualizar: Escuela = await this.getEscuelaById(id);
            if (escuelaActualizar) {
                escuelaActualizar.nombre = datos.nombre;
                escuelaActualizar.direccion = datos.direccion;
                escuelaActualizar.numero = datos.numero;
                escuelaActualizar.email = datos.email;
                const saveMethod = queryRunner
                ? (entity: any) => queryRunner.manager.save(Escuela, entity) 
                : (entity: any) => this.escuelaRepository.save(entity);
                const escuelaGuardada: Escuela = await saveMethod(escuelaActualizar);
                this.escuelaGateway.enviarActualizacionEscuela(escuelaGuardada);
                return escuelaGuardada;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar actualizar la escuela ${datos.nombre}`);
        }
    }

    async eliminarEscuela(id: number): Promise<Boolean> {
        try {
            const escuelaEliminar: Escuela = await this.getEscuelaById(id);
            if (escuelaEliminar) {
                await this.escuelaRepository.remove(escuelaEliminar);
                this.escuelaGateway.enviarEliminarEscuela(escuelaEliminar);
                return true;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar eliminar la escuela con id ${id}`);
        }
    }

    async softEliminarEscuela(id: number): Promise<Boolean> {
        const escuelaExists: Escuela = await this.getEscuelaById(id);
        if (escuelaExists.deleted) {
            throw new ConflictException('La escuela ya fue borrada con anterioridad');
        }
        const rows: UpdateResult = await this.escuelaRepository.update({ idEscuela: id }, { deleted: true });
        return rows.affected == 1;
    }

    async softReactivarEscuela(id: number): Promise<Boolean> {
        const escuelaExists: Escuela = await this.getEscuelaById(id);
        if (!escuelaExists.deleted) {
            throw new ConflictException('La escuela ya fue activada con anterioridad');
        }
        const rows: UpdateResult = await this.escuelaRepository.update({ idEscuela: id }, { deleted: false });
        return rows.affected == 1;
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

