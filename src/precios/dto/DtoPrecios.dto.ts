import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class DtoPrecios{
    @IsNotEmpty()
    @IsString()
    tipo:string;
    @IsNotEmpty()
    @IsNumber()
    importe:number;
}