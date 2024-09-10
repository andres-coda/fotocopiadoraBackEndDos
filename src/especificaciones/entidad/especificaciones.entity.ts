import { LibroPedido } from "src/libro-pedido/entidad/libroPedido.entity";
import { Stock } from "src/stock/entidad/stock.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('especificaciones')
export class Especificaciones {
    @PrimaryGeneratedColumn()
    idEspecificaciones: number;

    @Column()
    nombre: string;

    @ManyToMany(()=> LibroPedido, (libroP) => libroP.especificaciones)
    librosPedidos: LibroPedido[];

    @Column({ type: 'boolean', nullable: false, default: false })
    deleted?: boolean;

    @ManyToMany(()=> Stock, stock=> stock.especificaciones)
    stock:Stock[];


    constructor( nombre: string ) {
        this.nombre= nombre;
    }
}