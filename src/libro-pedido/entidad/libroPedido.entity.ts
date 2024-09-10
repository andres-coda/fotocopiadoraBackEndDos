import { Especificaciones } from "src/especificaciones/entidad/especificaciones.entity";
import { EstadoPedido } from "src/estado-pedido/entidad/estadoPedido.entity";
import { Libro } from "src/libro/entidad/libro.entity";
import { Pedido } from "src/pedido/entidad/pedido.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('libro-pedido')
export class LibroPedido{
    @PrimaryGeneratedColumn()
    idLibroPedido: number;

    @Column({ length: 255 })
    extras:string;

    @Column()
    cantidad:number;

    @ManyToOne(() => Libro, libro => libro.librosPedidos)
    libro: Libro;

    @ManyToOne(() => Pedido, pedido => pedido.librosPedidos)
    pedido: Pedido;

    @ManyToMany(()=> Especificaciones, (esp)=> esp.librosPedidos)
    @JoinTable({ name: "libro-pedido-especificaciones" })
    especificaciones: Especificaciones[];

    @ManyToOne(()=> EstadoPedido, estadoPedido=> estadoPedido.libroPedido)
    estadoPedido:EstadoPedido;

    @Column({ type: 'boolean', nullable: false, default: false })
    deleted?: boolean;

    constructor(extra:string, cantidad:number, especificaciones:Especificaciones[], libro:Libro, pedido:Pedido, estadoPedido:EstadoPedido) {
        this.extras=extra;
        this.cantidad=cantidad;
        this.especificaciones=especificaciones;
        this.libro=libro;
        this.pedido=pedido;
        this.estadoPedido=estadoPedido;
    }
}