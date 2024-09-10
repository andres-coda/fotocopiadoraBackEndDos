import { Escuela } from "src/escuela/entidad/escuela.entity";
import { ProfeMateria } from "src/profe-materia/entidad/profeMateria.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('curso')
export class Curso {
    @PrimaryGeneratedColumn()
    idCurso:number;

    @Column()
    anio:number;

    @Column()
    grado:string

    @ManyToOne(() => Escuela, escuela => escuela.cursos)
    escuela: Escuela;

    @OneToMany(() => ProfeMateria, profeMateria => profeMateria.curso)
    profeMaterias: ProfeMateria[];
    
    @Column({ type: 'boolean', nullable: false, default: false })
    deleted?: boolean;

    constructor(anio:number, grado:string, escuela:Escuela){
        this.anio=anio;
        this.grado=grado;
        this.escuela=escuela;
    }

}