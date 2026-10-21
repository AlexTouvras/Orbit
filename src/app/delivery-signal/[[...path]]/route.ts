import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const UPSTREAM =
  "https://raw.githubusercontent.com/AlexTouvras/delivery-signal/main/docs";

const TYPES: Record<string, string> = {
  html: "text/html; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  mjs: "text/javascript; charset=utf-8",
  css: "text/css; charset=utf-8",
  json: "application/json; charset=utf-8",
  webmanifest: "application/manifest+json; charset=utf-8",
  png: "image/png",
  svg: "image/svg+xml",
  py: "text/plain; charset=utf-8",
  csv: "text/csv; charset=utf-8",
  txt: "text/plain; charset=utf-8",
  md: "text/plain; charset=utf-8",
};

function contentType(file: string): string {
  const ext = file.slice(file.lastIndexOf(".") + 1).toLowerCase();
  return TYPES[ext] ?? "application/octet-stream";
}

function fileFromPath(path: string[] | undefined): string | null {
  if (!path?.length) return "index.html";
  if (path.some((seg) => !seg || seg === "." || seg === ".." || seg.includes("\\") || seg.includes("/"))) {
    return null;
  }
  return path.join("/");
}

const CHECKER = path.join(process.cwd(), "src/delivery-signal/pipeline.py");
const SAMPLE = path.join(process.cwd(), "src/delivery-signal/sample");

/**
 * Live Delivery Signal from the public repo's main branch.
 * A push there shows up here on the next request after the short cache.
 * The checker (`engine/pipeline.py`) is the copy in this repo: it builds the
 * week reading. Sample files in `src/delivery-signal/sample/` replace the
 * same names from main. The page and extract.py still come from main.
 */
async function proxy(request: Request, pathSegments: string[] | undefined) {
  const url = new URL(request.url);
  if (!pathSegments?.length) {
    return NextResponse.redirect(new URL("/delivery-signal/index.html", url), 308);
  }

  const file = fileFromPath(pathSegments);
  if (!file) return new NextResponse("Not found", { status: 404 });

  if (file === "engine/pipeline.py") {
    const body = await readFile(CHECKER);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType(file),
        "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
        "X-Delivery-Signal-Ref": "orbit-checker",
      },
    });
  }

  if (file.startsWith("sample/")) {
    const name = file.slice("sample/".length);
    try {
      const body = await readFile(path.join(SAMPLE, name));
      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": contentType(file),
          "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
          "X-Delivery-Signal-Ref": "orbit-sample",
        },
      });
    } catch {
      // The rest of the sample still comes from main.
    }
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${UPSTREAM}/${file}`, { next: { revalidate: 60 } });
  } catch {
    return new NextResponse("Delivery Signal is not reachable right now.", {
      status: 502,
    });
  }
  if (!upstream.ok) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(await upstream.arrayBuffer(), {
    status: 200,
    headers: {
      "Content-Type": contentType(file),
      "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
      "X-Delivery-Signal-Ref": "main",
    },
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  return proxy(request, path);
}
