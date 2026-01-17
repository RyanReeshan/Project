const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      name: 'Classic White T-Shirt',
      category: 'T-Shirts',
      price: 25.0,
      size: 'M',
      color: 'White',
      stock: 50,
      sku: 'TSH-001',
      barcode: '100001',
    },
    {
      name: 'Slim Fit Blue Jeans',
      category: 'Jeans',
      price: 59.99,
      size: '32',
      color: 'Blue',
      stock: 30,
      sku: 'JNS-001',
      barcode: '100002',
    },
    {
      name: 'Summer Floral Dress',
      category: 'Dresses',
      price: 45.0,
      size: 'S',
      color: 'Floral',
      stock: 15,
      sku: 'DRS-001',
      barcode: '100003',
    },
    {
      name: 'Leather Jacket',
      category: 'Jackets',
      price: 120.0,
      size: 'L',
      color: 'Black',
      stock: 10,
      sku: 'JKT-001',
      barcode: '100004',
    },
    {
      name: 'Wool Scarf',
      category: 'Accessories',
      price: 15.0,
      size: 'One Size',
      color: 'Gray',
      stock: 100,
      sku: 'ACC-001',
      barcode: '100005',
    },
    {
      name: 'Canvas Sneakers',
      category: 'Shoes',
      price: 35.0,
      size: '9',
      color: 'Red',
      stock: 25,
      sku: 'SHOE-001',
      barcode: '100006',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
  }

  console.log('Seed successful');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
