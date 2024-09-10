import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";
import { Especificaciones } from "src/especificaciones/entidad/Especificaciones.entity";
import { Libro } from "src/libro/entidad/libro.entity";
import { Pedido } from "src/pedido/entidad/Pedido.entity";
import { Persona } from "src/persona/entidad/Persona.entity";
import { Usuario } from "src/usuario/entidad/Usuario.entity";
import { LibroPedido } from "../entidad/LibroPedido.entity";

export class DtoPedidoCompleto{

    @IsNotEmpty()
    @ValidateNested({each:true})
    @Type(()=>LibroPedido)
    librosPedido:LibroPedido[];

    @IsNotEmpty()
    @Type(()=>Pedido)
    pedido:Pedido

    @IsNotEmpty()
    @Type(()=>Persona)
    cliente:Persona;
    
}