"use client";

import { useEffect } from "react";

/**
 * Renders nothing; while it is on the page, starting any video pauses every other one (a `play` event does not bubble,
 * so it is listened for in the capture phase on the document).
 */
export function OneVideoAtATime() {
  useEffect(() => {
    const onPlay = (event: Event) => {
      if (!(event.target instanceof HTMLVideoElement)) return;
      for (const video of document.querySelectorAll("video")) {
        if (video !== event.target && !video.paused) video.pause();
      }
    };
    document.addEventListener("play", onPlay, true);
    return () => document.removeEventListener("play", onPlay, true);
  }, []);
  return null;
}
