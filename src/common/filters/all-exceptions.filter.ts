// import {
//     ExceptionFilter,
//     Catch,
//     ArgumentsHost,
//     HttpException,
//     Logger,
//   } from '@nestjs/common';
//   import { FastifyReply } from 'fastify';
  
//   @Catch()
//   export class AllExceptionsFilter implements ExceptionFilter {
//     private readonly logger = new Logger(AllExceptionsFilter.name);
  
//     catch(exception: unknown, host: ArgumentsHost) {
//       const ctx = host.switchToHttp();
  
//       // Get response and request objects
//       const response = ctx.getResponse();
//       const request = ctx.getRequest();
  
//       let status = 500;
//       let message = 'Internal server error';
  
//       if (exception instanceof HttpException) {
//         status = exception.getStatus();
//         message = exception.message;
//       } else if (exception instanceof Error) {
//         message = exception.message;
//       }
  
//       this.logger.error(`HTTP Status: ${status} Error Message: ${message}`, (exception as any).stack);
  
//       // Detect if Fastify or Express
//       // Fastify reply has 'send' method, Express response has 'json' method
//       if (typeof (response as any).send === 'function') {
//         // Fastify
//         (response as FastifyReply).status(status).send({
//           statusCode: status,
//           timestamp: new Date().toISOString(),
//           path: request.url,
//           message,
//         });
//       } else if (typeof (response as any).json === 'function') {
//         // Express
//         response.status(status).json({
//           statusCode: status,
//           timestamp: new Date().toISOString(),
//           path: request.url,
//           message,
//         });
//       } else {
//         // Fallback: just end the response
//         response.statusCode = status;
//         response.end(message);
//       }
//     }
//   }
  