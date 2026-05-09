const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu bơm dữ liệu (Seeding)...');

  // 1. Tạo Role Super Admin
  const superAdminRole = await prisma.role.upsert({
    where: { slug: 'super-admin' },
    update: {},
    create: {
      name: 'Super Admin',
      slug: 'super-admin',
      description: 'Quản trị viên cấp cao nhất, có toàn quyền hệ thống.',
    },
  });

  // 2. Tạo các Module Permissions cho Super Admin (Cấp full quyền)
  const modules = ['ROOMS', 'BOOKINGS', 'STAFF', 'CUSTOMERS', 'SETTINGS'];
  
  for (const moduleName of modules) {
    await prisma.rolePermission.upsert({
      where: {
        unique_role_module: {
          roleId: superAdminRole.id,
          module: moduleName,
        }
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        module: moduleName,
        canView: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true,
      },
    });
  }

  // 3. Tạo tài khoản Super Admin đầu tiên
  const hashedPassword = await bcrypt.hash('admin123456', 10);
  
  const adminUser = await prisma.staff.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      roleId: superAdminRole.id,
      username: 'admin',
      email: 'admin@hotel.com',
      passwordHash: hashedPassword,
      fullName: 'Quản trị viên tối cao',
      phone: '0987654321',
    },
  });

  console.log('Seeding thành công! Tài khoản Admin:');
  console.log(`Username: ${adminUser.username}`);
  console.log(`Password: admin123456`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });