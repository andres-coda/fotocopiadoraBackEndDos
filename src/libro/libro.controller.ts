import { Controller, Get, Post, Put, Patch, HttpCode, Param, Body, ParseIntPipe, UseGuards, HttpStatus, Delete } from '@nestjs/common';
import { LibroService } from './libro.service';
import { Libro } from './entidad/libro.entity';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { DtoLibro } from './dto/dtoLibro.dto';

@Controller('libro')
export class LibroController {
    constructor(private readonly libroService: LibroService) {}

    @Get()
    @HttpCode(200)
    async getLibros(): Promise<Libro[]> {
        return await this.libroService.getLibros();
    }

    @Get(':id')
    @HttpCode(200)
    async getLibroById(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Libro> {
        return await this.libroService.getLibroById(id);
    }

    @Post()
    @UseGuards(AdminGuard)
    async crearLibro(@Body() datos: DtoLibro): Promise<Libro> {
        return await this.libroService.corroborarLibroIndividual(datos);
    }

    @Put(':id')
    @UseGuards(AdminGuard)
    async actualizarLibro(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Body() datos: DtoLibro): Promise<Libro> {
        return await this.libroService.actualizarLibro(id, datos);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    async eliminarLibro(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
        return await this.libroService.eliminarLibro(id);
    }

    @Patch(':id')
    @UseGuards(AdminGuard)
    async reactivarLibro(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
        return await this.libroService.softReactivarLibro(id);
    }
}

