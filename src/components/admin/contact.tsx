// Contact affordance for the operator: tap to call or open WhatsApp.
// Ghana runs on WhatsApp, so both are offered.
export function Contact({ name, phone, label }: { name?: string; phone: string; label?: string }) {
  const wa = phone.replace(/[^\d]/g, "");
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      {label && <span className="text-ink-faint">{label}</span>}
      {name && <span className="font-medium">{name}</span>}
      <a href={`tel:${phone}`} className="font-data text-ink-soft hover:text-ink hover:underline">
        {phone}
      </a>
      <a
        href={`https://wa.me/${wa}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-verified-tint px-2 py-0.5 text-xs font-semibold text-verified hover:opacity-80"
      >
        WhatsApp
      </a>
    </div>
  );
}
