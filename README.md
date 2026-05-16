# proyecto-copec-

Web funcional para informes de inspección precompra Copec.

Incluye:

- Experiencia mobile-first para compradores.
- Agenda de inspección con estaciones Copec habilitadas.
- Backend Node/Express.
- Base de datos SQLite local.
- Inicio de sesión para administradores.
- Carga de informes, videos, fotos, scanner, eco y documentos.

## Uso local

```bash
npm install
npm start
```

Luego abre:

```text
http://localhost:3000
```

## Acceso inicial

```text
Correo: admin@copec.cl
Contraseña: Copec123!
```

Puedes cambiar esas credenciales con variables de entorno:

```bash
ADMIN_EMAIL=tu-correo@dominio.cl ADMIN_PASSWORD=una-clave-segura npm start
```

## Datos y archivos

- SQLite se crea automáticamente en `data/copec.sqlite`.
- Los archivos subidos se guardan en `uploads/`.
- Ambas carpetas están ignoradas por git para no subir datos reales.

## Validación

```bash
npm test
```

## Supabase

El SQL y la guía para vincular Supabase están en:

- `supabase/schema.sql`
- `docs/supabase.md`