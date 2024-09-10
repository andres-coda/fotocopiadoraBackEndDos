import { Role } from "src/auth/rol/rol.enum";
import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('usuario')
@Unique(['email'])
export class Usuario{
    @PrimaryGeneratedColumn()
    idUsuario:number;

    @Column()
    email:string;

    @Column()
    password:string;

    @Column({ type: 'enum', enum: Role, default: Role.User })
    role:string;

    constructor(email:string, password:string, role:Role){
        this.email=email;
        this.password=password;
        this.role=role;
    }
}