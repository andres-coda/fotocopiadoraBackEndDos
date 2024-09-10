import { Transform, Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from "class-validator";
import { Especificaciones } from "src/especificaciones/entidad/Especificaciones.entity";
import { EstadoPedido } from "src/estado-pedido/entidad/EstadoPedido.entity";
import { Libro } from "src/libro/entidad/libro.entity";

export class DtoStock {
    @IsNotEmpty()
    @IsNumber()
    cantidad: number;

    @IsNotEmpty()
    @Type(()=>EstadoPedido)
    estado: EstadoPedido;

    @IsNotEmpty()
    @Type(()=> Libro)
    libro: Libro;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({each:true})
    @Type(()=>Especificaciones)
    @Transform(({ value }) => value.map((id: number) => ({ id })), { toClassOnly: true })
    especificaciones: Especificaciones[]
}