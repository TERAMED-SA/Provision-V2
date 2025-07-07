import Link from 'next/link';
import { Button } from '../components/ui/button';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <header className="fixed top-0 left-0 w-full flex items-center h-16 px-4 bg-white/80 dark:bg-gray-900/80 shadow-md z-50 backdrop-blur">
        <Button asChild variant="ghost" className="flex items-center gap-2 text-base font-medium">
          <Link href="/">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </Link>
        </Button>
      </header>
      <div className="flex flex-col items-center justify-center gap-6 h-screen w-full pt-16">
        <Image
          src="/404.png"
          alt="Página não encontrada"
          width={340}
          height={220}
          priority
        />
        <h1 className="text-7xl font-extrabold text-gray-800 dark:text-gray-100 mb-2 drop-shadow-lg">
          404
        </h1>
        <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">
          Oops! Página não encontrada.<br />
          Talvez o endereço esteja incorreto ou a página foi removida.
        </h2>
      </div>
    </>
  );
}