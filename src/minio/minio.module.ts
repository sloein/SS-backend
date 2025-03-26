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
                // 创建一个忽略 SSL 错误的 HTTPS 代理
                const httpsAgent = new https.Agent({
                    rejectUnauthorized: false  // 忽略 SSL 证书验证
                });
                
                const client = new Minio.Client({
                    endPoint: configService.get('minio_endpoint') as string,
                    port: +configService.get('minio_port'),
                    useSSL: true,
                    accessKey: configService.get('minio_access_key') as string,
                    secretKey: configService.get('minio_secret_key') as string,
                    // 添加以下配置以解决 SSL 问题
                    pathStyle: true,  // 使用路径风格而不是虚拟主机风格
                    transportAgent: httpsAgent  // 使用自定义 HTTPS 代理
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
