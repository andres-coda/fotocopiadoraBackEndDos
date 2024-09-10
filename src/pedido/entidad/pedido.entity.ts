import { LibroPedido } from "src/libro-pedido/entidad/libroPedido.entity";
import { Persona } from "src/persona/entidad/persona.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('pedido')
export class Pedido{
    @PrimaryGeneratedColumn()
    idPedido:number;

    @Column()
    fechaTomado: Date;

    @Column()
    fechaEntrega: Date;

    @Column()
    importeTotal:number;

    @Column({nullable:true})
    archivos:number;

    @Column({nullable:true})
    anillados:number

    @Column()
    sena: number;

    @ManyToOne(()=> Persona, cliente=> cliente.pedidos)
    cliente: Persona;

    @OneToMany(()=> LibroPedido, libroPedido=> libroPedido.pedido)
    librosPedidos:LibroPedido[];
    
    @Column({ type: 'boolean', nullable: false, default: false })
    deleted?: boolean;

    constructor(fechaT: Date, fechaE: Date, importe: number, sena: number, cliente: Persona, archivos: number = 0, anillados: number = 0) {
        this.fechaTomado = fechaT;
        this.fechaEntrega = fechaE;
        this.importeTotal = importe;
        this.sena = sena;
        this.cliente = cliente;
        this.archivos = archivos ?? 0;
        this.anillados = anillados ?? 0;
    }
    
}