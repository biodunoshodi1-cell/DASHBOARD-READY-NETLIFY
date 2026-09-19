import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { phonicsReferenceSections, type ReferenceSection, type RefBlock } from '@/data/phonicsReferenceContent';

// ---------------------------------------------------------------------------
// A browsable, searchable version of "The Phonics Rules Book" — the
// reference half of the Phonics area (paired with the hands-on Practice
// sections). Parents/teachers (or curious older learners) can look up a
// spelling rule instead of practicing a specific sound.
// ---------------------------------------------------------------------------

function blockMatches(block: RefBlock, query: string): boolean {
  const q = query.toLowerCase();
  switch (block.type) {
    case 'paragraph':
    case 'tip':
      return block.text.toLowerCase().includes(q);
    case 'bullets':
      return block.items.some((item) => item.toLowerCase().includes(q));
    case 'table':
      return (
        (block.title?.toLowerCase().includes(q) ?? false) ||
        block.rows.some(
          (row) =>
            row.spelling.toLowerCase().includes(q) ||
            row.example.toLowerCase().includes(q) ||
            row.sound.toLowerCase().includes(q) ||
            row.notes.toLowerCase().includes(q),
        )
      );
    default:
      return false;
  }
}

function sectionMatches(section: ReferenceSection, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  if (section.title.toLowerCase().includes(q) || section.summary.toLowerCase().includes(q)) return true;
  return section.blocks.some((block) => blockMatches(block, query));
}

function RefBlockView({ block }: { block: RefBlock }) {
  if (block.type === 'paragraph') {
    return <p className="text-base text-foreground/90 leading-relaxed">{block.text}</p>;
  }
  if (block.type === 'tip') {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-900 rounded-2xl px-5 py-4 text-base text-amber-900 dark:text-amber-200 font-semibold">
        💡 {block.text}
      </div>
    );
  }
  if (block.type === 'bullets') {
    return (
      <ul className="space-y-2 list-disc list-inside marker:text-pink-500">
        {block.items.map((item, i) => (
          <li key={i} className="text-base text-foreground/90 leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    );
  }
  // table
  return (
    <div className="space-y-2">
      {block.title && <h4 className="font-black text-foreground text-lg">{block.title}</h4>}
      <div className="rounded-xl border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-black">Spelling</TableHead>
              <TableHead className="font-black">Example</TableHead>
              <TableHead className="font-black">Sound</TableHead>
              <TableHead className="font-black">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {block.rows.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="font-bold whitespace-nowrap">{row.spelling}</TableCell>
                <TableCell className="whitespace-nowrap">{row.example}</TableCell>
                <TableCell className="whitespace-nowrap">{row.sound}</TableCell>
                <TableCell className="text-sm text-muted-foreground min-w-[220px]">{row.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function PhonicsReferenceBook() {
  const [query, setQuery] = useState('');

  const visibleSections = useMemo(
    () => phonicsReferenceSections.filter((section) => sectionMatches(section, query)),
    [query],
  );

  return (
    <div>
      <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm rounded-3xl p-6 border-2 border-white/50 mb-6">
        <h2 className="text-2xl font-black text-foreground mb-1">📖 The Phonics Rule Book</h2>
        <p className="text-muted-foreground font-semibold mb-4">
          A parent &amp; teacher reference for how English sounds are spelled — tap a section to open it, or search for a rule.
        </p>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rules, sounds, or example words (e.g. &quot;silent e&quot;, &quot;FLOSS&quot;, &quot;igh&quot;)"
            className="pl-12 pr-10 h-12 rounded-2xl"
            data-testid="input-reference-search"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
              data-testid="button-clear-search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {visibleSections.length === 0 ? (
        <div className="bg-white/90 dark:bg-card/90 rounded-3xl p-10 text-center border-2 border-white/50">
          <p className="text-xl font-black text-foreground mb-1">No matches for "{query}"</p>
          <p className="text-muted-foreground font-semibold">Try a different word, like a sound (e.g. "oa") or a rule name (e.g. "doubling").</p>
        </div>
      ) : (
        <div className="bg-white/90 dark:bg-card/90 rounded-3xl border-2 border-white/50 px-6">
          <Accordion type="multiple" defaultValue={query ? visibleSections.map((s) => s.id) : []}>
            {visibleSections.map((section) => (
              <AccordionItem key={section.id} value={section.id} data-testid={`ref-section-${section.id}`}>
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-start gap-3 text-left">
                    <span className="text-3xl leading-none">{section.icon}</span>
                    <div>
                      <div className="font-black text-lg text-foreground">{section.title}</div>
                      <div className="text-sm text-muted-foreground font-semibold">{section.summary}</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-5 pl-1">
                    {section.blocks.map((block, i) => (
                      <RefBlockView key={i} block={block} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
