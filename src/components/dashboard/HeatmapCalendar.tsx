/**
 * EcoMind AI Ultra — Carbon Heatmap Calendar
 * GitHub-style 365-day carbon footprint heatmap.
 * Accessibility: Color-independent data via tooltips and labels.
 */

import { useState, useMemo, memo } from 'react';
import { Tooltip } from '../common/Tooltip';

interface HeatmapCalendarProps {
  data: Array<{
    log_date: string;
    total_carbon: number;
    intensity: 'low' | 'medium' | 'high';
  }>;
  year?: number;
}

export function HeatmapCalendar({ data, year = new Date().getFullYear() }: HeatmapCalendarProps) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const calendarData = useMemo(() => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const days: Array<{
      date: string;
      carbon: number;
      intensity: 'low' | 'medium' | 'high' | 'none';
      dayOfWeek: number;
      weekIndex: number;
    }> = [];

    const dataMap = new Map(data.map((d) => [d.log_date, d]));

    let currentDate = new Date(startDate);
    let weekIndex = 0;
    let prevMonth = -1;

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const entry = dataMap.get(dateStr);
      const dayOfWeek = currentDate.getDay();

      if (dayOfWeek === 0 && currentDate.getMonth() !== prevMonth) {
        prevMonth = currentDate.getMonth();
      }
      if (dayOfWeek === 0 && currentDate > startDate) {
        weekIndex++;
      }

      days.push({
        date: dateStr,
        carbon: entry?.total_carbon ?? 0,
        intensity: entry
          ? entry.total_carbon < 5
            ? 'low'
            : entry.total_carbon < 15
            ? 'medium'
            : 'high'
          : 'none',
        dayOfWeek,
        weekIndex,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }, [data, year]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getColorClass = (intensity: string) => {
    switch (intensity) {
      case 'low':
        return 'bg-emerald-500/60';
      case 'medium':
        return 'bg-amber-500/60';
      case 'high':
        return 'bg-red-500/60';
      default:
        return 'bg-slate-800/50';
    }
  };

  const maxWeek = Math.max(...calendarData.map((d) => d.weekIndex), 0);

  return (
    <section className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6" aria-label={`Carbon heatmap calendar for ${year}`}>
      <h2 className="text-lg font-semibold text-white mb-4">Carbon Heatmap {year}</h2>

      <div className="overflow-x-auto">
        <div className="min-w-[750px]">
          {/* Month labels */}
          <div className="flex ml-8 mb-1" role="presentation">
            {months.map((m) => (
              <span key={m} className="text-xs text-slate-500 flex-1 text-center" role="presentation">
                {m}
              </span>
            ))}
          </div>

          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-2" role="presentation">
              {weekDays.map((d) => (
                <span key={d} className="text-[10px] text-slate-500 h-3 flex items-center" role="presentation">
                  {d}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-1">
              {Array.from({ length: maxWeek + 1 }, (_, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }, (_, dayIdx) => {
                    const day = calendarData.find(
                      (d) => d.weekIndex === weekIdx && d.dayOfWeek === dayIdx
                    );
                    if (!day) return <div key={dayIdx} className="w-3 h-3" />;

                    return (
                      <Tooltip
                        key={dayIdx}
                        content={
                          <div className="text-xs">
                            <p className="font-semibold">{day.date}</p>
                            <p>
                              {day.carbon > 0
                                ? `${day.carbon.toFixed(1)} kg CO2e`
                                : 'No data'}
                            </p>
                            <p className="text-slate-400 capitalize">{day.intensity} impact</p>
                          </div>
                        }
                      >
                        <button
                          className={`w-3 h-3 rounded-sm ${getColorClass(day.intensity)} hover:ring-2 hover:ring-white/30 transition-all`}
                          onMouseEnter={() => setHoveredDay(day.date)}
                          onMouseLeave={() => setHoveredDay(null)}
                          aria-label={`${day.date}: ${day.carbon.toFixed(1)} kg CO2e, ${day.intensity} impact`}
                        />
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-slate-800/50" />
              <div className="w-3 h-3 rounded-sm bg-emerald-500/60" />
              <div className="w-3 h-3 rounded-sm bg-amber-500/60" />
              <div className="w-3 h-3 rounded-sm bg-red-500/60" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {hoveredDay && (
        <p className="text-sm text-slate-400 mt-2" aria-live="polite" role="status">
          Selected: {hoveredDay}
        </p>
      )}
    </section>
  );
}

export default memo(HeatmapCalendar);
