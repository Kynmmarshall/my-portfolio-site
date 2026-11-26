"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";
import { useSceneMotion } from "@/context/ScrollMotionProvider";
import { useText } from "@/hooks/useLocale";

export function MediaGallery({
  images,
  title,
  landscape = false,
}: {
  images: string[];
  title: string;
  landscape?: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const controller = useSceneMotion();
  const t = useText();
  const screenAlt = (index: number) =>
    t({
      en: `${title} screen ${index + 1}`,
      fr: `${title}, écran ${index + 1}`,
    });
  useEffect(() => {
    if (active === null) return;
    if (!dialog.current?.open) dialog.current?.showModal();
    // Released on close, unmount and route change, so scrolling can never stay locked.
    return controller.lockScroll();
  }, [active, controller]);
  function close() {
    dialog.current?.close();
  }
  return (
    <>
      <div className={`gallery${landscape ? " landscape-gallery" : ""}`}>
        {images.map((image, index) => (
          <button
            key={image}
            onClick={() => setActive(index)}
            aria-label={t({
              en: `Open ${title} screenshot ${index + 1}`,
              fr: `Ouvrir la capture ${index + 1} de ${title}`,
            })}
          >
            <Image
              src={image}
              alt={screenAlt(index)}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            <span className="gallery-zoom">
              <Maximize2 size={15} />
            </span>
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="media-dialog"
        aria-label={t({
          en: `${title} screenshot gallery`,
          fr: `Galerie de captures de ${title}`,
        })}
        data-lenis-prevent
        onClose={() => setActive(null)}
        onClick={(event) => {
          if (event.target === dialog.current) close();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" && active !== null)
            setActive((active + 1) % images.length);
          if (event.key === "ArrowLeft" && active !== null)
            setActive((active - 1 + images.length) % images.length);
        }}
      >
        <div className="media-dialog-inner">
          <div className="media-dialog-header">
            <span>
              {title} /{" "}
              {active === null
                ? ""
                : t({
                    en: `${active + 1} of ${images.length}`,
                    fr: `${active + 1} sur ${images.length}`,
                  })}
            </span>
            <button
              className="icon-button"
              onClick={close}
              aria-label={t({ en: "Close gallery", fr: "Fermer la galerie" })}
            >
              <X size={18} />
            </button>
          </div>
          {active !== null && (
            <div className="dialog-image">
              <Image
                src={images[active]}
                alt={screenAlt(active)}
                fill
                sizes="90vw"
              />
            </div>
          )}
          <div className="gallery-controls">
            <button
              className="icon-button"
              onClick={() =>
                setActive(((active ?? 0) - 1 + images.length) % images.length)
              }
              aria-label={t({
                en: "Previous screenshot",
                fr: "Capture précédente",
              })}
            >
              <ArrowLeft size={18} />
            </button>
            <button
              className="icon-button"
              onClick={() => setActive(((active ?? 0) + 1) % images.length)}
              aria-label={t({ en: "Next screenshot", fr: "Capture suivante" })}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
