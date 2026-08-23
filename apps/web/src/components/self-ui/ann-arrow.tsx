export function AnnArrow({
  className = "",
  rotate = 0,
  curl = "gentle",
  strokeWidth = 2,
}: {
  className?: string;
  rotate?: number;
  curl?: "straight" | "gentle" | "wavy";
  strokeWidth?: number;
}) {
  const shaft = {
    straight: "M23 35 L23 4",
    gentle: "M23 35 C22 26 22 15 23 4",
    wavy: "M23 35 C15 26 30 14 23 4",
  }[curl];
  return (
    <svg
      className={`ann-arrow ${className}`}
      viewBox="0 0 46 38"
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    >
      <path d={shaft} style={{ strokeWidth }} />
      <path d="M17 10 L23 3 L29 10" style={{ strokeWidth }} />
    </svg>
  );
}
