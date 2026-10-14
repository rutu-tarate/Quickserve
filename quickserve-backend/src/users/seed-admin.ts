import 'dotenv/config';
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

import {
  User,
  UserSchema,
} from './schemas/user.schema';

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log('MongoDB connected');

    const UserModel =
      mongoose.models.User ||
      mongoose.model(User.name, UserSchema);

    const existingAdmin = await UserModel.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existingAdmin) {
      console.log('Admin already exists');
      await mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD!,
      10,
    );

    await UserModel.create({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      mobile: process.env.ADMIN_MOBILE,
      password: hashedPassword,
      role: 'ADMIN',
      status: true,
    });

    console.log('✅ Admin created successfully');
    console.log(`Email: ${process.env.ADMIN_EMAIL}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Admin creation failed:', error);
    await mongoose.disconnect();
  }
}

seedAdmin();