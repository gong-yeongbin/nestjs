import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RedisService } from 'nestjs-redis';
import { RedisLockService } from 'nestjs-simple-redis-lock';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Campaign, PostBackDaily, PostBackUnregisteredEvent, PostBackEvent } from '../entities/Entity';
import { HttpService } from '@nestjs/common';

@Injectable()
export class CommonService {
  constructor(
    private httpService: HttpService,
    private readonly redisService: RedisService,
    private readonly lockService: RedisLockService,
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(PostBackDaily)
    private readonly postBackDailyRepository: Repository<PostBackDaily>,
    @InjectRepository(PostBackUnregisteredEvent)
    private readonly postBackUnregisteredEventRepository: Repository<PostBackUnregisteredEvent>,
  ) {}

  async dailyPostBackCountUp(postBackDailyEntity: PostBackDaily, postBackEventEntity: PostBackEvent, price?: number): Promise<PostBackDaily> {
    switch (postBackEventEntity.adminPostback) {
      case 'install':
        postBackDailyEntity.install = +postBackDailyEntity.install + 1;
        break;
      case 'signup':
        postBackDailyEntity.signup = +postBackDailyEntity.signup + 1;
        break;
      case 'retention':
        postBackDailyEntity.retention = +postBackDailyEntity.retention + 1;
        break;
      case 'buy':
        postBackDailyEntity.buy = +postBackDailyEntity.buy + 1;
        postBackDailyEntity.price = +postBackDailyEntity.price + price;
        break;
      case 'etc1':
        postBackDailyEntity.etc1 = +postBackDailyEntity.etc1 + 1;
        break;
      case 'etc2':
        postBackDailyEntity.etc2 = +postBackDailyEntity.etc2 + 1;
        break;
      case 'etc3':
        postBackDailyEntity.etc3 = +postBackDailyEntity.etc3 + 1;
        break;
      case 'etc4':
        postBackDailyEntity.etc4 = +postBackDailyEntity.etc4 + 1;
        break;
      case 'etc5':
        postBackDailyEntity.etc5 = +postBackDailyEntity.etc5 + 1;
        break;
    }
    return await this.postBackDailyRepository.save(postBackDailyEntity);
  }

  async postBackUnregisteredEvent(postBackDailyEntity: PostBackDaily, event_name: string): Promise<PostBackUnregisteredEvent> {
    const postBackUnregisteredEventEntity: PostBackUnregisteredEvent = await this.postBackUnregisteredEventRepository.findOne({
      where: {
        event_name: event_name,
        postBackDaily: postBackDailyEntity,
      },
    });

    if (postBackUnregisteredEventEntity) {
      postBackUnregisteredEventEntity.event_count = +postBackUnregisteredEventEntity.event_count + 1;

      return await this.postBackUnregisteredEventRepository.save(postBackUnregisteredEventEntity);
    } else {
      const postBackUnregisteredEvent: PostBackUnregisteredEvent = new PostBackUnregisteredEvent();
      postBackUnregisteredEvent.postBackDaily = postBackDailyEntity;
      postBackUnregisteredEvent.event_name = event_name;

      return await this.postBackUnregisteredEventRepository.save(postBackUnregisteredEvent);
    }
  }

  async httpServiceHandler(url: string): Promise<string> {
    let isSendtime: string;

    await this.httpService
      .get(url)
      .toPromise()
      .then(async () => {
        console.log(`[ mecrosspro ---> media ] install : ${url}`);
        isSendtime = moment.utc().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
      })
      .catch();

    return isSendtime ? isSendtime : '';
  }

