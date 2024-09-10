import { Type } from "class-transformer";
import { IsDate, isDate, IsEmpty, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { EstadoPedido } from "src/estado-pedido/entidad/EstadoPedido.entity";
import { Persona } from "src/persona/entidad/Persona.entity";

export class DtoPedido{
    @IsNotEmpty()
    @IsDate()
    fechaEntrega: Date;

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
}