import { Global, Module } from '@nestjs/common';
import * as Minio from 'minio';

@Global()
@Module({
    providers: [
        {
            provide: 'MINIO_CLIENT',
            async useFactory() {
                const client = new Minio.Client({
                        endPoint: 'localhost',
                        port: 9000,
                        useSSL: false,
                        accessKey: '',
                        secretKey: ''
                    })
                return client;
            }
          }
    ],
    exports: ['MINIO_CLIENT']
})
export class MinioModule {}
