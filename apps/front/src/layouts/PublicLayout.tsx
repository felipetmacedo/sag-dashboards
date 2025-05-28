import { Outlet } from 'react-router-dom';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
} 