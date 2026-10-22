import type React from "react";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert";
import { compileMDX } from "next-mdx-remote/rsc";
import { renderToStaticMarkup } from "react-dom/server";
import remarkGfm from "remark-gfm";

describe("MDX Rendering & Table Support", () => {
  const mdxComponentsFile = fs.readFileSync(
    path.resolve("src/components/mdx-components.tsx"),
    "utf8"
  );
  const packageJson = JSON.parse(
    fs.readFileSync(path.resolve("package.json"), "utf8")
  );

  it("package.json includes remark-gfm as a dependency", () => {
    assert.ok(
      packageJson.dependencies["remark-gfm"],
      "remark-gfm must be listed in package.json dependencies"
    );
  });

  it("mdx-components.tsx imports remark-gfm and adds it to remarkPlugins", () => {
    assert.match(
      mdxComponentsFile,
      /import\s+remarkGfm\s+from\s+["']remark-gfm["']/,
      "mdx-components.tsx must import remarkGfm"
    );
    assert.match(
      mdxComponentsFile,
      /remarkPlugins:\s*\[[\s\S]*?remarkGfm[\s\S]*?\]/,
      "mdxRemoteOptions must include remarkGfm in remarkPlugins"
    );
  });

  it("mdx-components.tsx registers custom table primitives", () => {
    assert.match(
      mdxComponentsFile,
      /function\s+CustomTable/,
      "mdx-components.tsx must define CustomTable"
    );
    assert.match(
      mdxComponentsFile,
      /function\s+CustomThead/,
      "mdx-components.tsx must define CustomThead"
    );
    assert.match(
      mdxComponentsFile,
      /function\s+CustomTh/,
      "mdx-components.tsx must define CustomTh"
    );
    assert.match(
      mdxComponentsFile,
      /function\s+CustomTd/,
      "mdx-components.tsx must define CustomTd"
    );
    assert.match(
      mdxComponentsFile,
      /function\s+CustomTr/,
      "mdx-components.tsx must define CustomTr"
    );
    assert.match(
      mdxComponentsFile,
      /mdxComponents\s*=\s*\{[\s\S]*?table:\s*CustomTable/,
      "mdxComponents must register table"
    );
    assert.match(
      mdxComponentsFile,
      /mdxComponents\s*=\s*\{[\s\S]*?thead:\s*CustomThead/,
      "mdxComponents must register thead"
    );
    assert.match(
      mdxComponentsFile,
      /mdxComponents\s*=\s*\{[\s\S]*?th:\s*CustomTh/,
      "mdxComponents must register th"
    );
    assert.match(
      mdxComponentsFile,
      /mdxComponents\s*=\s*\{[\s\S]*?td:\s*CustomTd/,
      "mdxComponents must register td"
    );
    assert.match(
      mdxComponentsFile,
      /mdxComponents\s*=\s*\{[\s\S]*?tr:\s*CustomTr/,
      "mdxComponents must register tr"
    );
  });

  it("resets table margin to 0 so table fits flush within wrapper card without extra top/bottom space", () => {
    const globalsCss = fs.readFileSync(
      path.resolve("src/app/globals.css"),
      "utf8"
    );

    // Verify globals.css overrides default prose table margin (which is 2em by default)
    assert.match(
      globalsCss,
      /\.prose\s+table\s*\{[\s\S]*?margin:\s*0\s*!important/,
      "globals.css must reset .prose table margin to 0"
    );

    // Verify CustomTable applies margin-reset utility classes
    assert.match(
      mdxComponentsFile,
      /m-0!|my-0!/,
      "CustomTable must apply zero-margin utility classes"
    );
  });

  it("renders markdown tables as semantic HTML table elements with remark-gfm", async () => {
    const markdownTable = `
| Strategy | Attempt 1 | Attempt 2 | Attempt 3 |
| :--- | :--- | :--- | :--- |
| Fixed Interval | 100ms | 100ms | 100ms |
| Exponential | 100ms | 200ms | 400ms |
| Full Jitter | 0–100ms | 0–200ms | 0–400ms |
`.trim();

    const result = await compileMDX({
      source: markdownTable,
      options: {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
        },
      },
    });

    const html = renderToStaticMarkup(result.content);

    // Verify it renders semantic table markup
    assert.ok(html.includes("<table"), "Output HTML must contain <table");
    assert.ok(html.includes("<thead"), "Output HTML must contain <thead");
    assert.ok(html.includes("<tbody"), "Output HTML must contain <tbody");
    assert.ok(html.includes("<tr"), "Output HTML must contain <tr");
    assert.ok(html.includes("<th"), "Output HTML must contain <th");
    assert.ok(html.includes("<td"), "Output HTML must contain <td");

    // Verify expected table header content
    assert.ok(html.includes("Strategy"), "Table must contain 'Strategy' header");
    assert.ok(html.includes("Attempt 1"), "Table must contain 'Attempt 1' header");
    assert.ok(html.includes("Attempt 2"), "Table must contain 'Attempt 2' header");
    assert.ok(html.includes("Attempt 3"), "Table must contain 'Attempt 3' header");

    // Verify expected table row content
    assert.ok(html.includes("Fixed Interval"), "Table must contain 'Fixed Interval' row");
    assert.ok(html.includes("Exponential"), "Table must contain 'Exponential' row");
    assert.ok(html.includes("Full Jitter"), "Table must contain 'Full Jitter' row");

    // Verify it is NOT collapsed into raw markdown pipe text inside a <p> tag
    assert.ok(
      !html.includes("<p>| Strategy"),
      "Markdown table must not be rendered as raw pipe text in a paragraph"
    );
  });

  it("sample-retry-backoff.mdx renders table successfully with remark-gfm", async () => {
    const postSource = fs.readFileSync(
      path.resolve("content/blog/sample-retry-backoff.mdx"),
      "utf8"
    );

    // Strip frontmatter
    const content = postSource.replace(/^---[\s\S]*?---\s*/, "");

    const result = await compileMDX({
      source: content,
      components: {
        Callout: ({ children }: { children?: React.ReactNode }) => children,
      },
      options: {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
        },
      },
    });

    const html = renderToStaticMarkup(result.content);

    assert.ok(html.includes("<table"), "Rendered blog post must contain <table");
    assert.ok(html.includes("Fixed Interval"), "Rendered blog post must contain table cell");
    assert.ok(
      !html.includes("<p>| Strategy"),
      "Rendered blog post must not have raw markdown table syntax"
    );
  });
});
