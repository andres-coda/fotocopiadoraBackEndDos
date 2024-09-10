import { Libro } from "src/libro/entidad/libro.entity";
import { ProfeMateria } from "src/profe-materia/entidad/profeMateria.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('materia')
export class Materia {
    @PrimaryGeneratedColumn()
    idMateria:number;

    @Column({ length: 100})
    nombre:string;

    @OneToMany(()=>Libro, libro=> libro.materia)
    libros:Libro[]
    
    @Column({ type: 'boolean', nullable: false, default: false })
    deleted?: boolean;

    @OneToMany(() => ProfeMateria, profeMateria => profeMateria.materia)
    profeMaterias: ProfeMateria[];

    constructor(nombre:string) {
        this.nombre=nombre;
    }
}