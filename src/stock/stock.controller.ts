import { Controller, Get, Put, Post, Patch, Delete, ParseIntPipe, UseGuards, HttpCode, HttpStatus, Param, Body } from '@nestjs/common';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { StockService } from './stock.service';
import { DtoLibroEstado } from './dto/DtoLibroEstado.dto';
import { Stock } from './entidad/stock.entity';
import { DtoStock } from './dto/DtoStock.sto';

@Controller('stock')
export class StockController {
    constructor(private readonly stockService: StockService) {}
    @Get('/prueba')
    async getStockPrueba(@Body() datos:DtoLibroEstado):Promise<Stock | null> {
        return await this.stockService.getStockByLibroEstado( datos);
    }
    @Get()
    @HttpCode(200)
    @UseGuards(AdminGuard)
    async getStocks(): Promise<Stock[]> {
        return await this.stockService.getStock();
    }

    @Get(':id')
    @UseGuards(AdminGuard)
    @HttpCode(200)
    async getStockById(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Stock> {
        return await this.stockService.getStockById(id);
    }

    @Post()
    @UseGuards(AdminGuard)
    async crearStock(@Body() datos: DtoStock): Promise<Stock> {
        return await this.stockService.crearStock(datos);
    }

    @Put(':id')
    @UseGuards(AdminGuard)
    async actualizarStock(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Body() datos: DtoStock): Promise<Stock> {
        return await this.stockService.actualizarStock(id, datos);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    async eliminarStock(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
        return await this.stockService.eliminarStock(id);
    }

    @Patch(':id')
    @UseGuards(AdminGuard)
    async reactivarStock(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
        return await this.stockService.softReactivarStock(id);
    }
}
