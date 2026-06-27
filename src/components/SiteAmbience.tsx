import { useEffect, useRef, useState } from "react";

const BG_VIDEO = "https://file.garden/ah6UIxtAklyoF-jt/ppersona.mp4";
const BGM = "https://file.garden/ah6UIxtAklyoF-jt/suzume.mp3";
const VOLUME = 0.35;

export function SiteAmbience() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = VOLUME;
  }, []);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      a.pause();
      setPlaying(false);
    }
  }

  return (
    <>
      <video
        className="site-bg"
        src={BG_VIDEO}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="site-bg__overlay" aria-hidden="true" />

      <audio ref={audioRef} src={BGM} loop preload="none" />
      <button
        className={"bgm-toggle mono" + (playing ? " bgm-toggle--on" : "")}
        onClick={toggle}
        aria-label={playing ? "Pause music" : "Play music"}
        title={playing ? "pause music" : "play music"}
      >
        {playing ? "♪ playing" : "♪ music off"}
      </button>
    </>
  );
}
