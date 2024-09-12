import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { LibroPedido } from 'src/libro-pedido/entidad/libroPedido.entity';
import { LibroPedidoService } from 'src/libro-pedido/libro-pedido.service';
import { Libro } from 'src/libro/entidad/libro.entity';
import { LibroService } from 'src/libro/libro.service';
import { DtoPedidoEstado } from 'src/pedido/dto/DtoPedidoEstado';
import { DtoPedidoReturn } from 'src/pedido/dto/DtoPedidoReturn.dto';
import { PedidoService } from 'src/pedido/pedido.service';
import { PersonaGateway } from 'src/persona/gateway/persona.gateway';
import { PersonaService } from 'src/persona/persona.service';
import { DtoLibroEstado } from 'src/stock/dto/DtoLibroEstado.dto';
import { Stock } from 'src/stock/entidad/stock.entity';
import { StockService } from 'src/stock/stock.service';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class GestionEstadosService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly pedidoService:PedidoService,
        private readonly libroPedidoService: LibroPedidoService,
        private readonly stockService: StockService,
        private readonly libroService:LibroService,
        private readonly personaService:PersonaService
    ){}
    async EstadoPedidoModificar(dtoLibrosPedido:DtoPedidoEstado, idPedido:number):Promise<DtoPedidoReturn>{
        const queryRunner:QueryRunner = this.dataSource.createQueryRunner(); // Crear un queryRunner
        await queryRunner.connect(); // Conectar el queryRunner
        await queryRunner.startTransaction(); // Iniciar la transacción        
        try {
            const pedido:DtoPedidoReturn = await this.pedidoService.getPedidoById(idPedido, queryRunner);
            if (dtoLibrosPedido.librosPedidos.length<=0) return pedido;
            const idEstado:number = dtoLibrosPedido.estado.idEstadoPedido;      
            for (const libroP of dtoLibrosPedido.librosPedidos) {
                const newLibroPedido:LibroPedido = await this.libroPedidoService.EstadoPedidoModificar(idEstado,libroP.idLibroPedido, queryRunner);
                if (!newLibroPedido) {
                    throw new NotFoundException(`No se pudo modificar el estado del libro con id ${libroP.idLibroPedido}`);
                }  else {
                    const libroStock: Libro = await this.stockService.compararStocks(libroP.libro.idLibro, queryRunner); 
                    if (!libroStock) throw new NotFoundException(`No se pudo actualizar el libro stock ${libroP.libro.idLibro}`);
                }                                     
            }
            const nuevoPedido:DtoPedidoReturn = await this.pedidoService.getPedidoById(idPedido, queryRunner);
            if(nuevoPedido) {
                await queryRunner.commitTransaction();
                const libros: Libro[] = nuevoPedido.librosPedidos.map(lp=> lp.libro);
                this.libroService.enviarLibrosActualizados({libros:libros});
                this.personaService.enviarPersona(nuevoPedido.cliente.idPersona);                
                return nuevoPedido;
            }
        } catch ( error) {
            await queryRunner.rollbackTransaction(); // Hacer rollback si algo falla
            throw this.handleExceptions(error, `Error al intentar actualizar el estado del pedido con id ${idPedido}`);
        } finally {
            await queryRunner.release();
        }
    }

    async sincronizarStock():Promise<Stock[]>{
        const listaLibrosP:LibroPedido[]= await this.libroPedidoService.getLibrosPedidos();
        const listaStock:Stock[] = [];
       try {
        for (const libroP of listaLibrosP){
            const newLibroP: DtoLibroEstado = { ...libroP, estado: libroP.estadoPedido };
            const stock: Stock = await this.stockService.gestionarStock(newLibroP, libroP, false);
            listaStock.push(stock);
        }
        
       } catch (error) {
        console.error('Sincronizcación fallida'+error)
       }
       return listaStock;
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
