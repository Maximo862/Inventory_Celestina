import { useState, useEffect, useRef, useMemo } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { useDebounce } from "@/hooks/useDebounce";
import { searchProductsRequest } from "@/features/products/api/ProductsRequest";
import { useProducts } from "@/features/products/context/ProductContext";

interface ProductSearchInputProps {
  value: string;
  onChange: (productId: string) => void;
  placeholder?: string;
}

interface SearchResult {
  id: number;
  name: string;
}

export function ProductSearchInput({
  value,
  onChange,
  placeholder = "Buscar producto...",
}: ProductSearchInputProps) {
  const { products } = useProducts()!;
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  const selectedProduct = useMemo(() => {
    if (!value) return null;
    return products.find((p) => p.id === Number(value)) || null;
  }, [value, products]);

  useEffect(() => {
    const searchProducts = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchProductsRequest(debouncedQuery, 10);
        setResults(data);
      } catch (error) {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchProducts();
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

  const handleSelect = (product: SearchResult) => {
    onChange(String(product.id));
    setQuery(product.name);
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
          placeholder={selectedProduct ? selectedProduct.name : placeholder}
          className="w-full bg-white text-[#0F172A] text-base rounded-lg p-3 pl-10 pr-10 border-2 border-[#E2E8F0] focus:border-[#4FA3D1] focus:outline-none focus:ring-2 focus:ring-[#4FA3D1]/20 transition duration-200"
        />
        {(query || value) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
          >
            <FiX className="text-lg" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-[#E2E8F0] rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-center text-[#64748B]">Buscando...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(product)}
                    className="w-full px-4 py-3 text-left hover:bg-[#F8FAFC] text-[#0F172A] transition-colors"
                  >
                    {product.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : debouncedQuery.trim() ? (
            <div className="p-3 text-center text-[#64748B]">
              No se encontraron productos
            </div>
          ) : (
            <div className="p-3 text-center text-[#64748B]">
              Escribe para buscar productos
            </div>
          )}
        </div>
      )}
    </div>
  );
}
