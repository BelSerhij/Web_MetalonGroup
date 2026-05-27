import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.fencePost.deleteMany();
  await prisma.fenceLag.deleteMany();
  await prisma.fenceScrew.deleteMany();

  // =========================
  // ПРОФНАСТИЛ С-10
  // =========================

  await prisma.product.create({
    data: {
      title: 'Профнастил С-10',
      slug: 'profnastyl-s10',
      description: 'Профнастил для парканів та фасадів',
      category: 'Профнастил',
      image: '/Products/prof7016.jpg',
      unit: 'м²',

      usefulWidth: 1.16,
      fullWidth: 1.20,

      variants: {
        create: [

          {
            thickness: 0.40,
            color: 'RAL 8017',
            coating: 'Gloss',
            paintingType: 'OneSide',
            metalBrand: 'POLYSTEEL (Україна)',
            zincContent: 100,
            price: 260,
          },

          {
            thickness: 0.45,
            color: 'RAL 7016',
            coating: 'Matt',
            paintingType: 'TwoSide',
            metalBrand: 'U.S. Steel (Словаччина)',
            zincContent: 140,
            price: 340,
          },

          {
            thickness: 0.50,
            color: 'RAL 6005',
            coating: 'Matt',
            paintingType: 'TwoSide',
            metalBrand: 'ArcelorMittal',
            zincContent: 225,
            price: 390,
          },

          {
            thickness: 0.40,
            color: 'Цинк',
            coating: 'Zinc',
            paintingType: 'OneSide',
            metalBrand: 'Модуль Україна',
            zincContent: 100,
            price: 220,
          },

        ],
      },
    },
  });

  // =========================
  // ШТАХЕТ
  // =========================

  await prisma.product.create({
    data: {
      title: 'Штахет металевий',
      slug: 'shtahet-metalevyi',
      description: 'Металевий штахет для огорож',
      category: 'Штахет',
      image: '/Products/shtahet.jpg',
      unit: 'м.п.',

      usefulWidth: 0.11,
      fullWidth: 0.11,

      variants: {
        create: [

          {
            thickness: 0.40,
            color: 'RAL 8017',
            coating: 'Gloss',
            paintingType: 'OneSide',
            metalBrand: 'POLYSTEEL (Україна)',
            zincContent: 100,
            price: 42,
          },

          {
            thickness: 0.45,
            color: 'RAL 7024',
            coating: 'Matt',
            paintingType: 'TwoSide',
            metalBrand: 'ArcelorMittal',
            zincContent: 140,
            price: 58,
          },

        ],
      },
    },
  });

  // =========================
  // МЕТАЛОЧЕРЕПИЦЯ MODERN
  // =========================

  await prisma.product.create({
    data: {
      title: 'Металочерепиця Modern',
      slug: 'metalocherepytsya-modern',
      description: 'Сучасна металочерепиця',
      category: 'Металочерепиця',
      image: '/Products/Milana.jpg',
      unit: 'м²',

      usefulWidth: 1.10,
      fullWidth: 1.16,

      variants: {
        create: [

          {
            thickness: 0.45,
            color: 'RAL 8017',
            coating: 'Matt',
            paintingType: 'TwoSide',
            metalBrand: 'U.S. Steel',
            zincContent: 140,
            price: 420,
          },

          {
            thickness: 0.50,
            color: 'RAL 7024',
            coating: 'Matt',
            paintingType: 'TwoSide',
            metalBrand: 'ArcelorMittal',
            zincContent: 225,
            price: 490,
          },

        ],
      },
    },
  });

// POSTS
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

  // LAGS
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

  // SCREWS
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

}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {

    console.error(e);

    await prisma.$disconnect();

    process.exit(1);

  });