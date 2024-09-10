import { Controller, Get, Post, Put, Patch, Delete, HttpCode, HttpStatus, UseGuards, ParseIntPipe, Param, Body } from '@nestjs/common';
import { ProfeMateria } from './entidad/profeMateria.entity';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { DtoProfeMateria } from './dto/DtoProfeMateria.dto';
import { ProfeMateriaService } from './profe-materia.service';
import { DtoLibro } from 'src/libro/dto/dtoLibro.dto';

@Controller('profe-materia')
export class ProfeMateriaController {
    constructor(private readonly profeMateriaService: ProfeMateriaService) { }
  
    @Get()
    @HttpCode(200)
    async getProfeMateria(): Promise<ProfeMateria[]> {
      return await this.profeMateriaService.getProfeMateria();
    }
  
    @Get(':id')
    @HttpCode(200)
    async getProfeMateriaById(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<ProfeMateria> {
      return await this.profeMateriaService.getProfeMateriaById(id);
    }
  
    @Post()
    @UseGuards(AdminGuard)
    async crearProfeMateria(@Body() datos: DtoProfeMateria): Promise<ProfeMateria> {
      return await this.profeMateriaService.crearProfeMateriaCompleto(datos);
    }
  
    @Put(':id')
    @UseGuards(AdminGuard)
    async actualizarProfeMateria(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Body() datos: DtoProfeMateria): Promise<ProfeMateria> {
      return await this.profeMateriaService.actualizarProfeMateria(id, datos);
    }
  
    @Delete(':id')
    @UseGuards(AdminGuard)
    async eliminarProfeMateria(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
      return await this.profeMateriaService.eliminarProfeMateria(id);
    }
  
    @Patch(':id')
    @UseGuards(AdminGuard)
    async reactivarProfeMateria(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
      return await this.profeMateriaService.softReactivarProfeMateria(id);
    }
  
    @Get(':id/profeMateria-subtract-libro/:idLibro')
      @UseGuards(AdminGuard)
      async quitarLibroDeProfeMateria(@Param('id', new ParseIntPipe({
          errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE
      })) id: number, 
      @Param('idLibro', new ParseIntPipe({
        errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE
    })) idLibro:number ) : Promise <ProfeMateria> {
          return await this.profeMateriaService.quitarLibroProfeMateria(id,idLibro);
      }
  
      @Patch(':id/profeMateria-add-libro')
      @UseGuards(AdminGuard)
      async agregarLibroAProfeMateria(@Param('id', new ParseIntPipe({
          errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE
      })) id: number, @Body() dtoLibro:DtoLibro ) : Promise <ProfeMateria> {
          return await this.profeMateriaService.agregarLibroProfeMateria(id,dtoLibro);
      }
  
  }
  
