import Head from 'next/head';
import { type ReactNode } from 'react';

const Layout = ({ children, title="HYTKY" }:{ children:ReactNode, title?:string }) => {

    return (
        <>
        <Head>
            <title>{title}</title>
            <meta
            name="description"
            content="Helsingin Yliopiston Teknokulttuurin Ystävät"
            />
            <link rel="icon" href="/favicon.ico" />
            <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#000000] to-[#15162c]">
        {children}
      </main>
        
        </>
    );
}

export default Layout;