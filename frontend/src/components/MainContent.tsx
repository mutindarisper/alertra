import React, { useMemo, useRef } from "react";
import MapboxMap from "./Map";
import { useSidebar, type DisasterFeature } from "../context/sidebar-context";
import { eventKey, eventTitle } from "../service/events";
import { menuItems } from "./Sidebar";

const ALERT_LEVELS = [
  { key: "Red", label: "Red", bar: "bg-rose-500", chip: "bg-rose-50 text-rose-700 ring-rose-200" },
  { key: "Orange", label: "Orange", bar: "bg-amber-500", chip: "bg-amber-50 text-amber-700 ring-amber-200" },
  { key: "Green", label: "Green", bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
];

const chipFor = (level?: string) =>
  ALERT_LEVELS.find((l) => l.key.toLowerCase() === (level || "").toLowerCase())?.chip ??
  "bg-slate-100 text-slate-600 ring-slate-200";

const parseDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatWhen = (value?: string) => {
  const date = parseDate(value);
  if (!date) return "Date unavailable";

  const diffDays = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  const absolute = date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (diffDays < 0) return absolute;
  if (diffDays === 0) return `Today · ${absolute}`;
  if (diffDays === 1) return `Yesterday · ${absolute}`;
  if (diffDays < 30) return `${diffDays} days ago · ${absolute}`;
  return absolute;
};

const MainContent: React.FC = () => {
  const { activeItem, disasters, isLoading, focusRequest, focusEvent } = useSidebar();
  const mapSectionRef = useRef<HTMLElement>(null);

  const ActiveIcon = menuItems.find((item) => item.name === activeItem)?.icon ?? menuItems[0].icon;

  const recent = useMemo(() => {
    return [...disasters]
      .sort((a, b) => {
        const aDate = parseDate(a.properties.fromdate)?.getTime() ?? 0;
        const bDate = parseDate(b.properties.fromdate)?.getTime() ?? 0;
        return bDate - aDate;
      })
      .slice(0, 6);
  }, [disasters]);

  const levelCounts = useMemo(() => {
    return ALERT_LEVELS.map((level) => ({
      ...level,
      count: disasters.filter(
        (event) => (event.properties.alertlevel || "").toLowerCase() === level.key.toLowerCase(),
      ).length,
    }));
  }, [disasters]);

  const total = disasters.length;

  const handleEventClick = (event: DisasterFeature) => {
    focusEvent(event);

    // On narrow screens the map has usually scrolled out of view by the time you
    // reach the list, so pull it back — but leave the page alone when it is
    // already on screen.
    const section = mapSectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);

    if (visible / rect.height < 0.6) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="min-h-0 flex-1 overflow-y-auto scrollbar-slim p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-200">
            <ActiveIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {activeItem === "Overview" ? "All alerts" : activeItem}
            </h1>
            <p className="text-sm text-slate-500">
              {isLoading
                ? "Loading the latest events…"
                : `${total} ${total === 1 ? "event" : "events"} on the map`}
            </p>
          </div>
        </div>

        {/* Map — the primary view */}
        <section
          ref={mapSectionRef}
          className="scroll-mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card"
        >
          <div className="h-[60vh] min-h-[360px] w-full lg:h-[65vh]">
            <MapboxMap />
          </div>
        </section>

        {/* Supporting detail, side by side on wide screens */}
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Recent events */}
          <section className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Most recent
              </h2>
              <span className="text-xs text-slate-400">Select an event to locate it</span>
            </div>

            {isLoading && recent.length === 0 && (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-[76px] animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            )}

            {!isLoading && recent.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                No {activeItem === "Overview" ? "" : `${activeItem.toLowerCase()} `}events reported
                for this period.
              </p>
            )}

            <ul className="space-y-3">
              {recent.map((event) => {
                const key = eventKey(event);
                const isFocused = focusRequest?.key === key;

                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => handleEventClick(event)}
                      aria-label={`Show ${eventTitle(event.properties)} on the map`}
                      className={`flex w-full flex-col gap-2 rounded-xl border bg-white p-4 text-left shadow-card transition hover:border-brand-300 hover:shadow-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
                        isFocused ? "border-brand-400 ring-1 ring-brand-200" : "border-slate-200"
                      }`}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                            isFocused ? "bg-brand-50 text-brand-600" : "bg-slate-50 text-slate-500"
                          }`}
                        >
                          <ActiveIcon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate font-medium text-slate-900">
                            {eventTitle(event.properties)}
                          </h3>
                          <p className="truncate text-sm text-slate-500">
                            {event.properties.country || "Location unavailable"}
                            {event.properties.severitydata?.severitytext
                              ? ` · ${event.properties.severitydata.severitytext}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-3 pl-12 sm:pl-0">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ${chipFor(
                            event.properties.alertlevel,
                          )}`}
                        >
                          {event.properties.alertlevel || "Unknown"}
                        </span>
                        <span className="whitespace-nowrap text-sm text-slate-400">
                          {formatWhen(event.properties.fromdate)}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Alert level breakdown */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Alert levels
            </h2>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
              <div className="mb-5 flex items-baseline justify-between gap-3">
                <span className="text-2xl font-semibold tabular-nums text-slate-900">{total}</span>
                <span className="text-sm text-slate-500">events tracked</span>
              </div>

              <div className="space-y-4">
                {levelCounts.map((level) => {
                  const pct = total > 0 ? (level.count / total) * 100 : 0;

                  return (
                    <div key={level.key}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{level.label}</span>
                        <span className="tabular-nums text-slate-500">
                          {level.count} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${level.bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default MainContent;
