import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { FindManyOptions, FindOneOptions, QueryRunner, Repository, UpdateResult } from 'typeorm';
import { Pedido } from './entidad/pedido.entity';
import { DtoPedidoReturn } from './dto/DtoPedidoReturn.dto';
import { DtoPedido } from './dto/DtoPedido.dto';
import { EstadoPedido } from 'src/estado-pedido/entidad/estadoPedido.entity';
import { EstadoPedidoService } from 'src/estado-pedido/estado-pedido.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PedidoService {
    constructor(
        @InjectRepository(Pedido) private readonly pedidoRepository: Repository<Pedido>,
        private estadoPedidoService:EstadoPedidoService
    ) {}

    private asignarEstadoPedido(pedido:Pedido):DtoPedidoReturn{
        const nuevoPedido: DtoPedidoReturn = {...pedido, estado:null};
        if (pedido.librosPedidos.length>0) {
            let menorEstado: EstadoPedido = pedido.librosPedidos[0].estadoPedido;
            pedido.librosPedidos.forEach(libroPedido => {
                if (menorEstado.idEstadoPedido > libroPedido.estadoPedido.idEstadoPedido ) {
                    menorEstado = libroPedido.estadoPedido;
                }
            });
            nuevoPedido.estado=menorEstado;
        } 
        return nuevoPedido;
    }

    async getPedidos(): Promise<DtoPedidoReturn[]> {
        try {
            const criterio: FindManyOptions = {
                relations: ['cliente', 'librosPedidos.estadoPedido', 'librosPedidos.libro'],
            };
            const pedidos: Pedido[] = await this.pedidoRepository.find(criterio);    
            const nuevoPedidos: DtoPedidoReturn[] = pedidos.map(pedido => {
                return this.asignarEstadoPedido(pedido);
            });
            return nuevoPedidos;
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer los pedidos`);
        }
    }
    

    async getPedidoById(id: number, queryRunner?:QueryRunner): Promise<DtoPedidoReturn> {
        console.log('metodo: getPedidoById()');
        try {
            const criterio: FindOneOptions = { 
                relations: ['cliente', 'librosPedidos.libro', 'librosPedidos.estadoPedido', 'librosPedidos.especificaciones'], 
                where: { idPedido: id } 
            };
            const pedido: Pedido = queryRunner 
            ? await queryRunner.manager.findOne(Pedido, criterio)
            : await this.pedidoRepository.findOne(criterio);
            if (pedido) {
                const nuevoPedido:DtoPedidoReturn = this.asignarEstadoPedido(pedido);
                return nuevoPedido;
            }
            throw new NotFoundException(`No se encontró el pedido con el id ${id}`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer el pedido ${id}`);
        }
    }

    async crearPedido(datos: DtoPedido, queryRunner?:QueryRunner): Promise<Pedido> {
        console.log('metodo: crearPedido()');
        try {
            const hoy = new Date();
            const estado = await this.estadoPedidoService.getEstadoPedidoById(1, queryRunner);
            if (!estado) throw new NotFoundException(`No se pudo crear el pedido, no se encontro el estado ${1}`);
            const nuevoPedido: Pedido = new Pedido(
                hoy, 
                datos.fechaEntrega, 
                datos.importeTotal, 
                datos.sena, 
                datos.cliente, 
                datos.archivos, 
                datos.anillados
            );
            const pedidoGuardado: Pedido = queryRunner 
                ? await queryRunner.manager.save(Pedido, nuevoPedido)
                : await this.pedidoRepository.save(nuevoPedido);    
            return pedidoGuardado; 
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar crear el pedido`);
        }
    }

    async actualizarPedido(id: number, datos: DtoPedido): Promise<Pedido> {
        try {
            const pedidoActualizar: DtoPedidoReturn = await this.getPedidoById(id);
            if (pedidoActualizar) {
                pedidoActualizar.fechaTomado=pedidoActualizar.fechaTomado;
                pedidoActualizar.fechaEntrega = datos.fechaEntrega;
                pedidoActualizar.importeTotal = datos.importeTotal;
                pedidoActualizar.sena = datos.sena;
                pedidoActualizar.cliente = datos.cliente;
                pedidoActualizar.archivos=datos.archivos;
                pedidoActualizar.anillados=datos.anillados;
                const pedidoActualizado: Pedido = await this.pedidoRepository.save(pedidoActualizar);
                return pedidoActualizado;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar actualizar el pedido con id ${id}`);
        }
    }

    async eliminarPedido(id: number): Promise<Boolean> {
        try {
            const pedidoEliminar: Pedido = await this.getPedidoById(id);
            if (pedidoEliminar) {
                await this.pedidoRepository.remove(pedidoEliminar);
                return true;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar eliminar el pedido con id ${id}`);
        }
    }

    async softEliminarPedido(id: number): Promise<Boolean> {
        const pedidoExists: Pedido = await this.getPedidoById(id);
        if (pedidoExists.deleted) {
            throw new ConflictException('El pedido ya fue borrado con anterioridad');
        }
        const rows: UpdateResult = await this.pedidoRepository.update({ idPedido: id }, { deleted: true });
        return rows.affected == 1;
    }

    async softReactivarPedido(id: number): Promise<Boolean> {
        const pedidoExists: Pedido = await this.getPedidoById(id);
        if (!pedidoExists.deleted) {
            throw new ConflictException('El pedido ya fue activado con anterioridad');
        }
        const rows: UpdateResult = await this.pedidoRepository.update({ idPedido: id }, { deleted: false });
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

