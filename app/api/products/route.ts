import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const products =
    await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

  return NextResponse.json(products);
}