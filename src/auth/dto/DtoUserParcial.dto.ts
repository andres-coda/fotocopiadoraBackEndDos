import { IsEmail, IsNumber, IsString } from "class-validator";
import { Role } from "../rol/rol.enum";

export class DtoUserParcial{
    @IsNumber()
    sub:number;
    
    @IsEmail()
    @IsString()
    email:string;

    role:Role;
}