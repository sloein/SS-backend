import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MinioController } from './minio.controller';
import * as Minio from 'minio';

@Global()
@Module({
    providers: [
        {
            provide: 'MINIO_CLIENT',
            async useFactory(configService: ConfigService) {
                const client = new Minio.Client({
                    endPoint: configService.get('minio_endpoint') as string,
                    port: +configService.get('minio_port'),
                    useSSL: true,
                    accessKey: configService.get('minio_access_key') as string,
                    secretKey: configService.get('minio_secret_key') as string
                })
                return client;
            },
            inject: [ConfigService]
          },
    ],
    exports: ['MINIO_CLIENT'],
    controllers: [MinioController]
})
export class MinioModule {}
