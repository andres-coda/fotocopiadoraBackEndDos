import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { EscuelaService } from './escuela.service';
import { Escuela } from './entidad/escuela.entity';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { DtoEscuela } from './dto/DtoEscuela.dto';

@Controller('escuela')
export class EscuelaController {
    constructor(private readonly escuelaService: EscuelaService) {}

    @Get()
    @HttpCode(200)
    async getEscuelas(): Promise<Escuela[]> {
        return await this.escuelaService.getEscuelas();
    }

    @Get(':id')
    @HttpCode(200)
    async getEscuelaById(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Escuela> {
        return await this.escuelaService.getEscuelaById(id);
    }

    @Post()
    @UseGuards(AdminGuard)
    async crearEscuela(@Body() datos: DtoEscuela): Promise<Escuela> {
        return await this.escuelaService.crearEscuela(datos);
    }

    @Put(':id')
    @UseGuards(AdminGuard)
    async actualizarEscuela(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Body() datos: DtoEscuela): Promise<Escuela> {
        return await this.escuelaService.actualizarEscuela(id, datos);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    async eliminarEscuela(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
        return await this.escuelaService.eliminarEscuela(id);
    }

    @Patch(':id')
    @UseGuards(AdminGuard)
    async reactivarEscuela(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
        return await this.escuelaService.softReactivarEscuela(id);
    }
}

