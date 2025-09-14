import { withAuth } from 'next-auth/middleware';

export default withAuth(
  (middleware = (req) => {
    // eslint-disable-line no-unused-vars
  }),
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = { matcher: ['/forum/:path*'] };
