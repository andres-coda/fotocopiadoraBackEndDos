import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { LibroPedido } from './entidad/libroPedido.entity';
import { Pedido } from 'src/pedido/entidad/pedido.entity';
import { Libro } from 'src/libro/entidad/libro.entity';
import { Persona } from 'src/persona/entidad/persona.entity';
import { DtoPedidoCompleto } from './dto/DtoPedidoCompleto.dto';
import { EstadoPedido } from 'src/estado-pedido/entidad/estadoPedido.entity';
import { DataSource, FindManyOptions, FindOneOptions, QueryRunner, Repository, UpdateResult } from 'typeorm';
import { DtoLibroPedido } from './dto/DtoLibroPedido.dto';
import { Especificaciones } from 'src/especificaciones/entidad/especificaciones.entity';
import { PersonaService } from 'src/persona/persona.service';
import { LibroService } from 'src/libro/libro.service';
import { EspecificacionesService } from 'src/especificaciones/especificaciones.service';
import { PedidoService } from 'src/pedido/pedido.service';
import { StockService } from 'src/stock/stock.service';
import { EstadoPedidoService } from 'src/estado-pedido/estado-pedido.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DtoLibroEstado } from 'src/stock/dto/DtoLibroEstado.dto';
import { LibroPedidoGateway } from './gateway/libroPedido.gateway';
import { PersonaGateway } from 'src/persona/gateway/persona.gateway';
import { PedidoGateway } from 'src/pedido/gateway/pedido.gateway';

@Injectable()
export class LibroPedidoService {
    constructor(
        @InjectRepository(LibroPedido) private readonly libroPedidoRepository: Repository<LibroPedido>,
        @InjectDataSource() private dataSource:DataSource,
        private readonly estadoService: EstadoPedidoService,
        private readonly stockService:StockService,
        private readonly pedidoService: PedidoService,
        private readonly esecificacionesService:EspecificacionesService,
        private readonly libroService: LibroService,
        private readonly personaService: PersonaService,
        private readonly libroPedidoGateway: LibroPedidoGateway,
        private readonly personaGateway: PersonaGateway,
     ) {}

    async getLibrosPedidos(): Promise<LibroPedido[]> {
        try {
            const criterio: FindManyOptions = { relations: ['libro', 'pedido', 'especificaciones', 'estadoPedido'] };
            const librosPedidos: LibroPedido[] = await this.libroPedidoRepository.find(criterio);
            if (librosPedidos) return librosPedidos;
            throw new NotFoundException(`No hay libros pedidos registrados en la base de datos`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer los libros pedidos`);
        }
    }

    async getLibroPedidoById(id: number, queryRunner?:QueryRunner): Promise<LibroPedido | null> {
        try {
            const criterio: FindOneOptions = { 
                relations: ['libro', 'pedido.cliente', 'especificaciones', 'estadoPedido'], 
                where: { idLibroPedido: id } 
            };
            const libroPedido: LibroPedido = queryRunner 
            ? await queryRunner.manager.findOne(LibroPedido, criterio)
            : await this.libroPedidoRepository.findOne(criterio);
            return libroPedido || null;
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer el libro pedido ${id}`);
        }
    }

    async getLibroPedidoEstadoPedido(dtoEstado:string): Promise<LibroPedido[]>{
        try {
            const estado: EstadoPedido = await this.estadoService.getEstadoPedidoNombre(dtoEstado);
            const criterio: FindManyOptions = {
                relations:['pedido.cliente','libro','especificaciones', 'estadoPedido'],
                where:{ 
                    estadoPedido: {
                        idEstadoPedido : estado.idEstadoPedido
                    }
                },
                order:{
                    pedido:{
                        idPedido: 'ASC'
                    }
                }    
            }

            const listaPedidoLibros:LibroPedido[]= await this.libroPedidoRepository.find(criterio);
            if (listaPedidoLibros) return listaPedidoLibros;
            throw new NotFoundException(`No se encontraron los libros con las especificaciiones dadas`);
        } catch(error){
            throw this.handleExceptions(error, `Error al intentar buscar los libros pedido por estado: ${dtoEstado}`);
        }
    }

