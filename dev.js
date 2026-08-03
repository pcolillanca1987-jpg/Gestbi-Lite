import { serve } from "bun";
import { readFileSync, existsSync } from "fs";
import { join, extname } from "path";

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon"
};

function startServer(port) {
  try {
    const server = serve({
      port: port,
      fetch(req) {
        const url = new URL(req.url);
        let filePath = url.pathname === "/" ? "/index.html" : url.pathname;
        const fullPath = join(import.meta.dir, filePath);

        if (existsSync(fullPath)) {
          const ext = extname(fullPath).toLowerCase();
          const contentType = mimeTypes[ext] || "text/plain";
          const content = readFileSync(fullPath);
          return new Response(content, {
            headers: { "Content-Type": contentType }
          });
        }

        return new Response("404 Not Found", { status: 404 });
      },
    });

    console.log(`🚀 Servidor Bun ejecutándose localmente en http://localhost:${server.port}`);
  } catch (err) {
    if (port < 3010) {
      startServer(port + 1);
    } else {
      console.error("No se pudo iniciar el servidor en puertos 3000-3010", err);
    }
  }
}

startServer(3000);
