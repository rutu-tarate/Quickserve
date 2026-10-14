import 'dotenv/config';
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

import {
  User,
  UserSchema,
} from './schemas/user.schema';

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log('MongoDB connected');

    const UserModel =
      mongoose.models.User ||
      mongoose.model(User.name, UserSchema);

    const hashedPassword = await bcrypt.hash(
      '123456',
      10,
    );

    const admin = await UserModel.findOneAndUpdate(
      {
        email: 'admin@quickserve.com',
      },
      {
        name: 'QuickServe Admin',
        email: 'admin@quickserve.com',
        password: hashedPassword,
        role: 'ADMIN',
        status: true,
      },
      {
        new: true,
      },
    );

    if (!admin) {
      console.log('❌ Admin not found');
    } else {
      console.log('✅ Admin password reset successfully');
      console.log('Email: admin@quickserve.com');
      console.log('Password: 123456');
      console.log('Role:', admin.role);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
}

resetAdmin();