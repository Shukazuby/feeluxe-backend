import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const port = process.env.PORT;
  const app = await NestFactory.create(AppModule, { cors: { origin: '*' } });

  app.enableCors();

  // Stripe webhook needs raw body
  app.use(
    '/webhook',
    express.raw({
      type: 'application/json',
      verify: (req, res, buf) => {
        (req as any).rawBody = buf;
      },
    }),
  );

  // Other routes use JSON parser
  app.use(bodyParser.json());

  const config = new DocumentBuilder()
    .setTitle('Feeluxe_ng API')
    .setDescription('The API for Feeluxe_ng')
    .setVersion('1.0')
    .addBearerAuth()

    // .addBearerAuth(
    //   {
    //     type: 'http',
    //     scheme: 'bearer',
    //     bearerFormat: 'JWT',
    //     in: 'header',
    //   },
    //   'JWT',
    // )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  console.log(`Running on port ${port}`)
  console.log(`http://localhost:${port}/docs`)
}
bootstrap();
