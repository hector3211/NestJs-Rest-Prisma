import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.setBaseViewsDir(join(__dirname, '..', 'src/views'));
  // app.setViewEngine('hbs');
  const swagCon = new DocumentBuilder()
    .setTitle("Hector's Api")
    .setDescription("REST Api that's buit by Hector Oropesa!")
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'Header' },
      'JWT',
    )
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const document = SwaggerModule.createDocument(app, swagCon, options);
  SwaggerModule.setup('api', app, document);

  app.use(cookieParser());
  // app.setBaseViewsDir(join(__dirname, '..', 'src/views'));
  // app.setViewEngine('hbs');

  await app.listen(3000);

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
}
bootstrap();
