import { spawn, execSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const PORT = 3999;
const BASE_URL = `http://localhost:${PORT}`;
const SERVER_START_TIMEOUT = 60000;
const OVERALL_TIMEOUT = 120000;

let serverProcess = null;
let overallTimer = null;

function cleanup() {
  if (overallTimer) {
    clearTimeout(overallTimer);
    overallTimer = null;
  }
  if (serverProcess && serverProcess.pid) {
    try {
      if (process.platform === "win32") {
        execSync(`taskkill /PID ${serverProcess.pid} /T /F`, { stdio: "ignore" });
      } else {
        process.kill(-serverProcess.pid, "SIGKILL");
      }
    } catch (_) {
      try {
        serverProcess.kill("SIGKILL");
      } catch (_) {}
    }
    serverProcess = null;
  }
}

// Ensure cleanup on abnormal termination
process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit(1);
});
process.on("SIGTERM", () => {
  cleanup();
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception in link checker:", err);
  cleanup();
  process.exit(1);
});

// Clear port 3999 if in use
function freePortIfBusy() {
  try {
    if (process.platform === "win32") {
      const output = execSync(`netstat -ano | findstr :${PORT}`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
      });
      for (const line of output.split("\n")) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(pid) && parseInt(pid, 10) > 0) {
          try {
            execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
          } catch (_) {}
        }
      }
    }
  } catch (_) {}
}

