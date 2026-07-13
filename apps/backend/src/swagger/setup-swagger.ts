import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const isEnabled =
    configService.get<string>('SWAGGER_ENABLED', 'true') === 'true';
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  if (!isEnabled || nodeEnv === 'production') {
    return;
  }

  const swaggerPath = configService.get<string>('SWAGGER_PATH', 'api/docs');
  const port = configService.get<number>('PORT', 8000);

  const config = new DocumentBuilder()
    .setTitle('Testing Task API')
    .setDescription(
      'REST API documentation for the Testing Task backend application.',
    )
    .setVersion('1.0')
    .setContact('Nazarii1202', '', '')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'access-token',
    )
    .addServer(`http://localhost:${port}`, 'Local development')
    .addTag('App', 'General application endpoints')
    .addTag('Auth', 'Authentication and authorization endpoints')
    .addTag('Data Rooms', 'Virtual data room folder and file management')
    .addTag('Health', 'Service and dependency health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}_${methodKey}`,
  });

  SwaggerModule.setup(swaggerPath, app, document, {
    customSiteTitle: 'Testing Task API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
