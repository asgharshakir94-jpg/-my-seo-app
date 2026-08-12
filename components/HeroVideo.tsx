// components/HeroVideo.tsx
"use client";

import { useState } from "react";
import { Play } from "lucide-react";

export function HeroVideo() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div
      style={{ position: "relative", paddingBottom: "38.59375%", height: 0 }}
      className="w-full"
    >
      {isPlaying ? (
        <iframe
          src="https://www.loom.com/embed/f62b0aaa54c04422b81f1261297a50b3?autoplay=1&muted=1&hideEmbedTopBar=true"
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        />
      ) : (
        <button
          onClick={() => setIsPlaying(true)}
          className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/80 hover:bg-black/70 transition-colors"
        >
          <span className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-md font-medium text-base">
            <Play className="w-5 h-5" fill="black" />
            Demo Video
          </span>
        </button>
      )}
    </div>
  );
}