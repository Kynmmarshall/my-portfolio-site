import { Activity, GitCommitHorizontal } from "lucide-react";
import type { ActivityDay } from "@/lib/schemas/analytics";
import { weeklyActivity } from "@/lib/analytics/aggregate";
import { NameFor, T } from "@/components/i18n/T";

export function ActivityCharts({ days }: { days: ActivityDay[] }) {
  if (!days.length)
    return (
      <div className="data-empty">
        <GitCommitHorizontal size={28} />
        <h3>
          <T
            en="Activity is not connected yet."
            fr="L'activité n'est pas encore connectée."
          />
        </h3>
        <p>
          <T
            en="Contribution data will appear after a successful authenticated GitHub refresh. No estimated activity is shown."
            fr="Les données de contributions apparaîtront après une actualisation GitHub authentifiée réussie. Aucune activité estimée n'est affichée."
          />
        </p>
        <a
          className="text-link"
          href="https://github.com/Kynmmarshall"
          target="_blank"
          rel="noreferrer"
        >
          <T en="View activity on GitHub" fr="Voir l'activité sur GitHub" />
        </a>
      </div>
    );
  const max = Math.max(1, ...days.map((day) => day.count));
  const weekly = weeklyActivity(days);
  const maxWeekly = Math.max(1, ...weekly.map((week) => week.count));
  const padding = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const total = days.reduce((sum, day) => sum + day.count, 0);
  return (
    <>
      <NameFor
        id="heatmap-label"
        text={{
          en: `${total} contributions across ${days.length} days`,
          fr: `${total} contributions sur ${days.length} jours`,
        }}
      />
      <div className="heatmap-scroll">
        <div
          className="contribution-heatmap"
          role="img"
          aria-labelledby="heatmap-label"
        >
          {Array.from({ length: padding }, (_, index) => (
            <span key={`pad-${index}`} className="heatmap-pad" />
          ))}
          {days.map((day) => (
            <span
              key={day.date}
              title={`${day.date}: ${day.count}`}
              style={{
                background: day.count
                  ? `color-mix(in srgb, #177567 ${30 + (day.count / max) * 70}%, #e9eee4)`
                  : "#e9eee4",
              }}
            />
          ))}
        </div>
      </div>
      <div className="chart-axis">
        <span>{days[0].date}</span>
        <span>{days.at(-1)?.date}</span>
      </div>
      <div className="weekly-heading">
        <Activity size={16} />
        <h3>
          <T en="Weekly rhythm" fr="Rythme hebdomadaire" />
        </h3>
        <span className="mono">
          <T
            en="GITHUB CONTRIBUTIONS / UTC"
            fr="CONTRIBUTIONS GITHUB / UTC"
          />
        </span>
      </div>
      <NameFor
        id="weekly-label"
        text={{
          en: "Weekly contribution totals",
          fr: "Total hebdomadaire des contributions",
        }}
      />
      <div
        className="weekly-chart"
        role="img"
        aria-labelledby="weekly-label"
      >
        {weekly.map((week) => (
          <div key={week.date} title={`${week.date}: ${week.count}`}>
            <span style={{ height: `${(week.count / maxWeekly) * 100}%` }} />
          </div>
        ))}
      </div>
      <details className="data-details">
        <summary>
          <T en="View contribution data" fr="Voir les données de contributions" />
        </summary>
        <div className="data-table-scroll">
          <table>
            <caption>
              <T
                en="GitHub contribution totals by day"
                fr="Total des contributions GitHub par jour"
              />
            </caption>
            <thead>
              <tr>
                <th scope="col">
                  <T en="Date (UTC)" fr="Date (UTC)" />
                </th>
                <th scope="col">
                  <T en="Contributions" fr="Contributions" />
                </th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day.date}>
                  <td>{day.date}</td>
                  <td>{day.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
