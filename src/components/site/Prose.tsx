import type { ReactNode } from "react";

// A deliberately small Markdown subset for Journal and Alchemy text, rendered
// as React elements (no raw HTML, so Studio text cannot inject markup).
// Supports: paragraphs, ## and ### headings, > quotes, - and 1. lists, ---,
// **bold**, *italic*, `code` and [links](https://…).

const SAFE_HREF = /^(https?:\/\/|mailto:|\/)/i;

function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const key = `${keyPrefix}-${i++}`;
    if (match[2]) nodes.push(<strong key={key}>{match[2]}</strong>);
    else if (match[3]) nodes.push(<em key={key}>{match[3]}</em>);
    else if (match[4]) nodes.push(<code key={key}>{match[4]}</code>);
    else if (match[5] && match[6]) {
      const href = match[6];
      if (SAFE_HREF.test(href)) {
        const external = /^https?:/i.test(href);
        nodes.push(
          <a
            key={key}
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {match[5]}
          </a>,
        );
      } else {
        nodes.push(match[5]);
      }
    }
    last = pattern.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Prose({ text, className = "" }: { text: string; className?: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const out: ReactNode[] = [];

  blocks.forEach((raw, b) => {
    const block = raw.trim();
    if (!block) return;
    const key = `b${b}`;
    const lines = block.split("\n");

    if (/^---+$/.test(block)) {
      out.push(<hr key={key} />);
    } else if (block.startsWith("### ")) {
      out.push(<h3 key={key}>{inline(block.slice(4), key)}</h3>);
    } else if (block.startsWith("## ")) {
      out.push(<h2 key={key}>{inline(block.slice(3), key)}</h2>);
    } else if (lines.every((l) => l.startsWith(">"))) {
      const quote = lines.map((l) => l.replace(/^>\s?/, "")).join(" ");
      out.push(<blockquote key={key}>{inline(quote, key)}</blockquote>);
    } else if (lines.every((l) => /^[-*]\s+/.test(l))) {
      out.push(
        <ul key={key}>
          {lines.map((l, i) => (
            <li key={i}>{inline(l.replace(/^[-*]\s+/, ""), `${key}-${i}`)}</li>
          ))}
        </ul>,
      );
    } else if (lines.every((l) => /^\d+\.\s+/.test(l))) {
      out.push(
        <ol key={key}>
          {lines.map((l, i) => (
            <li key={i}>{inline(l.replace(/^\d+\.\s+/, ""), `${key}-${i}`)}</li>
          ))}
        </ol>,
      );
    } else {
      out.push(
        <p key={key}>
          {lines.map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {inline(line, `${key}-${i}`)}
            </span>
          ))}
        </p>,
      );
    }
  });

  return <div className={`prose-ca ${className}`}>{out}</div>;
}
