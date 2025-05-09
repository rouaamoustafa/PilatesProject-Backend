import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user/entities/user.entity';
import { GymOwner } from './gym-owner/entities/gym-owner.entity';
import { Instructor } from './instructor/entities/instructor.entity';
import { Location } from './location/entities/location.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Instructor, GymOwner,Location],
  synchronize: false,
});

async function seedSuperAdmin() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);

  const existing = await userRepo.findOneBy({ email: 'superadmin@example.com' });
  if (existing) {
    console.log('✅ Superadmin already exists');
    process.exit(0);
  }

  const password = await bcrypt.hash('Super@123', 10);

  const superAdmin = userRepo.create({
    full_name: 'Super Admin',
    email: 'superadmin@example.com',
    password,
    role: 'superadmin',
  });

  await userRepo.save(superAdmin);
  console.log('🚀 Superadmin created successfully');
  process.exit(0);
}

seedSuperAdmin();
