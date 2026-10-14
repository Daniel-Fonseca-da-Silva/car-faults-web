"use client";

import { Play } from "lucide-react";
import { useRef, useState } from "react";

interface DemoVideoProps {
  src: string;
  poster: string;
  width: number;
  height: number;
  label: string;
  playLabel: string;
}

/**
 * Muted looping demo that downloads nothing until the visitor presses play.
 * Clicking the video while it plays pauses it again.
 */
export function DemoVideo({
  src,
  poster,
  width,
  height,
  label,
  playLabel,
}: DemoVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    videoRef.current?.play().catch(() => setIsPlaying(false));
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        width={width}
        height={height}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={() => videoRef.current?.pause()}
        className="h-auto w-full rounded-2xl bg-muted"
      />
      {!isPlaying && (
        <button
          type="button"
          onClick={handlePlay}
          aria-label={playLabel}
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/20 transition-colors outline-none hover:bg-black/30 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Play aria-hidden className="ml-1 size-7 fill-current" />
          </span>
        </button>
      )}
    </div>
  );
}
