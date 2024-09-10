import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
  } from '@nestjs/websockets';
  import { Server } from 'socket.io';
import { Curso } from '../entidad/curso.entity';
  
  @WebSocketGateway({ cors: true }) // Habilita CORS para permitir conexiones desde el frontend
  export class CursosGateway {
    @WebSocketServer()
    server: Server;
  
    // Método para emitir la actualización del curso a todos los clientes conectados
    enviarActualizacionCurso(msg: string, data: Curso) {
      this.server.emit(msg, data); // Emite el evento 'cursoActualizado' a todos los clientes
    }
  }
  