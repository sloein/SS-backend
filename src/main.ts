import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FormatResponseInterceptor } from './format-response.interceptor';
import { InvokeRecordInterceptor } from './invoke-record.interceptor';
import { CustomExceptionFilter } from './custom-exception.filter';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    bufferLogs: true,
  });

  // 增加请求体大小限制
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  
  app.enableCors(); // 允许跨域请求
  
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new FormatResponseInterceptor());
  app.useGlobalInterceptors(new InvokeRecordInterceptor());
  app.useGlobalPipes(new ValidationPipe({ 
    transform: true,
    transformOptions: { enableImplicitConversion: true }
  }));
  app.useGlobalFilters(new CustomExceptionFilter());

//   app.useStaticAssets('uploads', {
//     prefix: '/uploads'
// });允许直接访问上传的文件


  const config = new DocumentBuilder()
    .setTitle('在线学习系统')
    .setDescription('api 接口文档')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get('nest_server_port');
  
  logger.log(`应用正在启动，端口: ${port}`);
  await app.listen(port);
  logger.log(`应用已成功启动: http://localhost:${port}`);
  
  // 输出所有缓冲的日志
  app.flushLogs();
}

bootstrap();
