"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, File, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Label } from "../../ui/label"

interface FileUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFileSelect: (file: File) => void
}

export default function FileUploadDialog({ open, onOpenChange, onFileSelect }: FileUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Máximo 10MB permitido.")
        return
      }

      setSelectedFile(file)

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
      }
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile)
      onOpenChange(false)
      resetDialog()
    }
  }

  const resetDialog = () => {
    setSelectedFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      resetDialog()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Arquivo</DialogTitle>
          <DialogDescription> Selecione um arquivo para enviar. Máximo 10MB.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file">Arquivo</Label>
            <Input
              ref={fileInputRef}
              id="file"
              type="file"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
            />
          </div>

          {selectedFile && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3">
                {preview ? (
                  <div className="relative">
                    <img src={preview || "/placeholder.svg"} alt="Preview" className="w-16 h-16 object-cover rounded" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                    <File className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{selectedFile?.name}</p>
                  <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button size="sm" variant="ghost" onClick={resetDialog}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile}>
            <Upload className="mr-2 h-4 w-4" />
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
