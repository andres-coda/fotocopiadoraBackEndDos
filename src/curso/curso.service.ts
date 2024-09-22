import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Curso } from './entidad/curso.entity';
import { DataSource, FindManyOptions, FindOneOptions, In, QueryRunner, Repository, UpdateResult } from 'typeorm';
import { EscuelaService } from 'src/escuela/escuela.service';
import { ProfeMateriaService } from 'src/profe-materia/profe-materia.service';
import { DtoCurso } from './dto/DtoCurso.dto';
import { Escuela } from 'src/escuela/entidad/escuela.entity';
import { CursosGateway } from './gateway/cursos.gateway';
import { ProfeMateria } from 'src/profe-materia/entidad/profeMateria.entity';
import { DtoCursoArray } from './dto/DtoCursoArray.dto';
import { DtoProfeMateria } from 'src/profe-materia/dto/DtoProfeMateria.dto';

@Injectable()
export class CursoService {
  constructor(
    @InjectRepository(Curso) private readonly cursoRepository: Repository<Curso>,
    @InjectDataSource() private dataSource: DataSource,
    private readonly cursosGateway: CursosGateway,
    private readonly escuelaService: EscuelaService,
    private readonly profeMateriaService: ProfeMateriaService,
  ) { }

  async getCursos(): Promise<Curso[]> {
    try {
      const criterio: FindManyOptions = { 
        relations: ['escuela', 'profeMaterias.profesor', 'profeMaterias.materia', 'profeMaterias.libros','profeMaterias'] 
    };
      const cursos: Curso[] = await this.cursoRepository.find(criterio);
      if (cursos) return cursos;
      throw new NotFoundException(`No hay cursos registrados en la base de datos`);
    } catch (error) {
      throw this.handleExceptions(error, `Error al intentar leer los cursos`);
    }
  }

  async getCursoById(id: number): Promise<Curso> {
    try {
      const criterio: FindOneOptions = {
        relations: ['escuela', 'profeMaterias.profesor', 'profeMaterias.materia', 'profeMaterias.libros'],
        where: { idCurso: id }
      }
      const curso: Curso = await this.cursoRepository.findOne(criterio);
      if (curso) return curso;
      throw new NotFoundException(`No se encontro el curso con el id ${id}`);
    } catch (error) {
      throw this.handleExceptions(error, `Error al intentar leer el curso ${id}: ${error}`);
    }
  }

  private async getCursoByData(dtoCurso: DtoCurso): Promise<Curso | null> {
    try {
      const criterio: FindOneOptions<Curso> = {
        relations: ['escuela', 'profeMaterias.profesor', 'profeMaterias.materia'],
        where: {
          anio: dtoCurso.anio,
          grado: dtoCurso.grado,
          escuela: {
            idEscuela: dtoCurso.escuela.idEscuela
          }
        }
      }
      const curso: Curso = await this.cursoRepository.findOne(criterio);
      return curso || null
    } catch (error) {
      throw this.handleExceptions(error, `Error al intentar encontrar el curso ${dtoCurso.grado}: ${error}`);
    }
  } 

  async crearCurso(datos: DtoCurso, queryRunner?:QueryRunner): Promise<Curso> {
    console.log('metodo: crearCurso()');
    
    try {
      const escuela: Escuela = await this.escuelaService.getEscuelaById(datos.escuela.idEscuela);
      if (!escuela) throw new NotFoundException(`Escuela no encontrada ${datos.escuela.idEscuela}`);
      const nuevoCurso: Curso = new Curso(datos.anio, datos.grado, escuela);
      const cursoGuardado: Curso = queryRunner 
                ? await queryRunner.manager.save(Curso, nuevoCurso)
                : await this.cursoRepository.save(nuevoCurso); 
      if (cursoGuardado) {
        this.cursosGateway.enviarActualizacionCurso('curso creado',cursoGuardado);
        return cursoGuardado;      
      }
    } catch (error) {
      throw this.handleExceptions(error, `Error al intentar crear el curso ${datos.grado} en la base de datos; ${error}`);
    }
  }

  async actualizarCurso(id: number, datos: DtoCurso, queryRunner?:QueryRunner): Promise<Curso> {
    try {
      const cursoActualizar: Curso = await this.getCursoById(id);
      if (cursoActualizar) {
        cursoActualizar.anio = datos.anio;
        cursoActualizar.grado = datos.grado;
        cursoActualizar.escuela = datos.escuela;
        if (queryRunner) {
            const cursoActualizado = await queryRunner.manager.save(Curso, cursoActualizar);
            this.cursosGateway.enviarActualizacionCurso('curso actualizado',cursoActualizado);
            return cursoActualizado
          } else {      
            const cursoActualizado = await this.cursoRepository.save(cursoActualizar);
            this.cursosGateway.enviarActualizacionCurso('curso actualizado',cursoActualizado);
            return cursoActualizado;
          }
      }
    } catch (error) {
      throw this.handleExceptions(error, `Error al intentar actualizar el curso ${datos.grado} en la base de datos; ${error}`);
    }
  }

  async eliminarCurso(id: number): Promise<Boolean> {
    try {
      const cursoEliminar: Curso = await this.getCursoById(id);
      if (cursoEliminar) {
        await this.cursoRepository.remove(cursoEliminar);
        this.cursosGateway.enviarActualizacionCurso('curso eliminado',cursoEliminar);
        return true;
      }
    } catch (error) {
      throw this.handleExceptions(error, `Error al intentar eliminar el curso de id ${id} en la base de datos; ${error}`);
    }
  }

