import { Curso } from "src/curso/entidad/curso.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('escuela')
export class Escuela {
    @PrimaryGeneratedColumn()
    idEscuela: number;

    @Column({length: 255})
    nombre: string;

    @Column()
    direccion: string;

    @Column()
    numero: string;

    @Column()
    email:string;

    @OneToMany(()=> Curso, curso => curso.escuela)
    cursos: Curso[];
    
    @Column({ type: 'boolean', nullable: false, default: false })
    deleted?: boolean;

    constructor(nombre:string, direccion:string, numero:string, email:string){
        this.nombre=nombre;
        this.direccion=direccion;
        this.numero=numero;
        this.email=email;
    }
}