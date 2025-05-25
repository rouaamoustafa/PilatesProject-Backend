import { EventBase } from '../../EventBase/event-base.entity';
import { Entity } from 'typeorm';


@Entity({ name: 'courses' })
export class Course extends EventBase {}
