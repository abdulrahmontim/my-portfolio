import React from "react";
import Link from "next/link";
import rehypePrettyCode from "rehype-pretty-code";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";

export interface CalloutProps {
  type?: "note" | "tip" | "warning";
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type = "note", title, children }: CalloutProps) {
  const styles = {
    note: {
      border: "border-blue-500",
      bg: "bg-blue-500/10",
      titleColor: "text-blue-500 dark:text-blue-400",
      defaultTitle: "Note",
    },
    tip: {
      border: "border-[var(--custom-green,#2ecc71)]",
      bg: "bg-[var(--custom-green,#2ecc71)]/10",
      titleColor: "text-[var(--custom-green,#2ecc71)]",
      defaultTitle: "Tip",
    },
    warning: {
      border: "border-amber-500",
      bg: "bg-amber-500/10",
      titleColor: "text-amber-500 dark:text-amber-400",
      defaultTitle: "Warning",
    },
  }[type] || {
    border: "border-blue-500",
    bg: "bg-blue-500/10",
    titleColor: "text-blue-500",
    defaultTitle: "Note",
  };

  return (
    <aside
      className={`my-6 p-4 rounded-r-lg border-l-4 ${styles.border} ${styles.bg}`}
      role="note"
    >
      <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${styles.titleColor}`}>
        {title || styles.defaultTitle}
      </div>
      <div className="text-sm sm:text-base leading-relaxed opacity-95 high-contrast-text [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
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
        className="max-w-full h-auto rounded-lg mx-auto border border-[var(--bs-border-color,#374151)] shadow-sm"
        loading="lazy"
      />
      {caption && (
        <figcaption className="mt-2 text-xs sm:text-sm opacity-75 italic high-contrast-text">
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
    <div className="my-6 overflow-hidden rounded-lg border border-[var(--bs-border-color,#374151)] shadow-sm">
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
    <div className="overflow-x-auto my-6 border border-[var(--bs-border-color,#374151)] rounded-lg">
      <table className="min-w-full divide-y divide-[var(--bs-border-color,#374151)]" {...props}>
        {children}
      </table>
    </div>
  );
}

function CustomLink({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (!href) return <a {...props}>{children}</a>;

  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className="text-[var(--custom-green)] hover:underline" {...props}>
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
        className="text-[var(--custom-green)] hover:underline"
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className="text-[var(--custom-green)] hover:underline" {...props}>
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
      className="max-w-full h-auto rounded-lg mx-auto border border-[var(--bs-border-color,#374151)] shadow-sm"
      {...props}
    />
  );
}

export const mdxComponents = {
  Callout,
  Figure,
  YouTube,
  table: CustomTable,
  a: CustomLink,
  img: CustomImg,
};

export const mdxRemoteOptions: MDXRemoteProps["options"] = {
  mdxOptions: {
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: {
            dark: "github-dark",
            light: "github-light",
          },
          keepBackground: false,
        },
      ],
    ] as unknown as NonNullable<NonNullable<MDXRemoteProps["options"]>["mdxOptions"]>["rehypePlugins"],
  },
};
