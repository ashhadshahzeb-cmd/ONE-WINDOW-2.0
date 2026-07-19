import { useEffect, useState } from "react";
import { Command } from "cmdk";
import Fuse from "fuse.js";
import { Search, FileText } from "lucide-react";
import { db } from "@/lib/db";

interface CommandPaletteProps {
  onSelectRecord: (record: any) => void;
}

export function CommandPalette({ onSelectRecord }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch local records
  useEffect(() => {
    if (open && records.length === 0) {
      db.records.toArray().then(setRecords);
    }
  }, [open]);

  const [totalMatches, setTotalMatches] = useState(0);

  // Fuzzy search
  useEffect(() => {
    if (!search) {
      setResults(records.slice(0, 1000));
      setTotalMatches(records.length);
      return;
    }
    const fuse = new Fuse(records, {
      keys: ['subject', 'cfo_diary_number', 'receiving_number', 'received_from'],
      threshold: 0.5,
      ignoreLocation: true,
      minMatchCharLength: 2
    });
    const matches = fuse.search(search);
    setTotalMatches(matches.length);
    setResults(matches.map(r => r.item).slice(0, 1000));
  }, [search, records]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <Command shouldFilter={false} label="Command Menu" className="w-full h-full flex flex-col">
          <div className="flex items-center px-4 border-b border-white/10 h-14">
            <Search className="w-5 h-5 text-emerald-400 shrink-0 mr-3" />
            <Command.Input
              autoFocus
              value={search}
              onValueChange={setSearch}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/40 h-full w-full"
              placeholder="Search files by subject, diary no, sender..."
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false);
              }}
            />
            <div className="text-[10px] font-bold text-white/30 bg-white/5 px-2 py-1 rounded">ESC</div>
          </div>
          {search && (
            <div className="px-4 py-2 bg-slate-900/50 border-b border-white/5 text-xs font-bold text-emerald-400/80">
              Found {totalMatches} entries {totalMatches > 1000 ? "(Showing top 1000)" : ""}
            </div>
          )}
          <Command.List className="max-h-[300px] overflow-y-auto p-2 no-scrollbar">
            {results.length === 0 && <Command.Empty className="p-8 text-center text-white/40">No results found.</Command.Empty>}
            {results.map((record) => (
              <Command.Item
                key={record.id}
                onSelect={() => {
                  setOpen(false);
                  onSelectRecord(record);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer aria-selected:bg-emerald-500/20 aria-selected:text-white text-white/70 hover:bg-white/5 transition-colors group outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <FileText className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-bold text-white truncate">{record.subject}</div>
                  <div className="text-[10px] text-white/50">{record.cfo_diary_number} &bull; {record.received_from}</div>
                </div>
                <div className="text-[10px] bg-black/40 px-2 py-1 rounded uppercase font-bold tracking-widest text-emerald-400 group-aria-selected:bg-emerald-500 group-aria-selected:text-white">
                  Jump
                </div>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
