import { useEffect, useState } from "react";

export default function WysiwygInlinePreview({ html }: { html: string }) {
  const [text, setText] = useState("");

  useEffect(() => {
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const segments: string[] = [];
    const blockTags = new Set([
      "BLOCKQUOTE",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "LI",
      "P",
      "PRE",
    ]);
    let segment = "";

    const flush = () => {
      const normalized = segment.replace(/\s+/g, " ").trim();
      if (normalized) segments.push(normalized);
      segment = "";
    };

    const readNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        segment += node.textContent ?? "";
        return;
      }

      if (!(node instanceof HTMLElement)) return;
      if (node.tagName === "BR") {
        flush();
        return;
      }

      const isBlock = blockTags.has(node.tagName);
      if (isBlock) flush();
      node.childNodes.forEach(readNode);
      if (isBlock) flush();
    };

    parsed.body.childNodes.forEach(readNode);
    flush();

    setText(segments.join(" · "));
  }, [html]);

  return <span className="line-clamp-2 max-w-xl">{text || "--"}</span>;
}
