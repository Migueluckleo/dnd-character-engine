# Seguridad

## Qué sí puede publicarse

- Código fuente.
- `ui.html`, `style.css`, `index.html`, `.nojekyll`.
- `config.public.js` solo si contiene URLs públicas.
- `.env.example` sin credenciales reales.

## Qué nunca debe publicarse

- `.env` o `.env.*` con valores reales.
- `DATABASE_URL` real.
- `AUTH_SECRET` real.
- Llaves privadas, service-role keys o contraseñas.
- Backups de base de datos.

## GitHub Pages

GitHub Pages no ejecuta backend. La UI puede vivir en Pages, pero login/personajes necesitan una API externa configurada en `config.public.js`.

## Antes de subir a GitHub

Ejecutar:

```bash
npm run prepublish:check
```
