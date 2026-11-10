import { brand } from "@/lib/brand";

const sizes = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-5xl sm:text-6xl",
} as const;

const tones = {
  light: "text-pearl",
  dark: "text-navy",
} as const;

type WordmarkProps = {
  size?: keyof typeof sizes;
  tone?: keyof typeof tones;
  showCategory?: boolean;
};

export function Wordmark({
  size = "md",
  tone = "light",
  showCategory = false,
}: WordmarkProps) {
  return (
    <span className="inline-flex flex-col gap-1">
      <span
        className={`font-display font-semibold leading-none tracking-tight ${sizes[size]} ${tones[tone]}`}
      >
        {brand.name}
        <span className="text-ice">.</span>
      </span>
      {showCategory ? (
        <span
          className={`text-[0.65rem] font-medium uppercase tracking-[0.28em] ${
            tone === "light" ? "text-silver" : "text-slate"
          }`}
        >
          {brand.category}
        </span>
      ) : null}
    </span>
  );
}
