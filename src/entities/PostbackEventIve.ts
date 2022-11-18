import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('postback_event_ive', { schema: 'mcpro' })
export default class PostbackEventIve {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'idx' })
  idx: number;

  @Column({ type: 'varchar', name: 'p_clk', length: 255 })
  pClk: string;

  @Column({ type: 'varchar', name: 'pub', length: 255 })
  pub: string;

  @Column({ type: 'varchar', name: 'sub_pub', length: 255 })
  subPub: string;

  @Column({ type: 'varchar', name: 'event_name', length: 255 })
  eventName: string;

  @Column({ type: 'varchar', name: 'event_value', length: 255 })
  eventValue: string;

  @Column({ type: 'varchar', name: 'event_time', length: 255 })
  eventTime: string;

  @Column({ type: 'bigint', name: 'event_ts' })
  eventTs: number;

  @Column({ type: 'varchar', name: 'sub_param1', length: 255 })
  subParam1: string;

  @Column({ type: 'varchar', name: 'sub_param2', length: 255 })
  subParam2: string;

  @Column({ type: 'varchar', name: 'sub_param3', length: 255 })
  subParam3: string;

  @Column({ type: 'varchar', name: 'sub_param4', length: 255 })
  subParam4: string;

  @Column({ type: 'varchar', name: 'sub_param5', length: 255 })
  subParam5: string;

  @Column({ type: 'varchar', name: 'adid', length: 255 })
  adid: string;

  @Column({ type: 'varchar', name: 'idfa', length: 255 })
  idfa: string;

  @Column({ type: 'varchar', name: 'platform', length: 255 })
  platform: string;

  @Column({ type: 'varchar', name: 'os_ver', length: 255 })
  osVer: string;

  @Column({ type: 'varchar', name: 'carrier', length: 255 })
  carrier: string;

  @Column({ type: 'varchar', name: 'brand', length: 255 })
  brand: string;

  @Column({ type: 'varchar', name: 'model', length: 255 })
  model: string;

  @Column({ type: 'varchar', name: 'country', length: 255 })
  country: string;

  @Column({ type: 'varchar', name: 'language', length: 255 })
  language: string;

  @Column({ type: 'varchar', name: 'ip', length: 255 })
  ip: string;

  @Column({ type: 'varchar', name: 'view_code', length: 255 })
  viewCode: string;

  @Column({ type: 'varchar', name: 'token', nullable: true, length: 255 })
  token: string;

  @Column('text', { name: 'originalUrl', nullable: true })
  originalUrl: string;

  @Column({ type: 'varchar', name: 'send_time', nullable: true, length: 255 })
  sendTime: string;

  @Column('text', { name: 'send_url', nullable: true })
  sendUrl: string;

  @Column({ type: 'varchar', name: 'pub_id', nullable: true, length: 255 })
  pubId: string;

  @Column({ type: 'varchar', name: 'sub_id', nullable: true, length: 255 })
  subId: string;

  @Column('datetime', {
    name: 'created_at',
    default: () => "'CURRENT_TIMESTAMP(6)'",
  })
  createdAt: Date;
}
