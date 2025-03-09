/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { encode } from 'next-auth/jwt';
import { env } from '../../src/env.mjs';
import { type Page } from '@playwright/test';

const login = async (page: Page) => {
  const token = await encode({
    token: {
      name: 'Tester McTest',
      email: 'Test@example.com',
      picture: 'https://github.com/mona.png',
      sub: '1',
      userId: 1,
      role: 'admin',
    },
    secret: env.NEXTAUTH_SECRET || 'default_secret',
  });

  await page.context().addCookies([
    {
      name: 'next-auth.session-token',
      value: token,
      domain: 'dev',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax' as const,
      secure: true,
      expires: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    },
  ]);
  return page;
};

const logout = async (page: Page) => {
  await page.goto('/auth/logout');
  return page;
};

export { login, logout };
