import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Libro } from './entidad/libro.entity';
import { FindManyOptions, FindOneOptions, In, QueryRunner, Repository, UpdateResult } from 'typeorm';
import { MateriaService } from 'src/materia/materia.service';
import { DtoLibro } from './dto/dtoLibro.dto';
import { Materia } from 'src/materia/entidad/materia.entity';
import { DtoLibroArray } from './dto/DtoLibroArray.dto';
import { DtoLibroPedidoArray } from 'src/libro-pedido/dto/DtoLibroPedidoArray.dto';
import { LibroGateway } from './gateway/libro.gateway';

@Injectable()
export class LibroService {
    constructor(
        @InjectRepository(Libro) private readonly libroRepository: Repository<Libro>,
        private readonly materiaService: MateriaService,
        private readonly libroGateway: LibroGateway,
    ) {}

    async getLibros(): Promise<Libro[]> {
        try {
            const criterio: FindManyOptions = { relations: [ 'stock', 'profeMaterias.curso.escuela', 'materia','stock.estado','stock.especificaciones'] };
            const libros: Libro[] = await this.libroRepository.find(criterio);
            if (libros) return libros;
            throw new NotFoundException(`No hay libros registrados en la base de datos`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer los libros`);
        }
    }

    async getLibroById(id: number, queryRunner?:QueryRunner): Promise<Libro | null> {
        console.log('metodo: getLibroById()');
        try {            
            const criterio: FindOneOptions = { 
                relations: [
                    'stock', 
                    'stock.estado',
                    'stock.especificaciones', 
                    'librosPedidos.especificaciones',
                    'librosPedidos.pedido.cliente', 
                    'librosPedidos.estadoPedido', 
                    'profeMaterias.curso.escuela', 
                    'profeMaterias.materia', 
                    'profeMaterias.profesor', 
                    'materia'
                ], 
                where: { idLibro: id },
                };
            const libro: Libro = queryRunner 
                ? await queryRunner.manager.findOne(Libro, criterio)
                : await this.libroRepository.findOne(criterio);
            return libro || null
        } catch (error) {
                console.error('Error en getLibroById:', error); // Agrega un log detallado
            throw this.handleExceptions(error, `Error al intentar leer el libro ${id}`);
        }
    }

    async crearLibro(datos: DtoLibro, queryRunner?:QueryRunner): Promise<Libro> {
        console.log('metodo: crearLibro()');
        try {
            const materia: Materia = await this.materiaService.getMateriaByCriterio(datos.materia, queryRunner);
            if (!materia) throw new NotFoundException(`No se pudo crear ni encontrar la materia ${datos.materia.nombre}`);
            const nuevoLibro: Libro = new Libro(                  
                datos.nombre,
                datos.descripcion,
                datos.edicion,
                datos.img,
                datos.cantidadPg,
                datos.autor,
                materia,
            )
            const libroGuardado: Libro = queryRunner 
                ? await queryRunner.manager.save(Libro, nuevoLibro)
                : await this.libroRepository.save(nuevoLibro);
            this.libroGateway.enviarCrearLibro(libroGuardado);
            return libroGuardado;
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar crear el libro ${datos.nombre}`);
        }
    }
    

