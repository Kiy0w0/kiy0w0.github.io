import { useEffect, useState } from "react";
import { getLastTrack, type Track } from "../lib/lastfm";

// Polls Last.fm for the most recent / now-playing track every 60s.
export function useLastTrack() {
  const [track, setTrack] = useState<Track | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      getLastTrack()
        .then((t) => alive && setTrack(t))
        .catch(() => {});
    load();
    const id = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return track;
}
