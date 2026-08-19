"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Preprocesses raw streaming text from LLM to convert pseudo-XML tags like <product-card> ... </product-card>
 * into clean, beautifully formatted Markdown callout boxes.
 */
function preprocessContent(rawContent: string): string {
  if (!rawContent) return "";

  // 1. Transform <product-card> ... </product-card> blocks into clean markdown callout blocks
  let processed = rawContent.replace(
    /<product-card>([\s\S]*?)<\/product-card>/gi,
    (_match, innerText) => {
      const trimmed = innerText.trim();

      // Reformat inline hyphen separators (" - **") into clean bullet points
      const formattedLines = trimmed
        .replace(/\s*-\s*\*\*/g, "\n- **")
        .replace(/^\s*\*\*/, "- **");

      return `\n\n> 👟 **Product Recommendation**\n> \n${formattedLines
        .split("\n")
        .map((line: string) => `> ${line}`)
        .join("\n")}\n\n`;
    }
  );

  // 2. Clean up any leftover unclosed pseudo XML tags during active SSE streaming
  processed = processed
    .replace(/<product-card>/gi, "\n\n> 👟 **Product Recommendation**\n> ")
    .replace(/<\/product-card>/gi, "\n\n")
    .replace(/<search-results>/gi, "")
    .replace(/<\/search-results>/gi, "");

  return processed;
}

/**
 * Custom CodeBlock with interactive Copy button.
 */
function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-2.5 overflow-hidden rounded-xl border border-gray-800 bg-gray-900 text-gray-100 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-950/80 px-3.5 py-1.5 text-[11px] text-gray-400">
        <span className="font-mono text-gray-300">{language || "code"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-[12px] font-mono leading-relaxed text-gray-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps): React.ReactNode {
  if (!content) return null;

  const processedContent = preprocessContent(content);

  return (
    <div className={`markdown-body space-y-2 text-xs leading-relaxed text-gray-800 ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-gray-950 mt-3 mb-1.5 pb-1 border-b border-gray-100">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-gray-950 mt-2.5 mb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold text-gray-900 mt-2 mb-1">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-semibold text-gray-800 mt-1.5 mb-0.5">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-xs leading-relaxed text-gray-800 my-1">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-1.5 space-y-1 pl-4 text-xs text-gray-800 list-disc">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-1.5 space-y-1 pl-4 text-xs text-gray-800 list-decimal">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-3 border-blue-500 bg-blue-50/60 px-3.5 py-2 text-xs text-gray-800 rounded-r-xl not-italic shadow-2xs">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-950">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-800">{children}</em>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700 transition-colors"
            >
              {children}
            </a>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const match = /language-(\w+)/.exec(codeClassName || "");
            const codeString = String(children).replace(/\n$/, "");
            const isInline = !match && !String(children).includes("\n");

            if (isInline) {
              return (
                <code
                  className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-pink-600 border border-gray-200"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                code={codeString}
                language={match ? match[1] : undefined}
              />
            );
          },
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-xs">
              <table className="min-w-full text-left text-xs text-gray-700">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-semibold text-gray-900 uppercase tracking-wider">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-100">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50/60 transition-colors">{children}</tr>
          ),
          th: ({ children }) => <th className="px-3 py-2">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 text-gray-800">{children}</td>,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
