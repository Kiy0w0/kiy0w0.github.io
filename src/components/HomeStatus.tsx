import { useEffect, useState } from "react";

// ganti ke tanggal mulai coding kamu (YYYY-MM-DD)
const CODING_SINCE = new Date("2020-01-01T00:00:00");

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

function uptime(from: Date, now: number): string {
  let s = Math.floor((now - from.getTime()) / 1000);
  const y = Math.floor(s / 31536000);
  s -= y * 31536000;
  const d = Math.floor(s / 86400);
  s -= d * 86400;
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  s -= m * 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${y}y ${d}d ${p(h)}:${p(m)}:${p(s)}`;
}

export function HomeStatus() {
  const [now, setNow] = useState(() => Date.now());
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
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
      <span className="home-status__item">{uptime(CODING_SINCE, now)}</span>
      <span className="home-status__item">bali · {baliTime} WITA</span>
      {weather && (
        <span className="home-status__item">
          {WMO[weather.code] ?? "weather"} · {Math.round(weather.temp)}°C
        </span>
      )}
    </div>
  );
}
