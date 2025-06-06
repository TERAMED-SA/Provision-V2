"use client"

import { useState, useEffect, useRef } from "react"
import { File, Search, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTrigger
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator
} from "../ui/command"

const MOCK_DATA = [
  { id: 1, email: "joao@email.com", category: "Usuários" },
  { id: 2, email: "maria@email.com", category: "Usuários" },

]

export default function SearchDialog() {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchData = () => {
    return MOCK_DATA
  }

  const data = fetchData()

  const getFilteredResults = () => {
    if (!query) return []
    return data.filter(
      (item) =>
        item.email?.toLowerCase().includes(query.toLowerCase()) ||
        item.name?.toLowerCase().includes(query.toLowerCase()),
    )
  }

  const filteredResults = getFilteredResults()
  const groupedResults = filteredResults.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, typeof filteredResults>,
  )

  useEffect(() => {
    if (dialogOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [dialogOpen])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Search className="h-5 w-5 text-foreground dark:text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-4 bg-background dark:bg-zinc-900">
        <div className="p-4 pb-0">
          <div className="flex items-center relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-zinc-400 h-4 w-4" />
            <Input
              ref={inputRef}
              placeholder="Pesquisar..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setOpen(true)
              }}
              className="pl-10 pr-12 py-6 w-full border rounded-md outline-none bg-background dark:bg-zinc-800 text-foreground dark:text-white focus:outline-none focus:ring-0 focus-visible:ring-1 focus-visible:border-primary"
            />
            {query && (
              <button
                className="absolute right-3 text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:hover:text-white"
                onClick={() => {
                  setQuery("")
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <Command className="rounded-t-none border-t-0 bg-background dark:bg-zinc-900 text-foreground dark:text-white">
          <CommandList className="max-h-[400px] overflow-auto">
            {query && filteredResults.length === 0 ? (
              <CommandEmpty className="text-muted-foreground dark:text-zinc-400 text-center">
                Nenhum resultado encontrado.
              </CommandEmpty>
            ) : (
              Object.entries(groupedResults).map(([category, items], index, array) => (
                <div key={category}>
                  <CommandGroup heading={category}>
                    {items.map((item) => (
                      <CommandItem
                        key={item.id}
                        className="flex items-center gap-2 px-4 py-2 cursor-pointer text-foreground dark:text-white hover:bg-muted dark:hover:bg-zinc-800"
                      >
                        {category === "Usuários" ? (
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-muted dark:bg-zinc-700 flex items-center justify-center text-white">
                              {item.email?.charAt(0).toUpperCase()}
                            </div>
                            <span>{item.email}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-md bg-muted dark:bg-zinc-700 flex items-center justify-center text-white">
                              <File size={16} />
                            </div>
                            <span>{item.name}</span>
                          </div>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {index < array.length - 1 && <CommandSeparator />}
                </div>
              ))
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
