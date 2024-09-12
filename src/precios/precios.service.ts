import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { FindOneOptions, Repository, UpdateResult } from 'typeorm';
import { Precios } from './entidad/precios.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DtoPrecios } from './dto/DtoPrecios.dto';
import { PreciosGateway } from './gateway/precios.gateway';

@Injectable()
export class PreciosService {
    constructor(
        @InjectRepository(Precios) private readonly precioRepository: Repository<Precios>,
        private readonly precioGateWay:PreciosGateway,
    ){}

    async getPrecios(): Promise<Precios[]> {
        try {
            const precios: Precios[] = await this.precioRepository.find();
            if (precios) return precios;
            throw new NotFoundException(`No hay precios registrados en la base de datos`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer los precios`);
        }
    }

    async getPreciosById(id: number): Promise<Precios> {
        try {
            const criterio: FindOneOptions = { where: { idPrecios: id } };
            const precio: Precios = await this.precioRepository.findOne(criterio);
            if (precio) return precio;
            throw new NotFoundException(`No se encontró el precio con el id ${id}`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer el precio ${id}`);
        }
    }

    async crearPrecio(datos: DtoPrecios): Promise<Precios> {
        try {
            const nuevoPrecio: Precios = await this.precioRepository.save(
                new Precios(datos.tipo, datos.importe));
            if (nuevoPrecio) {
                this.precioGateWay.enviarCrearPrecio(nuevoPrecio);
            }
            return nuevoPrecio;
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar crear el precio`);
        }
    }

    async actualizarPrecio(id: number, datos: DtoPrecios): Promise<Precios> {
        try {
            let precioActualizar: Precios = await this.getPreciosById(id);
            if (precioActualizar) {
                precioActualizar.tipo = datos.tipo;
                precioActualizar.importe = datos.importe;
                const precioActualizado:Precios = await  this.precioRepository.save(precioActualizar);
                if (precioActualizado) {
                    this.precioGateWay.enviarActualizacionPrecio(precioActualizado);
                }
                return precioActualizado;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar actualizar el precio con id ${id}`);
        }
    }

    async eliminarPrecio(id: number): Promise<Boolean> {
        try {
            const precioEliminar: Precios = await this.getPreciosById(id);
            if (precioEliminar) {
                await this.precioRepository.remove(precioEliminar);
                return true;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar eliminar el precio con id ${id}`);
        }
    }

    async softEliminarPrecio(id: number): Promise<Boolean> {
        const precioExists: Precios = await this.getPreciosById(id);
        if (precioExists.deleted) {
            throw new ConflictException('El precio ya fue borrada con anterioridad');
        }
        const rows: UpdateResult = await this.precioRepository.update({ idPrecios: id }, { deleted: true });
        return rows.affected == 1;
    }

    async softReactivarPrecio(id: number): Promise<Boolean> {
        const precioExists: Precios = await this.getPreciosById(id);
        if (!precioExists.deleted) {
            throw new ConflictException('El precio ya fue activada con anterioridad');
        }
        const rows: UpdateResult = await this.precioRepository.update({ idPrecios: id }, { deleted: false });
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

