import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
  } from '@nestjs/websockets';
  import { Server } from 'socket.io';
import { Escuela } from '../entidad/escuela.entity';
  
  @WebSocketGateway({ cors: true }) // Habilita CORS para permitir conexiones desde el frontend
  export class EscuelaGateway {
    @WebSocketServer()
    server: Server;
  
    // Método para emitir la actualización del curso a todos los clientes conectados
    enviarActualizacionEscuela(msg:string, data?: Escuela) {
      this.server.emit(msg, data); // Emite el evento 'cursoActualizado' a todos los clientes
    }
  }