import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('ACME Accounting API')
    .setDescription('API for managing accounting tickets and reports')
    .setVersion('1.0')
    .addTag('tickets', 'Ticket management operations')
    .addTag('reports', 'Report generation operations')
    .addTag('health', 'Health check operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
