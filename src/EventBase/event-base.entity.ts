import {
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    ManyToOne,
  } from 'typeorm';
  import { Instructor } from '../../src/instructor/entities/instructor.entity'
  import { Location }   from '../../src/location/entities/location.entity';
  
  export enum Level {
    BEGINNER     = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED     = 'advanced',
  }
  
  export enum Mode {
    ONLINE = 'online',
    ONSITE = 'onsite',
  }
  
  export abstract class EventBase extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    title: string;
  
    @ManyToOne(() => Instructor, i => i.id, {
      nullable: false,
      onDelete: 'CASCADE',
    })
    instructor: Instructor;
  
    @Column({ type: 'enum', enum: Level })
    level: Level;
  
    @Column({ type: 'enum', enum: Mode })
    mode: Mode;
  
    @ManyToOne(() => Location, l => l.id, {
      nullable: true,
      onDelete: 'SET NULL',
    })
    location?: Location;
  
    @Column('decimal', { precision: 10, scale: 2, transformer: {
      to: (v: number) => v,
      from: (v: string) => parseFloat(v),
    }})
    price: number;
  
    @Column({ type: 'date' })
    date: string;
  
    @Column({ type: 'time' })
    startTime: string;
  
    @Column('int')
    durationMinutes: number;
  }