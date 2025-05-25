import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import { Logger, ValidationPipe } from '@nestjs/common'
import 'dotenv/config'

import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'

function getAllowedOrigins() {
  return [
    'http://localhost:3001',
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(x => x.trim()) : [])
  ].filter(Boolean);
}

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const isProd = process.env.NODE_ENV === 'production'

  const adapter = new FastifyAdapter({ logger: true })

  await adapter.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET ?? 'fallback-secret-for-dev',
    hook: 'onRequest',
    parseOptions: {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    },
  })

  await adapter.register(fastifyCors, {
    origin: (origin, cb) => {
      const whitelist = getAllowedOrigins();
      if (!origin || whitelist.includes(origin)) {
        cb(null, true)
      } else {
        cb(new Error('Not allowed by CORS'), false)
      }
    },
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: [
      'Content-Type','Authorization',
      'Accept','Origin','X-Requested-With','Cookie'
    ],
    exposedHeaders: ['Set-Cookie'],
  })

  await adapter.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 5,
      fieldSize: 1 * 1024 * 1024,
      headerPairs: 2000,
    },
    attachFieldsToBody: false,
  })

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  )

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      skipMissingProperties: true,
    }),
  )
  app.useGlobalFilters(new HttpExceptionFilter())
  app.setGlobalPrefix('api')

  app.use((req, res, next) => {
    if (req.url.includes('/auth')) {
      logger.debug(req.method + ' ' + req.url)
      logger.debug('Headers: ' + JSON.stringify(req.headers))
      logger.debug('Cookies: ' + JSON.stringify(req.cookies))
    }
    next()
  })

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host)
  logger.log('Application is running on: ' + (await app.getUrl()))
}

bootstrap().catch(err => {
  // Better error handling
  // eslint-disable-next-line no-console
  console.error('NestJS bootstrap error:', err)
  process.exit(1)
})
