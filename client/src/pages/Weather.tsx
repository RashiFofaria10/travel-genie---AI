
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudFog,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Sunrise,
  Sunset,
  Search,
  LoaderCircle,
  MapPin,
  RefreshCw,
} from "lucide-react";

type Location = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
};

type WeatherData = {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    sunrise: string[];
    sunset: string[];
  };
};

const DEFAULT_LOCATION: Location = {
  name: "Goa",
  country: "India",
  latitude: 15.2993,
  longitude: 74.124,
};

function getWeatherDescription(code: number) {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55].includes(code)) return "Drizzle";
  if ([56, 57].includes(code)) return "Freezing drizzle";
  if ([61, 63, 65].includes(code)) return "Rain";
  if ([66, 67].includes(code)) return "Freezing rain";
  if ([71, 73, 75, 77].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain showers";
  if ([85, 86].includes(code)) return "Snow showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Weather unavailable";
}

function WeatherIcon({
  code,
  isDay = true,
  size = 40,
}: {
  code: number;
  isDay?: boolean;
  size?: number;
}) {
  const className = "text-[#E78FB3]";

  if (code === 0 || code === 1) {
    return (
      <Sun
        size={size}
        className={isDay ? "text-yellow-500" : className}
      />
    );
  }

  if (code === 2 || code === 3) {
    return <Cloud size={size} className="text-gray-500" />;
  }

  if ([45, 48].includes(code)) {
    return <CloudFog size={size} className="text-gray-500" />;
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return <CloudDrizzle size={size} className="text-blue-400" />;
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return <CloudRain size={size} className="text-blue-500" />;
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return <CloudSnow size={size} className="text-blue-300" />;
  }

  if ([95, 96, 99].includes(code)) {
    return <CloudLightning size={size} className="text-purple-500" />;
  }

  return <Cloud size={size} className={className} />;
}

function formatTime(value?: string) {
  if (!value) return "--";

  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDay(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
  });
}

