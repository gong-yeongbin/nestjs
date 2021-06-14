import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { PostBackDaily } from './PostBackDaily';

export interface PostBackUnregisteredEventMetaData {
  event_name: string;
  event_count?: number;
  postBackDaily: PostBackDaily;
}

@Entity('postback_unregistered_event')
export class PostBackUnregisteredEvent {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'idx' })
  idx: number;

  @Column({ type: 'nvarchar', name: 'event_name' })
  event_name: string;

  @Column({ type: 'bigint', name: 'event_count', default: 1 })
  event_count: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(
    () => PostBackDaily,
    (postBackDaily) => postBackDaily.postBackUnregisteredEvent,
  )
  postBackDaily: PostBackDaily;
}
