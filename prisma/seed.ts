import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword } from '../lib/password';

const prisma = new PrismaClient();

async function main() {
  const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  if (!initialAdminPassword || initialAdminPassword.length < 12) {
    throw new Error('Set INITIAL_ADMIN_PASSWORD to a unique password of at least 12 characters before seeding');
  }
  console.log('🌱 Seeding database...');

  // ============================================
  // CLEAN DATABASE
  // ============================================

  console.log('🗑 Cleaning database...');

  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.order.deleteMany();
  await prisma.production.deleteMany();
  await prisma.metalCoil.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.user.deleteMany();
  await prisma.fencePost.deleteMany();
  await prisma.fenceLag.deleteMany();
  await prisma.fenceScrew.deleteMany();

  console.log('✅ Database cleaned');

  // ============================================
  // USERS
  // ============================================

  const admin = await prisma.user.create({
    data: {
      name: 'Адміністратор',
      email: 'admin@metalon.ua',
      passwordHash: await hashPassword(initialAdminPassword),
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  console.log('👤 Admin created');

  // ============================================
  // SUPPLIERS
  // ============================================

  const polysteel = await prisma.supplier.create({
    data: {
      name: 'POLYSTEEL',
      phone: '+380670000001',
      email: 'sales@polysteel.ua',
      companyName: 'POLYSTEEL',
      edrpou: '12345678',
      address: 'Україна',
      note: 'Основний постачальник металу.',
    },
  });

  const moduleUkraine = await prisma.supplier.create({
    data: {
      name: 'Модуль Україна',
      phone: '+380670000002',
      email: 'office@module.ua',
      companyName: 'Модуль Україна',
      edrpou: '87654321',
      address: 'Україна',
      note: 'Постачальник оцинкованого металу.',
    },
  });

  const arcelorMittal = await prisma.supplier.create({
    data: {
      name: 'ArcelorMittal',
      companyName: 'ArcelorMittal',
      address: 'Європа',
      note: 'Постачальник металу преміум сегменту.',
    },
  });

  console.log('🏭 Suppliers created');

  // ============================================
  // WAREHOUSES
  // ============================================

  const mainWarehouse = await prisma.warehouse.create({
    data: {
      name: 'Основний склад',
      code: 'MAIN',
      address: 'Україна',
      isActive: true,
    },
  });

  const productionWarehouse = await prisma.warehouse.create({
    data: {
      name: 'Виробництво',
      code: 'PRODUCTION',
      address: 'Виробничий цех',
      isActive: true,
    },
  });

  console.log('🏢 Warehouses created');

  // ============================================
  // PRODUCTS
  // ============================================

  const profnastilS10 = await prisma.product.create({
    data: {
      title: 'Профнастил С-10',
      slug: 'profnastyl-s10',
      description:
        'Профнастил С-10 для парканів, фасадів та інших конструкцій.',
      category: 'Профнастил',
      image: '/Products/prof7016.jpg',
      unit: 'м²',
      usefulWidth: 1.16,
      fullWidth: 1.2,

      variants: {
        create: [
          {
            thickness: 0.4,
            color: 'RAL 8017',
            coating: 'Gloss',
            paintingType: 'OneSide',
            metalBrand: 'POLYSTEEL (Україна)',
            zincContent: 100,
            price: 260,
            inStock: true,
          },
          {
            thickness: 0.45,
            color: 'RAL 7016',
            coating: 'Matt',
            paintingType: 'TwoSide',
            metalBrand: 'U.S. Steel (Словаччина)',
            zincContent: 140,
            price: 340,
            inStock: true,
          },
          {
            thickness: 0.45,
            color: 'RAL 7016',
            coating: 'Matt',
            paintingType: 'TwoSide',
            metalBrand: 'POLYSTEEL (Україна)',
            zincContent: 100,
            price: 260,
            inStock: true,
          },
          {
            thickness: 0.45,
            color: 'RAL 7024',
            coating: 'Matt',
            paintingType: 'TwoSide',
            metalBrand: 'POLYSTEEL (Україна)',
            zincContent: 100,
            price: 280,
            inStock: true,
          },
          {
            thickness: 0.45,
            color: 'RAL 8019',
            coating: 'Matt',
            paintingType: 'TwoSide',
            metalBrand: 'POLYSTEEL (Україна)',
            zincContent: 100,
            price: 280,
            inStock: false,
          },
          {
            thickness: 0.5,
            color: 'RAL 6005',
            coating: 'Matt',
            paintingType: 'TwoSide',
            metalBrand: 'ArcelorMittal',
            zincContent: 225,
            price: 390,
            inStock: false,
          },
          {
            thickness: 0.4,
            color: 'Цинк',
            coating: 'Zinc',
            paintingType: 'OneSide',
            metalBrand: 'Модуль Україна',
            zincContent: 100,
            price: 220,
            inStock: true,
          },
        ],
      },
    },

    include: {
      variants: true,
    },
  });

  console.log('✅ Профнастил С-10 created');

  // ============================================
  // ШТАХЕТ
  // ============================================

  const shtahet = await prisma.product.create({
    data: {
      title: 'Штахет металевий',
      slug: 'shtahet-metalevyi',
      description:
        'Металевий штахет для сучасних огорож.',
      category: 'Штахет',
      image: '/Products/shtahet.jpg',
      unit: 'м.п.',
      usefulWidth: 0.11,
      fullWidth: 0.11,

      variants: {
        create: [
          {
            thickness: 0.4,
            color: 'RAL 8017',
            coating: 'Gloss',
            paintingType: 'OneSide',
            metalBrand: 'POLYSTEEL (Україна)',
            zincContent: 100,
            price: 42,
            inStock: true,
          },
          {
            thickness: 0.45,
            color: 'RAL 7024',
            coating: 'Matt',
            paintingType: 'TwoSide',
            metalBrand: 'ArcelorMittal',
            zincContent: 140,
            price: 58,
            inStock: false,
          },
          {
            thickness: 0.45,
            color: 'RAL 7016',
            coating: 'Matt',
            paintingType: 'TwoSide',
            metalBrand: 'POLYSTEEL (Україна)',
            zincContent: 100,
            price: 52,
            inStock: true,
          },
        ],
      },
    },

    include: {
      variants: true,
    },
  });

  console.log('✅ Штахет created');

  // ============================================
  // МЕТАЛОЧЕРЕПИЦЯ MODERN
  // ============================================

  const metalTileModern = await prisma.product.create({
    data: {
      title: 'Металочерепиця Modern',
      slug: 'metalocherepytsya-modern',
      description:
        'Сучасна металочерепиця для покрівлі.',
      category: 'Металочерепиця',
      image: '/Products/Milana.jpg',
      unit: 'м²',
      usefulWidth: 1.1,
      fullWidth: 1.16,

      variants: {
        create: [
          {
            thickness: 0.45,
            color: 'RAL 8017',
            coating: 'Matt',
            paintingType: 'TwoSide',
            metalBrand: 'U.S. Steel (Словаччина)',
            zincContent: 140,
            price: 420,
            inStock: true,
          },
          {
            thickness: 0.5,
            color: 'RAL 7024',
            coating: 'Matt',
            paintingType: 'TwoSide',
            metalBrand: 'ArcelorMittal',
            zincContent: 225,
            price: 490,
            inStock: false,
          },
        ],
      },
    },

    include: {
      variants: true,
    },
  });

  console.log('✅ Металочерепиця created');

  // ============================================
  // GET PRODUCT VARIANTS
  // ============================================

  const s10BrownVariant = profnastilS10.variants.find(
    (variant) =>
      variant.color === 'RAL 8017' &&
      Number(variant.thickness) === 0.4
  );

  const s10GraphiteVariant = profnastilS10.variants.find(
    (variant) =>
      variant.color === 'RAL 7016' &&
      variant.metalBrand === 'POLYSTEEL (Україна)'
  );

  const s10AnthraciteVariant = profnastilS10.variants.find(
    (variant) => variant.color === 'RAL 7024'
  );

  const s10ZincVariant = profnastilS10.variants.find(
    (variant) => variant.color === 'Цинк'
  );

  if (
    !s10BrownVariant ||
    !s10GraphiteVariant ||
    !s10AnthraciteVariant ||
    !s10ZincVariant
  ) {
    throw new Error(
      '❌ Не вдалося знайти необхідні ProductVariant'
    );
  }

  // ============================================
  // METAL COILS
  // ============================================

  const brownCoil = await prisma.metalCoil.create({
    data: {
      code: 'COIL-8017-001',
      supplierId: polysteel.id,
      color: 'RAL 8017',
      thickness: 0.4,
      coating: 'Gloss',
      paintingType: 'OneSide',
      metalBrand: 'POLYSTEEL (Україна)',
      zincContent: 100,
      width: 1.2,
      initialWeight: 5000,
      currentWeight: 3200,
      initialLength: 1300,
      currentLength: 832,
      purchasePrice: 350000,
      purchasePricePerKg: 70,
      status: 'IN_USE',
    },
  });

  const graphiteCoil = await prisma.metalCoil.create({
    data: {
      code: 'COIL-7016-001',
      supplierId: polysteel.id,
      color: 'RAL 7016',
      thickness: 0.45,
      coating: 'Matt',
      paintingType: 'TwoSide',
      metalBrand: 'POLYSTEEL (Україна)',
      zincContent: 100,
      width: 1.2,
      initialWeight: 5000,
      currentWeight: 2800,
      initialLength: 1160,
      currentLength: 650,
      purchasePrice: 420000,
      purchasePricePerKg: 84,
      status: 'IN_USE',
    },
  });

  const anthraciteCoil = await prisma.metalCoil.create({
    data: {
      code: 'COIL-7024-001',
      supplierId: polysteel.id,
      color: 'RAL 7024',
      thickness: 0.45,
      coating: 'Matt',
      paintingType: 'TwoSide',
      metalBrand: 'POLYSTEEL (Україна)',
      zincContent: 100,
      width: 1.2,
      initialWeight: 5000,
      currentWeight: 5000,
      initialLength: 1160,
      currentLength: 1160,
      purchasePrice: 420000,
      purchasePricePerKg: 84,
      status: 'IN_STOCK',
    },
  });

  const zincCoil = await prisma.metalCoil.create({
    data: {
      code: 'COIL-ZINC-001',
      supplierId: moduleUkraine.id,
      color: 'Цинк',
      thickness: 0.4,
      coating: 'Zinc',
      paintingType: 'OneSide',
      metalBrand: 'Модуль Україна',
      zincContent: 100,
      width: 1.2,
      initialWeight: 4000,
      currentWeight: 2100,
      initialLength: 1040,
      currentLength: 546,
      purchasePrice: 260000,
      purchasePricePerKg: 65,
      status: 'IN_USE',
    },
  });

  const greenCoil = await prisma.metalCoil.create({
    data: {
      code: 'COIL-6005-001',
      supplierId: arcelorMittal.id,
      color: 'RAL 6005',
      thickness: 0.5,
      coating: 'Matt',
      paintingType: 'TwoSide',
      metalBrand: 'ArcelorMittal',
      zincContent: 225,
      width: 1.2,
      initialWeight: 5000,
      currentWeight: 5000,
      initialLength: 1000,
      currentLength: 1000,
      purchasePrice: 500000,
      purchasePricePerKg: 100,
      status: 'IN_STOCK',
    },
  });

  console.log('🔩 Metal coils created');

  // ============================================
  // PRODUCTION
  // ============================================

  const brownProduction = await prisma.production.create({
    data: {
      coilId: brownCoil.id,
      productId: profnastilS10.id,
      variantId: s10BrownVariant.id,
      status: 'COMPLETED',
      usedWeight: 1800,
      usedLength: 468,
      producedQuantity: 542.88,
      wasteQuantity: 3.2,
      costPrice: 180,
      note: 'Виробництво профнастилу RAL 8017.',
    },
  });

  const graphiteProduction = await prisma.production.create({
    data: {
      coilId: graphiteCoil.id,
      productId: profnastilS10.id,
      variantId: s10GraphiteVariant.id,
      status: 'COMPLETED',
      usedWeight: 2200,
      usedLength: 510,
      producedQuantity: 591.6,
      wasteQuantity: 4.5,
      costPrice: 210,
      note: 'Виробництво профнастилу RAL 7016.',
    },
  });

  const zincProduction = await prisma.production.create({
    data: {
      coilId: zincCoil.id,
      productId: profnastilS10.id,
      variantId: s10ZincVariant.id,
      status: 'COMPLETED',
      usedWeight: 1900,
      usedLength: 494,
      producedQuantity: 573.04,
      wasteQuantity: 5.1,
      costPrice: 150,
      note: 'Виробництво оцинкованого профнастилу.',
    },
  });

  console.log('🏭 Production created');

  // ============================================
  // STOCK MOVEMENTS
  // ============================================

  await prisma.stockMovement.createMany({
    data: [
      {
        warehouseId: mainWarehouse.id,
        productId: profnastilS10.id,
        variantId: s10BrownVariant.id,
        quantity: 542.88,
        type: 'PRODUCTION',
        productionId: brownProduction.id,
        note: 'Надходження після виробництва RAL 8017.',
      },
      {
        warehouseId: mainWarehouse.id,
        productId: profnastilS10.id,
        variantId: s10GraphiteVariant.id,
        quantity: 591.6,
        type: 'PRODUCTION',
        productionId: graphiteProduction.id,
        note: 'Надходження після виробництва RAL 7016.',
      },
      {
        warehouseId: mainWarehouse.id,
        productId: profnastilS10.id,
        variantId: s10ZincVariant.id,
        quantity: 573.04,
        type: 'PRODUCTION',
        productionId: zincProduction.id,
        note: 'Надходження після виробництва оцинкованого профнастилу.',
      },
      {
        warehouseId: mainWarehouse.id,
        productId: profnastilS10.id,
        variantId: s10AnthraciteVariant.id,
        quantity: 300,
        type: 'ADJUSTMENT',
        note: 'Початковий залишок RAL 7024.',
      },
    ],
  });

  console.log('📦 Stock movements created');

  // ============================================
  // CUSTOMER
  // ============================================

  const customer = await prisma.customer.create({
    data: {
      name: 'ТОВ "Будівельна компанія"',
      phone: '+380670000000',
      email: 'office@example.com',
      companyName: 'ТОВ "Будівельна компанія"',
      edrpou: '12345678',
      address: 'м. Хмельницький',
      note: 'Тестовий клієнт.',
    },
  });

  console.log('👤 Customer created');

  // ============================================
  // ORDER
  // ============================================

  const order = await prisma.order.create({
    data: {
      number: 'ORD-000001',

      customerId: customer.id,

      createdById: admin.id,

      status: 'COMPLETED',

      paymentStatus: 'PAID',

      totalAmount: 26000,

      paidAmount: 26000,

      totalCostPrice: 18000,

      note: 'Тестове замовлення.',

      items: {
        create: [
          {
            productId: profnastilS10.id,

            variantId: s10BrownVariant.id,

            quantity: 100,

            price: 260,

            costPrice: 180,

            total: 26000,
          },
        ],
      },

      payments: {
        create: [
          {
            amount: 26000,

            method: 'BANK_TRANSFER',

            note: 'Повна оплата замовлення.',
          },
        ],
      },
    },
  });

  console.log('🧾 Order created');

  // ============================================
  // SALE STOCK MOVEMENT
  // ============================================

  await prisma.stockMovement.create({
    data: {
      warehouseId: mainWarehouse.id,

      productId: profnastilS10.id,

      variantId: s10BrownVariant.id,

      quantity: -100,

      type: 'SALE',

      orderId: order.id,

      note: 'Продаж за замовленням ORD-000001.',
    },
  });

  console.log('💰 Sale stock movement created');

  // ============================================
  // FENCE POSTS
  // ============================================

  await prisma.fencePost.createMany({
    data: [
      {
        title: 'Стовп 50x50x2',
        size: '50x50',
        thickness: 2,
        length: 1,
        price: 150,
      },
      {
        title: 'Стовп 60x60x2',
        size: '60x60',
        thickness: 2,
        length: 1,
        price: 180,
      },
    ],
  });

  console.log('✅ Fence posts created');

  // ============================================
  // FENCE LAGS
  // ============================================

  await prisma.fenceLag.createMany({
    data: [
      {
        title: 'Лага 30x30x1.8',
        size: '30x30',
        thickness: 1.8,
        length: 1,
        price: 75,
      },
      {
        title: 'Лага 40x20x1.8',
        size: '40x20',
        thickness: 1.8,
        length: 1,
        price: 85,
      },
      {
        title: 'Лага 40x20x2',
        size: '40x20',
        thickness: 2,
        length: 1,
        price: 95,
      },
    ],
  });

  console.log('✅ Fence lags created');

  // ============================================
  // FENCE SCREWS
  // ============================================

  await prisma.fenceScrew.createMany({
    data: [
      {
        title: 'Саморіз 4.8x19',
        size: '4.8x19',
        price: 1.7,
      },
      {
        title: 'Саморіз 4.8x35',
        size: '4.8x35',
        price: 1.7,
      },
    ],
  });

  console.log('✅ Fence screws created');

  console.log('');
  console.log('🎉 Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('❌ Seed failed:', error);

    await prisma.$disconnect();

    process.exit(1);
  });
