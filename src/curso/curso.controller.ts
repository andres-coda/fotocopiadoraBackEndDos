import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { CursoService } from './curso.service';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { Curso } from './entidad/curso.entity';
import { DtoCurso } from './dto/DtoCurso.dto';
import { ProfeMateria } from 'src/profe-materia/entidad/profeMateria.entity';
import { DtoProfeMateria } from 'src/profe-materia/dto/DtoProfeMateria.dto';

@Controller('curso')
export class CursoController {
    constructor(private readonly cursoService:CursoService) {}

    @Get()
    @UseGuards(AdminGuard)
    @HttpCode(200)
    async getCursos(): Promise<Curso[]> {
        return await this.cursoService.getCursos();
    }

    @Get(':id')
    @UseGuards(AdminGuard)
    @HttpCode(200)
    async getCursoById(@Param('id', new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE
    })) id: number): Promise<Curso> {
        return await this.cursoService.getCursoById(id);
    }

    @Post()
    @UseGuards(AdminGuard)
    async crearCurso(@Body() datos: DtoCurso): Promise<Curso> {
        return await this.cursoService.crearCurso(datos);
    }

    @Post('/profeMateria-add')
    @UseGuards(AdminGuard)
    async agregarProfeMateria(@Body() datos: DtoProfeMateria) : Promise <Curso> {        
        return await this.cursoService.cargarCursoCompleto(datos);
    }

    @Put(':id')
    @UseGuards(AdminGuard)
    async actualizarCurso(@Param('id', new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE
    })) id: number, @Body() datos: DtoCurso): Promise<Curso> {
        return await this.cursoService.actualizarCurso(id, datos);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    async eliminarCurso(@Param('id', new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE
    })) id: number): Promise<Boolean> {
        return await this.cursoService.softEliminarCurso(id);        
    }

    @Patch(':id')
    @UseGuards(AdminGuard)
    async reactivarCurso(@Param('id', new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE
    })) id: number): Promise<Boolean> {
        return await this.cursoService.softReactvarCurso(id);
    }

    @Patch(':id/profeMateria-subtract')
    @UseGuards(AdminGuard)
    async quitarProfeMateria(@Param('id', new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE
    })) id: number, @Body() datos:ProfeMateria ) : Promise <Curso> {
        return await this.cursoService.quitarProfeMateria(datos,id);
    }
}

