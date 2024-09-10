import { Controller, Patch, Get, Body, Param, UseGuards, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { GestionEstadosService } from './gestion-estados.service';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { Pedido } from 'src/pedido/entidad/pedido.entity';
import { Stock } from 'src/stock/entidad/stock.entity';
import { DtoPedidoEstado } from 'src/pedido/dto/DtoPedidoEstado';

@Controller('gestion-estados')
export class GestionEstadosController {
    constructor(private readonly gestionEstadoService:GestionEstadosService){}

    @Patch('/pedido/:id') 
    @HttpCode(200)
    @UseGuards(AdminGuard)
    async cambiarEstadoPedido(@Param('id', new ParseIntPipe({ 
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
        @Body() dtoPedido:DtoPedidoEstado
    ):Promise<Pedido>{      
        return await this.gestionEstadoService.EstadoPedidoModificar(dtoPedido,id);
    }
    
  @Get('/sincronizar/stock')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  async sincronizarStock():Promise<Stock[]>{
    return await this.gestionEstadoService.sincronizarStock();
  }
}

