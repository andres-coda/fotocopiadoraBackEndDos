import { IsNotEmpty } from "class-validator";
import { EstadoPedido } from "src/estado-pedido/entidad/EstadoPedido.entity";

export class DtoAgregarEstadoPedido {
    @IsNotEmpty()
    estadoPedido:EstadoPedido;
}