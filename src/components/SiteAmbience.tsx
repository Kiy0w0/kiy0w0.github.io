import { useEffect, useRef, useState } from "react";

const BG_VIDEO = "https://file.garden/ah6UIxtAklyoF-jt/animebg.mp4";
const BGM = "https://file.garden/ah6UIxtAklyoF-jt/suzume.mp3";
const VOLUME = 0.35;
const BG_KEY = "bg-video";

export function SiteAmbience() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [bgVideo, setBgVideo] = useState(() => localStorage.getItem(BG_KEY) === "1");

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = VOLUME;
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("bg-video-on", bgVideo);
  }, [bgVideo]);

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

  function toggleBg() {
    setBgVideo((on) => {
      const next = !on;
      localStorage.setItem(BG_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <>
      {bgVideo && (
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
        </>
      )}

      <audio ref={audioRef} src={BGM} loop preload="none" />
      <div className="ambience-controls">
        <button
          className={"bg-toggle mono" + (bgVideo ? " bg-toggle--on" : "")}
          onClick={toggleBg}
          aria-label={bgVideo ? "Use black background" : "Use video background"}
          title={bgVideo ? "black background" : "video background"}
        >
          {bgVideo ? "▦ bg on" : "▦ bg off"}
        </button>
        <button
          className={"bgm-toggle mono" + (playing ? " bgm-toggle--on" : "")}
          onClick={toggle}
          aria-label={playing ? "Pause music" : "Play music"}
          title={playing ? "pause music" : "play music"}
        >
          {playing ? "♪ playing" : "♪ music off"}
        </button>
      </div>
    </>
  );
}
