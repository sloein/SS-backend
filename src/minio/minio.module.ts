import { forwardRef, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MinioController } from './minio.controller';
import * as Minio from 'minio';
import * as https from 'https';
import { CourseModule } from '../course/course.module';

@Global()
@Module({
    imports: [forwardRef(() => CourseModule)],
    providers: [
        {
            provide: 'MINIO_CLIENT',
            async useFactory(configService: ConfigService) {
                
                const client = new Minio.Client({
                    endPoint: configService.get('minio_endpoint') as string,
                    port: +configService.get('minio_port'),
                    useSSL: true,
                    accessKey: configService.get('minio_access_key') as string,
                    secretKey: configService.get('minio_secret_key') as string,
                  
                });
                
                // 测试连接
                try {
                    await client.listBuckets();
                    console.log('MinIO 客户端连接成功');
                } catch (error) {
                    console.error('MinIO 客户端连接失败:', error);
                }
                
                return client;
            },
            inject: [ConfigService]
          },
    ],
    exports: ['MINIO_CLIENT'],
    controllers: [MinioController]
})
export class MinioModule {}
