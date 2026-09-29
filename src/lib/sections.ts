import type { EditionId } from './catalogue.ts';

export type Section = { label: string; start: number };

const sections: Record<EditionId, Section[]> = {
  web15: [
    { label: 'Opening', start: 0 }, { label: 'Identity', start: 4 },
    { label: 'Applications', start: 7 }, { label: 'System', start: 13 },
    { label: 'Contact', start: 14 }
  ],
  client20: [
    { label: 'Opening', start: 0 }, { label: 'Identity', start: 4 },
    { label: 'Usage rules', start: 14 }, { label: 'Handover', start: 19 }
  ],
  client30: [
    { label: 'Opening', start: 0 }, { label: 'Identity', start: 4 },
    { label: 'Usage rules', start: 14 }, { label: 'Applications', start: 22 },
    { label: 'Handover', start: 29 }
  ]
};

export function sectionsFor(edition: EditionId): Section[] {
  return sections[edition];
}

export function sectionAt(edition: EditionId, index: number): string {
  return [...sections[edition]].reverse().find((section) => index >= section.start)?.label ?? 'Opening';
}
