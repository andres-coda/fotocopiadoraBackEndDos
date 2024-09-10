import { IsEmpty, IsNotEmpty, IsNumber, IsString, Matches } from "class-validator";

export class DtoEscuela {
    @IsEmpty()
    @IsNumber()
    idEscuela:number;
    
    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsNotEmpty()
    @IsString()
    direccion: string;

    @IsNotEmpty()
    @Matches(/^\d+$/, { message: 'El celular debe contener solo números' })
    @IsString()
    numero: string;

    @IsString()
    email:string;
}