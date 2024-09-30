import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { CursoModule } from './curso/curso.module';
import { EscuelaModule } from './escuela/escuela.module';
import { EspecificacionesModule } from './especificaciones/especificaciones.module';
import { EstadoPedidoModule } from './estado-pedido/estado-pedido.module';
import { GestionEstadosModule } from './gestion-estados/gestion-estados.module';
import { ImgSubirModule } from './img-subir/img-subir.module';
import { LibroModule } from './libro/libro.module';
import { LibroPedidoModule } from './libro-pedido/libro-pedido.module';
import { MateriaModule } from './materia/materia.module';
import { PedidoModule } from './pedido/pedido.module';
import { PersonaModule } from './persona/persona.module';
import { PreciosModule } from './precios/precios.module';
import { ProfeMateriaModule } from './profe-materia/profe-materia.module';
import { StockModule } from './stock/stock.module';
import { UsuarioModule } from './usuario/usuario.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'index'),
      serveRoot: '/',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
    }),
    ChatModule,
    AuthModule,
    CursoModule,
    EscuelaModule,
    EspecificacionesModule,
    EstadoPedidoModule,
    GestionEstadosModule,
    ImgSubirModule,
    LibroModule,
    LibroPedidoModule,
    MateriaModule,
    PedidoModule,
    PersonaModule,
    PreciosModule,
    ProfeMateriaModule,
    StockModule,
    UsuarioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
