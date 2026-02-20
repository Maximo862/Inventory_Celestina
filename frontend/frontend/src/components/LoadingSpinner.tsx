export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="inline-block h-16 w-16 animate-spin rounded-full border-8 border-solid border-[#2563EB] border-r-transparent"></div>
        <p className="mt-4 text-xl font-semibold text-[#475569]">
          Cargando...
        </p>
      </div>
    </div>
  );
}