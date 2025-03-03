import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';
@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory(configService: ConfigService) {
        const client = createClient ({
          url: configService.get('redis_server_url'),
          password: configService.get('redis_server_password'),
          socket: {
            reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
            connectTimeout: 60000,
            keepAlive: 5000
          },
        });
        client.on("error", function(err) {
          console.error("Redis 连接错误:", err);
        });
        await client.connect()
        return client;
      },
      inject: [ConfigService]
    }
  ],
  exports: [RedisService],
})
export class RedisModule {}
