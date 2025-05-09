import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import cookie from '@fastify/cookie';
import { existsSync, mkdirSync } from 'fs';
import multipart from '@fastify/multipart';
import { Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import 'dotenv/config';  
import fastifyStatic from '@fastify/static'
import { join } from 'path'

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    // Create upload directories
    if (!existsSync('./uploads/instructors')) {
      mkdirSync('./uploads/instructors', { recursive: true });
    }
    if (!existsSync('./uploads/gym-owners')) {
      mkdirSync('./uploads/gym-owners', { recursive: true });
    }
    
    // Create app with Fastify
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
    );
    
    await app.register(fastifyStatic, {
      root: join(__dirname, '..', 'uploads'),
      prefix: '/uploads/',
    })
    // Apply global filters
    app.useGlobalFilters(new HttpExceptionFilter());
    
    // Configure CORS
    app.enableCors({
      origin: 'http://localhost:3001',
      credentials: true,
    });
    
    // Register Fastify plugins
    await app.register(multipart, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB per file
        files:    3,               // (optional) max number of files per request
      },
    });
    
    await app.register(cookie, {
      secret: 'your-cookie-secret', // optional signing
    });

    await app.listen(3000, '0.0.0.0');
    logger.log(`Application is running on: ${await app.getUrl()}`);
  } catch (error) {
    logger.error(`Failed to start application: ${error.message}`, error.stack);
    process.exit(1);
  }
}
bootstrap();