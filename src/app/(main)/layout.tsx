import Navbar from 'app/components/Navbar';
import { ReactNode } from 'react';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
 

  return (
    <div>
      <Navbar  />
      <main className="main">{children}</main>
    </div>
  );
}

export default RootLayout;
