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
    onModuleInit() {
      this.server.setMaxListeners(20); // Aumentar el límite a 20 listeners, o el número que consideres adecuado.
    }
    // Método para emitir la actualización del curso a todos los clientes conectados
    enviarActualizacionEscuela(data: Escuela) {
      this.server.emit('Se actualizo escuela', data); // Emite el evento 'cursoActualizado' a todos los clientes
    }   

    enviarCrearEscuela(data:Escuela){
      this.server.emit('Se creo escuela', data);
    }

    enviarEliminarEscuela(data:Escuela){
      this.server.emit('Se elimino escuela', data);
    }
  }