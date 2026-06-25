import type { Folder } from "../../lib/blog";

export function FolderChips({
  folders,
  active,
  onSelect,
}: {
  folders: Folder[];
  active: string | null;
  onSelect: (slug: string | null) => void;
}) {
  return (
    <div className="folder-chips" role="tablist" aria-label="Folders">
      <button
        className={"chip" + (active === null ? " chip--on" : "")}
        onClick={() => onSelect(null)}
        role="tab"
        aria-selected={active === null}
      >
        all
      </button>
      {folders.map((f) => (
        <button
          key={f.id}
          className={"chip" + (active === f.slug ? " chip--on" : "")}
          onClick={() => onSelect(f.slug)}
          role="tab"
          aria-selected={active === f.slug}
        >
          {f.name}
        </button>
      ))}
    </div>
  );
}
