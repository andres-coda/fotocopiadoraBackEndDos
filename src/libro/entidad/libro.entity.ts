import { LibroPedido } from "src/libro-pedido/entidad/libroPedido.entity";
import { Materia } from "src/materia/entidad/materia.entity";
import { ProfeMateria } from "src/profe-materia/entidad/profeMateria.entity";
import { Stock } from "src/stock/entidad/stock.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('libro')
export class Libro{
    @PrimaryGeneratedColumn()
    public idLibro: number;

    @Column({length:255})
    nombre: string;

    @Column()
    descripcion: string;

    @Column({ length: 50 })
    edicion: string;

    @Column()
    cantidadPg:number;

    @OneToMany(()=> Stock, stock=> stock.libro)
    stock: Stock[];

    @Column()
    img: string;

    @ManyToOne(()=>Materia, materia=> materia.libros)
    materia:Materia;

    @OneToMany(() => LibroPedido, libroPedido => libroPedido.libro)
    librosPedidos: LibroPedido[];

    @ManyToMany(() => ProfeMateria, profeMateria => profeMateria.libros)
    @JoinTable({
        name: 'libro_profesor_materia', 
        joinColumn: {
            name: 'libroId',
            referencedColumnName: 'idLibro'
        },
        inverseJoinColumn: {
            name: 'profeMateriaId',
            referencedColumnName: 'idProfeMateria'
        }
    })
    profeMaterias: ProfeMateria[];

    @Column({ type: 'boolean', nullable: false, default: false })
    deleted?: boolean;

    @Column({nullable:true})
    autor:string;

    constructor(nombre:string, descripcion:string, edicion:string, img:string, pg:number, autor:string, materia:Materia) {
        this.nombre=nombre;
        this.descripcion=descripcion;
        this.edicion=edicion;
        this.img=img;
        this.cantidadPg=pg;
        this.autor = autor;
        this.materia=materia;
    }
}
