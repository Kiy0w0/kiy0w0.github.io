const TECH: { name: string; slug?: string }[] = [
  { name: "Rust", slug: "rust" },
  { name: "C", slug: "c" },
  { name: "C++", slug: "cplusplus" },
  { name: "Elixir", slug: "Elixir" },
  { name: "Go", slug: "go" },
  { name: "TypeScript", slug: "typescript" },
  { name: "JavaScript", slug: "javascript" },
  { name: "PHP", slug: "php" },
  { name: "HTML", slug: "html5" },
  { name: "CSS", slug: "css" },
  { name: "Deno", slug: "deno" },
  { name: "Bun", slug: "bun" },
];

export function TechStrip() {
  return (
    <div className="tech-strip reveal">
      {TECH.map((t) =>
        t.slug ? (
          <img
            key={t.name}
            className="tech-logo"
            src={`https://cdn.simpleicons.org/${t.slug}/ffffff`}
            alt={t.name}
            title={t.name}
            loading="lazy"
            width={22}
            height={22}
          />
        ) : (
          <span key={t.name} className="tech-badge mono">{t.name}</span>
        )
      )}
    </div>
  );
}
