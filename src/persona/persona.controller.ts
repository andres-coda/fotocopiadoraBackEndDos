import { Controller, Get, Post, Put, Patch, Param, Body, Delete, HttpCode, HttpStatus, ParseIntPipe, UseGuards, NotFoundException } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { Persona } from './entidad/persona.entity';
import { DtoPersona } from './dto/personaDto.dto';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { NotFoundError } from 'rxjs';

@Controller('persona')
export class PersonaController {
    constructor(private readonly personaService: PersonaService) { }
  
    @Get()
    @HttpCode(200)
    async getPersonas(): Promise<Persona[]> {
      return await this.personaService.getPersonasCompleto();
    }
  
    @Get(':id')
    @HttpCode(200)
    async getPersonaById(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Persona> {
      const persona: Persona = await this.personaService.getPersonaById(id);
      if (!persona) throw new NotFoundException('No se encontro ninguna persona con el id '+id);
      return persona;
    }
  
    @Post()
    @UseGuards(AdminGuard)
    async crearPersona(@Body() datos: DtoPersona): Promise<Persona> {
      return await this.personaService.corroboracionCliente(datos);
    }
  
    @Put(':id')
    @UseGuards(AdminGuard)
    async actualizarPersona(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Body() datos: DtoPersona): Promise<Persona> {
      return await this.personaService.actualizarPersona(id, datos);
    }
  
    @Delete(':id')
    @UseGuards(AdminGuard)
    async eliminarPersona(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
      return await this.personaService.eliminarPersona(id);
    }
  
    @Patch(':id')
    @UseGuards(AdminGuard)
    async reactivarPersona(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
      return await this.personaService.softReactivarPersona(id);
    }
  }
  
