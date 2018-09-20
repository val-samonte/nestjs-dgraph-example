import { Module } from '@nestjs/common';
import { DgraphModule } from '@valsamonte/nestjs-dgraph';
import { AppController } from './app.controller';
import * as grpc from 'grpc';

@Module({
  imports: [
    DgraphModule.forRoot({
      stubs: [
        {
          address: 'localhost:9080',
          credentials: grpc.credentials.createInsecure(),
        },
      ],
      debug: true,
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
