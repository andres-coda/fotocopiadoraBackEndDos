import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
  } from '@nestjs/websockets';
  import { Server } from 'socket.io';
import { LibroPedido } from '../entidad/libroPedido.entity';
import { Persona } from 'src/persona/entidad/persona.entity';
import { Libro } from 'src/libro/entidad/libro.entity';
import { Pedido } from 'src/pedido/entidad/pedido.entity';

  
  @WebSocketGateway({ cors: true }) // Habilita CORS para permitir conexiones desde el frontend
  export class LibroPedidoGateway {
    @WebSocketServer()
    server: Server;
    onModuleInit() {
      this.server.setMaxListeners(20); // Aumentar el límite a 20 listeners, o el número que consideres adecuado.
    }
  
    // Método para emitir la actualización del curso a todos los clientes conectados
    enviarActualizacionPedido(pedido : LibroPedido) {
      this.server.emit('Se actualizo libro pedido', pedido); // Emite el evento 'cursoActualizado' a todos los clientes
    }

    enviarCrearPedido(pedido : LibroPedido) {
      this.server.emit('Se creo libro pedido', pedido); // Emite el evento 'cursoActualizado' a todos los clientes
    }
  }
  