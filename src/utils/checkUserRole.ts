import { type UserRole } from '~/server/api/types';
import { env } from '~/env.mjs';

/** @param id Telegram user ID, as a string (the ID token's `id` claim). */
export const checkUserRole = async (id: string): Promise<UserRole> => {
  const response = await fetch(env.HYTKYBOT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user: id }),
  });

  const json = (await response.json()) as { role: string };

  if (Object.keys(json).length === 0 || Object.keys(json).includes('error')) {
    throw new Error('Problem with hytkybot');
  }

  const role = json.role as UserRole; // Type assertion

  if (role !== 'admin' && role !== 'active' && role !== 'nakki') {
    throw new Error('Invalid user role');
  }

  return role;
};
