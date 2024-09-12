import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
  } from '@nestjs/websockets';
  import { Server } from 'socket.io';
import { Persona } from '../entidad/persona.entity';

  
  @WebSocketGateway({ cors: true }) // Habilita CORS para permitir conexiones desde el frontend
  export class PersonaGateway {
    @WebSocketServer()
    server: Server;
  
    // Método para emitir la actualización del curso a todos los clientes conectados
    enviarActualizacionPersona(data: Persona) {
      this.server.emit('Se actualizo persona', data); // Emite el evento 'cursoActualizado' a todos los clientes
    }

    enviarCrearPersona(data:Persona){
      this.server.emit('Se creo persona', data);
    }
  }
  