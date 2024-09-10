import { Controller, Get, Post, Put, Patch, Delete, HttpCode, UseGuards, Param, Body, ParseIntPipe, HttpStatus } from '@nestjs/common';
import { MateriaService } from './materia.service';
import { Materia } from './entidad/materia.entity';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { DtoMateria } from './dto/DtoMateria.dto';

@Controller('materia')
export class MateriaController {
    constructor(private readonly materiaService: MateriaService) {}

    @Get()
    @HttpCode(200)
    async getMaterias(): Promise<Materia[]> {
        return await this.materiaService.getMaterias();
    }

    @Get(':id')
    @HttpCode(200)
    async getMateriaById(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Materia> {
        return await this.materiaService.getMateriaById(id);
    }

    @Post()
    @UseGuards(AdminGuard)
    async crearMateria(@Body() datos: DtoMateria): Promise<Materia> {
        return await this.materiaService.getMateriaByCriterio(datos);
    }

    @Put(':id')
    @UseGuards(AdminGuard)
    async actualizarMateria(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Body() datos: DtoMateria): Promise<Materia> {
        return await this.materiaService.actualizarMateria(id, datos);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    async eliminarMateria(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
        return await this.materiaService.eliminarMateria(id);
    }

    @Patch(':id')
    @UseGuards(AdminGuard)
    async reactivarMateria(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
        return await this.materiaService.softReactivarMateria(id);
    }
}
