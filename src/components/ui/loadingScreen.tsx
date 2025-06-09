
import { Loader2 } from "lucide-react";

export default function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6 text-gray-700 animate-fade-in">
        <img src="/logo.png" alt="Logo" className="h-20 w-20 md:w-48 md:h-48 object-contain"  />

        <p className="text-lg text-zinc-600">{message}</p>
        <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
      </div>
    </div>
  );
}
