'use server'

import { prisma } from './prisma';
import { revalidatePath } from 'next/cache';

export async function getProducts() {
  try {
    return await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export async function addProduct(data: any) {
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        category: data.category,
        price: parseFloat(data.price),
        size: data.size,
        color: data.color,
        stock: parseInt(data.stock),
        sku: data.sku,
        barcode: data.barcode,
        image: data.image,
      },
    });
    revalidatePath('/inventory');
    revalidatePath('/pos');
    return { success: true, product };
  } catch (error) {
    console.error('Failed to add product:', error);
    return { success: false, error: 'Failed to add product' };
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        price: parseFloat(data.price),
        size: data.size,
        color: data.color,
        stock: parseInt(data.stock),
        sku: data.sku,
        barcode: data.barcode,
        image: data.image,
      },
    });
    revalidatePath('/inventory');
    revalidatePath('/pos');
    return { success: true, product };
  } catch (error) {
    console.error('Failed to update product:', error);
    return { success: false, error: 'Failed to update product' };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath('/inventory');
    revalidatePath('/pos');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete product:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}

export async function createSale(data: {
  items: { productId: string; quantity: number; price: number }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  tenderedAmount: number;
  changeAmount: number;
  paymentMethod: string;
  customerId?: string;
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the sale
      const sale = await tx.sale.create({
        data: {
          subtotal: data.subtotal,
          tax: data.tax,
          discount: data.discount,
          total: data.total,
          tenderedAmount: data.tenderedAmount,
          changeAmount: data.changeAmount,
          status: 'COMPLETED',
          paymentMethod: data.paymentMethod,
          customerId: data.customerId,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      // 2. Update stock for each product
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 3. Update customer loyalty points if customerId provided
      if (data.customerId) {
        const pointsEarned = Math.floor(data.total); // 1 point per Rs. 1
        await tx.customer.update({
          where: { id: data.customerId },
          data: {
            loyaltyPoints: {
              increment: pointsEarned,
            },
          },
        });
      }

      return sale;
    });

    revalidatePath('/pos');
    revalidatePath('/inventory');
    revalidatePath('/reports');
    revalidatePath('/');
    return { success: true, sale: result };
  } catch (error) {
    console.error('Failed to create sale:', error);
    return { success: false, error: 'Failed to complete checkout' };
  }
}

export async function getSales() {
  try {
    return await prisma.sale.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
      orderBy: { timestamp: 'desc' },
    });
  } catch (error) {
    console.error('Failed to fetch sales:', error);
    return [];
  }
}

export async function refundSale(saleId: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get the sale details
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: { items: true },
      });

      if (!sale) throw new Error('Sale not found');
      if (sale.status === 'REFUNDED') throw new Error('Sale already refunded');

      // 2. Update sale status
      await tx.sale.update({
        where: { id: saleId },
        data: { status: 'REFUNDED' },
      });

      // 3. Restore stock
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // 4. Deduct loyalty points
      if (sale.customerId) {
        const pointsToDeduct = Math.floor(sale.total);
        await tx.customer.update({
          where: { id: sale.customerId },
          data: {
            loyaltyPoints: {
              decrement: pointsToDeduct,
            },
          },
        });
      }

      return { success: true };
    });

    revalidatePath('/reports');
    revalidatePath('/inventory');
    return result;
  } catch (error: any) {
    console.error('Failed to refund sale:', error);
    return { success: false, error: error.message };
  }
}

export async function getCustomers() {
  try {
    return await prisma.customer.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return [];
  }
}

export async function addCustomer(data: { name: string; email?: string; phone: string }) {
  try {
    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
      },
    });
    revalidatePath('/customers');
    revalidatePath('/pos');
    return { success: true, customer };
  } catch (error) {
    console.error('Failed to add customer:', error);
    return { success: false, error: 'Failed to add customer' };
  }
}
