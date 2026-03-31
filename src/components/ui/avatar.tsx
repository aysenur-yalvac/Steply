export function avatarInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

export function Avatar({ src, name, size = "sm", className = "" }: AvatarProps) {
  const sz = sizes[size];
  const base = `${sz} rounded-full shrink-0 ring-2 ring-white ${className}`;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${base} object-cover`}
      />
    );
  }

  return (
    <div
      className={`${base} bg-[#7C3AFF]/15 text-[#7C3AFF] flex items-center justify-center font-bold`}
    >
      {avatarInitials(name)}
    </div>
  );
}
