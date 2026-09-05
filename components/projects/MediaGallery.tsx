"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";

export function MediaGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (active !== null && !dialog.current?.open) dialog.current?.showModal();
  }, [active]);
  function close() {
    dialog.current?.close();
  }
  return (
    <>
      <div className="gallery">
        {images.map((image, index) => (
          <button
            key={image}
            onClick={() => setActive(index)}
            aria-label={`Open ${title} screenshot ${index + 1}`}
          >
            <Image
              src={image}
              alt={`${title} screen ${index + 1}`}
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
        aria-label={`${title} screenshot gallery`}
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
              {active === null ? "" : `${active + 1} of ${images.length}`}
            </span>
            <button
              className="icon-button"
              onClick={close}
              aria-label="Close gallery"
            >
              <X size={18} />
            </button>
          </div>
          {active !== null && (
            <div className="dialog-image">
              <Image
                src={images[active]}
                alt={`${title} screen ${active + 1}`}
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
              aria-label="Previous screenshot"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              className="icon-button"
              onClick={() => setActive(((active ?? 0) + 1) % images.length)}
              aria-label="Next screenshot"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
