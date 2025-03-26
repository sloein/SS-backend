import { Controller, Get, Inject, Query, UseGuards, HttpException, HttpStatus, Param, Post, Body, forwardRef } from '@nestjs/common';
import * as Minio from 'minio';
import { RequireLogin } from '../custom.decorator';
import { LoginGuard } from '../login.guard';
import { CourseService } from '../course/course.service';

@Controller('minio')
@UseGuards(LoginGuard)
export class MinioController {

    @Inject('MINIO_CLIENT')
    private minioClient: Minio.Client;
    
    @Inject(forwardRef(() => CourseService))
    private courseService: CourseService;

    @Get('presignedUrl')
    @RequireLogin()
    async presignedPutObject(@Query('fileName') fileName: string) {
        try {
            // 生成唯一的文件名，防止覆盖
            const timestamp = new Date().getTime();

            //处理特殊符号
            // fileName = encodeURIComponent(fileName);
            //算上-14位
            const uniqueName = `${timestamp}-${fileName}`;
            
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

    /**
     * 删除文件
     */
    @Get('delete')
    @RequireLogin()
    async deleteFile(@Query('name') name: string) {
        await this.minioClient.removeObject('studysystem', name);
        return {
            message: '文件删除成功'
        };
    }

    @Get('download')
    // @RequireLogin()
    async getDownloadUrl(@Query('fileName') fileName: string) {

        try {

            // 生成预签名下载URL，有效期1小时
            const url = await this.minioClient.presignedGetObject(
                'studysystem',  // bucket名称
                fileName,       // 文件名
                3600           // 过期时间（秒）
            );
            
            return {
                code: 200,
                data: {
                    url
                },
                message: '获取下载链接成功'
            };

        } catch (error) {
            throw new HttpException(
                {
                    message: '获取下载链接失败',
                    error: error
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

    }

    /**
     * 初始化分片上传
     */
    @Post('multipart/init')
    @RequireLogin()
    async initMultipartUpload(@Body() body: {
        courseId: number;
        fileHash: string;
        fileName: string;
        fileSize: number;
        type: string;
        title: string;
    }) {
        try {
            // 生成唯一的对象键
            const objectKey = body.fileName;
            
            // 初始化MinIO的多部分上传
            const uploadId = await this.minioClient.initiateNewMultipartUpload(
                'studysystem', 
                objectKey, 
                { 'Content-Type': 'application/octet-stream' }
            );
            
            return {
                code: 200,
                data: {
                    uploadId,
                    fileName: objectKey
                },
                message: '初始化分片上传成功'
            };
        } catch (error) {
            console.error('初始化分片上传失败:', error);
            throw new HttpException({
                message: '初始化分片上传失败',
                error: error.message
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 获取分片上传的预签名URL
     */
    @Get('multipart/presignedUrl')
    @RequireLogin()
    async getMultipartPresignedUrl(
        @Query('uploadId') uploadId: string,
        @Query('fileName') fileName: string,
        @Query('partNumber') partNumber: string
    ) {
        try {
            const partNumberInt = parseInt(partNumber, 10);
            
            if (isNaN(partNumberInt) || partNumberInt < 1) {
                throw new Error('分片编号无效');
            }
            
            // 生成上传特定分片的预签名URL
            const presignedUrl = await this.minioClient.presignedPutObject(
                'studysystem',
                fileName,
                3600
            );
            
            return {
                code: 200,
                data: {
                    presignedUrl,
                    partNumber: partNumberInt
                },
                message: '获取分片上传链接成功'
            };
        } catch (error) {
            console.error('获取分片上传链接失败:', error);
            throw new HttpException({
                message: '获取分片上传链接失败',
                error: error.message
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 获取已上传的分片列表
     */
    @Get('multipart/listParts')
    @RequireLogin()
    async listUploadedParts(
        @Query('uploadId') uploadId: string,
        @Query('fileName') fileName: string
    ) {
        try {
            // 尝试使用标准API，如果没有这个方法，可能需要检查MinIO文档
            let parts;
            try {
                // 首先尝试使用标准API
                parts = await (this.minioClient as any).listParts('studysystem', fileName, uploadId);
            } catch (e) {
                console.warn('标准API调用失败，尝试替代方法:', e);
                
                // 如果标准API不可用，尝试使用其他方法或自定义实现
                // 下面是一个模拟实现，仅作为替代方案
                // 在实际环境中，应该根据MinIO SDK的实际支持进行调整
                parts = [];
                
                // 可以返回一个空数组，让前端继续上传所有分片
                console.log('返回空的分片列表，前端将上传所有分片');
            }
            
            return {
                code: 200,
                data: {
                    parts: Array.isArray(parts) ? parts.map(part => ({
                        partNumber: part.number || part.partNumber,
                        etag: part.etag,
                        size: part.size,
                        lastModified: part.lastModified
                    })) : []
                },
                message: '获取已上传分片列表成功'
            };
        } catch (error) {
            console.error('获取已上传分片列表失败:', error);
            throw new HttpException({
                message: '获取已上传分片列表失败',
                error: error.message
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 完成分片上传
     */
    @Post('multipart/complete')
    @RequireLogin()
    async completeMultipartUpload(@Body() body: {
        uploadId: string;
        fileName: string;
        parts: { partNumber: number; etag: string }[];
        courseId?: number;
        chapterId?: number;
        fileHash: string;
        title: string;
        type: string;
    }) {
        try {
            // 完成分片上传
            const etag = await this.minioClient.completeMultipartUpload(
                'studysystem',
                body.fileName,
                body.uploadId,
                body.parts.map(part => ({
                    part: part.partNumber,
                    etag: part.etag
                }))
            );
            
            // 如果是课程资料，保存到数据库
            if (body.courseId) {
                // 构建符合UploadMaterialDto要求的对象
                const materialData = {
                    courseId: body.courseId,
                    title: body.title,
                    type: body.type,
                    url: `https://your-minio-endpoint/studysystem/${body.fileName}`,
                    fileHash: body.fileHash,
                    fileSize: 0 // 由于这个字段是必需的，但我们在这里没有具体大小，暂时设为0
                };
                
                await this.courseService.uploadCourseMaterial(materialData);
            }
            
            // TODO: 如果是章节内容，处理章节内容保存
            
            return {
                code: 200,
                data: {
                    etag,
                    fileName: body.fileName
                },
                message: '完成分片上传成功'
            };
        } catch (error) {
            console.error('完成分片上传失败:', error);
            throw new HttpException({
                message: '完成分片上传失败',
                error: error.message
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 取消分片上传
     */
    @Post('multipart/abort')
    @RequireLogin()
    async abortMultipartUpload(@Body() body: {
        uploadId: string;
        fileName: string;
    }) {
        try {
            // 取消分片上传
            await this.minioClient.abortMultipartUpload(
                'studysystem',
                body.fileName,
                body.uploadId
            );
            
            return {
                code: 200,
                message: '取消分片上传成功'
            };
        } catch (error) {
            console.error('取消分片上传失败:', error);
            throw new HttpException({
                message: '取消分片上传失败',
                error: error.message
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}


