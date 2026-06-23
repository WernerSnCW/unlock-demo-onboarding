import { useState } from 'react';
import PathChart from './PathChart';
import { STAGE_COPY } from '@/data/scenarioPlannerCopy';
import { fmtSignedPct } from '@/lib/scenarioPlannerView';
import { blendEpisodes, readAt } from '@/lib/episodeBlend';
import type { EpisodeReplay } from '@/lib/empiricalEngine';
import type { Episode } from '@/data/episodeLibrary';

export default function StageTuneIt(
  { options, replays }: { options: Episode[]; replays: Record<string, EpisodeReplay> },
) {
  const copy = STAGE_COPY[2];
  // Only monthly episodes blend cleanly together; group by granularity to keep paths aligned (§5 mixed granularity).
  const [selected, setSelected] = useState<string[]>(() => options.slice(0, 1).map((e) => e.id));
  const [r, setR] = useState(0); // default typical
  const [revealRead, setRevealRead] = useState(false);

  const chosen = selected.map((id) => replays[id]).filter(Boolean);
  const blend = blendEpisodes(chosen, chosen.map(() => 1));
  const collapsed = chosen.length < 2;
  const readPath = collapsed ? blend.central : readAt(blend, r);
  const troughIndex = blend.central.indexOf(Math.min(...blend.central));

  return (
    <section data-testid="stage-3" className="space-y-3">
      <p className="text-sm text-[var(--muted-foreground)]">{copy.leadIn}</p>

      <fieldset className="flex flex-wrap gap-2" data-testid="blend-picker">
        {options.map((e) => (
          <label key={e.id} className="text-xs flex items-center gap-1">
            <input
              type="checkbox"
              checked={selected.includes(e.id)}
              onChange={(ev) => {
                setSelected((s) => ev.target.checked ? [...s, e.id] : s.filter((x) => x !== e.id));
                setRevealRead(true);
              }}
            />
            {e.shortLabel}
          </label>
        ))}
      </fieldset>

      <PathChart blend={blend} readPath={readPath}
        stepUnit={options[0]?.granularity === 'annual' ? 'year' : 'month'} troughIndex={Math.max(0, troughIndex)} />

      {revealRead && (
        <div data-testid="read-position">
          <label className="text-xs flex items-center gap-3">
            Read: typical outcome
            <input type="range" min={0} max={1} step={0.01} value={r} disabled={collapsed}
              onChange={(e) => setR(parseFloat(e.target.value))} className="flex-1" />
            worst markets reached
          </label>
          <p className="text-xs text-[var(--muted-foreground)]">
            {collapsed
              ? 'Combine at least two episodes to read across the range they reached.'
              : `Markets actually reached ${fmtSignedPct(Math.min(...readPath))} here in these episodes — not a prediction, and future losses can exceed this.`}
          </p>
        </div>
      )}
      <p className="text-xs text-[var(--muted-foreground)]">{copy.complianceCaption}</p>
      <p className="text-sm">{copy.worthSittingWith}</p>
    </section>
  );
}
