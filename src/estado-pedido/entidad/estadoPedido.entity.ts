import { LibroPedido } from "src/libro-pedido/entidad/libroPedido.entity";
import { Stock } from "src/stock/entidad/stock.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('estado-pedido')
export class EstadoPedido{
  @PrimaryGeneratedColumn()
  idEstadoPedido: number;

  @Column({ length: 50})
  estado: string;

  @OneToMany(()=> Stock, stock=> stock.estado)
  stock:Stock[];

  @OneToMany(()=> LibroPedido, libroPedido=> libroPedido.pedido)
  libroPedido:LibroPedido[]

  @Column({ type: 'boolean', nullable: false, default: false })
  deleted?: boolean;

  constructor( estado:string ){
    this.estado=estado;
  }
}