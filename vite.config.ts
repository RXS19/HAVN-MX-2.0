import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'local-api-handler',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const matchUrl = req.url?.split('?')[0];
            if ((matchUrl === '/api/chat' || matchUrl === '/api/contact') && req.method === 'POST') {
              try {
                // Buffer the request body
                const buffers: Uint8Array[] = [];
                for await (const chunk of req) {
                  buffers.push(chunk as Uint8Array);
                }
                const bodyStr = Buffer.concat(buffers).toString('utf-8');
                const body = bodyStr ? JSON.parse(bodyStr) : {};

                // Dynamically load the TypeScript API handler
                const apiPath = matchUrl === '/api/chat' ? '/api/chat.ts' : '/api/contact.ts';
                const { default: handler } = await server.ssrLoadModule(apiPath);

                // Adapt Node/Vite request and response objects to match Vercel's API
                const originalSetHeader = res.setHeader.bind(res);
                const adaptedReq = Object.assign(req, { body });
                const adaptedRes = Object.assign(res, {
                  status(statusCode: number) {
                    res.statusCode = statusCode;
                    return adaptedRes;
                  },
                  setHeader(key: string, value: string) {
                    originalSetHeader(key, value);
                    return adaptedRes;
                  },
                  json(data: any) {
                    originalSetHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                    return adaptedRes;
                  }
                });

                await handler(adaptedReq as any, adaptedRes as any);
              } catch (err: any) {
                console.error("Local dev API error:", err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: "Ocurrió un error en el servidor de desarrollo local." }));
              }
            } else {
              next();
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
