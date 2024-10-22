import { type UserRole } from '~/server/api/types';

export const checkUserRole = async (id: number): Promise<UserRole> => {
  const idString = id.toString();
  const response = await fetch('http://hytkybot:3000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user: idString }),
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
