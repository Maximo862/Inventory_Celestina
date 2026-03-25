import { useState, useEffect } from "react";
import { FormLayout } from "@/components/FormLayout";
import { Input } from "@/components/Input";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type {
  Category,
  PricePreviewResult,
} from "@/types/types";

type ModalStatus = "input" | "previewing" | "previewDone" | "applying";

interface PriceAdjustmentModalProps {
  isOpen: boolean;
  category: Category;
  onClose: () => void;
  onApply: (id: number, percentage: number) => Promise<void>;
  onPreview: (id: number, percentage: number) => Promise<PricePreviewResult>;
}

export function PriceAdjustmentModal({
  isOpen,
  category,
  onClose,
  onApply,
  onPreview,
}: PriceAdjustmentModalProps) {
  const [percentage, setPercentage] = useState("");
  const [status, setStatus] = useState<ModalStatus>("input");
  const [previewData, setPreviewData] = useState<PricePreviewResult | null>(
    null
  );
  const [percentageError, setPercentageError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPercentage("");
      setStatus("input");
      setPreviewData(null);
      setPercentageError(null);
    }
  }, [isOpen]);

  const parsePercentage = (): number | null => {
    const cleaned = percentage.replace(",", ".");
    const value = parseFloat(cleaned);
    if (isNaN(value)) return null;
    return value;
  };

  const validatePercentage = (): boolean => {
    const value = parsePercentage();
    if (value === null) {
      setPercentageError("Ingresá un valor numérico");
      return false;
    }
    if (value === 0) {
      setPercentageError("El porcentaje no puede ser 0");
      return false;
    }
    if (value < -100 || value > 1000) {
      setPercentageError("Debe estar entre -100 y 1000");
      return false;
    }
    setPercentageError(null);
    return true;
  };

  const handlePreview = async () => {
    if (!validatePercentage()) return;

    setStatus("previewing");
    try {
      const result = await onPreview(category.id, parsePercentage()!);
      setPreviewData(result);
      setStatus("previewDone");
    } catch {
      setStatus("input");
    }
  };

  const handleApply = async () => {
    setStatus("applying");
    try {
      await onApply(category.id, parsePercentage()!);
      onClose();
    } catch {
      setStatus("previewDone");
    }
  };

  const handleBack = () => {
    setStatus("input");
    setPreviewData(null);
  };

  const handleClose = () => {
    if (status === "applying") return;
    onClose();
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value);

  if (!isOpen) return null;

  const isPositive = previewData && previewData.percentage > 0;
  const diff =
    previewData
      ? previewData.totalNewPrice - previewData.totalCurrentPrice
      : 0;

  return (
    <FormLayout
      title={`Ajustar precios - ${category.name}`}
      description="Modificá los precios de los productos de esta categoría y sus subcategorías."
      onClose={handleClose}
      isSubmitting={status === "applying"}
      isValid={status === "previewDone" && previewData !== null}
      submitLabel="Aplicar cambios"
      onSubmit={handleApply}
    >
      {status === "previewing" || status === "applying" ? (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-[#64748B]">
            {status === "previewing"
              ? "Calculando..."
              : "Aplicando cambios..."}
          </p>
        </div>
      ) : status === "previewDone" && previewData ? (
        <div className="space-y-6">
          <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg text-[#64748B]">Porcentaje:</span>
              <span
                className={`text-2xl font-bold ${isPositive ? "text-[#16A34A]" : "text-[#DC2626]"
                  }`}
              >
                {isPositive ? "+" : ""}
                {previewData.percentage}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg text-[#64748B]">
                Productos afectados:
              </span>
              <span className="text-xl font-semibold text-[#0F172A]">
                {previewData.affectedProducts.length}
              </span>
            </div>
          </div>

          {previewData.affectedProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xl text-[#64748B]">
                No hay productos en esta categoría
              </p>
            </div>
          ) : (
            <>
              <div className="border-2 border-[#E2E8F0] rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-[#F8FAFC] sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-3 text-[#64748B] font-semibold text-base">
                        Producto
                      </th>
                      <th className="text-right px-4 py-3 text-[#64748B] font-semibold text-base">
                        Precio actual
                      </th>
                      <th className="text-right px-4 py-3 text-[#64748B] font-semibold text-base">
                        Nuevo precio
                      </th>
                      <th className="text-right px-4 py-3 text-[#64748B] font-semibold text-base">
                        Diferencia
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.affectedProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-t border-[#E2E8F0]"
                      >
                        <td className="px-4 py-3 text-[#0F172A]">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-right text-[#64748B]">
                          {formatPrice(product.currentPrice)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-[#0F172A]">
                          {formatPrice(product.newPrice)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold ${product.newPrice > product.currentPrice
                              ? "text-[#16A34A]"
                              : product.newPrice < product.currentPrice
                                ? "text-[#DC2626]"
                                : "text-[#64748B]"
                            }`}
                        >
                          {product.newPrice > product.currentPrice ? "+" : ""}
                          {formatPrice(
                            product.newPrice - product.currentPrice
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-[#0F172A] text-white rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-lg">
                  <span>Total actual:</span>
                  <span className="font-semibold">
                    {formatPrice(previewData.totalCurrentPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Total nuevo:</span>
                  <span className="font-semibold">
                    {formatPrice(previewData.totalNewPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-xl border-t border-[#64748B] pt-2 mt-2">
                  <span>Diferencia:</span>
                  <span
                    className={`font-bold ${diff > 0 ? "text-[#22C55E]" : diff < 0 ? "text-[#EF4444]" : "text-white"
                      }`}
                  >
                    {diff > 0 ? "+" : ""}
                    {formatPrice(diff)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBack}
                className="w-full text-[#4FA3D1] hover:text-[#1D4ED8] font-semibold text-lg py-2"
              >
                ← Volver a calcular con otro porcentaje
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <Input
            id="percentage"
            label="Porcentaje de ajuste"
            type="text"
            placeholder="Ej: 10 (aumenta 10%), -5 (reduce 5%)"
            value={percentage}
            onChange={(e) => {
              setPercentage(e.target.value);
              setPercentageError(null);
            }}
            error={percentageError || undefined}
            autoFocus
          />
          <div className="flex flex-wrap gap-3">
            {[10, 15, 20, 25, 30, -10].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setPercentage(String(val));
                  setPercentageError(null);
                }}
                className="px-4 py-2 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-lg text-[#0F172A] hover:border-[#4FA3D1] hover:bg-[#4FA3D1]/5 transition-colors font-medium"
              >
                {val > 0 ? `+${val}%` : `${val}%`}
              </button>
            ))}
          </div>
          <p className="text-base text-[#64748B]">
            Usá valores positivos (+) para aumentar precios o negativos (-) para
            reducir. Rango permitido: -100% a 1000%.
          </p>
          <button
            type="button"
            onClick={handlePreview}
            disabled={!percentage.trim()}
            className="w-full py-4 bg-[#4FA3D1] hover:bg-[#1D4ED8] disabled:bg-[#E2E8F0] disabled:text-[#94A3B8] text-white font-bold text-lg rounded-xl transition-colors"
          >
            Vista previa
          </button>
        </div>
      )}
    </FormLayout>
  );
}
