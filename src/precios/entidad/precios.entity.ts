import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('precios')
export class Precios {
    @PrimaryGeneratedColumn()
    idPrecios: number;

    @Column()
    tipo: string;

    @Column()
    importe: number;
     
    @Column({ type: 'boolean', nullable: false, default: false })
    deleted?: boolean;

    constructor(tipo:string, importe:number){
        this.importe=importe;
        this.tipo=tipo;
    }

}