  async softEliminarCurso(id: number): Promise<Boolean> {
    // Busco el producto
    const cursoExists: Curso = await this.getCursoById(id);
    // Si el producto esta borrado, lanzamos una excepcion
    if (cursoExists.deleted) {
      throw new ConflictException('El curso ya fue borrada con anterioridad');
    }
    // Actualizamos la propiedad deleted
    const rows: UpdateResult = await this.cursoRepository.update(
      { idCurso: id },
      { deleted: true }
    );
    // Si afecta a un registro, devolvemos true
    return rows.affected == 1;
  }

  async softReactvarCurso(id: number): Promise<Boolean> {
    // Busco el producto
    const cursoExists: Curso = await this.getCursoById(id);
    // Si el producto esta borrado, lanzamos una excepcion
    if (!cursoExists.deleted) {
      throw new ConflictException('El curso ya fue activado con anterioridad');
    }
    // Actualizamos la propiedad deleted
    const rows: UpdateResult = await this.cursoRepository.update(
      { idCurso: id },
      { deleted: false }
    );
    // Si afecta a un registro, devolvemos true
    return rows.affected == 1;
  }

  async quitarProfeMateria(datos: ProfeMateria, id: number) {
    try {
      const curso: Curso = await this.getCursoById(id);
      curso.profeMaterias = curso.profeMaterias.filter(profe => profe.idProfeMateria !== datos.idProfeMateria);
      const cursoActualizado = await this.cursoRepository.save(curso);
      if(cursoActualizado) {
        this.cursosGateway.enviarActualizacionCurso('se actualizo curso', cursoActualizado);
        return cursoActualizado;
      }
    } catch (error) {
      throw this.handleExceptions(error, `Error al quitar profeMateria del curso con id ${id}`);
    }
  }


  private async agregarProfeMateriaCurso(dtoCurso: Curso, dtoProfeMateria: ProfeMateria, queryRunner?:QueryRunner): Promise<Curso> {
    console.log('metodo: agregarProfeMateriaCurso()');
    
    try {
      const newProfes: ProfeMateria[] = Array.isArray(dtoCurso.profeMaterias) ? [...dtoCurso.profeMaterias] : [];
      newProfes.push(dtoProfeMateria);
      const newCurso: Curso = { ...dtoCurso, profeMaterias: newProfes }
      const cursoActualizado: Curso = queryRunner 
                ? await queryRunner.manager.save(Curso, newCurso)
                : await this.cursoRepository.save(newCurso); 
      if (cursoActualizado) {
        this.cursosGateway.enviarActualizacionCurso('curso creado',cursoActualizado);
        return cursoActualizado;      
      }
    } catch (error) {
      throw this.handleExceptions(error, `Error al agregar profesor y materia al curso`);
    }
  }

  async corroborarCursos(datos: DtoCursoArray): Promise<Curso[]> {
    try {
      const cursos = await this.cursoRepository.findBy({
        idCurso: In(datos.cursos.map(c => c.idCurso))
      });
      const todasEstanPresentes = cursos.length === datos.cursos.length;
      if (todasEstanPresentes) return cursos
      throw new NotFoundException('No se encontraron los cursos proporcionadas.')
    } catch (error) {
      throw this.handleExceptions(error, `Error al corroborar los cursos`);
    }
  }

  private async validarCurso(dtoCurso: DtoCurso, queryRunner?:QueryRunner): Promise<Curso> {
    console.log('metodo: validarCurso()');
    try {
      let curso: Curso = await this.getCursoByData(dtoCurso);
      if (!curso) {
        curso = await this.crearCurso(dtoCurso, queryRunner);
      }
      return curso;
    } catch (error) {
      throw this.handleExceptions(error, `Error al intentar validar el curso ${dtoCurso.grado}`);
    }
  }

  async cargarCursoCompleto(dtoProfeMateria: DtoProfeMateria): Promise<Curso> {
    const queryRunner = this.dataSource.createQueryRunner(); // Crear un queryRunner
    await queryRunner.connect(); // Conectar el queryRunner
    await queryRunner.startTransaction(); // Iniciar la transacción
    try {
      const profeMateria: ProfeMateria = await this.profeMateriaService.crearProfeMateriaCompleto(dtoProfeMateria, queryRunner);
      const curso: Curso = await this.validarCurso(dtoProfeMateria.curso, queryRunner);
      if (!curso && !profeMateria) {
        throw new NotFoundException('No se pudo procesar la solicitud');
      }
      if (curso.profeMaterias && curso.profeMaterias.length > 0 && curso.profeMaterias.some(pm => pm.idProfeMateria === profeMateria.idProfeMateria)) {
        return curso;
      }
      const newCurso: Curso = await this.agregarProfeMateriaCurso(curso, profeMateria, queryRunner);
      if (newCurso) {
        this.cursosGateway.enviarActualizacionCurso('se actualizo curso', newCurso);
        await queryRunner.commitTransaction();
        return newCurso;
      }
      throw new NotFoundException('No se pudo agregar la materia y el profesor al curso');
    } catch (error) {
      await queryRunner.rollbackTransaction(); // Hacer rollback si algo falla
      throw this.handleExceptions(error, `Error al intentar crear los datos de ${dtoProfeMateria.profesor.nombre}, ${dtoProfeMateria.materia.nombre}`);
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