import { Controller, Get, Put, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, ParseIntPipe, HttpStatus } from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { Pedido } from './entidad/pedido.entity';
import { DtoPedido } from './dto/DtoPedido.dto';

@Controller('pedido')
export class PedidoController {
    constructor(private readonly pedidoService: PedidoService) {}

    @Get()
    @UseGuards(AdminGuard)
    @HttpCode(200)
    async getPedidos(): Promise<Pedido[]> {
        return await this.pedidoService.getPedidos();
    }

    @Get(':id')
    @UseGuards(AdminGuard)
    @HttpCode(200)
    async getPedidoById(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Pedido> {
        return await this.pedidoService.getPedidoById(id);
    }

    @Post()
    @UseGuards(AdminGuard)
    async crearPedido(@Body() datos: DtoPedido): Promise<Pedido> {
        return await this.pedidoService.crearPedido(datos);
    }

    @Put(':id')
    @UseGuards(AdminGuard)
    async actualizarPedido(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Body() datos: DtoPedido): Promise<Pedido> {
        return await this.pedidoService.actualizarPedido(id, datos);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    async eliminarPedido(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
        return await this.pedidoService.eliminarPedido(id);
    }

    @Patch(':id')
    @UseGuards(AdminGuard)
    async reactivarPedido(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
        return await this.pedidoService.softReactivarPedido(id);
    }
}
