import 'dotenv/config'
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { AuthGuard } from './shared/auth.guard';

const port = process.env.PORT || 8080;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new AuthGuard(reflector));
  
  await app.listen(port);
  Logger.log('Server running on http://localhost:' + port, 'Bootstrap');
}
bootstrap();
