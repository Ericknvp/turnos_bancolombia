export function BrandMark({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center border border-surface-container-high shadow-sm">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4 14C4 8.47715 8.47715 4 14 4H18C23.5228 4 28 8.47715 28 14V18C28 23.5228 23.5228 28 18 28H14C8.47715 28 4 23.5228 4 18V14Z"
            fill="#0B1C30"
          />
          <path d="M10 18L16 10L22 18H10Z" fill="#FFDD00" />
          <path d="M12 21H20" stroke="#FFDD00" strokeLinecap="round" strokeWidth="2" />
        </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-headline-sm font-headline-sm font-bold text-on-surface tracking-tight">
          Bancolombia Gestión de Turnos
        </span>
        {subtitle && <span className="text-body-sm text-secondary">{subtitle}</span>}
      </div>
    </div>
  );
}
