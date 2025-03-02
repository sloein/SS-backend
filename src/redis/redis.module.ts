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
          url : configService.get('redis_server_url'),
        });
        client.on("error", function(err) {
          throw err;
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
