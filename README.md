# DnD Character Engine

## Credits

- Inventory fallback icons use the Game-icons icon set via Iconify. Game-icons is licensed under CC BY 3.0 and created by Lorc, Delapouite and contributors: https://game-icons.net/

Aplicación para crear y gestionar personajes DnD 5e SRD.

## Importante para GitHub Pages

GitHub Pages solo publica archivos estáticos. El frontend se construye con Vite hacia `_site/`, pero el backend de Express/Prisma no puede ejecutarse dentro de GitHub Pages.

Para usar login, perfiles y personajes desde Pages, configura `config.public.js` con la URL pública de un backend desplegado aparte:

```js
window.DND_PUBLIC_CONFIG = {
  API_BASE_URL: 'https://tu-backend.example.com',
};
```

No pongas secretos en `config.public.js`.

## Archivos que no deben subirse con secretos

- `.env`
- `.env.*`
- Credenciales de base de datos
- `AUTH_SECRET`
- Llaves privadas de Supabase u otros servicios
- `node_modules/`

## Desarrollo local

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run db:migrate
npm run db:seed
npm run dev
```

En otra terminal, levanta la UI con Vite:

```bash
npm run dev:web
```

Luego abre `http://127.0.0.1:5173/ui.html`.

Para construir el frontend estático:

```bash
npm run build:web
```

## Preview local sin login

Para revisar cambios visuales sin hacer `git push`, sin iniciar sesión y sin tocar producción:

```bash
npm run preview
```

Luego abre `http://127.0.0.1:4173/preview.html`.

Esta vista usa los mismos archivos de UI (`ui.html`, `style.css` y assets), pero activa `?preview=1` con datos demo locales en memoria. No consulta ni modifica la API real.

Nota de arquitectura: desde la Fase 2, el mock API de esta vista vive en `src/client/preview.ts` y se carga con Vite; `ui.html` solo delega las llamadas de preview a ese módulo.

Desde la Fase 3, helpers legacy puros como escape de texto, formato de modificadores y dados viven en `src/client/legacy-utils.ts` y se exponen temporalmente en `window.DND_UTILS` para mantener compatible el `ui.html` durante la migración.

## Revisión antes de publicar

```bash
npm run prepublish:check
```

Ese comando valida TypeScript, pruebas y revisión básica de seguridad del árbol publicable.
