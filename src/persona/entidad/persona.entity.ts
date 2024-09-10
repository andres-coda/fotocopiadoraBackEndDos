import { Pedido } from "src/pedido/entidad/pedido.entity";
import { ProfeMateria } from "src/profe-materia/entidad/profeMateria.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('persona')
export class Persona {
    @PrimaryGeneratedColumn()
    idPersona: number;

    @Column()
    nombre: string;

    @Column()
    celular:string;

    @Column()
    email: string;

    @OneToMany(()=> Pedido, pedido=> pedido.cliente)
    pedidos: Pedido[];
     
    @Column({ type: 'boolean', nullable: false, default: false })
    deleted?: boolean;

    @OneToMany(() => ProfeMateria, profeMateria => profeMateria.profesor)
    profeMaterias: ProfeMateria[];

    constructor(nombre:string, celular:string, email:string){
        this.nombre=nombre;
        this.celular=celular;
        this.email=email;
    }

}