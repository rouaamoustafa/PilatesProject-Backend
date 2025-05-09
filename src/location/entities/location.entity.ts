import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
} from 'typeorm';
import { GymOwner } from '../../gym-owner/entities/gym-owner.entity';

@Entity()
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  mapLink: string;

  @OneToOne(() => GymOwner, owner => owner.address)
  gymOwner: GymOwner;
}