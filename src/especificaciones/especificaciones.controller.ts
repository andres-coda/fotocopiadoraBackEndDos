import { Controller, Get, Post, Patch, Put, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, UseGuards, Body } from '@nestjs/common';
import { EspecificacionesService } from './especificaciones.service';
import { Especificaciones } from './entidad/especificaciones.entity';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { DtoEspecificaciones } from './dto/dtoEspecificaciones.dto';

@Controller('especificaciones')
export class EspecificacionesController {
    constructor(private readonly especificacionesService: EspecificacionesService) {}

    @Get()
    @HttpCode(200)
    async getEspecificaciones(): Promise<Especificaciones[]> {
        return await this.especificacionesService.getEspecificaciones();
    }

    @Get(':id')
    @HttpCode(200)
    async getEspecificacionById(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Especificaciones> {
        return await this.especificacionesService.getEspecificacionById(id);
    }

    @Post()
    @UseGuards(AdminGuard)
    async crearEspecificacion(@Body() datos: DtoEspecificaciones): Promise<Especificaciones> {
        return await this.especificacionesService.crearEspecificacion(datos);
    }

    @Put(':id')
    @UseGuards(AdminGuard)
    async actualizarEspecificacion(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Body() datos: DtoEspecificaciones): Promise<Especificaciones> {
        return await this.especificacionesService.actualizarEspecificacion(id, datos);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    async eliminarEspecificacion(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
        return await this.especificacionesService.eliminarEspecificacion(id);
    }

    @Patch(':id')
    @UseGuards(AdminGuard)
    async reactivarEspecificacion(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
        return await this.especificacionesService.softReactivarEspecificacion(id);
    }
}
