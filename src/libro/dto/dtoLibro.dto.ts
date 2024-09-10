import { IsEmpty, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Materia } from "src/materia/entidad/Materia.entity";

export class DtoLibro {
    @IsEmpty()
    @IsNumber()
    idLibro:number;

    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsString()
    descripcion: string;

    @IsString()
    autor: string;

    @IsString()
    edicion:string;

    @IsString()
    img:string;

    @IsNotEmpty()
    @IsNumber()
    cantidadPg:number;

    materia: Materia;

}