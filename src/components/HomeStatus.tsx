import { useEffect, useState } from "react";


const CODING_SINCE = new Date("2020-05-02T00:00:00");

// Bali (WITA). Open-Meteo, no API key.
const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=-8.65&longitude=115.22&current=temperature_2m,weather_code&timezone=Asia%2FMakassar";

const WMO: Record<number, string> = {
  0: "☀️ clear",
  1: "🌤️ mainly clear",
  2: "⛅ partly cloudy",
  3: "☁️ overcast",
  45: "🌫️ fog",
  48: "🌫️ fog",
  51: "🌦️ drizzle",
  53: "🌦️ drizzle",
  55: "🌦️ drizzle",
  61: "🌧️ rain",
  63: "🌧️ rain",
  65: "🌧️ heavy rain",
  80: "🌧️ showers",
  81: "🌧️ showers",
  82: "⛈️ heavy showers",
  95: "⛈️ thunderstorm",
  96: "⛈️ thunderstorm",
  99: "⛈️ thunderstorm",
};

const UNITS = [
  { key: "yrs", div: 31536000000, dp: 8 },
  { key: "days", div: 86400000, dp: 5 },
  { key: "hrs", div: 3600000, dp: 4 },
] as const;

function uptime(from: Date, now: number, idx: number): string {
  const u = UNITS[idx];
  return (now - from.getTime()) / u.div < 0
    ? "0"
    : ((now - from.getTime()) / u.div).toFixed(u.dp);
}

export function HomeStatus() {
  const [now, setNow] = useState(() => Date.now());
  const [unit, setUnit] = useState(0);
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch(WEATHER_URL)
        .then((r) => r.json())
        .then((j) => {
          if (alive && j.current)
            setWeather({ temp: j.current.temperature_2m, code: j.current.weather_code });
        })
        .catch(() => { });
    load();
    const id = setInterval(load, 600000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const baliTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Makassar",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);

  return (
    <div className="home-status mono">
      <button
        type="button"
        className="home-status__item home-status__uptime"
        onClick={() => setUnit((u) => (u + 1) % UNITS.length)}
        title="click to switch unit"
      >
        coding · <span className="num">{uptime(CODING_SINCE, now, unit)}</span> {UNITS[unit].key}
      </button>
      <span className="home-status__item">bali · {baliTime} WITA</span>
      {weather && (
        <span className="home-status__item">
          {WMO[weather.code] ?? "weather"} · {Math.round(weather.temp)}°C
        </span>
      )}
    </div>
  );
}
