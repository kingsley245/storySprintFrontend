import React, {
  useEffect,
  useRef,
} from 'react';

interface ProtectedVideoPlayerProps {
  src: string;
  poster?: string;
  onTimeUpdate?: (
    currentTime: number
  ) => void;
}

export default function ProtectedVideoPlayer({
  src,
  poster,
  onTimeUpdate,
}: ProtectedVideoPlayerProps) {

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  useEffect(() => {

    const preventContextMenu = (
      event: MouseEvent
    ) => {
      event.preventDefault();
    };

    const preventShortcuts = (
      event: KeyboardEvent
    ) => {

      if (
        event.key === 'PrintScreen'
      ) {
        event.preventDefault();
      }

      if (
        event.ctrlKey &&
        ['s', 'u'].includes(
          event.key.toLowerCase()
        )
      ) {
        event.preventDefault();
      }

      if (
        event.ctrlKey &&
        event.shiftKey &&
        ['i', 'j'].includes(
          event.key.toLowerCase()
        )
      ) {
        event.preventDefault();
      }

      if (
        event.key === 'F12'
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener(
      'contextmenu',
      preventContextMenu
    );

    document.addEventListener(
      'keydown',
      preventShortcuts
    );

    return () => {

      document.removeEventListener(
        'contextmenu',
        preventContextMenu
      );

      document.removeEventListener(
        'keydown',
        preventShortcuts
      );

    };

  }, []);

  return (
    <div
      className="relative w-full bg-black rounded-2xl overflow-hidden select-none"
      onContextMenu={(e) =>
        e.preventDefault()
      }
    >

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        controlsList="nodownload"
        disablePictureInPicture
        playsInline
        className="w-full aspect-video object-contain"
        onTimeUpdate={(e) => {

          if (onTimeUpdate) {

            onTimeUpdate(
              e.currentTarget.currentTime
            );

          }

        }}
      />

      {/* Invisible protection layer */}

      <div
        className="
          absolute
          top-0
          left-0
          right-0
          h-8
          pointer-events-none
          bg-transparent
        "
      />

    </div>
  );
}