async function waitForServer(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) {
        return true;
      }
    } catch (_) {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server at ${url} failed to respond within ${timeoutMs / 1000}s`);
}

function extractLinksAndIds(html) {
  // Extract ids on the page
  const idRegex = /\bid=["']([^"']*)["']/gi;
  const ids = new Set();
  let m;
  while ((m = idRegex.exec(html)) !== null) {
    ids.add(m[1]);
  }

  // Extract <a ...> tags
  const aTagRegex = /<a\b([^>]*)>/gi;
  const links = [];
  while ((m = aTagRegex.exec(html)) !== null) {
    const attrs = m[1];
    const hrefMatch = attrs.match(/\bhref=["']([^"']*)["']/i);
    if (!hrefMatch) continue;

    const href = hrefMatch[1];
    const targetMatch = attrs.match(/\btarget=["']([^"']*)["']/i);
    const target = targetMatch ? targetMatch[1] : null;

    const relMatch = attrs.match(/\brel=["']([^"']*)["']/i);
    const rel = relMatch ? relMatch[1] : null;

    links.push({ href, target, rel });
  }

  return { ids, links };
}

async function runLinkCheck() {
  overallTimer = setTimeout(() => {
    console.error(`Overall timeout of ${OVERALL_TIMEOUT / 1000}s exceeded.`);
    cleanup();
    process.exit(1);
  }, OVERALL_TIMEOUT);

  console.log("Preparing next start on port", PORT, "...");
  freePortIfBusy();

  const nextBin = path.resolve("node_modules/next/dist/bin/next");
  serverProcess = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
    stdio: "pipe",
    env: { ...process.env, PORT: String(PORT) },
  });

  serverProcess.stderr.on("data", (data) => {
    // Optionally inspect server errors if needed
  });

  console.log("Waiting for production server to respond...");
  await waitForServer(BASE_URL, SERVER_START_TIMEOUT);
  console.log("Server responded successfully! Beginning crawl.\n");

  const queue = ["/"];
  const visitedPages = new Set();
  const pageCache = new Map(); // path -> { status, html, ids }
  const auditResults = []; // { sourcePage, href, resolvedTarget, status, issue }

  async function fetchResource(urlPath) {
    if (pageCache.has(urlPath)) {
      return pageCache.get(urlPath);
    }
    const fullUrl = `${BASE_URL}${urlPath}`;
    try {
      const res = await fetch(fullUrl);
      const isHtml = res.headers.get("content-type")?.includes("text/html");
      const isXml = res.headers.get("content-type")?.includes("xml");
      const text = (isHtml || isXml) ? await res.text() : "";
      const { ids, links } = isHtml ? extractLinksAndIds(text) : { ids: new Set(), links: [] };
      const data = {
        status: res.status,
        isHtml: Boolean(isHtml),
        html: text,
        ids,
        links,
      };
      pageCache.set(urlPath, data);
      return data;
    } catch (err) {
      const data = {
        status: 0,
        isHtml: false,
        html: "",
        ids: new Set(),
        links: [],
        error: err.message,
      };
      pageCache.set(urlPath, data);
      return data;
    }
  }

  // Seed with /sitemap.xml if available
  try {
    const sitemapData = await fetchResource("/sitemap.xml");
    if (sitemapData.status === 200 && sitemapData.html) {
      const locRegex = /<loc>(.*?)<\/loc>/g;
      let locMatch;
      while ((locMatch = locRegex.exec(sitemapData.html)) !== null) {
        try {
          const locUrl = new URL(locMatch[1]);
          const pathname = locUrl.pathname || "/";
          if (!queue.includes(pathname)) {
            queue.push(pathname);
          }
        } catch (_) {}
      }
    }
  } catch (_) {}

  // Crawl queue
  while (queue.length > 0) {
    const currentPath = queue.shift();
    if (visitedPages.has(currentPath)) continue;
    visitedPages.add(currentPath);

    const pageData = await fetchResource(currentPath);
    if (!pageData.isHtml) continue;

    for (const { href, target, rel } of pageData.links) {
      // 1. Empty or #
      if (!href || href === "#") {
        auditResults.push({
          sourcePage: currentPath,
          href: href || "(empty)",
          resolvedTarget: "N/A",
          status: "empty or hash href",
        });
        continue;
      }

      // 2. mailto:
      if (href.startsWith("mailto:")) {
        const hasAt = href.includes("@");
        auditResults.push({
          sourcePage: currentPath,
          href,
          resolvedTarget: href,
          status: hasAt ? "OK" : "invalid mailto format",
        });
        continue;
      }

      // 3. tel:
      if (href.startsWith("tel:")) {
        auditResults.push({
          sourcePage: currentPath,
          href,
          resolvedTarget: href,
          status: "OK",
        });
        continue;
      }

      // 4. External link (http:// or https://)
      if (href.startsWith("http://") || href.startsWith("https://")) {
        // Check for hardcoded internal site domain
        if (
          href.includes("abdulrahmon-sulaimon.vercel.app") ||
          href.includes(`localhost:${PORT}`)
        ) {
          auditResults.push({
            sourcePage: currentPath,
            href,
            resolvedTarget: href,
            status: "hardcoded site domain",
          });
          continue;
        }

        let isValidUrl = true;
        try {
          new URL(href);
        } catch (_) {
          isValidUrl = false;
        }

        if (!isValidUrl) {
          auditResults.push({
            sourcePage: currentPath,
            href,
            resolvedTarget: href,
            status: "invalid external URL format",
          });
          continue;
        }

        if (target !== "_blank") {
          auditResults.push({
            sourcePage: currentPath,
            href,
            resolvedTarget: href,
            status: "missing target",
          });
          continue;
        }

        const relParts = (rel || "").toLowerCase().split(/\s+/);
        if (!relParts.includes("noopener") || !relParts.includes("noreferrer")) {
          auditResults.push({
            sourcePage: currentPath,
            href,
            resolvedTarget: href,
            status: "missing rel",
          });
          continue;
        }

        auditResults.push({
          sourcePage: currentPath,
          href,
          resolvedTarget: href,
          status: "OK",
        });
        continue;
      }

      // 5. Internal link (starts with / or #)
      let targetPath;
      let anchor = null;

      if (href.startsWith("#")) {
        targetPath = currentPath;
        anchor = href.slice(1);
      } else {
        const [pathWithQuery, hash] = href.split("#");
        const [pathOnly] = pathWithQuery.split("?");
        targetPath = pathOnly || "/";
        anchor = hash || null;
      }

      const targetResource = await fetchResource(targetPath);
      if (targetResource.status === 404) {
        auditResults.push({
          sourcePage: currentPath,
          href,
          resolvedTarget: targetPath + (anchor ? `#${anchor}` : ""),
          status: "404",
        });
        continue;
      }

      if (targetResource.status !== 200 && targetResource.status !== 304) {
        auditResults.push({
          sourcePage: currentPath,
          href,
          resolvedTarget: targetPath + (anchor ? `#${anchor}` : ""),
          status: `HTTP ${targetResource.status}`,
        });
        continue;
      }

      if (anchor) {
        if (!targetResource.ids.has(anchor)) {
          auditResults.push({
            sourcePage: currentPath,
            href,
            resolvedTarget: targetPath + `#${anchor}`,
            status: "missing anchor",
          });
          continue;
        }
      }

      auditResults.push({
        sourcePage: currentPath,
        href,
        resolvedTarget: targetPath + (anchor ? `#${anchor}` : ""),
        status: "OK",
      });

      // Add newly discovered HTML page to queue
      if (
        targetResource.isHtml &&
        !visitedPages.has(targetPath) &&
        !queue.includes(targetPath)
      ) {
        queue.push(targetPath);
      }
    }
  }

  // Print results table
  console.log("=".repeat(100));
  console.log("LINK AUDIT RESULTS");
  console.log("=".repeat(100));

  // Print neatly formatted table
  const colWidths = {
    source: Math.max(12, ...auditResults.map((r) => r.sourcePage.length)),
    href: Math.max(10, ...auditResults.map((r) => r.href.length)),
    target: Math.max(15, ...auditResults.map((r) => r.resolvedTarget.length)),
    status: Math.max(8, ...auditResults.map((r) => r.status.length)),
  };

  const header = `| ${"Source Page".padEnd(colWidths.source)} | ${"Href".padEnd(colWidths.href)} | ${"Resolved Target".padEnd(colWidths.target)} | ${"Status".padEnd(colWidths.status)} |`;
  const sep = `|-${"-".repeat(colWidths.source)}-|-${"-".repeat(colWidths.href)}-|-${"-".repeat(colWidths.target)}-|-${"-".repeat(colWidths.status)}-|`;

  console.log(header);
  console.log(sep);

  let hasError = false;
  for (const r of auditResults) {
    if (r.status !== "OK") {
      hasError = true;
    }
    const row = `| ${r.sourcePage.padEnd(colWidths.source)} | ${r.href.padEnd(colWidths.href)} | ${r.resolvedTarget.padEnd(colWidths.target)} | ${r.status.padEnd(colWidths.status)} |`;
    console.log(row);
  }

  console.log("=".repeat(100));
  const total = auditResults.length;
  const passed = auditResults.filter((r) => r.status === "OK").length;
  const failed = total - passed;

  console.log(`Summary: ${total} links audited. ${passed} OK, ${failed} broken.`);

  cleanup();

  if (hasError) {
    console.error("\nLink check FAILED.");
    process.exit(1);
  } else {
    console.log("\nLink check PASSED with 0 errors.");
    process.exit(0);
  }
}

runLinkCheck().catch((err) => {
  console.error("Fatal crawler error:", err);
  cleanup();
  process.exit(1);
});
