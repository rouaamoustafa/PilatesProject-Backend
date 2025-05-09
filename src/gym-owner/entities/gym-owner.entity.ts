import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Location } from '../../location/entities/location.entity';
import { Instructor } from '../../instructor/entities/instructor.entity';

@Entity('gym_owner')
export class GymOwner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  phone: string;

  @OneToOne(() => Location, loc => loc.gymOwner, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  address: Location;

  @OneToOne(() => User, user => user.gymOwnerProfile, {
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @OneToMany(() => Instructor, inst => inst.gymOwner, {
    cascade: ['insert', 'update'],
  })
  instructors: Instructor[];
}
