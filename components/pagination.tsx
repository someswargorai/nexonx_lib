import { FC, useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type PaginationProps = {
  totalCount: number;
  limit: number;
  currentPage: number;
  totalPages: number;
  setLimit: (val: number) => void;
  onPageChange: (page: number) => void;
  className?: string;
};

export default function PaginationBasic({  totalCount,
  limit,
  currentPage,
  totalPages,
  setLimit,
  onPageChange,
  className = ""
}:PaginationProps){
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 3) pages.push("...");
    pages.push(totalPages);
  }

  const startEntry = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endEntry = Math.min(currentPage * limit, totalCount);

  const baseBtn =
    "h-9 min-w-9 px-2 flex items-center justify-center text-sm font-medium rounded-md border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 active:bg-zinc-100 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none select-none";

  const activeBtn =
    "h-9 min-w-9 px-2 flex items-center justify-center text-sm font-semibold rounded-md bg-zinc-900 text-white border border-zinc-900 shadow-sm transition-all duration-200 select-none";

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 border border-zinc-200 rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] ${className}`}
    >
  
      <div className="flex items-center gap-1.5">
        <button
          className={baseBtn}
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          title="First Page"
        >
          <ChevronsLeft size={16} strokeWidth={2} />
        </button>

        <button
          className={baseBtn}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          title="Previous Page"
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>

        <div className="flex items-center gap-1.5 mx-1">
          {pages.map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} className="flex items-center justify-center w-9 h-9 text-zinc-400">
                <MoreHorizontal size={16} strokeWidth={2} />
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={p === currentPage ? activeBtn : baseBtn}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          className={baseBtn}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          title="Next Page"
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>

        <button
          className={baseBtn}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          title="Last Page"
        >
          <ChevronsRight size={16} strokeWidth={2} />
        </button>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-6 text-sm text-zinc-500">
       
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdown(!dropdown)}
            className="h-9 px-3 flex items-center gap-2 border border-zinc-200 rounded-md bg-white hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-200 text-zinc-700 font-medium group"
          >
            <span className="text-zinc-400 font-normal">Show:</span>
            {limit}
            <ChevronDown 
              size={14} 
              className={`transition-transform duration-200 text-zinc-400 group-hover:text-zinc-600 ${dropdown ? "rotate-180" : ""}`} 
            />
          </button>

          <AnimatePresence>
            {dropdown && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 bottom-full sm:bottom-full mb-2 sm:mb-0 sm:mt-2 w-32 bg-white border border-zinc-200 rounded-lg shadow-xl overflow-hidden z-50 p-1"
              >
                {[10, 20, 30, 50, 100].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setLimit(n);
                      onPageChange(1);
                      setDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      n === limit 
                        ? "bg-zinc-900 text-white font-medium" 
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    {n} per page
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      <div className="hidden xs:block whitespace-nowrap">
          <span className="text-zinc-400">Showing</span>{" "}
          <span className="font-semibold text-zinc-900">{startEntry}</span>
          <span className="text-zinc-400 mx-1">-</span>
          <span className="font-semibold text-zinc-900">{endEntry}</span>{" "}
          <span className="text-zinc-400">of</span>{" "}
          <span className="font-semibold text-zinc-900">{totalCount}</span>
        </div>
      </div>
    </div>
  );
};


