'use server';

import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

async function checkAuth() {
  const cookieStore = await cookies();
  if (cookieStore.get('admin_token')?.value !== 'true') {
    throw new Error('Unauthorized');
  }
}

export async function addMatchEvent(matchId: string, playerId: string, type: string, minute: string) {
  await checkAuth();
  
  await prisma.matchEvent.create({
    data: {
      matchId,
      playerId,
      type,
      minute
    }
  });
  return { success: true };
}

export async function removeMatchEvent(eventId: string) {
  await checkAuth();
  await prisma.matchEvent.delete({
    where: { id: eventId }
  });
  return { success: true };
}

export async function setLineup(matchId: string, teamId: string, playerIds: string[], isStartingEleven: boolean) {
  await checkAuth();
  
  // First, remove existing lineup for this match, team, and starting/bench status
  await prisma.lineup.deleteMany({
    where: {
      matchId,
      teamId,
      isStartingEleven
    }
  });

  // Then add the new players
  if (playerIds.length > 0) {
    const data = playerIds.map(id => ({
      matchId,
      teamId,
      playerId: id,
      isStartingEleven
    }));
    await prisma.lineup.createMany({
      data
    });
  }

  return { success: true };
}
