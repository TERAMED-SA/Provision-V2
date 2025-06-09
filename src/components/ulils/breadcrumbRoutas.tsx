"use client";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type BreadcrumbRoutasProps = {
  title?: string;       
  productName?: string;  
  showBackButton?: boolean; 
};

export function BreadcrumbRoutas({ title, productName, showBackButton = false }: BreadcrumbRoutasProps) {
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split("/").filter(Boolean);

  let parent = "";
  let current = "";

  if (segments.length >= 2) {
    parent = segments[segments.length - 2];
    current = segments[segments.length - 1];
  } else if (segments.length === 1) {
    current = segments[0];
  } else {
    current = "Home";
  }

  if (productName && /^[0-9a-fA-F-]{36}$/.test(current)) {
    current = productName;
  }

  const parentHref = segments.length >= 2 ? "/" + segments.slice(0, segments.length - 1).join("/") : "/";
  const formatLabel = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        {showBackButton && (
          <button onClick={handleBack} className="mr-2 cursor-pointer">
            <ChevronLeft />
          </button>
        )}
        <h1 className="text-xl font-medium font-Saira">{title}</h1>
      </div>
      <nav aria-label="breadcrumb" className="flex items-center space-x-2 text-sm">
        {parent && (
          <>
            <Link href={parentHref}>
              <span className="text-gray-500 hover:underline">{formatLabel(parent)}</span>
            </Link>
            <span> / </span>
          </>
        )}
        <span className="text-zinc-800 font-medium text-base dark:text-white">{formatLabel(current)}</span>
      </nav>
    </div>
  );
}
