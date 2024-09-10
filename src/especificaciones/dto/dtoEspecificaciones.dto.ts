import { IsEmpty, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class DtoEspecificaciones {
    @IsEmpty()
    @IsNumber()
    idEspecificaciones:number;
    
    @IsNotEmpty()
    @IsString()
    nombre: string;
}