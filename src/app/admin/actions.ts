'use server';

import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export async function updateMatchScore(matchId: string, homeScore: number | null, awayScore: number | null) {
  // Verify token again just in case
  const cookieStore = await cookies();
  if (cookieStore.get('admin_token')?.value !== 'true') {
    throw new Error('Unauthorized');
  }

  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore: homeScore,
      awayScore: awayScore,
    }
  });

  return { success: true };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  redirect('/admin/login');
}
