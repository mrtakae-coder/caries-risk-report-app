import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 3000);
const root = resolve("web");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg"
};

function resolveFile(url) {
  const pathname = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const requested = pathname === "/" ? "/index.html" : pathname;
  const filePath = resolve(join(root, requested));

  if (!filePath.startsWith(root)) {
    return null;
  }

  return filePath;
}

const server = createServer(async (req, res) => {
  const filePath = resolveFile(req.url ?? "/");

  if (!filePath || !existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  try {
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = extname(filePath);
    res.writeHead(200, {
      "Content-Type": contentTypes[ext] ?? "application/octet-stream",
      "Cache-Control": "no-store"
    });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Server error");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Saliva report web app: http://localhost:${port}`);
});
