type Social = {
  name: string;
  href: string;
  icon: string;
  label: string;
};

const ICON = "https://cdn.simpleicons.org";

const SOCIALS: Social[] = [
  { name: "github", href: "https://github.com/kiy0w0", icon: `${ICON}/github/e8e8f0`, label: "GitHub" },
  { name: "discord", href: "https://discord.com/users/586802340607164417", icon: `${ICON}/discord/e8e8f0`, label: "Discord" },
  { name: "spotify", href: "https://open.spotify.com/user/rs2fx0zux04z37mrlfvprowx1", icon: `${ICON}/spotify/e8e8f0`, label: "Spotify" },
  { name: "lastfm", href: "https://www.last.fm/user/OvOliner", icon: `${ICON}/lastdotfm/e8e8f0`, label: "Last.fm" },
  { name: "x", href: "https://x.com/", icon: `${ICON}/x/e8e8f0`, label: "X" },
];

export function SocialRow() {
  return (
    <div className="socials" role="navigation" aria-label="social links">
      {SOCIALS.map((s) => (
        <a
          key={s.name}
          className="socials__link"
          href={s.href}
          target="_blank"
          rel="noreferrer me"
          aria-label={s.label}
          title={s.label}
        >
          <img src={s.icon} alt="" width={18} height={18} loading="lazy" />
        </a>
      ))}
    </div>
  );
}
