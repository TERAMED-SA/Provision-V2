import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../ui/dialog";
import { cn } from "@/lib/utils";

interface GenericDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  icon?: React.ElementType;
  className?: string;
}

export function GenericDetailModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footerContent,
  icon: Icon,
  className,
}: GenericDetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("p-0 max-h-[90vh] flex flex-col max-w-7xl", className)}>
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-lg font-semibold">
              {Icon && <Icon className="h-6 w-6 text-primary" />}
              {title}
            </DialogTitle>
        
          </div>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </DialogHeader>
        
        <div className="px-6 py-2 overflow-y-auto flex-grow bg-muted/10 dark:bg-muted/20">
          <div className="space-y-4">
            {children}
          </div>
        </div>

        {footerContent && (
          <DialogFooter className="p-6 pt-4 mt-auto bg-muted/50">
            {footerContent}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
} 