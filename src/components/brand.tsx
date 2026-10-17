export function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span className={`relative inline-block overflow-hidden rounded-[8px] bg-[#d6ff00] ${className}`}>
      <img src="/logo.jpg" alt="" className="absolute left-1/2 top-[-6%] h-auto w-[230%] max-w-none -translate-x-1/2" />
    </span>
  );
}
