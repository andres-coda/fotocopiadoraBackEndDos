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
  
    // Método para emitir la actualización del curso a todos los clientes conectados
    enviarActualizacionPedido(pedido : Pedido) {
      this.server.emit('Se actualizo pedido', pedido); // Emite el evento 'cursoActualizado' a todos los clientes
    }

    enviarCrearPedido(pedido : Pedido) {
      this.server.emit('Se creo pedido', pedido); // Emite el evento 'cursoActualizado' a todos los clientes
    }
  }
  