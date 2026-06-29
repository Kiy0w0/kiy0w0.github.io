import { useEffect, useState } from "react";

export function ScrollCue() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href="#guestbook"
      className={`scroll-cue${hidden ? " scroll-cue--hidden" : ""}`}
      aria-label="scroll to guestbook"
    >
      <span className="cue-text">guestbook</span>
      <span className="chev">⌄</span>
    </a>
  );
}