  async isValidationPostbackDaily(view_code: string, cp_token: string): Promise<PostBackDaily> {
    let postBackDailyEntity: PostBackDaily;

    postBackDailyEntity = await this.postBackDailyRepository
      .createQueryBuilder('postBackDaily')
      .leftJoinAndSelect('postBackDaily.campaign', 'campaign')
      .where('Date(postBackDaily.created_at) =:date', { date: moment.utc().tz('Asia/Seoul').format('YYYY-MM-DD') })
      .andWhere('postBackDaily.view_code =:view_code', { view_code: view_code })
      .getOne();

    if (!postBackDailyEntity) {
      try {
        await this.lockService.lock(moment().format('YYYYMMDD'), 1 * 60 * 1000, 10, 30);

        const redis: any = this.redisService.getClient();

        let cursor: number;
        cursor = 0;
        do {
          const data: any = await redis.hscan('view_code', cursor, 'MATCH', `${cp_token}/*`, 'COUNT', 20000);

          cursor = data[0];
          const keys: Array<string> = data[1];
          for (let i = 0; i < keys.length; i++) {
            const isViewCode: string = await redis.hget('view_code', keys[i]);

            if (view_code === isViewCode) {
              const splitData: Array<string> = keys[i].split('/');
              const pub_id: string = splitData[1];
              const sub_id: string = splitData[2];
              const media_idx: string = splitData[3];

              const campaignEntity: Campaign = await this.campaignRepository.findOne({
                where: {
                  cp_token: cp_token,
                  media: { idx: media_idx },
                },
                relations: ['media'],
              });

              if (!campaignEntity) throw new NotFoundException();

              const postBackDaily = this.postBackDailyRepository.create({
                cp_token: cp_token,
                pub_id: pub_id,
                sub_id: sub_id,
                view_code: view_code,
                campaign: campaignEntity,
              });

              postBackDailyEntity = await this.postBackDailyRepository.save(postBackDaily);
            }
          }
        } while (cursor != 0);
      } finally {
        this.lockService.unlock(moment().format('YYYYMMDD'));
      }
    }

    return postBackDailyEntity;
  }

  async convertedPostbackInstallUrl(data: {
    uuid: string;
    click_id: string;
    adid: string;
    event_datetime: string;
    click_datetime: string;
    campaignEntity: Campaign;
    postBackDailyEntity: PostBackDaily;
  }): Promise<string> {
    const mediaPostbackInstallUrlTemplate: string = data.campaignEntity.media.mediaPostbackInstallUrlTemplate;
    const platform: string = data.campaignEntity.advertising.platform;
    const click_id: string = data.click_id;
    const adid: string = data.adid;
    const event_datetime: string = data.event_datetime;
    const click_datetime: string = data.click_datetime;
    const pub_id: string = data.postBackDailyEntity.pub_id;
    const sub_id: string = data.postBackDailyEntity.sub_id;
    const uuid: string = data.uuid;

    return mediaPostbackInstallUrlTemplate
      .replace('{click_id}', click_id)
      .replace('{device_id}', adid)
      .replace('{android_device_id}', platform.toLowerCase() == 'aos' ? adid : '')
      .replace('{ios_device_id}', platform.toLowerCase() == 'ios' ? adid : '')
      .replace('{install_timestamp}', event_datetime)
      .replace('{click_datetime', click_datetime)
      .replace('{pub_id}', pub_id)
      .replace('{sub_id}', sub_id)
      .replace('{payout}', '')
      .replace('{uuid}', uuid);
  }

  async convertedPostbackEventUrl(data: {
    uuid: string;
    click_id: string;
    adid: string;
    event_name: string;
    event_datetime: string;
    install_datetime: string;
    campaignEntity: Campaign;
    postBackDailyEntity: PostBackDaily;
  }): Promise<string> {
    const mediaPostbackInstallUrlTemplate: string = data.campaignEntity.media.mediaPostbackEventUrlTemplate;
    const platform: string = data.campaignEntity.advertising.platform;
    const click_id: string = data.click_id;
    const adid: string = data.adid;
    const event_name: string = data.event_name;
    const event_datetime: string = data.event_datetime;
    const install_datetime: string = data.install_datetime;
    const pub_id: string = data.postBackDailyEntity.pub_id;
    const sub_id: string = data.postBackDailyEntity.sub_id;
    const uuid: string = data.uuid;

    return mediaPostbackInstallUrlTemplate
      .replace('{click_id}', click_id)
      .replace('{event_name}', event_name)
      .replace('{event_value}', '')
      .replace('{device_id}', adid)
      .replace('{android_device_id}', platform.toLowerCase() == 'aos' ? adid : '')
      .replace('{ios_device_id}', platform.toLowerCase() == 'ios' ? adid : '')
      .replace('{install_timestamp}', install_datetime)
      .replace('{event_timestamp}', event_datetime)
      .replace('{pub_id}', pub_id)
      .replace('{sub_id}', sub_id)
      .replace('{uuid}', uuid);
  }
}
