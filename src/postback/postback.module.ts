import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostBackEvent } from 'src/entities/PostBackEvent';
import { PostBackEventAdbrixRemaster } from 'src/entities/PostBackEventAdbrixRemaster';
import { PostBackInstallAdbrixRemaster } from 'src/entities/PostBackInstallAdbrixRemaster';
import { PostBackInstallAppsflyer } from 'src/entities/PostBackInstallAppsflyer';
import { SubMedia } from 'src/entities/SubMedia';
import { PostbackController } from './postback.controller';
import { PostbackService } from './postback.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubMedia,
      PostBackEvent,
      PostBackInstallAdbrixRemaster,
      PostBackEventAdbrixRemaster,
      PostBackInstallAppsflyer,
    ]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
  ],
  controllers: [PostbackController],
  providers: [PostbackService],
})
export class PostbackModule {}
