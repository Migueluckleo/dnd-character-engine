# DnD Character Engine

## Credits

- Inventory fallback icons use the Game-icons icon set via Iconify. Game-icons is licensed under CC BY 3.0 and created by Lorc, Delapouite and contributors: https://game-icons.net/

Aplicación para crear y gestionar personajes DnD 5e SRD.

## Importante para GitHub Pages

GitHub Pages solo publica archivos estáticos. Esta carpeta ya incluye la UI lista para Pages (`index.html`, `ui.html`, `style.css`, `config.public.js`), pero el backend de Express/Prisma no puede ejecutarse dentro de GitHub Pages.

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

Luego abre `ui.html`.

## Revisión antes de publicar

```bash
npm run prepublish:check
```

Ese comando valida TypeScript, pruebas y revisión básica de seguridad del árbol publicable.
