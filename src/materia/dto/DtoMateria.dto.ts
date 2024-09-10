import { IsEmpty, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class DtoMateria {
    @IsEmpty()
    @IsNumber()
    idMateria:number;
    
    @IsNotEmpty()
    @IsString()
    nombre: string;
}