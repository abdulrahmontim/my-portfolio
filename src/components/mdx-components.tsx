import React from "react";
import Link from "next/link";
import rehypePrettyCode from "rehype-pretty-code";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

export interface CalloutProps {
  type?: "note" | "tip" | "warning";
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type = "note", title, children }: CalloutProps) {
  const label = title || (type === "warning" ? "Warning" : type === "tip" ? "Tip" : "Note");

  return (
    <aside
      className="my-6 p-4 rounded-lg border border-border bg-surface"
      role="note"
    >
      <div className="text-xs font-mono font-medium uppercase tracking-wider mb-2 text-muted">
        {label}
      </div>
      <div className="text-sm sm:text-base leading-relaxed text-text [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}

export interface FigureProps {
  src: string;
  alt: string;
  caption?: string;
}

export function Figure({ src, alt, caption }: FigureProps) {
  return (
    <figure className="my-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="max-w-full h-auto rounded-lg mx-auto border border-border shadow-sm"
        loading="lazy"
      />
      {caption && (
        <figcaption className="mt-2 text-xs sm:text-sm text-muted italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export interface YouTubeProps {
  id: string;
}

export function YouTube({ id }: YouTubeProps) {
  // Strip any accidental full URL, leaving just the 11-char ID
  const cleanId = id.includes("v=")
    ? id.split("v=")[1]?.split("&")[0]
    : id.replace(/^.*youtu\.be\//, "");

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-border shadow-sm">
      <div className="relative w-full aspect-video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${cleanId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    </div>
  );
}

function CustomTable({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse text-left" {...props}>
        {children}
      </table>
    </div>
  );
}

function CustomThead({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className="border-b border-border" {...props}>
      {children}
    </thead>
  );
}

function CustomTbody({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className="divide-y divide-border" {...props}>
      {children}
    </tbody>
  );
}

function CustomTr({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr {...props}>
      {children}
    </tr>
  );
}

function CustomTh({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className="font-semibold text-muted py-2 px-3 text-left border-b border-border" {...props}>
      {children}
    </th>
  );
}

function CustomTd({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className="py-2 px-3 text-text text-left" {...props}>
      {children}
    </td>
  );
}

function CustomLink({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const linkClasses = "text-text underline decoration-border underline-offset-[3px] hover:text-primary hover:decoration-primary transition-colors";
  if (!href) return <a {...props}>{children}</a>;

  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={linkClasses} {...props}>
        {children}
      </a>
    );
  }

  const isExternal = href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//");

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClasses}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={linkClasses} {...props}>
      {children}
    </Link>
  );
}

export function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  return match ? match[1] : null;
}

function CustomImg({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || ""}
      loading="lazy"
      decoding="async"
      className="max-w-full h-auto rounded-lg mx-auto border border-border shadow-sm"
      {...props}
    />
  );
}

export const mdxComponents = {
  Callout,
  Figure,
  YouTube,
  table: CustomTable,
  thead: CustomThead,
  tbody: CustomTbody,
  tr: CustomTr,
  th: CustomTh,
  td: CustomTd,
  a: CustomLink,
  img: CustomImg,
};

export const mdxRemoteOptions: MDXRemoteProps["options"] = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: {
            dark: "github-dark-dimmed",
            light: "github-light",
          },
          keepBackground: false,
        },
      ],
    ] as unknown as NonNullable<NonNullable<MDXRemoteProps["options"]>["mdxOptions"]>["rehypePlugins"],
  },
};
