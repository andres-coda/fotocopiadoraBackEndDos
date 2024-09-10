import { Especificaciones } from "src/especificaciones/entidad/especificaciones.entity";
import { EstadoPedido } from "src/estado-pedido/entidad/estadoPedido.entity";
import { Libro } from "src/libro/entidad/libro.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('stock')
export class Stock {
    @PrimaryGeneratedColumn()
    idStock: number;

    @Column()
    cantidad: number;

    @ManyToOne(() => EstadoPedido, estadoPedido => estadoPedido.stock)
    estado: EstadoPedido;

    @ManyToOne(() => Libro, libro => libro.stock)
    libro: Libro;

    @ManyToMany(() => Especificaciones, esp => esp.stock)
    @JoinTable({ name: 'stock-especificaciones' })
    especificaciones: Especificaciones[];

    @Column({ type: 'boolean', nullable: false, default: false })
    deleted?: boolean;


    constructor(cantidad: number, estado: EstadoPedido, libro: Libro, especificaciones: Especificaciones[]) {
        this.cantidad = cantidad;
        this.estado = estado;
        this.libro = libro;
        this.especificaciones = especificaciones;
    }
}
