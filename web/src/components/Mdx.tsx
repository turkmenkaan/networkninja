/**
 * Server-rendered MDX.
 *
 * Compiles raw MDX source (content.mdx / solution.mdx) with next-mdx-remote's
 * RSC entrypoint. The pipeline:
 *   - remark-gfm           → tables, strikethrough, task lists, autolinks
 *   - rehype-slug          → stable heading ids (anchor targets)
 *   - rehype-pretty-code   → Shiki syntax highlighting for fenced code blocks
 *
 * A custom components map styles headings/links/tables/code to NetworkNinjas'
 * "midnight dojo / terminal" system. Fenced blocks with NO language (the CLI
 * command/output examples the curriculum embeds) are detected and rendered in
 * a dedicated `.nn-cli` terminal well instead of being run through the highlighter.
 */
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import { ASTopology } from "./diagrams/ASTopology";
import { MessageTimeline } from "./diagrams/MessageTimeline";
import { HierarchyTree } from "./diagrams/HierarchyTree";
import { ASPathFlow } from "./diagrams/ASPathFlow";
import { StateMachine } from "./diagrams/StateMachine";

const prettyCodeOptions: PrettyCodeOptions = {
  // A dark Shiki theme close to our terminal palette; CSS in globals.css
  // overrides individual token colors via the --shiki-* variables.
  theme: "github-dark",
  keepBackground: false,
  defaultLang: "plaintext",
};

/** Pull the raw text out of a <code> child so we can sniff ASCII diagrams. */
function childText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(childText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return childText((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

// Custom element renderers — the canonical next-mdx-remote `components` map.
// `MDXComponents` comes from `@types/mdx`, a dependency of next-mdx-remote.
const components: MDXComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1
      {...props}
      className="mt-0 scroll-mt-24 font-display text-3xl font-bold tracking-tight text-paper sm:text-[2.1rem]"
    />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      {...props}
      className="group mt-12 scroll-mt-24 border-b border-ink-line/70 pb-2 font-display text-2xl font-semibold tracking-tight text-paper"
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3
      {...props}
      className="mt-9 scroll-mt-24 font-display text-xl font-semibold tracking-tight text-paper"
    />
  ),
  h4: (props: ComponentPropsWithoutRef<"h4">) => (
    <h4
      {...props}
      className="mt-7 scroll-mt-24 font-display text-base font-semibold uppercase tracking-[0.14em] text-paper-muted"
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p {...props} className="my-4 leading-[1.75] text-paper-muted" />
  ),
  a: ({ href = "#", ...props }: ComponentPropsWithoutRef<"a">) => {
    const isInternal = href.startsWith("/") || href.startsWith("#");
    const className =
      "font-medium text-blade underline decoration-blade/30 underline-offset-4 transition-colors hover:decoration-blade";
    if (isInternal) {
      return <Link href={href} className={className} {...props} />;
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={className}
        {...props}
      />
    );
  },
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      {...props}
      className="my-4 list-disc space-y-2 pl-6 text-paper-muted marker:text-blade-dim"
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      {...props}
      className="my-4 list-decimal space-y-2 pl-6 text-paper-muted marker:font-mono marker:text-blade-dim"
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li {...props} className="leading-[1.7] [&>p]:my-1" />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong {...props} className="font-semibold text-paper" />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      {...props}
      className="my-6 rounded-r-lg border-l-2 border-blade/60 bg-blade/[0.05] py-2 pl-5 pr-4 text-paper-muted [&>p]:my-1.5"
    />
  ),
  hr: () => <hr className="my-10 border-ink-line/70" />,
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-ink-line">
      <table {...props} className="w-full border-collapse text-sm" />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead {...props} className="bg-ink-raised" />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      {...props}
      className="border-b border-ink-line px-4 py-2.5 text-left font-mono text-xs font-semibold uppercase tracking-wider text-paper-muted"
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td
      {...props}
      className="border-b border-ink-line/60 px-4 py-2.5 align-top text-paper-muted"
    />
  ),
  // `pre` arrives already wrapped by rehype-pretty-code for highlighted blocks.
  // Fenced blocks with NO language (the curriculum's CLI command/output
  // examples) get tagged with the defaultLang ("plaintext"); we lift those out
  // of the highlighter into a dedicated `.nn-cli` terminal well.
  pre: (props: ComponentPropsWithoutRef<"pre">) => {
    const lang = (props as Record<string, unknown>)["data-language"];
    if (lang === "plaintext" || lang === "text" || lang === "ascii") {
      const text = childText(props.children).replace(/\n$/, "");
      return <div className="nn-cli">{text}</div>;
    }
    return <pre {...props} />;
  },
  code: (props: ComponentPropsWithoutRef<"code">) => <code {...props} />,
  // Curriculum diagram primitives — authors use these in MDX instead of
  // hand-rolled SVG or ASCII. See src/components/diagrams/.
  ASTopology,
  MessageTimeline,
  HierarchyTree,
  ASPathFlow,
  StateMachine,
};

export async function Mdx({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        // Our MDX is trusted, git-authored curriculum content (never user
        // input). next-mdx-remote v6 blocks JS expressions by default; we
        // re-enable them because diagram components take expression props
        // (e.g. nodes={[...]}, caption={<>...</>}). blockDangerousJS stays ON,
        // so eval/Function/process/require remain blocked.
        blockJS: false,
        blockDangerousJS: true,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [rehypePrettyCode, prettyCodeOptions],
          ],
        },
      }}
    />
  );
}
