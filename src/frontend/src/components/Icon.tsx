import { ReactNode } from "react";

const paths: Record<string, ReactNode> = {
  spark: <path d="m12 3-1.1 3.2a7 7 0 0 1-4.5 4.5L3 12l3.4 1.2a7 7 0 0 1 4.4 4.5L12 21l1.2-3.3a7 7 0 0 1 4.4-4.5L21 12l-3.4-1.3a7 7 0 0 1-4.4-4.5L12 3Z" />,
  user: <><circle cx="12" cy="8" r="3.25" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3 12h18M10 12v2h4v-2" /></>,
  heart: <path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z" />,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>,
  shield: <><path d="M12 22s8-3.7 8-10V5l-8-3-8 3v7c0 6.3 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
  arrow: <path d="M5 12h14M14 7l5 5-5 5" />,
  check: <path d="m5 12 4 4L19 6" />,
  reset: <><path d="M4 4v6h6" /><path d="M5.5 15a7 7 0 1 0 .5-7L4 10" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  alert: <><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.6 2.6 17A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></>,
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  clipboard: <><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
};

export default function Icon({ name, className = "size-5" }: { name: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
