import * as dotenv from 'dotenv';
import { connect, disconnect, model, Model } from 'mongoose';
import { createHash } from 'crypto';
import { Admin, AdminSchema } from '../entities/admin.entity';

dotenv.config();

async function seedAdmin() {
  try {
    const mongoUrl = process.env.MONGODB_URL?.trim();
    if (!mongoUrl) {
      throw new Error('MONGODB_URL is not set in environment variables');
    }

    await connect(mongoUrl);
    console.log('Connected to MongoDB');

    const AdminModel: Model<Admin> = model('Admin', AdminSchema);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@feeluxe.ng';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    const passwordHash = createHash('sha256').update(adminPassword).digest('hex');

    const existingAdmin = await AdminModel.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`Admin with email ${adminEmail} already exists. Updating password...`);
      existingAdmin.passwordHash = passwordHash;
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log('Admin password updated successfully!');
    } else {
      const admin = new AdminModel({
        name: adminName,
        email: adminEmail,
        passwordHash,
        isActive: true,
      });
      await admin.save();
      console.log('Admin created successfully!');
    }

    console.log(`\nAdmin Credentials:`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`\nYou can now login at /admin/login`);

    await disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();

