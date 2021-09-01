import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Campaign } from './Entity';

@Entity('postback_event_appsflyer')
export default class PostBackEventAppsflyer {
  @PrimaryGeneratedColumn({ name: 'idx', type: 'bigint' })
  idx: number;

  @Column({ name: 'view_code', type: 'nvarchar' })
  view_code: string;

  @Column({ name: 'token', type: 'nvarchar', nullable: true })
  token: string;

  @Column({ name: 'media', type: 'nvarchar', nullable: true })
  media: string;

  @Column({ name: 'pub_id', type: 'nvarchar', nullable: true })
  pubId: string;

  @Column({ name: 'sub_id', type: 'nvarchar', nullable: true })
  subId: string;

  @Column({ name: 'clickid', type: 'nvarchar' })
  clickid: string;

  @Column({ name: 'af_siteid', type: 'nvarchar' })
  af_siteid: string;

  @Column({ name: 'af_c_id', type: 'nvarchar' })
  af_c_id: string;

  @Column({ name: 'advertising_id', type: 'nvarchar', nullable: true })
  advertising_id: string;

  @Column({ name: 'idfa', type: 'nvarchar', nullable: true })
  idfa: string;

  @Column({ name: 'idfv', type: 'nvarchar', nullable: true })
  idfv: string;

  @Column({ name: 'install_time', type: 'nvarchar', nullable: true })
  install_time: string;

  @Column({ name: 'country_code', type: 'nvarchar', nullable: true })
  country_code: string;

  @Column({ name: 'language', type: 'nvarchar', nullable: true })
  language: string;

  @Column({ name: 'event_name', type: 'nvarchar', nullable: true })
  event_name: string;

  @Column({ name: 'event_revenue_currency', type: 'nvarchar', nullable: true })
  event_revenue_currency: string;

  @Column({ name: 'event_revenue', type: 'nvarchar', nullable: true })
  event_revenue: string;

  @Column({ name: 'event_time', type: 'nvarchar', nullable: true })
  event_time: string;

  @Column({ name: 'device_carrier', type: 'nvarchar', nullable: true })
  device_carrier: string;

  @Column({ name: 'device_ip', type: 'nvarchar', nullable: true })
  device_ip: string;

  @Column({ name: 'originalUrl', type: 'text', nullable: true })
  originalUrl: string;

  @Column({ name: 'send_time', type: 'nvarchar', nullable: true })
  send_time: string;

  @Column({ name: 'send_url', type: 'text', nullable: true })
  send_url: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => Campaign, (campaign) => campaign.postBackEventAppsflyer)
  @JoinColumn({ name: 'campaign' })
  campaign: Campaign;
}
