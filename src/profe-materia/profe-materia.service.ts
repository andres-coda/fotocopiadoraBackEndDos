import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, FindOneOptions, QueryRunner, Repository, UpdateResult } from 'typeorm';
import { ProfeMateria } from './entidad/profeMateria.entity';
import { PersonaService } from 'src/persona/persona.service';
import { MateriaService } from 'src/materia/materia.service';
import { LibroService } from 'src/libro/libro.service';
import { DtoProfeMateria } from './dto/DtoProfeMateria.dto';
import { Persona } from 'src/persona/entidad/persona.entity';
import { Materia } from 'src/materia/entidad/materia.entity';
import { Libro } from 'src/libro/entidad/libro.entity';
import { DtoLibro } from 'src/libro/dto/dtoLibro.dto';

@Injectable()
export class ProfeMateriaService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(ProfeMateria) private readonly profeMateriaRepository: Repository<ProfeMateria>,
    private readonly personaService: PersonaService,
    private readonly materiaService: MateriaService,
    private readonly libroService: LibroService,
  ) { }

  async getProfeMateria(): Promise<ProfeMateria[]> {
    try {
      const criterio: FindManyOptions = {
        relations: ['materia', 'profesor', 'curso.escuela', 'libros']
      }
      const profeMateria: ProfeMateria[] = await this.profeMateriaRepository.find(criterio);
      if (profeMateria) return profeMateria;
      throw new NotFoundException(`No hay lista de profesores y materias registrada en la base de datos`);
    } catch (error) {
      throw this.handleExceptions(error, `Error al intentar leer la lista de profesores y materias`);
    }
  }

  async getProfeMateriaById(id: number): Promise<ProfeMateria> {
    try {
      const criterio: FindOneOptions = {
        relations: ['materia', 'profesor', 'curso.escuela', 'libros'],
        where: { idProfeMateria: id }
      };
      const profeMateria: ProfeMateria = await this.profeMateriaRepository.findOne(criterio);
      if (profeMateria) return profeMateria;
      throw new NotFoundException(`No se encontró la relación de profesor y materia con el id ${id}`);
    } catch (error) {
      throw this.handleExceptions(error, `Error al intentar leer la relación profesor y materia ${id}`);
    }
  }

  async corroborarProfeMateria(datos: DtoProfeMateria): Promise<ProfeMateria> {
    try {
      const criterio: FindOneOptions<ProfeMateria> = {
        relations: ['profesor', 'materia'],
        where: {
          materia: {
            idMateria: datos.materia.idMateria,
          },
          profesor: {
            idPersona: datos.profesor.idPersona,
          },
        },
      };
      const result = await this.profeMateriaRepository.findOne(criterio);
      return result || null;
    } catch (error) {
      throw this.handleExceptions(error, `Error al intentar corroborar los datos de ${datos.profesor.nombre}, ${datos.materia.nombre}`);
    }
  }

  async crearProfeMateriaCompleto(dtoProfeMateria: DtoProfeMateria, queryRunner?:QueryRunner): Promise<ProfeMateria> {
    console.log('crearProfeMateriaCompleto()');    
    try {
      let profe: Persona = await this.personaService.getPersonaByData(dtoProfeMateria.profesor, queryRunner);
      if (!profe) {
        profe = await this.personaService.crearPersona(dtoProfeMateria.profesor, queryRunner);
      }
      let materia: Materia = await this.materiaService.getMateriaByNombre(dtoProfeMateria.materia.nombre);
      if (!materia) {
        materia = await this.materiaService.crearMateria(dtoProfeMateria.materia, queryRunner);
      }
      if (profe && materia) {
        const newDto: DtoProfeMateria = { ...dtoProfeMateria, profesor: profe, materia: materia }
        const profeMateria = new ProfeMateria(profe, materia);
        if (queryRunner) {
          console.log('guardando profe materia');
          return await queryRunner.manager.save(profeMateria)
        } else {
          return await this.profeMateriaRepository.save(profeMateria);

        }
      }
    } catch (error) {
      throw this.handleExceptions(error, `Error al intentar crear los datos de ${dtoProfeMateria.profesor.nombre}, ${dtoProfeMateria.materia.nombre}`);
    } 
  }

  async actualizarProfeMateria(id: number, datos: DtoProfeMateria): Promise<ProfeMateria> {
    try {
      const profe: Persona = await this.personaService.getPersonaById(datos.profesor.idPersona);
      const materia: Materia = await this.materiaService.getMateriaById(datos.materia.idMateria);
      if (materia && profe) {
        let profeMateriaActualizar: ProfeMateria = await this.getProfeMateriaById(id);
        if (profeMateriaActualizar) {
          profeMateriaActualizar.profesor = profe;
          profeMateriaActualizar.materia = materia;
          profeMateriaActualizar = await this.profeMateriaRepository.save(profeMateriaActualizar);
          return profeMateriaActualizar;
        }
      }
    } catch (error) {
      throw this.handleExceptions(error, `Error al intentar actualizar la la relación entre ${datos.profesor.nombre}, ${datos.materia.nombre}`);
    }
  }

  async eliminarProfeMateria(id: number): Promise<Boolean> {
    try {
      const profeMateriaEliminar: ProfeMateria = await this.getProfeMateriaById(id);
      if (profeMateriaEliminar) {
        await this.profeMateriaRepository.remove(profeMateriaEliminar);
        return true;
      }
    } catch (error) {
      throw this.handleExceptions(error, `Error al intentar eliminar la la relación con id ${id}`);
    }
  }

  async softEliminarProfeMateria(id: number): Promise<Boolean> {
    const profeMateriaExists: ProfeMateria = await this.getProfeMateriaById(id);
    if (profeMateriaExists.deleted) {
      throw new ConflictException(`La relación con id ${id} ya fue borrada con anterioridad`);
    }
    const rows: UpdateResult = await this.profeMateriaRepository.update({ idProfeMateria: id }, { deleted: true });
    return rows.affected == 1;
  }

  async softReactivarProfeMateria(id: number): Promise<Boolean> {
    const profeMateriaExists: ProfeMateria = await this.getProfeMateriaById(id);
    if (!profeMateriaExists.deleted) {
      throw new ConflictException('La relación ya fue activada con anterioridad');
    }
    const rows: UpdateResult = await this.profeMateriaRepository.update({ idProfeMateria: id }, { deleted: false });
    return rows.affected == 1;
  }

  async agregarLibroProfeMateria(id: number, dtoLibro: DtoLibro): Promise<ProfeMateria> {
    try {
      const profMateria: ProfeMateria = await this.getProfeMateriaById(id);
      const libro: Libro = await this.libroService.corroborarLibroIndividual(dtoLibro);
      const libroYaAsociado: boolean = profMateria.libros.some(l => l.idLibro === libro.idLibro);
      if (libroYaAsociado) {
        throw new ConflictException(`El libro ya está asociado a la relación profe materia id ${id}`);
      }
      profMateria.libros.push(libro);
      const newProfeMateria: ProfeMateria = await this.profeMateriaRepository.save(profMateria);
      return newProfeMateria;
    } catch (error) {
      throw this.handleExceptions(error, `Error al intentar agregar el libro ${dtoLibro.nombre}, a la relación profe materia id ${id}`);
    }
  }

  async quitarLibroProfeMateria(idProfeMateria: number, idLibro: number): Promise<ProfeMateria> {
    try {
      const profeMateria: ProfeMateria = await this.getProfeMateriaById(idProfeMateria);
      const libro: Libro = await this.libroService.getLibroById(idLibro);
      const libroYaAsociado: boolean = profeMateria.libros.some(l => l.idLibro === libro.idLibro);
      if (!libroYaAsociado) {
        throw new NotFoundException(`El libro con id ${idLibro} no está asociado a la relación profe materia id ${idProfeMateria}`);
      }
      const newLibros: Libro[] = profeMateria.libros.filter(lib => lib.idLibro != libro.idLibro);
      profeMateria.libros = newLibros;
      const newProfeMateria: ProfeMateria = await this.profeMateriaRepository.save(profeMateria);
      return newProfeMateria;
    } catch (error) {
      throw this.handleExceptions(error, `Error al intentar quitar el libro de id ${idLibro}, a la relación profe materia id ${idProfeMateria}`);
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

