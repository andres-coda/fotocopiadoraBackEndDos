import { Type } from "class-transformer";
import { isEmpty, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";
import { Especificaciones } from "src/especificaciones/entidad/Especificaciones.entity";
import { EstadoPedido } from "src/estado-pedido/entidad/EstadoPedido.entity";
import { Libro } from "src/libro/entidad/libro.entity";
import { Pedido } from "src/pedido/entidad/Pedido.entity";
import { isWeakMap } from "util/types";

export class DtoLibroPedido {
    @IsNotEmpty()
    @IsString()
    extras:string;

    @IsNotEmpty()
    @IsNumber()
    cantidad:number;

    @IsNotEmpty()
    @ValidateNested({each:true})
    @Type(()=>Especificaciones)
    especificaciones:Especificaciones[]

    @IsNotEmpty()
    @Type(()=>Libro)
    libro:Libro

    @IsNotEmpty()
    @Type(()=>Pedido)
    pedido:Pedido

    @Type(()=>EstadoPedido)
    estadoPedido?:EstadoPedido

}