    async actualizarLibro(id: number, datos: DtoLibro, queryRunner?:QueryRunner): Promise<Libro> {
        try {
            let libroActualizar: Libro = await this.getLibroById(id);
            if (!libroActualizar) throw new NotFoundException(`No se encontro el libro con id ${id} para actualizar`);
            libroActualizar.nombre = datos.nombre;
            libroActualizar.descripcion = datos.descripcion;
            libroActualizar.edicion = datos.edicion;
            libroActualizar.img= datos.img;
            libroActualizar.cantidadPg= datos.cantidadPg;
            libroActualizar.autor=datos.autor;
            libroActualizar.materia=datos.materia;
            const libroActualizado: Libro = queryRunner 
                ? await queryRunner.manager.save(Libro, libroActualizar)
                : await this.libroRepository.save(libroActualizar);
            this.libroGateway.enviarActualizacionLibro(libroActualizado);
            return libroActualizado;            
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar actualizar el libro ${datos.nombre}`);
        }
    }

    async eliminarLibro(id: number): Promise<Boolean> {
        try {
            const libroEliminar: Libro = await this.getLibroById(id);
            if (libroEliminar) {
                await this.libroRepository.remove(libroEliminar);
                return true;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar eliminar el libro con id ${id}`);
        }
    }

    async softEliminarLibro(id: number): Promise<Boolean> {
        const libroExists: Libro = await this.getLibroById(id);
        if (libroExists.deleted) {
            throw new ConflictException('El libro ya fue borrado con anterioridad');
        }
        const rows: UpdateResult = await this.libroRepository.update({ idLibro: id }, { deleted: true });
        return rows.affected == 1;
    }

    async softReactivarLibro(id: number): Promise<Boolean> {
        const libroExists: Libro = await this.getLibroById(id);
        if (!libroExists.deleted) {
            throw new ConflictException('El libro ya fue activado con anterioridad');
        }
        const rows: UpdateResult = await this.libroRepository.update({ idLibro: id }, { deleted: false });
        return rows.affected == 1;
    }

    private async corroborarLibro(datos: DtoLibro, queryRunner?:QueryRunner): Promise<Libro| null> {
        console.log('metodo: corroborarLibro()');
        if (!datos.nombre) {
            throw new NotFoundException("El libro no tiene nombre ni id");
        }
        try {
            const criterio: FindManyOptions<Libro> = {
                where: { nombre: datos.nombre },
            };
            const libros: Libro[] = queryRunner 
                ? await queryRunner.manager.find(Libro, criterio)
                : await this.libroRepository.find(criterio);
            if (libros.length<=0) return null
            const libroEncontrado = libros.find(libro =>
                libro.edicion === datos.edicion &&
                libro.cantidadPg === datos.cantidadPg &&
                libro.descripcion === datos.descripcion
            );
            return libroEncontrado || null;
        } catch (error) {
            throw this.handleExceptions(error, `Error al corroborar el libro`);
        }
    }

    async corroborarLibroIndividual(libro: DtoLibro, queryRunner?:QueryRunner):Promise<Libro>{
        console.log('metodo: corroborarLibroIndividual()');
        try {
            if (libro.idLibro) {
                const libroId: Libro = await this.getLibroById(libro.idLibro, queryRunner);
                if (libroId) {
                    return libroId;
                }
            } else {
                const libroNombre: Libro = await this.corroborarLibro(libro, queryRunner);
                if (libroNombre) {
                    return libroNombre;
                }
            }
            const nuevoLibro: Libro = await this.crearLibro(libro,queryRunner);
            if (nuevoLibro) {
                return nuevoLibro;
            }
            throw new NotFoundException(`No se encontró ni se pudo crear el libro ${libro.nombre}`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar crear el pedido del libro`);
        }
    }

    async corroboracionLibro(librosArray: DtoLibroPedidoArray, queryRunner?:QueryRunner): Promise<Libro[]> {
        console.log('metodo: corroboracionLibro()');  
        const librosComprobados: Libro[] = [];
        
        for (const libro of librosArray.librosPedido) {
            try {
                const newLibro:Libro = await this.corroborarLibroIndividual(libro.libro, queryRunner);
                if (newLibro) {
                    librosComprobados.push(newLibro);
                } else {
                    throw new NotFoundException(`No se encontró ni se pudo crear el libro ${newLibro.nombre}`);
                }
            } catch (error) {
                throw this.handleExceptions(error, `Error al intentar crear el pedido del libro`);
            }
        }
    
        return librosComprobados;
    }    

    async corroborarLibrosArray(datos:DtoLibroArray):Promise<Libro[]>{
        if (!datos || !Array.isArray(datos.libros)) {
            throw new BadRequestException('Los datos proporcionados no son válidos o no se han proporcionado libros.');
        }
        try {
            const libros =await this.libroRepository.findBy({
                idLibro: In(datos.libros.map(l=>l.idLibro))
            });
            const todasEstanPresentes = libros.length === datos.libros.length;
            if (todasEstanPresentes) return libros
            throw new NotFoundException('No se encontraron los libros proporcionadas.')
        }catch (error) {
            throw this.handleExceptions(error, `Error al corroborar los libros`);
        }
    }

    async enviarLibrosActualizados(datos:DtoLibroArray){
        try{
            for(const libro of datos.libros){
                const libroActualizado:Libro = await this.getLibroById(libro.idLibro);
                if (!libroActualizado) throw new NotFoundException(`No se pudo encontrar el libro ${libro.idLibro} para actualizarlo`)
                this.libroGateway.enviarActualizacionLibro(libroActualizado);
            }
        }catch (error) {
            throw this.handleExceptions(error, `Error al corroborar los libros`);
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

