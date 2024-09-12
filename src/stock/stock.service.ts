import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Stock } from './entidad/stock.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, FindOneOptions, QueryRunner, Repository, UpdateResult } from 'typeorm';
import { EspecificacionesService } from 'src/especificaciones/especificaciones.service';
import { LibroService } from 'src/libro/libro.service';
import { EstadoPedidoService } from 'src/estado-pedido/estado-pedido.service';
import { DtoLibroEstado } from './dto/DtoLibroEstado.dto';
import { DtoStock } from './dto/DtoStock.sto';
import { Especificaciones } from 'src/especificaciones/entidad/especificaciones.entity';
import { EstadoPedido } from 'src/estado-pedido/entidad/estadoPedido.entity';
import { Libro } from 'src/libro/entidad/libro.entity';
import { DtoLibroPedido } from 'src/libro-pedido/dto/DtoLibroPedido.dto';
import { LibroGateway } from 'src/libro/gateway/libro.gateway';

@Injectable()
export class StockService {
    constructor(
        @InjectRepository(Stock) private readonly stockRepository: Repository<Stock>,
        private readonly especificacionesService: EspecificacionesService,
        private readonly libroService: LibroService,
        private readonly estadoService: EstadoPedidoService,
    ) { }

    async getStock(): Promise<Stock[]> {
        try {
            const criterio: FindManyOptions = { relations: ['libro', 'estado', 'especificaciones'] }
            const stock = await this.stockRepository.find(criterio);
            if (stock) return stock;
            throw new NotFoundException('No se encontró ningún registro de stock en la base de datos.');
        } catch (error) {
            throw this.handleExceptions(error, `Error al obtener los stock`);
        }
    }

    async getStockByLibro(idLibro: number, queryRunner?: QueryRunner): Promise<Stock[]> {
        try {
            const criterio: FindManyOptions = {
                relations: ['libro', 'estado', 'especificaciones'],
                where: {
                    libro: {
                        idLibro: idLibro
                    }
                }
            }
            const listaStock: Stock[] = queryRunner
                ? await queryRunner.manager.find(Stock, criterio)
                : await this.stockRepository.find(criterio);
            return listaStock;
        } catch (error) {
            throw this.handleExceptions(error, 'Error al obtener el stock con los datos proporcionados');
        }
    }

    async getStockById(id: number): Promise<Stock> {
        try {
            const criterio: FindOneOptions = { relations: ['libro', 'estado', 'especificaciones'], where: { idStock: id } }
            const stock = await this.stockRepository.findOne(criterio);
            if (stock) return stock;
            throw new NotFoundException(`No se encontró ningún registro de stock con el ID ${id}.`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al obtener el stock con ID ${id}`);
        }
    }

    private getStockByEspecificaciones = (listaStock: Stock[], especificacionesIds: number[]): Stock | null => {
        const filteredStock = listaStock.find(stock => {
            const stockEspecificacionesIds = stock.especificaciones.map(esp => esp.idEspecificaciones);
            return (
                stockEspecificacionesIds.length === especificacionesIds.length &&
                especificacionesIds.every(id => stockEspecificacionesIds.includes(id)) &&
                stockEspecificacionesIds.every(id => especificacionesIds.includes(id))
            );
        });

        return filteredStock || null;
    };

    async getStockByLibroEstado(libroEstado: DtoLibroEstado, queryRunner?: QueryRunner): Promise<Stock | null> {
        console.log('metodo: getStockByLibroEstado()');
        try {
            const especificacionesCorroboradas = await this.especificacionesService.corroborarEspecificaciones(
                { especificaciones: libroEstado.especificaciones },
                queryRunner
            );            
            const especificacionesIds = especificacionesCorroboradas.map(espec => espec.idEspecificaciones);
            const libroId = Number(libroEstado.libro.idLibro);
            const estadoId = Number(libroEstado.estado.idEstadoPedido);

            const criterio: FindManyOptions = {
                relations: ['especificaciones', 'libro', 'estado'],
                where: {
                    libro: { idLibro: libroId },
                    estado: { idEstadoPedido: estadoId },
                }
            };

            const listaStock: Stock[] = queryRunner
                ? await queryRunner.manager.find(Stock, criterio)
                : await this.stockRepository.find(criterio);
            if (listaStock.length <= 0) {
                return null
            }
            const stock: Stock = this.getStockByEspecificaciones(listaStock, especificacionesIds);
            return stock || null;
        } catch (error) {
            throw this.handleExceptions(error, 'Error al obtener el stock con los datos proporcionados');
        } 
    }


    async crearStock(datos: DtoStock, queryRunner?: QueryRunner): Promise<Stock> {
        console.log('metodo: crearStock()');
        try {
            const newEspecificaciones: Especificaciones[] = await this.especificacionesService.corroborarEspecificaciones({ especificaciones: datos.especificaciones }, queryRunner);
            const estado: EstadoPedido = await this.estadoService.getEstadoPedidoById(datos.estado.idEstadoPedido, queryRunner);
            const libro: Libro = await this.libroService.getLibroById(datos.libro.idLibro, queryRunner);
            const nuevoStock = new Stock(
                Number(datos.cantidad),
                estado,
                libro,
                newEspecificaciones,
            );
            const stockGuardar: Stock = queryRunner
                ? await queryRunner.manager.save(Stock, nuevoStock)
                : await this.stockRepository.save(nuevoStock);
            return stockGuardar;
        } catch (error) {
            throw this.handleExceptions(error, `Estoy aqui y soy yo Error en la creación del registro de stock cantidad ${datos.cantidad}`);
        }
    }

    /* No metadata for \"Stock\" was found."*/

    async actualizarStock(id: number, datos: DtoStock, queryRunner?: QueryRunner): Promise<Stock> {
        try {
            const stockActualizar = await this.getStockById(id);
            if (stockActualizar) {
                stockActualizar.cantidad = datos.cantidad;
                stockActualizar.estado = datos.estado;
                stockActualizar.libro = datos.libro;
                stockActualizar.especificaciones = datos.especificaciones;
                const stockActualizado = queryRunner
                    ? await queryRunner.manager.save(Stock, stockActualizar)
                    : await this.stockRepository.save(stockActualizar);
                return stockActualizado;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al actualizar el stock con ID ${id}`);
        }
    }

