import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
  } from '@nestjs/websockets';
  import { Server } from 'socket.io';
import { Libro } from '../entidad/libro.entity';

  
  @WebSocketGateway({ cors: true }) // Habilita CORS para permitir conexiones desde el frontend
  export class LibroGateway {
    @WebSocketServer()
    server: Server;
  
    // Método para emitir la actualización del curso a todos los clientes conectados
    enviarActualizacionLibro(msg: string, data: Libro) {
      this.server.emit(msg, data); // Emite el evento 'cursoActualizado' a todos los clientes
    }
  }
  