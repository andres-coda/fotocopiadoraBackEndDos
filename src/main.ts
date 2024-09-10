import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*' // Esto permite solicitudes desde cualquier origen
  });
  await app.listen(3001);
}
bootstrap();
