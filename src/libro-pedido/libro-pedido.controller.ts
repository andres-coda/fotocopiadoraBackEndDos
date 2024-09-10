import { Controller, Get, Put, Param, Patch, Post, Body, HttpCode,UseGuards, Query, BadRequestException, ParseIntPipe, HttpStatus, Delete } from '@nestjs/common';
import { LibroPedidoService } from './libro-pedido.service';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { LibroPedido } from './entidad/libroPedido.entity';
import { DtoLibroPedido } from './dto/DtoLibroPedido.dto';
import { DtoAgregarEstadoPedido } from './dto/DtoAgregarEstadoPedido.dto';
import { DtoPedidoCompleto } from './dto/DtoPedidoCompleto.dto';
import { Pedido } from 'src/pedido/entidad/pedido.entity';

@Controller('libro-pedido')
export class LibroPedidoController {
    constructor(private readonly libroPedidoService: LibroPedidoService) { }
  
    @Get()
    @HttpCode(200)
    @UseGuards(AdminGuard)
    async getLibrosPedidos(
      @Query('estado') estado?: string,
      @Query('especificaciones') especificaciones?: string,
      @Query('libro') libro?: string
    ): Promise<LibroPedido[]> {
      let dtoEsp: number[] = [];
      if (especificaciones) {
        try {
          dtoEsp = JSON.parse(decodeURIComponent(especificaciones));
        } catch (error) {
          throw new BadRequestException('Error al procesar el parámetro de especificaciones.');
        }
      }
  
      if (dtoEsp.length > 0 && estado && libro) {
        return await this.libroPedidoService.getLibrosPedidosEspecificaciones(dtoEsp, estado, libro);
      }
      if (estado) return await this.libroPedidoService.getLibroPedidoEstadoPedido(estado);
      return await this.libroPedidoService.getLibrosPedidos();
    }
  
    @Get('/busqueda')
    @HttpCode(200)
    @UseGuards(AdminGuard)
    async getLibroPedidoBusqueda(
      @Query('estado') estado?: string,
      @Query('especificaciones') especificaciones?: string
    ): Promise<LibroPedido[]> {
      let dtoEsp: number[] = [];
      let dtoEstado: number[] = [];
      if(estado) {
        try{
          dtoEstado = JSON.parse(decodeURIComponent(estado));
        }catch(error) {
          throw new BadRequestException('Error al procesar el parámetro de estado.');
        }
      }
      if(especificaciones){
        try{
          dtoEsp = JSON.parse(decodeURIComponent(especificaciones));
        } catch(error) {
          throw new BadRequestException('Error al procesar el parámetro de especificaciones.');
        } 
      }
      return await this.libroPedidoService.getLibroPedidoBusqueda(dtoEsp, dtoEstado);
     
    }
    
  
    @Get(':id')
    @UseGuards(AdminGuard)
    @HttpCode(200)
    async getLibroPedidoById(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<LibroPedido> {
      return await this.libroPedidoService.getLibroPedidoById(id);
    }
  
    @Post()
    @UseGuards(AdminGuard)
    async crearLibroPedido(@Body() datos: DtoLibroPedido): Promise<LibroPedido> {
      return await this.libroPedidoService.crearLibroPedido(datos);
    }
  
    @Put(':id')
    @UseGuards(AdminGuard)
    async actualizarLibroPedido(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number, @Body() datos: DtoLibroPedido): Promise<LibroPedido> {
      return await this.libroPedidoService.actualizarLibroPedido(id, datos);
    }
  
    @Delete(':id')
    @UseGuards(AdminGuard)
    async eliminarLibroPedido(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
      return await this.libroPedidoService.eliminarLibroPedido(id);
    }
  
    @Patch(':id')
    @UseGuards(AdminGuard)
    async reactivarLibroPedido(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number): Promise<Boolean> {
      return await this.libroPedidoService.softReactivarLibroPedido(id);
    }
  
    @Patch(':id/estado')
    @UseGuards(AdminGuard)
    async actualizarEstadoLibroPedido(@Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE })) id: number,
      @Body() estado: DtoAgregarEstadoPedido
    ): Promise<LibroPedido> {
      return await this.libroPedidoService.EstadoPedidoModificar(estado.estadoPedido.idEstadoPedido, id);
    }
  
    @Post('/completo')
    @UseGuards(AdminGuard)
    async crearLibroPedidoCompleto(@Body() datos: DtoPedidoCompleto): Promise<Pedido> {
      return await this.libroPedidoService.guardarPedidoCompleto(datos);
    }
  }
  
