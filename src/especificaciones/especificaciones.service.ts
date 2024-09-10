import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Especificaciones } from './entidad/especificaciones.entity';
import { FindManyOptions, FindOneOptions, In, QueryRunner, Repository, UpdateResult } from 'typeorm';
import { DtoEspecificaciones } from './dto/dtoEspecificaciones.dto';
import { DtoEspecArray } from './dto/DtoEspecArray.dto';

@Injectable()
export class EspecificacionesService {
    constructor(@InjectRepository(Especificaciones) private readonly especificacionesRepository: Repository<Especificaciones>) {}

    async getEspecificaciones(): Promise<Especificaciones[]> {
        try {
            const criterio: FindManyOptions = { relations: ['librosPedidos'] };
            const especificaciones: Especificaciones[] = await this.especificacionesRepository.find(criterio);
            if (especificaciones) return especificaciones;
            throw new NotFoundException(`No hay especificaciones registradas en la base de datos`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer las especificaciones`);
        }
    }

    async getEspecificacionById(id: number): Promise<Especificaciones> {
        try {
            const criterio: FindOneOptions = { relations: ['librosPedidos'], where: { idEspecificaciones: id } };
            const especificacion: Especificaciones = await this.especificacionesRepository.findOne(criterio);
            if (especificacion) return especificacion;
            throw new NotFoundException(`No se encontró la especificación con el id ${id}`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer la especificación ${id}`);
        }
    }

    async crearEspecificacion(datos: DtoEspecificaciones): Promise<Especificaciones> {
        try {
            const nuevaEspecificacion: Especificaciones = await this.especificacionesRepository.save(new Especificaciones(datos.nombre));
            if (nuevaEspecificacion) return nuevaEspecificacion;
            throw new NotFoundException(`No se pudo crear la especificación ${datos.nombre}`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar crear la especificación ${datos.nombre}`);
        }
    }

    async actualizarEspecificacion(id: number, datos: DtoEspecificaciones): Promise<Especificaciones> {
        try {
            let especificacionActualizar: Especificaciones = await this.getEspecificacionById(id);
            if (especificacionActualizar) {
                especificacionActualizar.nombre = datos.nombre;
                especificacionActualizar = await this.especificacionesRepository.save(especificacionActualizar);
                return especificacionActualizar;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar actualizar la especificación ${datos.nombre}`);
        }
    }

    async eliminarEspecificacion(id: number): Promise<Boolean> {
        try {
            const especificacionEliminar: Especificaciones = await this.getEspecificacionById(id);
            if (especificacionEliminar) {
                await this.especificacionesRepository.remove(especificacionEliminar);
                return true;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar eliminar la especificación con id ${id}`);
        }
    }

    async softEliminarEspecificacion(id: number): Promise<Boolean> {
        const especificacionExists: Especificaciones = await this.getEspecificacionById(id);
        if (especificacionExists.deleted) {
            throw new ConflictException('La especificación ya fue borrada con anterioridad');
        }
        const rows: UpdateResult = await this.especificacionesRepository.update({ idEspecificaciones: id }, { deleted: true });
        return rows.affected == 1;
    }

    async softReactivarEspecificacion(id: number): Promise<Boolean> {
        const especificacionExists: Especificaciones = await this.getEspecificacionById(id);
        if (!especificacionExists.deleted) {
            throw new ConflictException('La especificación ya fue activada con anterioridad');
        }
        const rows: UpdateResult = await this.especificacionesRepository.update({ idEspecificaciones: id }, { deleted: false });
        return rows.affected == 1;
    }

    async corroborarEspecificaciones(datos:DtoEspecArray, queryRunner?:QueryRunner):Promise<Especificaciones[]>{
        try {
            let idsEspecificaciones= [];
            if (Array.isArray(datos.especificaciones) && datos.especificaciones.length>0 && typeof datos.especificaciones[0] != 'number' ) {
                idsEspecificaciones = datos.especificaciones.map(e => e.idEspecificaciones);
            } else {
                idsEspecificaciones = datos.especificaciones
            }     
            const especificaciones = queryRunner 
            ? await queryRunner.manager.getRepository(Especificaciones).find({ where: { idEspecificaciones: In(idsEspecificaciones) } })
            : await this.especificacionesRepository.findBy({ idEspecificaciones: In(idsEspecificaciones) });

            const todasEstanPresentes = especificaciones.length === datos.especificaciones.length;            
            if (todasEstanPresentes) return especificaciones
            throw new NotFoundException('No se encontraron las especificaciones proporcionadas.');
        } catch (error) {
            throw this.handleExceptions(error, `Error al corroborar las especificaciones`);
        }
    }

    async corroborarEspecPirIds(datos:number[]):Promise<Especificaciones[]> {
        try {
        const especificaciones:Especificaciones[] = await this.especificacionesRepository.findBy({
            idEspecificaciones: In(datos)
          });
          const todasEstanPresentes:boolean = especificaciones.length === datos.length;     
            if (todasEstanPresentes) return especificaciones
            throw new NotFoundException('No se encontraron las especificaciones proporcionadas.');
        } catch (error) {
            throw this.handleExceptions(error, `Error al corroborar las especificaciones`);
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
