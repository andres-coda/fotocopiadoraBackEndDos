import { Curso } from "src/curso/entidad/curso.entity";
import { Libro } from "src/libro/entidad/libro.entity";
import { Materia } from "src/materia/entidad/materia.entity";
import { Persona } from "src/persona/entidad/persona.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('profe-materia')
export class ProfeMateria {
    @PrimaryGeneratedColumn()
    idProfeMateria:number;

    @ManyToOne(() => Persona, persona=> persona.profeMaterias)
    profesor: Persona;

    @ManyToOne(() => Materia, materia => materia.profeMaterias)
    materia: Materia;

    @ManyToMany(()=> Libro, libro => libro.profeMaterias)
    @JoinTable({
        name: 'curso_profesor_libro',
        joinColumn:{
            name: 'profeMateriaId',
            referencedColumnName: 'idProfeMateria'
        },
        inverseJoinColumn: {
            name: 'libroId',
            referencedColumnName: 'idLibro'
        }
    })
    libros: Libro[];

    @ManyToOne(() => Curso, curso => curso.profeMaterias)
    curso: Curso;
 
    @Column({ type: 'boolean', nullable: false, default: false })
    deleted?: boolean;

    constructor(profesor:Persona, materia:Materia){
        this.profesor=profesor;
        this.materia=materia;
    }
}