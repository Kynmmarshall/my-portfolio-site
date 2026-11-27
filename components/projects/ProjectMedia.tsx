"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, ImageOff } from "lucide-react";
import { useText } from "@/hooks/useLocale";

export function ProjectMedia({
  cover,
  title,
  video,
  portrait,
  color = "mint",
  priority = false,
}: {
  cover: string;
  title: string;
  video?: string;
  portrait?: boolean;
  color?: string;
  priority?: boolean;
}) {
  const t = useText();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  useEffect(() => {
    const player = videoRef.current;
    if (!player) return;
    const stop = () => {
      player.pause();
      setPlaying(false);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) stop();
    });
    const visibility = () => {
      if (document.hidden) stop();
    };
    observer.observe(player);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [playing]);
  async function toggle() {
    const player = videoRef.current;
    if (!player) return;
    if (playing) {
      player.pause();
      setPlaying(false);
    } else {
      document.querySelectorAll("video").forEach((other) => {
        if (other !== player) other.pause();
      });
      try {
        await player.play();
        setPlaying(true);
      } catch {
        setVideoFailed(true);
      }
    }
  }
  return (
    <div
      className={`project-media media-${color} ${portrait ? "portrait-media" : ""}`}
    >
      {failed ? (
        <div className="media-fallback">
          <ImageOff />
          <span>{title}</span>
        </div>
      ) : (
        <Image
          src={cover}
          alt={t({
            en: `${title} application screenshot`,
            fr: `Capture d'écran de l'application ${title}`,
          })}
          fill
          sizes="(max-width: 700px) 100vw, 50vw"
          priority={priority}
          className="project-image"
          onError={() => setFailed(true)}
        />
      )}
      {video && !videoFailed && (
        <>
          <video
            ref={videoRef}
            src={video}
            loop
            muted
            playsInline
            preload="none"
            className={playing ? "preview-video is-playing" : "preview-video"}
            onPause={() => setPlaying(false)}
            onError={() => setVideoFailed(true)}
            aria-label={t({
              en: `${title} recorded gameplay`,
              fr: `Gameplay enregistré de ${title}`,
            })}
          />
          <button
            type="button"
            className="preview-control"
            data-playing={playing ? "true" : "false"}
            onClick={toggle}
            aria-label={
              playing
                ? t({ en: `Pause ${title} preview`, fr: `Mettre en pause l'aperçu de ${title}` })
                : t({ en: `Play ${title} preview`, fr: `Lire l'aperçu de ${title}` })
            }
          >
            <span className="preview-control-icon">
              {playing ? <Pause /> : <Play />}
            </span>
            <span className="preview-control-label">
              {playing
                ? t({ en: "Pause", fr: "Pause" })
                : t({ en: "Gameplay", fr: "Gameplay" })}
            </span>
          </button>
        </>
      )}
      <span className="media-corner" aria-hidden="true">
        +
      </span>
    </div>
  );
}
