import { IsEmail, IsNumber, IsString, Matches } from "class-validator";

export class DtoPersona{

    @IsString()
    nombre:string;

    @IsString()
    @Matches(/^\d+$/, { message: 'El celular debe contener solo números' })
    celular:string;

    @IsEmail()
    email:string;
}