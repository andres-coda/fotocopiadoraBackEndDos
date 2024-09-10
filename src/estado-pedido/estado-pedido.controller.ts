import { Controller, Get, Post, Put, Patch, Delete, HttpCode, HttpStatus, ParseIntPipe, Body, Param, UseGuards } from '@nestjs/common';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { DtoEstadoPedido } from './dto/DtoEstadoPedido.dto';
import { EstadoPedido } from './entidad/estadoPedido.entity';
import { EstadoPedidoService } from './estado-pedido.service';

@Controller('estado-pedido')
export class EstadoPedidoController {
    constructor(private readonly estadoPedidoService: EstadoPedidoService) {}

    @Get()
    @HttpCode(200)
    async getEstadoPedidos(): Promise<EstadoPedido[]> {
        return await this.estadoPedidoService.getEstadoPedidos();
    }

    @Get(':id')
    @HttpCode(200)
    async getEstadoPedidoById(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<EstadoPedido> {
        return await this.estadoPedidoService.getEstadoPedidoById(id);
    }

    @Post()
    @UseGuards(AdminGuard)
    async crearEstadoPedido(@Body() datos: DtoEstadoPedido): Promise<EstadoPedido> {
        return await this.estadoPedidoService.crearEstadoPedido(datos);
    }

    @Put(':id')
    @UseGuards(AdminGuard)
    async actualizarEstadoPedido(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Body() datos: DtoEstadoPedido): Promise<EstadoPedido> {
        return await this.estadoPedidoService.actualizarEstadoPedido(id, datos);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    async eliminarEstadoPedido(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
        return await this.estadoPedidoService.eliminarEstadoPedido(id);
    }

    @Patch(':id')
    @UseGuards(AdminGuard)
    async reactivarEstadoPedido(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
        return await this.estadoPedidoService.softReactivarEstadoPedido(id);
    }
}
