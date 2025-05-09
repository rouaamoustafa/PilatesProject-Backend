import 'dotenv/config'; // ✅ This will load the .env file automatically
import { DataSource } from 'typeorm';
import { User } from './user/entities/user.entity';
import { Instructor } from './instructor/entities/instructor.entity'; 
import { GymOwner } from './gym-owner/entities/gym-owner.entity';
import { Location } from './location/entities/location.entity';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, 
  entities: [User,Instructor,GymOwner,Location],
  migrations: ['src/migrations/*{.ts,.js}'],
});

