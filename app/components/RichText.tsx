import type { ReactNode } from "react";

const TOKEN_PATTERN = /(\*\*[^*]+\*\*|`[^`]+`|https?:\/\/[^\s，；;、]+)/g;

function stripTrailingPunctuation(value: string) {
  const match = value.match(/^(.*?)([。；;，、]+)?$/);
  return { url: match?.[1] ?? value, trailing: match?.[2] ?? "" };
}

export function RichText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(text.slice(cursor, index));
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={index}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(<mark key={index}>{token.slice(1, -1)}</mark>);
    } else {
      const { url, trailing } = stripTrailingPunctuation(token);
      nodes.push(
        <span key={index}>
          <a href={url} target="_blank" rel="noreferrer">
            {url.replace(/^https?:\/\//, "")}
          </a>
          {trailing}
        </span>,
      );
    }
    cursor = index + token.length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}
