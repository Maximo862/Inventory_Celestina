import { useState, useEffect, useRef, useMemo } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { useDebounce } from "@/hooks/useDebounce";
import { searchClientsRequest } from "@/features/clients/api/clientsRequest";
import { useClients } from "@/features/clients/context/ClientContext";

interface ClientSearchInputProps {
  value: string;
  onChange: (clientId: string) => void;
  placeholder?: string;
}

interface SearchResult {
  id: number;
  name: string;
}

export function ClientSearchInput({
  value,
  onChange,
  placeholder = "Buscar cliente...",
}: ClientSearchInputProps) {
  const { clients } = useClients()!;
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  const selectedClient = useMemo(() => {
    if (!value) return null;
    return clients.find((c) => c.id === Number(value)) || null;
  }, [value, clients]);

  useEffect(() => {
    const searchClients = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchClientsRequest(debouncedQuery, 10);
        setResults(data);
      } catch (error) {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchClients();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (client: SearchResult) => {
    onChange(String(client.id));
    setQuery(client.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setQuery("");
    setResults([]);
  };

  const handleFocus = () => {
    if (query.trim() || results.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-lg" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={handleFocus}
          placeholder={selectedClient ? selectedClient.name : placeholder}
          className="w-full bg-white text-[#0F172A] text-lg rounded-lg p-4 pl-10 pr-10 border-2 border-[#E2E8F0] focus:border-[#4FA3D1] focus:outline-none focus:ring-4 focus:ring-[#4FA3D1]/20 transition duration-200"
        />
        {(query || value) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
          >
            <FiX className="text-xl" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-[#E2E8F0] rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-[#64748B]">Buscando...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((client) => (
                <li key={client.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(client)}
                    className="w-full px-4 py-3 text-left hover:bg-[#F8FAFC] text-[#0F172A] transition-colors"
                  >
                    {client.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : debouncedQuery.trim() ? (
            <div className="p-4 text-center text-[#64748B]">
              No se encontraron clientes
            </div>
          ) : (
            <div className="p-4 text-center text-[#64748B]">
              Escribe para buscar clientes
            </div>
          )}
        </div>
      )}
    </div>
  );
}
