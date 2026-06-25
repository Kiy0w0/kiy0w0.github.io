import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import panick from "../panick.gif";

// Small cmd+k navigation box. Toggle with Ctrl/Cmd+K or Ctrl+Enter, Esc to close.
interface Item {
  label: string;
  to: string; // router path (/...), anchor hash (#...), or external url
  child?: boolean;
}

const ITEMS: Item[] = [
  { label: "Home", to: "#top" },
  { label: "Blog", to: "/blog" },
  { label: "Photography", to: "/photography" },
  { label: "Portfolio", to: "#details" },
  { label: "Tools", to: "#details" },
  { label: "Friends", to: "/friends" },
];

export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(
    () =>
      ITEMS.filter((i) => i.label.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  // global hotkey
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === "k" || e.key === "Enter")
      ) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const go = (item: Item) => {
    setOpen(false);
    if (item.to.startsWith("/")) {
      navigate(item.to);
    } else if (item.to.startsWith("#")) {
      document.querySelector(item.to)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.open(item.to, "_blank");
    }
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      go(results[active]);
    }
  };

  return (
    <>
      <button className="cmdk-trigger" onClick={() => setOpen(true)}>
        <span className="cmdk-label mono">
          click <kbd>CTRL + ENTER</kbd> to explore
        </span>
        <img className="cmdk-panick" src={panick} alt="" aria-hidden="true" />
      </button>

      {open && (
        <div className="cmdk-overlay" onClick={() => setOpen(false)}>
          <div
            className="cmdk"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onListKey}
          >
            <div className="cmdk-search">
              <span className="cmdk-icon">⌕</span>
              <input
                autoFocus
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
              />
            </div>

            <div className="cmdk-list">
              <p className="cmdk-group mono">navigation</p>
              {results.length === 0 && (
                <p className="cmdk-empty mono">no results</p>
              )}
              {results.map((item, i) => (
                <button
                  key={item.label}
                  className={`cmdk-item${item.child ? " child" : ""}${
                    i === active ? " active" : ""
                  }`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(item)}
                >
                  <span className="cmdk-arrow">{item.child ? "↳" : "•"}</span>
                  {item.label}
                </button>
              ))}
            </div>

            <div className="cmdk-foot mono">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span>esc close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
