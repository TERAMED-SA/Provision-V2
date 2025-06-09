import Link from 'next/link';
import { Button } from '../components/ui/button';
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 h-screen b dark:bg-gray-900">
     
        <h1 className="text-7xl font-bold text-gray-800 dark:text-gray-100 mb-2">
       404

        </h1>
           <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Página Não Encontrada
        </h2>
        <Button
        variant={'outline'}  asChild>
          <Link href="/" >
            Voltar 
          </Link>
        </Button>
     
    </div>
  );
}