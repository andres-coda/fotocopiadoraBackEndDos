import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EstadoPedido } from './entidad/estadoPedido.entity';
import { FindOneOptions, In, QueryRunner, Repository, UpdateResult } from 'typeorm';
import { DtoEstadoPedido } from './dto/DtoEstadoPedido.dto';

@Injectable()
export class EstadoPedidoService {
    constructor(@InjectRepository(EstadoPedido) private readonly estadoPedidoRepository: Repository<EstadoPedido>) {}

    async getEstadoPedidos(): Promise<EstadoPedido[]> {
        try {
            const estadoPedidos: EstadoPedido[] = await this.estadoPedidoRepository.find();
            if (estadoPedidos) return estadoPedidos;
            throw new NotFoundException(`No hay estados de pedidos registrados en la base de datos`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer los estados de pedidos`);
        }
    }

    async corroborarEstados(datos:number[]):Promise<EstadoPedido[]>{
        try {     
            const estados = await this.estadoPedidoRepository.findBy({
                idEstadoPedido: In(datos)
              });
              const todasEstanPresentes = estados.length === datos.length;
            
            if (todasEstanPresentes) return estados
            throw new NotFoundException('No se encontraron las especificaciones proporcionadas.');
        } catch (error) {
            throw this.handleExceptions(error, `Error al corroborar las especificaciones`);
        }
    }

    async getEstadoPedidoById(id: number, queryRunner?:QueryRunner): Promise<EstadoPedido | null> {
        console.log('metodo getEstadoPedidoById()');
        try {            
            const criterio: FindOneOptions = {  
                where: { idEstadoPedido: id } 
            };
            const estado: EstadoPedido = queryRunner 
            ? await queryRunner.manager.findOne(EstadoPedido, criterio)
            : await this.estadoPedidoRepository.findOne(criterio);
            return estado || null;
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer el estado de pedido ${id}`);
        }
    }

    async getEstadoPedidoNombre(nombre: string): Promise<EstadoPedido> {
        try {           
            const criterio: FindOneOptions = { where: {estado:nombre}}
            const estadoPedido: EstadoPedido = await this.estadoPedidoRepository.findOne(criterio);            
            if (estadoPedido) return estadoPedido;
            throw new NotFoundException(`No se encontró el estado de pedido con el nombre ${nombre}`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer el estado de pedido ${nombre}`);
        }
    }

    async crearEstadoPedido(datos: DtoEstadoPedido): Promise<EstadoPedido> {
        try {
            const nuevoEstadoPedido: EstadoPedido = await this.estadoPedidoRepository.save(new EstadoPedido(datos.estado));
            if (nuevoEstadoPedido) return nuevoEstadoPedido;
            throw new NotFoundException(`No se pudo crear el estado de pedido ${datos.estado}`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar crear el estado de pedido ${datos.estado}`);
        }
    }

    async actualizarEstadoPedido(id: number, datos: DtoEstadoPedido): Promise<EstadoPedido> {
        try {
            let estadoPedidoActualizar: EstadoPedido = await this.getEstadoPedidoById(id);
            if (estadoPedidoActualizar) {
                estadoPedidoActualizar.estado = datos.estado;
                estadoPedidoActualizar = await this.estadoPedidoRepository.save(estadoPedidoActualizar);
                return estadoPedidoActualizar;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar actualizar el estado de pedido ${datos.estado}`);
        }
    }

    async eliminarEstadoPedido(id: number): Promise<Boolean> {
        try {
            const estadoPedidoEliminar: EstadoPedido = await this.getEstadoPedidoById(id);
            if (estadoPedidoEliminar) {
                await this.estadoPedidoRepository.remove(estadoPedidoEliminar);
                return true;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar eliminar el estado de pedido con id ${id}`);
        }
    }

    async softEliminarEstadoPedido(id: number): Promise<Boolean> {
        const estadoPedidoExists: EstadoPedido = await this.getEstadoPedidoById(id);
        if (estadoPedidoExists.deleted) {
            throw new ConflictException('El estado de pedido ya fue borrado con anterioridad');
        }
        const rows: UpdateResult = await this.estadoPedidoRepository.update({ idEstadoPedido: id }, { deleted: true });
        return rows.affected == 1;
    }

    async softReactivarEstadoPedido(id: number): Promise<Boolean> {
        const estadoPedidoExists: EstadoPedido = await this.getEstadoPedidoById(id);
        if (!estadoPedidoExists.deleted) {
            throw new ConflictException('El estado de pedido ya fue activado con anterioridad');
        }
        const rows: UpdateResult = await this.estadoPedidoRepository.update({ idEstadoPedido: id }, { deleted: false });
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