    async getLibroPedidoBusqueda(dtoEsp: number[], dtoEstado: number[]): Promise<LibroPedido[]> {
        try {
            // Definir la base de la consulta con las relaciones necesarias
            const query = this.libroPedidoRepository.createQueryBuilder('libroPedido')
                .leftJoinAndSelect('libroPedido.pedido', 'pedido')
                .leftJoinAndSelect('pedido.cliente', 'cliente')
                .leftJoinAndSelect('libroPedido.libro', 'libro')
                .leftJoinAndSelect('libroPedido.especificaciones', 'especificaciones')
                .leftJoinAndSelect('libroPedido.estadoPedido', 'estadoPedido');
    
            // Aplicar filtros si hay estados proporcionados
            if (dtoEstado.length > 0) {
                query.andWhere('libroPedido.estadoPedido IN (:...dtoEstado)', { dtoEstado });
            }
    
            // Aplicar filtros si hay especificaciones proporcionadas
            if (dtoEsp.length > 0) {
                query.andWhere((qb) => {
                    const subQuery = qb.subQuery()
                        .select('subLibroPedido.idLibroPedido')
                        .from(LibroPedido, 'subLibroPedido')
                        .leftJoin('subLibroPedido.especificaciones', 'subEspecificaciones')
                        .where('subEspecificaciones.idEspecificaciones IN (:...dtoEsp)')
                        .getQuery();
                    return `libroPedido.idLibroPedido IN ${subQuery}`;
                }).setParameter('dtoEsp', dtoEsp);
            }
    
            // Ordenar por idPedido
            query.orderBy('libroPedido.pedido.idPedido', 'ASC');
    
            // Ejecutar la consulta y obtener los resultados
            const listaPedidoLibros: LibroPedido[] = await query.getMany();
    
            // Verificar si se encontraron resultados
            if (listaPedidoLibros.length > 0) return listaPedidoLibros;
    
            // Lanzar excepción si no se encontraron resultados
            throw new NotFoundException(`No se encontraron los libros con las especificaciones y estados dados`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar buscar los libros pedido por estado: ${dtoEstado}`);
        }
    }
    
    
    

    async getLibrosPedidosEspecificaciones(dtoEsp: number[], estado: string, libro:string): Promise<LibroPedido[]> {
        const listaLibrosEstado: LibroPedido[] = await this.getLibroPedidoEstadoPedido(estado);
        const especificaciones:Especificaciones[] = await this.esecificacionesService.corroborarEspecPirIds(dtoEsp);
        const libroVerificado:Libro = await this.libroService.getLibroById(Number(libro)); if (listaLibrosEstado && dtoEsp && especificaciones.length > 0 && libroVerificado) {
            const listaLibroActual:LibroPedido[] =  listaLibrosEstado.filter(libro=>libro.libro.idLibro===libroVerificado.idLibro);
            const listaFilterEsp = listaLibroActual.filter(libP => {
            const libroEspecificacionesIds = libP.especificaciones.map(espec => espec.idEspecificaciones);
            return dtoEsp.every(id => libroEspecificacionesIds.includes(id));
        });  
          return listaFilterEsp;
        }
        return [];
      }
      

    async crearLibroPedido(datos: DtoLibroPedido, queryRunner?:QueryRunner): Promise<LibroPedido> {
        try {
            console.log('metodo: crearLibroPedido()')
            const especificaciones = await this.esecificacionesService.corroborarEspecificaciones(datos, queryRunner);
            const estado = await this.estadoService.getEstadoPedidoById(1, queryRunner);
            const nuevoLibroPedido: LibroPedido =  new LibroPedido(
                datos.extras, 
                datos.cantidad, 
                especificaciones, 
                datos.libro, 
                datos.pedido, 
                estado
            );
            const dtoStock:DtoLibroEstado = { libro:datos.libro, estado:estado, especificaciones}
            const stock = await this.stockService.gestionarStock(dtoStock, datos, false, queryRunner);
            if (!stock) throw new NotFoundException(`No se pudo crear el stock`);
            const libroPedidoGuardado: LibroPedido = queryRunner 
                ? await queryRunner.manager.save(LibroPedido, nuevoLibroPedido)
                : await this.libroPedidoRepository.save(nuevoLibroPedido); 
            if(libroPedidoGuardado) {
                this.libroPedidoGateway.enviarCrearPedido(libroPedidoGuardado)
                return libroPedidoGuardado; 
            }   
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar crear el libro pedido con extras ${datos.extras}`);
        }
    }

    async actualizarLibroPedido(id: number, datos: DtoLibroPedido, queryRunner?:QueryRunner): Promise<LibroPedido> {
        try {
            const especificaciones = await this.esecificacionesService.corroborarEspecificaciones(datos);            
            let libroPedidoActualizar: LibroPedido = await this.getLibroPedidoById(id);            
            if (libroPedidoActualizar) {
                libroPedidoActualizar.extras = datos.extras;
                libroPedidoActualizar.cantidad=datos.cantidad;
                if(datos.estadoPedido) {
                    libroPedidoActualizar.estadoPedido=datos.estadoPedido;
                }
                libroPedidoActualizar.cantidad = datos.cantidad;
                libroPedidoActualizar.especificaciones = especificaciones;
                if (queryRunner){                  
                    return await queryRunner.manager.save(libroPedidoActualizar);
                }  else {
                    return await this.libroPedidoRepository.save(libroPedidoActualizar);
                }
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar actualizar el libro pedido con id ${id}`);
        }
    }

    async eliminarLibroPedido(id: number): Promise<Boolean> {
        try {
            const libroPedidoEliminar: LibroPedido = await this.getLibroPedidoById(id);
            if (libroPedidoEliminar) {
                await this.libroPedidoRepository.remove(libroPedidoEliminar);
                return true;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar eliminar el libro pedido con id ${id}`);
        }
    }

