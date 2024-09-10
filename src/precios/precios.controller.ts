import { Controller, Get, Post, Put, Patch, Delete, Param, Body, HttpCode, HttpStatus, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PreciosService } from './precios.service';
import { Precios } from './entidad/precios.entity';
import { DtoPrecios } from './dto/DtoPrecios.dto';
import { AdminGuard } from 'src/auth/guard/admin.guard';

@Controller('precios')
export class PreciosController {  
    constructor(private readonly preciosService: PreciosService) {}

@Get()
@HttpCode(200)
async getPrecioss(): Promise<Precios[]> {
    return await this.preciosService.getPrecios();
}

@Get(':id')
@HttpCode(200)
async getPreciosById(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Precios> {
    return await this.preciosService.getPreciosById(id);
}

@Post()
@UseGuards(AdminGuard)
async crearPrecios(@Body() datos: DtoPrecios): Promise<Precios> {
    return await this.preciosService.crearPrecio(datos);
}

@Put(':id')
@UseGuards(AdminGuard)
async actualizarPrecios(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Body() datos: DtoPrecios): Promise<Precios> {
    return await this.preciosService.actualizarPrecio(id, datos);
}

@Delete(':id')
@UseGuards(AdminGuard)
async eliminarPrecios(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
    return await this.preciosService.eliminarPrecio(id);
}

@Patch(':id')
@UseGuards(AdminGuard)
async reactivarPrecios(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
    return await this.preciosService.softReactivarPrecio(id);
}
}
