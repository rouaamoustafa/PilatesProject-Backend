import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Instructor } from '../../instructor/entities/instructor.entity';
import { GymOwner }   from '../../gym-owner/entities/gym-owner.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  full_name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column()
  role: 'superadmin' | 'admin' | 'gym_owner' | 'instructor' | 'subscriber';

  @CreateDateColumn()
  created_at: Date;

  @OneToOne(() => Instructor, instructor => instructor.user, {
    cascade: ['insert', 'update'],
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  instructorProfile?: Instructor;

  @OneToOne(() => GymOwner, owner => owner.user, {
    cascade: ['insert', 'update'],
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  gymOwnerProfile?: GymOwner;
}