    async softEliminarLibroPedido(id: number): Promise<Boolean> {
        const libroPedidoExists: LibroPedido = await this.getLibroPedidoById(id);
        if (libroPedidoExists.deleted) {
            throw new ConflictException('El libro pedido ya fue borrado con anterioridad');
        }
        const rows: UpdateResult = await this.libroPedidoRepository.update({ idLibroPedido: id }, { deleted: true });
        return rows.affected == 1;
    }

    async softReactivarLibroPedido(id: number): Promise<Boolean> {
        const libroPedidoExists: LibroPedido = await this.getLibroPedidoById(id);
        if (!libroPedidoExists.deleted) {
            throw new ConflictException('El libro pedido ya fue activado con anterioridad');
        }
        const rows: UpdateResult = await this.libroPedidoRepository.update({ idLibroPedido: id }, { deleted: false });
        return rows.affected == 1;
    }

    async EstadoPedidoModificar(estado:number, id:number, queryRunner?: QueryRunner): Promise<LibroPedido>{
        try {
            const libroPedido: LibroPedido = await this.getLibroPedidoById(id, queryRunner);          
            if ( !libroPedido ) throw new NotFoundException("no se encontro el pedido de libro proporcionado");
            const estadoPedido: EstadoPedido = await this.estadoService.getEstadoPedidoById(estado, queryRunner);            
            if ( !estadoPedido ) throw new NotFoundException("no se encontro el estado pedido proporcionado");
            libroPedido.estadoPedido= estadoPedido;  
            const newLibroPedido:LibroPedido = queryRunner
                ? await queryRunner.manager.save(libroPedido)
                : await this.libroPedidoRepository.save(libroPedido);
            if (newLibroPedido) {
                //const newLibroP:LibroPedido = await this.getLibroPedidoById(newLibroPedido.idLibroPedido);
                this.libroPedidoGateway.enviarActualizacionPedido(newLibroPedido)
                return newLibroPedido;         
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar actualizar el estado libro pedido con id ${id}`);
        }
    }   

    async guardarPedidoCompleto(pedidoCompleto:DtoPedidoCompleto):Promise<Pedido>{  
        const queryRunner = this.dataSource.createQueryRunner(); // Crear un queryRunner
        await queryRunner.connect(); // Conectar el queryRunner
        await queryRunner.startTransaction(); // Iniciar la transacción          
        const arrLibrosPedidos:LibroPedido[]=[];
        console.log('metodo: guardarPedidoCompleto()');
        try {
            const cliente:Persona = await this.personaService.corroboracionCliente(pedidoCompleto.cliente, queryRunner);
            const libros: Libro[] = await this.libroService.corroboracionLibro(pedidoCompleto, queryRunner);
            const pedido:Pedido = {...pedidoCompleto.pedido, cliente:cliente}
            const nuevoPedido: Pedido = await this.pedidoService.crearPedido(pedido, queryRunner);
            for (const libroPedido of pedidoCompleto.librosPedido) {
                const nuevoLibroPedidoCargar:LibroPedido = {...libroPedido, pedido:nuevoPedido}
                const nuevoLibroPedido: LibroPedido = await this.crearLibroPedido(nuevoLibroPedidoCargar, queryRunner);
                if ( nuevoLibroPedido) {
                    arrLibrosPedidos.push(nuevoLibroPedido);
                    continue;
                }
                throw new NotFoundException(`No se pudo crear el libro pedido ${libroPedido.extras}`);
            }
            const pedidoCargado = await this.pedidoService.getPedidoById(nuevoPedido.idPedido, queryRunner);
            if (pedidoCargado) {
                await queryRunner.commitTransaction();
                const clienteActualizado:Persona = await this.personaService.getPersonaById(cliente.idPersona);
                await this.libroService.enviarLibrosActualizados({libros:libros});
                if (clienteActualizado) {
                    this.personaGateway.enviarActualizacionPersona(clienteActualizado);      
                }
                return pedidoCargado;
            }
        } catch (error) {   
            console.error('Error en guardarPedidoCompleto:', error);         
            await queryRunner.rollbackTransaction(); // Hacer rollback si algo falla
            throw this.handleExceptions(error, `Error al intentar crear el pedido del libro`);
        } finally {
            await queryRunner.release();
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
