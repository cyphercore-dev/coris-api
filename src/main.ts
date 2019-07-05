import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { APP_HOST, APP_PORT } from './app/app.config.json';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: true});
  await app.listen(APP_PORT, APP_HOST);
}
bootstrap();
