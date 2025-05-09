import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User }     from '../../user/entities/user.entity';
import { GymOwner } from '../../gym-owner/entities/gym-owner.entity';

@Entity()
export class Instructor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  cv: string;

  @Column({ nullable: true })
  link: string;

  @OneToOne(() => User, user => user.instructorProfile, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => GymOwner, owner => owner.instructors, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  gymOwner?: GymOwner;
}