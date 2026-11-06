export const contactEmail = 'allono.at@gmail.com';
export const whatsappNumber = '918129445708';
export const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi Afterlife Theory Labs, I would like to talk about a business challenge.')}`;
export const discoveryHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi Afterlife Theory Labs, I would like to arrange a free 20-minute discovery call.')}`;

/** Passes conversion events to whichever lightweight analytics script is configured. */
export function trackConversion(event: string, detail?: string) {
  if (typeof window === 'undefined') return;
  const target = window as typeof window & {
    plausible?: (name: string, options?: { props?: Record<string, string> }) => void;
    gtag?: (...args: unknown[]) => void;
    umami?: { track: (name: string, data?: Record<string, string>) => void };
  };
  const props = detail ? { detail } : undefined;
  target.plausible?.(event, props ? { props } : undefined);
  target.gtag?.('event', event, detail ? { event_label: detail } : undefined);
  target.umami?.track(event, props);
}
