import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Persona } from './entidad/persona.entity';
import { FindManyOptions, FindOneOptions, In, QueryRunner, Repository, UpdateResult } from 'typeorm';
import { DtoPersona } from './dto/personaDto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DtoArrayPersona } from './dto/DtoArrayPersona.dto';
import { PersonaGateway } from './gateway/persona.gateway';

@Injectable()
export class PersonaService {
    constructor(
        @InjectRepository(Persona) private readonly personaRepository: Repository<Persona>,
        private readonly personaGateway:PersonaGateway,
    ) {}

    async getPersonasCompleto(): Promise<Persona[]> {
        try {
            const criterio: FindManyOptions = { 
                relations: ['profeMaterias.curso', 'pedidos.librosPedidos.estadoPedido'],
                order: {
                    pedidos: {
                        librosPedidos:{ 
                            estadoPedido: {
                                idEstadoPedido : 'ASC'
                            }
                        },
                        fechaTomado: 'ASC' 
                    }
                }
            };
            const personas: Persona[] = await this.personaRepository.find(criterio);
            if (!personas)  throw new NotFoundException(`No hay personas registradas en la base de datos`);

            const personasFiltradas:Persona[]= personas.map(persona=>{
                persona.pedidos=persona.pedidos.filter(pedido=>{
                    const tieneTodosEstados5 = pedido.librosPedidos.every(libroPedido => libroPedido.estadoPedido.idEstadoPedido === 5);
                    return !tieneTodosEstados5;
                });
                return persona;
            })
            return personasFiltradas;
            
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer las personas`);
        }
    }

    async getPersonas(): Promise<Persona[]> {
        try {
            const personas: Persona[] = await this.personaRepository
                .createQueryBuilder('persona')
                .leftJoinAndSelect('persona.profeMaterias.curso', 'curso')
                .leftJoinAndSelect('persona.pedidos', 'pedidos')
                .leftJoinAndSelect('pedidos.librosPedidos', 'librosPedidos')
                .leftJoinAndSelect('librosPedidos.estadoPedido', 'estadoPedido')
                .leftJoinAndSelect('pedidos.estado', 'estado')
                .where('pedidos.librosPedidos.estadoPedido.idEstadoPedido <= 4')
                .orWhere(qb => {
                    const subQuery = qb.subQuery()
                        .select('pedidos.idPedido')
                        .from('Pedido', 'pedidos')
                        .orderBy('pedidos.fechaTomado', 'ASC')
                        .where('pedidos.estado.idEstadoPedido = 5')
                        .limit(2)
                        .getQuery();
                    return 'pedidos.idPedido IN ' + subQuery;
                })
                .orderBy('pedidos.librosPedidos.estadoPedido.idEstadoPedido', 'ASC')
                .addOrderBy('pedidos.fechaTomado', 'ASC')
                .getMany();
    
            if (personas.length > 0) return personas;
            throw new NotFoundException(`No hay personas registradas en la base de datos`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer las personas`);
        }
    }

    async getPersonaById(id: number): Promise<Persona|null> {
        try {
            const criterio: FindOneOptions<Persona> = { 
                relations: [
                    'profeMaterias.curso', 
                    'pedidos.librosPedidos.libro',
                    'pedidos.librosPedidos.estadoPedido'
                ],
                where: { idPersona: id } ,
                order: {
                    pedidos: {
                        librosPedidos: {
                            idLibroPedido: 'DESC'
                        } 
                    }
                }
            };
            const persona: Persona = await this.personaRepository.findOne(criterio);
            return persona;
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar leer la persona ${id}`);
        }
    } 

    async getPersonaByData( data: Partial<DtoPersona>, queryRunner?:QueryRunner) : Promise <Persona | null> {
        console.log('metodo: getPersonaByData()');  
        let condicion= {cat: "nombre", val:""};
        if (data.celular) {
            condicion = { cat: "celular", val: data.celular };
        } else if (data.email) {
            condicion = { cat: "email", val: data.email };            
        } else {
            condicion = { cat: "nombre", val: data.nombre };
        }
        const criterio: FindOneOptions = { 
            relations:['profeMaterias.curso', 'pedidos.librosPedidos.libro'],
            where: {
                [condicion.cat]: condicion.val 
            }
        }
        const persona: Persona = queryRunner 
            ? await queryRunner.manager.findOne(Persona, criterio)
            : await this.personaRepository.findOne(criterio);
        return persona || null
    }

    async crearPersona(datos: DtoPersona,  queryRunner?: QueryRunner): Promise<Persona> {
        console.log('metodo: crearPersona()');  
        try {
            const nuevaPersona: Persona = new Persona(datos.nombre, datos.celular, datos.email);
            const personaGuardada: Persona = queryRunner 
                ? await queryRunner.manager.save(Persona, nuevaPersona)
                : await this.personaRepository.save(nuevaPersona);
            if (personaGuardada){
                this.personaGateway.enviarCrearPersona(personaGuardada);
            }
            return personaGuardada;
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar crear la persona`);
        }
    }

    async actualizarPersona(id: number, datos: DtoPersona, queryRunner?:QueryRunner): Promise<Persona> {
        try {
            let personaActualizar: Persona = await this.getPersonaById(id);
            if (personaActualizar) {
                personaActualizar.nombre = datos.nombre;
                personaActualizar.celular = datos.celular;
                personaActualizar.email = datos.email;
                const personaGuardada: Persona = queryRunner 
                    ? await queryRunner.manager.save(Persona, personaActualizar)
                    : await this.personaRepository.save(personaActualizar);
                if (personaGuardada){
                    this.personaGateway.enviarActualizacionPersona(personaGuardada);
                }
                return personaGuardada;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar actualizar la persona con id ${id}`);
        }
    }

    async eliminarPersona(id: number): Promise<Boolean> {
        try {
            const personaEliminar: Persona = await this.getPersonaById(id);
            if (personaEliminar) {
                await this.personaRepository.remove(personaEliminar);
                return true;
            }
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar eliminar la persona con id ${id}`);
        }
    }

    async softEliminarPersona(id: number): Promise<Boolean> {
        const personaExists: Persona = await this.getPersonaById(id);
        if (personaExists.deleted) {
            throw new ConflictException('La persona ya fue borrada con anterioridad');
        }
        const rows: UpdateResult = await this.personaRepository.update({ idPersona: id }, { deleted: true });
        return rows.affected == 1;
    }

    async softReactivarPersona(id: number): Promise<Boolean> {
        const personaExists: Persona = await this.getPersonaById(id);
        if (!personaExists.deleted) {
            throw new ConflictException('La persona ya fue activada con anterioridad');
        }
        const rows: UpdateResult = await this.personaRepository.update({ idPersona: id }, { deleted: false });
        return rows.affected == 1;
    }

    async corroborarPersonasArray(datos:DtoArrayPersona):Promise<Persona[]>{
        try {
            const profesores:Persona[] = await this.personaRepository.findBy({
                idPersona: In(datos.profesores.map(p=>p.idPersona))                
            });
            const todasEstanPresentes = profesores.length === datos.profesores.length;
            if (todasEstanPresentes) return profesores
            throw new NotFoundException('No se encontraron los profesores proporcionadas.');
        } catch (error) {
            throw this.handleExceptions(error, `Error al corroborar los profesores`);
        }
    }

    private async corrobararPersona(datos: DtoPersona, queryRunner?:QueryRunner): Promise<Persona | null> {
        console.log('metodo: corrobararPersona()');    
        if (!datos.celular  && !datos.email){
            throw new NotFoundException("El cliente no tiene celular ni email");
        }
        try {
            const personaPorCelular:Persona =  datos.celular ? await this.getPersonaByData({ celular: datos.celular }, queryRunner) : null;
            if (personaPorCelular) return personaPorCelular;
            
            const personaPorEmail:Persona = datos.email ? await this.getPersonaByData({ email: datos.email }, queryRunner) : null;
            if (personaPorEmail) return personaPorEmail;
            
            return null;
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar verificar la persona`);
        }
    }

    async corroboracionCliente(cliente:DtoPersona, queryRunner?:QueryRunner): Promise <Persona>{  
        console.log('metodo: corroboracionCliente()');      
        try {
            const clienteExiste:Persona = await this.corrobararPersona(cliente, queryRunner);
            if (clienteExiste) return clienteExiste;
            const nuevoCliente:Persona = await this.crearPersona(cliente, queryRunner);
            if (nuevoCliente) return nuevoCliente;
            throw new NotFoundException(`No se encontró ni se pudo crear el cliente`);
        } catch (error) {
            throw this.handleExceptions(error, `Error al intentar crear el pedido del libro`);
        }
    }
    
    async enviarPersona(idPersona:number){
        const persona:Persona = await this.getPersonaById(idPersona);
        this.personaGateway.enviarActualizacionPersona(persona);
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


