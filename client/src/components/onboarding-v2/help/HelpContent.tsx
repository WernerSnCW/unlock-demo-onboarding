import React from 'react';
import type { HelpBlock, HelpSection, ScreenHelp } from '@/content/screen-help';
import { useHelpDrawer } from './HelpDrawerProvider';

/**
 * Renders a screen's help content: sections of paragraphs, lists and notes.
 * Any text may embed an inline highlight link written as `[[label|anchor-key]]`
 * — clicking it scrolls the live screen to the matching element and pulses it.
 */

const INLINE = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;

/** Split a string into plain text and clickable highlight-link segments. */
function renderInline(text: string, onLink: (key: string) => void): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  let i = 0;
  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const label = match[1];
    const key = match[2];
    nodes.push(
      <button
        key={`lnk-${i++}`}
        type="button"
        onClick={() => onLink(key)}
        className="text-[var(--primary)] underline decoration-dotted underline-offset-2 hover:decoration-solid focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)] rounded-sm transition-colors"
        data-testid={`help-link-${key}`}
        title="Show this on the screen"
      >
        {label}
      </button>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function Block({ block, onLink }: { block: HelpBlock; onLink: (key: string) => void }) {
  if (block.type === 'p') {
    return (
      <p className="text-sm leading-relaxed text-[var(--muted-foreground)] mb-3">
        {renderInline(block.text, onLink)}
      </p>
    );
  }
  if (block.type === 'list') {
    return (
      <ul className="space-y-2 mb-3">
        {block.items.map((item, idx) => (
          <li key={idx} className="flex gap-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
            <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-[#00bb77]" aria-hidden />
            <span>{renderInline(item, onLink)}</span>
          </li>
        ))}
      </ul>
    );
  }
  // note
  return (
    <div className="mb-3 rounded-[var(--radius-md)] border border-[#00bb77]/25 bg-[#00bb77]/[0.06] px-3 py-2.5">
      <p className="text-sm leading-relaxed text-[var(--foreground)]">
        {renderInline(block.text, onLink)}
      </p>
    </div>
  );
}

function Section({ section, onLink }: { section: HelpSection; onLink: (key: string) => void }) {
  const isScrutinise = section.kind === 'scrutinise';
  const isRules = section.kind === 'rules';
  return (
    <section
      className={
        isScrutinise
          ? 'rounded-[var(--radius-md)] border border-[#f59e0b]/30 bg-[#f59e0b]/[0.06] p-4'
          : isRules
            ? 'rounded-[var(--radius-md)] border border-[var(--border)] bg-white/[0.03] p-4'
            : ''
      }
    >
      <h3
        className={`text-xs font-semibold uppercase tracking-[0.12em] mb-3 ${
          isScrutinise ? 'text-[#f59e0b]' : 'text-[var(--primary)]'
        }`}
      >
        {section.heading}
      </h3>
      <div>
        {section.blocks.map((block, idx) => (
          <Block key={idx} block={block} onLink={onLink} />
        ))}
      </div>
    </section>
  );
}

export default function HelpContent({ help }: { help: ScreenHelp }) {
  const { highlight } = useHelpDrawer();
  return (
    <div className="space-y-5">
      {help.sections.map((section, idx) => (
        <Section key={idx} section={section} onLink={highlight} />
      ))}
    </div>
  );
}
