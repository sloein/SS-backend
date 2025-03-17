import { Controller, Get, Inject, Query, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import * as Minio from 'minio';
import { RequireLogin } from '../custom.decorator';
import { LoginGuard } from '../login.guard';

@Controller('minio')
@UseGuards(LoginGuard)
export class MinioController {

    @Inject('MINIO_CLIENT')
    private minioClient: Minio.Client;

    @Get('presignedUrl')
    @RequireLogin()
    async presignedPutObject(@Query('name') name: string) {
        try {
            // 生成唯一的文件名，防止覆盖
            const timestamp = new Date().getTime();
            const uniqueName = `${timestamp}-${name}`;
            
            // 获取预签名URL，有效期1小时
            const url = await this.minioClient.presignedPutObject('studysystem', uniqueName, 3600);
            
            return {
                code: 200,
                data: {
                    url,
                    fileName: uniqueName
                },
                message: '获取上传链接成功'
            };
        } catch (error) {
            console.log(error);
            throw new HttpException(
                {
                    message: '获取上传链接失败',
                    error: error
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


    @Get('health')
    async checkMinioHealth() {
        try {
            // 尝试列出所有 bucket，这是一个轻量级操作
            await this.minioClient.listBuckets();
            
            return {
                code: 200,
                data: {
                    status: 'healthy',
                    timestamp: new Date()
                },
                message: 'MinIO 连接正常'
            };
        } catch (error) {
            throw new HttpException(
                {
                    message: 'MinIO 连接异常',
                    error: error.message,
                    status: 'unhealthy'
                },
                HttpStatus.SERVICE_UNAVAILABLE
            );
        }
    }
}
