import type { DetailedHTMLProps, HTMLAttributes } from "react";

/** The two wrapper elements used by `components/i18n/T.tsx`. */
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "t-en": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "t-fr": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