    async eliminarStock(id: number): Promise<boolean> {
        try {
            const stockEliminar = await this.getStockById(id);
            if (stockEliminar) {
                await this.stockRepository.remove(stockEliminar);
                return true;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al eliminar el stock con ID ${id}`);
        }
    }

    async softEliminarStock(id: number): Promise<Boolean> {
        const stockExists: Stock = await this.getStockById(id);
        if (stockExists.deleted) {
            throw new ConflictException('El stock ya fue borrada con anterioridad');
        }
        const rows: UpdateResult = await this.stockRepository.update({ idStock: id }, { deleted: true });
        return rows.affected == 1;
    }

    async softReactivarStock(id: number): Promise<Boolean> {
        const stockExists: Stock = await this.getStockById(id);
        if (!stockExists.deleted) {
            throw new ConflictException('El stock ya fue activada con anterioridad');
        }
        const rows: UpdateResult = await this.stockRepository.update({ idStock: id }, { deleted: false });
        return rows.affected == 1;
    }

    async actualizarCantidadStock(id: number, cantidad: number): Promise<Stock> {
        try {
            const stock: Stock = await this.getStockById(id);
            const newStock: Stock = { ...stock, cantidad }
            const stockActualizado: Stock = await this.actualizarStock(id, newStock);
            if (stockActualizado) return stockActualizado
        } catch (error) {
            throw this.handleExceptions(error, `Error al actualizar el stock con ID ${id}`);
        }
    }

    async gestionarStock(dtoLibroEstado: DtoLibroEstado, datos: DtoLibroPedido, resta: boolean, queryRunner?: QueryRunner): Promise<Stock> {
        console.log('metodo: gestionarStock()');

        try {
            const stockActualizar: Stock = await this.getStockByLibroEstado(dtoLibroEstado, queryRunner);
            if (!stockActualizar) {
                const datosCrear: DtoStock = { ...dtoLibroEstado, cantidad: Number(datos.cantidad) };
                return await this.crearStock(datosCrear, queryRunner);
            }
            if (resta) return await this.restarCantidadStock(stockActualizar, datos.cantidad, queryRunner);
            return await this.sumarCantidadStock(stockActualizar, datos.cantidad, queryRunner);
        } catch (error) {
            throw this.handleExceptions(error, `Error al gestionar el stock`);
        }
    }
    async sumarCantidadStock(stock: Stock, cantidad: number, queryRunner?: QueryRunner): Promise<Stock> {
        console.log('metodo: sumarCantidadStock()');
        try {
            const newStock: Stock = { ...stock, cantidad: stock.cantidad + cantidad }
            const stockGuardado: Stock = queryRunner
                ? await queryRunner.manager.save(Stock, newStock)
                : await this.stockRepository.save(newStock);
            return stockGuardado;
        } catch (error) {
            throw this.handleExceptions(error, `Error al aumentar cantidad del stock con ID ${stock.idStock}`);
        }
    }

    async restarCantidadStock(stock: Stock, cantidad: number, queryRunner?: QueryRunner): Promise<Stock> {
        console.log('metodo: restarCantidadStock()');
        try {
            const nuevaCantidad = stock.cantidad - cantidad;
            const nuevoStock: Stock = { ...stock, cantidad: nuevaCantidad };
            if (!queryRunner) return await this.stockRepository.save(nuevoStock)
            return await queryRunner.manager.save(nuevoStock)
        } catch (error) {
            throw this.handleExceptions(error, `Error al restar cantidad del stock con ID ${stock.idStock}`);
        }
    }

    private verificarStock(idEstado: number, idLibro: number, idsEsp: number[], listaStock: Stock[]): number {
        if (listaStock.length <= 0) return -1;
        const index = listaStock.findIndex(stock =>
            stock.estado.idEstadoPedido === idEstado &&
            stock.libro.idLibro === idLibro &&
            idsEsp.every(idEsp => stock.especificaciones.some(espec => espec.idEspecificaciones === idEsp))
        );
        return index;
    }

    async compararStocks(idLibro: number, queryRunner?: QueryRunner): Promise<Libro> {
        try {
            const listaStockActual: Stock[] = await this.comprobarStock(idLibro, queryRunner);
            const listaStockDb: Stock[] = await this.getStockByLibro(idLibro, queryRunner);
            for (const stock of listaStockActual) {
                const idsEspe: number[] = stock.especificaciones.map(esp => esp.idEspecificaciones)
                const index = this.verificarStock(
                    stock.estado.idEstadoPedido,
                    stock.libro.idLibro,
                    idsEspe,
                    listaStockDb
                );
                if (index === -1) {
                    const newDto: DtoStock = {
                        estado: stock.estado,
                        libro: stock.libro,
                        especificaciones: stock.especificaciones,
                        cantidad: stock.cantidad
                    }
                    const newStock: Stock = await this.crearStock(newDto, queryRunner)
                    continue
                }
                if (stock.cantidad != listaStockDb[index].cantidad) {
                    listaStockDb[index].cantidad = stock.cantidad;
                    const stockModificar: Stock = queryRunner
                        ? await queryRunner.manager.save(Stock, listaStockDb[index])
                        : await this.stockRepository.save(listaStockDb[index]);
                }
                listaStockDb.splice(index, 1);
            }
            if (listaStockDb.length > 0) {
                for (const stockDb of listaStockDb) {
                    stockDb.cantidad = 0;
                    const stockModificar: Stock = queryRunner
                        ? await queryRunner.manager.save(Stock, stockDb)
                        : await this.stockRepository.save(stockDb);
                }
            }
            const libro: Libro = await this.libroService.getLibroById(idLibro, queryRunner);
            return libro;
        } catch (error) {
            throw this.handleExceptions(error, `Error al tratar de comparar los stocks`);
        }
    }


    private async comprobarStock(idLibro: number, queryRunner?: QueryRunner): Promise<Stock[]> {
        try {
            const libro: Libro = await this.libroService.getLibroById(idLibro, queryRunner);
            if (!libro) throw new NotFoundException(`No se encontre libro con el id ${idLibro}`)
            const listaStock: Stock[] = [];
            let vuelta = 0;
            for (const libroP of libro.librosPedidos) {
                const idsEspe: number[] = libroP.especificaciones.map(esp => esp.idEspecificaciones)
                const index: number = this.verificarStock(libroP.estadoPedido.idEstadoPedido, libro.idLibro, idsEspe, listaStock);
                if (index == -1) {
                    const nuevoStock: Stock = {
                        idStock: null,
                        cantidad: libroP.cantidad,
                        estado: libroP.estadoPedido,
                        libro: libro,
                        especificaciones: libroP.especificaciones,
                    }
                    listaStock.push(nuevoStock);
                } else {
                    listaStock[index].cantidad += libroP.cantidad;
                }
                vuelta++;
            }
            return listaStock;
        } catch (error) {
            throw this.handleExceptions(error, `Error al tratar de comprobar los stocks del libro id ${idLibro}`);
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
