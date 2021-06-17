import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Campaign } from 'src/entities/Campaign';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import * as moment from 'moment';
import { RedisService } from 'nestjs-redis';
import { RedisLockService } from 'nestjs-simple-redis-lock';
import { decodeUnicode } from 'src/common/util';
import { SubMedia } from 'src/entities/SubMedia';
import { isRFC3339 } from 'class-validator';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(SubMedia)
    private readonly subMediaRepository: Repository<SubMedia>,
    private readonly redisService: RedisService,
    private readonly lockService: RedisLockService,
  ) {}

  // const adid: string = ['', undefined, '{adid}'].includes(request.query.adid)
  //   ? ''
  //   : request.query.adid;
  // const idfa: string = ['', undefined, '{idfa}'].includes(request.query.idfa)
  //   ? ''
  //   : request.query.idfa;
  // const click_id: string = ['', undefined, '{click_id}'].includes(
  //   request.query.click_id,
  // )
  //   ? ''
  //   : request.query.click_id;
  async tracking(request: any): Promise<string> {
    const originalUrl: string = decodeUnicode(
      `${request.protocol}://${request.get('host')}${request.originalUrl}`,
    );

    const cp_token: string = ['', undefined, '{token}'].includes(
      request.query.token,
    )
      ? ''
      : request.query.token;
    const pub_id: string = ['', undefined, '{pub_id}'].includes(
      request.query.pub_id,
    )
      ? ''
      : request.query.pub_id;
    const sub_id: string = ['', undefined, '{sub_id}'].includes(
      request.query.sub_id,
    )
      ? ''
      : request.query.sub_id;

    console.log(`[ media ---> mecrosspro ] ${originalUrl}`);

    const campaignEntity: Campaign = await this.campaignRepository.findOne({
      where: {
        cp_token: cp_token,
        status: true,
      },
      relations: ['media', 'advertising', 'advertising.tracker'],
    });

    if (!campaignEntity) throw new NotFoundException();

    const subMediaEntity: SubMedia = await this.subMediaRepository.findOne({
      where: {
        cp_token: cp_token,
        pub_id: pub_id,
        sub_id: sub_id,
        md_code: campaignEntity.media.md_code,
      },
    });

    try {
      await this.lockService.lock(
        moment().format('YYYYMMDD'),
        2 * 60 * 1000,
        50,
        50,
      );

      let view_code: string;
      const redis: any = this.redisService.getClient();

      const isExists: number = await redis.hsetnx(
        `${cp_token}/${pub_id}/${sub_id}/${campaignEntity.media.idx}/${moment()
          .tz('Asia/Seoul')
          .format('YYYYMMDD')}`,
        'click_count',
        1,
      );

      if (isExists) {
        if (!subMediaEntity) {
          view_code = v4().replace(/-/g, '');

          const subMedia: SubMedia = new SubMedia();
          subMedia.cp_token = cp_token;
          subMedia.view_code = view_code;
          subMedia.pub_id = pub_id;
          subMedia.sub_id = sub_id;
          subMedia.md_code = campaignEntity.media.md_code;

          await this.subMediaRepository.save(subMedia);
        } else {
          view_code = subMediaEntity.view_code;
        }

        await redis.hmset(
          `${cp_token}/${pub_id}/${sub_id}/${
            campaignEntity.media.idx
          }/${moment().tz('Asia/Seoul').format('YYYYMMDD')}`,
          'view_code',
          `${view_code}`,
        );
      } else {
        view_code = await redis.hget(
          `${cp_token}/${pub_id}/${sub_id}/${
            campaignEntity.media.idx
          }/${moment().tz('Asia/Seoul').format('YYYYMMDD')}`,
          'view_code',
        );

        await redis.hincrby(
          `${cp_token}/${pub_id}/${sub_id}/${
            campaignEntity.media.idx
          }/${moment().tz('Asia/Seoul').format('YYYYMMDD')}`,
          'click_count',
          1,
        );
      }

      const convertedTrackingUrl: string = convertTrackerTrackingUrl(
        campaignEntity.advertising.tracker.tk_code,
        campaignEntity.trackerTrackingUrl,
        request.query,
        view_code,
      );

      return convertedTrackingUrl;
    } finally {
      this.lockService.unlock(moment().format('YYYYMMDD'));
    }
  }
}

function convertTrackerTrackingUrl(
  tk_code: string,
  trackerTrackingUrl: string,
  query: any,
  view_code: string,
) {
  const android_device_id = query.adid === '{adid}' ? '' : query.adid;
  const ios_device_id = query.idfa === '{idfa}' ? '' : query.idfa;
  const device_id: string = android_device_id
    ? android_device_id
    : ios_device_id;

  let convertedTrackerTrackingUrl: string = null;

  switch (tk_code) {
    case 'appsflyer':
      convertedTrackerTrackingUrl = trackerTrackingUrl
        .replace(
          '{clickid}', //click id
          query.click_id,
        )
        .replace(
          '{af_siteid}', //view code
          view_code,
        )
        .replace(
          '{af_c_id}', //campaign token
          query.token,
        )
        .replace(
          '{advertising_id}', //android device id
          android_device_id,
        )
        .replace(
          '{idfa}', //ios device id
          ios_device_id,
        )
        .replace('{af_adset_id}', '')
        .replace('{af_ad_id}', '')
        .replace('{af_ip}', '') //device ip
        .replace('{af_ua}', '') //user agent
        .replace('{af_lang}', ''); //device language
      break;
    case 'adbrix':
      break;
    case 'adbrix_remaster':
      break;
    case 'mobiconnect':
      break;
    case 'airbridge':
      break;
  }

  return convertedTrackerTrackingUrl;
}
