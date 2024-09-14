import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
  } from '@nestjs/websockets';
  import { Server } from 'socket.io';
import { Precios } from '../entidad/precios.entity';

  
  @WebSocketGateway({ cors: true }) // Habilita CORS para permitir conexiones desde el frontend
  export class PreciosGateway {
    @WebSocketServer()
    server: Server;
    onModuleInit() {
      this.server.setMaxListeners(20); // Aumentar el límite a 20 listeners, o el número que consideres adecuado.
    }
    // Método para emitir la actualización del curso a todos los clientes conectados
    enviarActualizacionPrecio(data: Precios) {
      this.server.emit('Se actualizo precio', data); // Emite el evento 'cursoActualizado' a todos los clientes
    }

    enviarCrearPrecio(data:Precios){
      this.server.emit('Se creo precio', data);
    }
  }
  