export default function Weather() {
  const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);
  const [search, setSearch] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchWeather() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          latitude: String(location.latitude),
          longitude: String(location.longitude),
          current:
            "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
          daily:
            "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
          forecast_days: "5",
          timezone: "auto",
        });

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to retrieve weather data.");
        }

        const data: WeatherData = await response.json();

        setWeather(data);
        setUpdatedAt(
          new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          "Weather data could not be loaded. Please check your connection and try again."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchWeather();

    return () => controller.abort();
  }, [location]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = search.trim();
    if (!query) {
      setError("Enter a city or destination name.");
      return;
    }

    setSearching(true);
    setError("");

    try {
      const params = new URLSearchParams({
        name: query,
        count: "1",
        language: "en",
        format: "json",
      });

      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?${params}`
      );

      if (!response.ok) {
        throw new Error("Destination search failed.");
      }

      const data = await response.json();
      const result = data.results?.[0];

      if (!result) {
        setError("Destination not found. Try another city name.");
        return;
      }

      setLocation({
        name: result.name,
        country: result.country || "",
        latitude: result.latitude,
        longitude: result.longitude,
      });
      setSearch("");
    } catch {
      setError("Could not search for that destination. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  const current = weather?.current;
  const daily = weather?.daily;

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      <section className="mx-auto max-w-7xl px-6 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-black text-gray-900 sm:text-5xl">
            Weather <span className="text-[#E78FB3]">Forecast</span>
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-gray-600">
            Check real weather conditions before planning your next trip.
          </p>
        </motion.div>

        <form
          onSubmit={handleSearch}
          className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
        >
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-pink-100 bg-white px-4 shadow-sm">
            <MapPin className="shrink-0 text-[#E78FB3]" size={21} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search a city, e.g. Ahmedabad"
              aria-label="Search destination"
              className="w-full bg-transparent py-4 text-gray-800 outline-none placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={searching}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#E78FB3] px-7 py-4 font-bold text-white transition hover:bg-pink-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {searching ? (
              <LoaderCircle className="animate-spin" size={20} />
            ) : (
              <Search size={20} />
            )}
            Search
          </button>
        </form>

        {error && (
          <div
            role="alert"
            className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => {
                setError("");
                setLocation({ ...location });
              }}
              className="font-bold underline"
            >
              Try again
            </button>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <motion.div
          whileHover={{ scale: 1.005 }}
          className="rounded-[35px] bg-white p-6 shadow-xl sm:p-10"
        >
          {loading ? (
            <div className="flex min-h-80 flex-col items-center justify-center gap-4 text-gray-500">
              <LoaderCircle
                size={42}
                className="animate-spin text-[#E78FB3]"
              />
              <p>Fetching real weather data...</p>
            </div>
          ) : current && daily ? (
            <>
              <div className="grid items-center gap-10 lg:grid-cols-2">
                <div>
                  <WeatherIcon
                    code={current.weather_code}
                    isDay={current.is_day === 1}
                    size={86}
                  />

                  <h2 className="mt-5 text-6xl font-black text-gray-900">
                    {Math.round(current.temperature_2m)}°C
                  </h2>

                  <p className="mt-3 flex items-center gap-2 text-2xl font-semibold text-gray-700">
                    <MapPin size={22} className="text-[#E78FB3]" />
                    {location.name}, {location.country}
                  </p>

                  <p className="mt-2 text-lg text-gray-500">
                    {getWeatherDescription(current.weather_code)}
                  </p>

                  <p className="mt-1 text-gray-500">
                    Feels like {Math.round(current.apparent_temperature)}°C
                  </p>

                  <p className="mt-4 text-sm text-gray-400">
                    Local weather time: {formatTime(current.time)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="rounded-3xl bg-pink-50 p-5 sm:p-6">
                    <Wind className="text-[#E78FB3]" size={25} />
                    <h3 className="mt-3 font-bold text-gray-800">Wind</h3>
                    <p className="mt-1 text-xl font-semibold">
                      {current.wind_speed_10m} km/h
                    </p>
                  </div>

                  <div className="rounded-3xl bg-pink-50 p-5 sm:p-6">
                    <Droplets className="text-[#E78FB3]" size={25} />
                    <h3 className="mt-3 font-bold text-gray-800">Humidity</h3>
                    <p className="mt-1 text-xl font-semibold">
                      {current.relative_humidity_2m}%
                    </p>
                  </div>

                  <div className="rounded-3xl bg-pink-50 p-5 sm:p-6">
                    <Sunrise className="text-[#E78FB3]" size={25} />
                    <h3 className="mt-3 font-bold text-gray-800">Sunrise</h3>
                    <p className="mt-1 text-lg font-semibold">
                      {formatTime(daily.sunrise?.[0])}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-pink-50 p-5 sm:p-6">
                    <Sunset className="text-[#E78FB3]" size={25} />
                    <h3 className="mt-3 font-bold text-gray-800">Sunset</h3>
                    <p className="mt-1 text-lg font-semibold">
                      {formatTime(daily.sunset?.[0])}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-pink-100 pt-5 text-sm text-gray-500">
                <span>
                  <span className="font-semibold text-green-700">
                    ● Live API data
                  </span>{" "}
                  · Open-Meteo
                </span>
                <button
                  type="button"
                  onClick={() => setLocation({ ...location })}
                  className="inline-flex items-center gap-2 font-semibold text-[#D96E9B] hover:text-pink-600"
                >
                  <RefreshCw size={16} />
                  Refresh weather
                </button>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-gray-500">
              Weather data is unavailable for this destination.
            </div>
          )}
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-[#E78FB3]">
              5-Day Forecast
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Daily high and low temperatures
            </p>
          </div>

          {updatedAt && (
            <p className="text-xs text-gray-400">
              Data fetched at {updatedAt}
            </p>
          )}
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow">
            Loading forecast...
          </div>
        ) : daily ? (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {daily.time.map((date, index) => (
              <motion.div
                key={date}
                whileHover={{ y: -5 }}
                className="rounded-3xl bg-white p-6 text-center shadow-lg"
              >
                <h3 className="text-xl font-bold text-gray-800">
                  {index === 0 ? "Today" : formatDay(date)}
                </h3>

                <p className="mt-1 text-xs text-gray-400">
                  {new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>

                <div className="my-5 flex justify-center">
                  <WeatherIcon
                    code={daily.weather_code[index]}
                    size={42}
                  />
                </div>

                <p className="min-h-10 text-sm text-gray-500">
                  {getWeatherDescription(daily.weather_code[index])}
                </p>

                <p className="mt-3 text-2xl font-bold text-[#E78FB3]">
                  {Math.round(daily.temperature_2m_max[index])}°
                  <span className="ml-2 text-lg font-medium text-gray-400">
                    {Math.round(daily.temperature_2m_min[index])}°
                  </span>
                </p>

                <p className="mt-3 text-sm text-blue-500">
                  Rain chance:{" "}
                  {daily.precipitation_probability_max[index] ?? 0}%
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="rounded-3xl bg-white p-8 text-center text-gray-500">
            Forecast is currently unavailable.
          </p>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          Weather data provided by Open-Meteo. Forecasts can change.
        </p>
      </section>
    </main>
  );
}
