import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('mcp_postback_install_appsflyer')
export class PostBackInstallAppsflyer {
  @PrimaryGeneratedColumn({ name: 'idx', type: 'bigint' })
  idx: number;

  @Column({ name: 'cp_token', type: 'nvarchar' })
  cpToken: string;

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

  @Column({ name: 'click_time', type: 'nvarchar', nullable: true })
  click_time: string;

  @Column({ name: 'device_carrier', type: 'nvarchar', nullable: true })
  device_carrier: string;

  @Column({ name: 'device_ip', type: 'nvarchar', nullable: true })
  device_ip: string;

  @Column({ name: 'pbUrl', type: 'text', nullable: true })
  pbUrl: string;

  @Column({ name: 'isSendDate', type: 'datetime', nullable: true })
  isSendDate: Date;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
