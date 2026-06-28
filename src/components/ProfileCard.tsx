import { useEffect, useRef, useState } from "react";
import { animate, scrambleText } from "animejs";
import { STATUS_META, type Profile } from "../lib/discord";
import { useLastTrack } from "../hooks/useLastTrack";
import { useLivingAccent } from "../lib/livingAccent";
import { CommandPalette } from "./CommandPalette";
import { HomeStatus } from "./HomeStatus";
import { HomeFeatured } from "./HomeFeatured";
import { SocialRow } from "./SocialRow";

const TAGLINE = "self taught developer with various interests, currently exploring the world of web development and open source.";

const fmt = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export function ProfileCard({ profile }: { profile: Profile }) {
  const status = STATUS_META[profile.status];
  const name = profile.globalName ?? profile.username;
  const tag =
    profile.discriminator && profile.discriminator !== "0"
      ? `${profile.username}#${profile.discriminator}`
      : `@${profile.username}`;

  const lastTrack = useLastTrack();
  const sp = profile.spotify;
  const lt = profile.listening;
  useLivingAccent(sp?.albumArt ?? null);

  const rootRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);

  const act = profile.activities[0];

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!sp?.end && !act?.start) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [sp?.end, act?.start]);

  useEffect(() => {
    if (nameRef.current) {
      animate(nameRef.current, { innerHTML: scrambleText({ text: name }) });
    }
  }, [name]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = root.querySelectorAll<HTMLElement>(".reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        }
      },
      { threshold: 0.2 }
    );
    items.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [profile]);

  let pct = 0;
  let elapsed = "0:00";
  let total = "0:00";
  if (sp?.start && sp?.end) {
    const dur = sp.end - sp.start;
    const cur = Math.min(Math.max(0, now - sp.start), dur);
    pct = dur > 0 ? (cur / dur) * 100 : 0;
    elapsed = fmt(cur);
    total = fmt(dur);
  }

  const actElapsed = act?.start ? fmt(now - act.start) : null;

  const actLabel =
    act?.type === 3 ? "Watching" : act?.type === 1 ? "Streaming" : "Playing";

  return (
    <div className="profile" ref={rootRef}>
      <section className="hero">
        {lastTrack && (
          <a className="lastfm" href={lastTrack.url} target="_blank" rel="noreferrer">
            {lastTrack.art && <img src={lastTrack.art} alt="" />}
            <div>
              <span className="label mono">
                {lastTrack.nowPlaying ? "now playing" : "last played"}
              </span>
              <strong>{lastTrack.name}</strong>
              <span className="by">{lastTrack.artist}</span>
            </div>
          </a>
        )}

        <div className="avatar-wrap">
          <img className="avatar" src={profile.avatarUrl} alt={name} />
          {profile.avatarDecorationUrl && (
            <img
              className="avatar-deco"
              src={profile.avatarDecorationUrl}
              alt=""
              aria-hidden="true"
            />
          )}
          <span
            className="status-dot"
            style={{ background: status.color }}
            title={status.label}
          />
        </div>

        <h1
          className="name"
          ref={nameRef}
          style={profile.nameColor ? { color: profile.nameColor } : undefined}
        >
          {name}
        </h1>

        <div className="tag-row">
          <p className="tag">{tag}</p>
        </div>

        {profile.badges.length > 0 && (
          <div className="badges">
            {profile.badges.map((b) => (
              <img
                key={b.id}
                src={`https://cdn.discordapp.com/badge-icons/${b.icon}.png`}
                alt={b.description}
                title={b.description}
              />
            ))}
          </div>
        )}

        {act && (
          <div className="activity-card">
            {act.largeImage && (
              <div className="activity-art">
                <img src={act.largeImage} alt={act.name} />
                {act.smallImage && (
                  <img className="small" src={act.smallImage} alt="" />
                )}
              </div>
            )}
            <div className="activity-meta">
              <span className="label mono">{actLabel}</span>
              <strong>{act.name}</strong>
              {act.details && <span className="line">{act.details}</span>}
              {act.state && <span className="line dim">{act.state}</span>}
              {actElapsed && (
                <span className="line elapsed mono">{actElapsed} elapsed</span>
              )}
            </div>
          </div>
        )}

        {sp && (
          <a
            className="spotify spotify--hero"
            href={sp.trackUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
          >
            {sp.albumArt && <img src={sp.albumArt} alt={sp.album} />}
            <div className="spotify-meta">
              <span className="label mono">Listening to Spotify</span>
              <strong>{sp.song}</strong>
              <span className="by">by {sp.artist}</span>
              {sp.start && sp.end && (
                <div className="progress">
                  <span className="t mono">{elapsed}</span>
                  <div className="bar">
                    <div className="fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="t mono">{total}</span>
                </div>
              )}
            </div>
          </a>
        )}

        {lt && (
          <div className="spotify spotify--hero">
            {lt.albumArt && <img src={lt.albumArt} alt={lt.title} />}
            <div className="spotify-meta">
              <span className="label mono">Listening on Discord</span>
              <strong>{lt.title}</strong>
              {lt.artist && <span className="by">by {lt.artist}</span>}
              <span className="line dim">{lt.name}</span>
            </div>
          </div>
        )}

        <p className="tagline">{TAGLINE}</p>

        <SocialRow />

        {profile.customStatus && (
          <p className="custom-status">{profile.customStatus}</p>
        )}

        <CommandPalette />
        <HomeStatus />
        <HomeFeatured />
      </section>
    </div>
  );
}
