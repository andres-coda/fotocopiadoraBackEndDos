import { Type } from "class-transformer";
import { IsDate, isDate, IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { EstadoPedido } from "src/estado-pedido/entidad/EstadoPedido.entity";
import { LibroPedido } from "src/libro-pedido/entidad/LibroPedido.entity";
import { Persona } from "src/persona/entidad/Persona.entity";

export class DtoPedidoReturn{
    @IsEmpty()
    @IsNumber()
    idPedido:number;

    @IsNotEmpty()
    @IsDate()
    fechaEntrega: Date;

    @IsNotEmpty()
    @IsDate()
    fechaTomado: Date;

    @IsNotEmpty()
    @IsNumber()
    importeTotal: number;

    @IsNotEmpty()
    @IsNumber()
    sena: number;

    @IsNotEmpty()
    @IsNumber()
    anillados: number;

    @IsNotEmpty()
    @IsNumber()
    archivos: number;

    @IsNotEmpty()
    @Type(() => Persona)
    @IsString()
    cliente:Persona;

    @IsNotEmpty()
    @ValidateNested({each:true})
    @Type(()=>LibroPedido)
    librosPedidos:LibroPedido[];


    @IsOptional()
    @Type(()=> EstadoPedido)
    estado:EstadoPedido | null;
}