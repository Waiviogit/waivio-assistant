import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configService } from './config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const PREFIX = 'assistant';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      stopAtFirstError: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('AI assistant')
    .setDescription('AI assistant service')
    .setVersion('1.0')
    .addTag('assistant')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${PREFIX}/docs`, app, document);
  app.setGlobalPrefix(PREFIX);

  await app.listen(configService.getPort());
}
bootstrap();
