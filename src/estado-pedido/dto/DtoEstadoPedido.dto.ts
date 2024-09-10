import { IsNotEmpty, IsString } from "class-validator";

export class DtoEstadoPedido{
    @IsNotEmpty()
    @IsString()
    estado:string;
}