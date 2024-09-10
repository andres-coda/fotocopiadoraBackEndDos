import { IsEmail, IsString } from "class-validator";

export class DtoUsuario{
    @IsEmail()
    email:string;

    @IsString()
    password:string;
}