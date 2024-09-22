import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { FindManyOptions, FindOneOptions, In, QueryRunner, Repository, UpdateResult } from 'typeorm';
import { Materia } from './entidad/materia.entity';
import { DtoArrayMateria } from './dto/DtoArrayMateria.dto';
import { DtoMateria } from './dto/DtoMateria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MateriaGateway } from './gateway/materia.gateway';

@Injectable()
export class MateriaService {
    constructor(
        @InjectRepository(Materia) private readonly materiaRepository: Repository<Materia>,
        private readonly materiaGateway:MateriaGateway,
    ) {}

    async getMaterias(): Promise<Materia[]> {
        try {
            const criterio: FindManyOptions = { relations: ['profeMaterias.curso'] };
            const materias: Materia[] = await this.materiaRepository.find(criterio);
            if (materias) return materias;
            throw new NotFoundException(`No hay materias registradas en la base de datos`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer las materias`);
        }
    }

    async getMateriaById(id: number): Promise<Materia> {
        try {
            const criterio: FindOneOptions = { relations: ['profeMaterias.curso', 'libros'], where: { idMateria: id } };
            const materia: Materia = await this.materiaRepository.findOne(criterio);
            if (materia) return materia;
            throw new NotFoundException(`No se encontró la materia con el id ${id}`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer la materia ${id}`);
        }
    }

    async getMateriaByCriterio(datos: DtoMateria, queryRunner?:QueryRunner): Promise<Materia> {
        console.log('metodo: getMateriaByCriterio()');
        if (!datos) return null;
        try {
            const criterio: FindOneOptions<Materia> = {
                where: [
                    { idMateria: datos.idMateria },
                    { nombre: datos.nombre },
                ],
            };
            let materia: Materia = queryRunner 
                ? await queryRunner.manager.findOne(Materia, criterio)
                : await this.materiaRepository.findOne(criterio);
            if (!materia) {
                materia = await this.crearMateria(datos, queryRunner);
            }
            return materia;
        } catch (error) {
            throw this.handleExceptions(error, `No se encontró ni se pudo crear la materia ${datos.nombre}`);
        }
    }

    async getMateriaByNombre(nombre:string):Promise<Materia> {
        console.log('metodo: getMateriaByNombre()');
        try{
            const criterio: FindOneOptions = { where: { nombre: nombre } };
            const materia: Materia = await this.materiaRepository.findOne(criterio);
            if (materia) {
                return materia
            } else {
                return null;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer la materia ${nombre}`);
        }
    }

    async crearMateria(datos: DtoMateria,queryRunner?: QueryRunner): Promise<Materia> {
        console.log('metodo: crearMateria()');
        try {
            const nuevaMateria: Materia = new Materia(datos.nombre);
            const materiaGuardada: Materia = queryRunner 
                ? await queryRunner.manager.save(Materia, nuevaMateria)
                : await this.materiaRepository.save(nuevaMateria);
            if(materiaGuardada){
                this.materiaGateway.enviarCrearMateria(materiaGuardada);
            }
            return materiaGuardada;
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar crear la materia con nombre ${datos.nombre}`);
        }
    }

    async actualizarMateria(id: number, datos: DtoMateria, queryRunner?:QueryRunner): Promise<Materia> {
        try {
            let materiaActualizar: Materia = await this.getMateriaById(id);
            if (materiaActualizar) {
                materiaActualizar.nombre = datos.nombre;
                const materiaGuardada: Materia = queryRunner 
                    ? await queryRunner.manager.save(Materia, materiaActualizar)
                    : await this.materiaRepository.save(materiaActualizar);
                if(materiaGuardada){
                    this.materiaGateway.enviarActualizacionMateria(materiaGuardada);
                }
                return materiaGuardada;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar actualizar la materia con id ${id}`);
        }
    }

    async eliminarMateria(id: number): Promise<Boolean> {
        try {
            const materiaEliminar: Materia = await this.getMateriaById(id);
            if (materiaEliminar) {
                await this.materiaRepository.remove(materiaEliminar);
                return true;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar eliminar la materia con id ${id}`);
        }
    }

    async softEliminarMateria(id: number): Promise<Boolean> {
        const materiaExists: Materia = await this.getMateriaById(id);
        if (materiaExists.deleted) {
            throw new ConflictException('La materia ya fue borrada con anterioridad');
        }
        const rows: UpdateResult = await this.materiaRepository.update({ idMateria: id }, { deleted: true });
        return rows.affected == 1;
    }

    async softReactivarMateria(id: number): Promise<Boolean> {
        const materiaExists: Materia = await this.getMateriaById(id);
        if (!materiaExists.deleted) {
            throw new ConflictException('La materia ya fue activada con anterioridad');
        }
        const rows: UpdateResult = await this.materiaRepository.update({ idMateria: id }, { deleted: false });
        return rows.affected == 1;
    }

    async corroborarMaterias(datos:DtoArrayMateria):Promise<Materia[]>{
        try {
            const materias:Materia[] = await this.materiaRepository.findBy({
                idMateria: In(datos.materias.map(m=>m.idMateria))
            });
            const todasEstanPresentes = materias.length === datos.materias.length;
            if (todasEstanPresentes) return materias
            throw new NotFoundException('No se encontraron las materias proporcionadas.');
        } catch (error) {
            throw this.handleExceptions(error, `Error al corroborar las materias`);
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

