export default function ClientMarquee({ logos, label, count, reverse = false, testid }) {
  const half = (hidden) => (
    <div aria-hidden={hidden} className="flex items-center gap-5 pr-5">
      {logos.map((src, i) => (
        <div
          key={i}
          className="flex h-16 w-36 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#F4F8FE]/95 p-3"
        >
          <img
            src={src}
            alt={label}
            className="max-h-10 max-w-[112px] object-contain"
          />
        </div>
      ))}
    </div>
  );

  return (
    <div data-testid={testid} className="marquee-mask overflow-hidden py-1">
      <div className={`marquee-track ${reverse ? "marquee-reverse" : ""}`}>
        {half(false)}
        {half(true)}
      </div>
    </div>
  );
}
