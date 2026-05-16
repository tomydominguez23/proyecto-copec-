# Vinculación con Supabase

Esta guía deja preparado lo necesario para conectar la web Copec a Supabase.

## 1. Crear proyecto

1. Entra a Supabase y crea un proyecto nuevo.
2. Abre **SQL Editor**.
3. Copia y ejecuta completo el archivo:

```text
supabase/schema.sql
```

Ese script crea:

- `public.users`
- `public.sessions`
- `public.inspections`
- `public.stations`
- `public.inspection_files`
- bucket de Storage `inspection-files`
- datos iniciales de demo
- policies básicas de lectura y administración

## 2. Variables que necesitas

En Supabase ve a **Project Settings > API** y copia:

- Project URL
- anon public key
- service_role key

Luego configura tu entorno:

```bash
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
SUPABASE_STORAGE_BUCKET=inspection-files
ADMIN_EMAIL=admin@copec.cl
ADMIN_PASSWORD=Copec123!
```

Importante: `SUPABASE_SERVICE_ROLE_KEY` nunca debe ir en el frontend. Solo se usa en backend.

## 3. Usuario inicial

El SQL crea este usuario:

```text
Correo: admin@copec.cl
Clave: Copec123!
```

La clave queda guardada como hash bcrypt-compatible usando `pgcrypto`.

Para cambiarla desde SQL:

```sql
update public.users
set password_hash = crypt('TU-NUEVA-CLAVE', gen_salt('bf'))
where email = 'admin@copec.cl';
```

## 4. Storage

El bucket creado se llama:

```text
inspection-files
```

Está configurado como público para que los compradores puedan abrir PDFs, videos, fotos y documentos desde el informe.

Para producción con informes privados, cambia el bucket a privado y genera URLs firmadas desde el backend.

## 5. Tablas principales

### `inspections`

Guarda el informe principal del vehículo.

Campos importantes:

- `numero`
- `vehicle_name`
- `plate`
- `price`
- `mileage`
- `owners`
- `score`
- `items_checked`
- `inspection_date`
- `status`

### `stations`

Guarda las Copec disponibles para agenda de inspección.

Campos importantes:

- `name`
- `comuna`
- `direccion`
- `distancia`
- `horario`
- `cupos`
- `disponibilidad`

### `inspection_files`

Guarda la metadata de archivos subidos.

Tipos permitidos:

- `informe`
- `video`
- `foto`
- `eco`
- `scanner`
- `documento`

## 6. Siguiente paso para conectar el backend

El backend actual ya funciona con SQLite. Para usar Supabase como base real, el backend debe leer estas variables:

```bash
DATABASE_PROVIDER=supabase
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=inspection-files
```

Y reemplazar las operaciones SQLite por operaciones Supabase:

- `users` para login
- `sessions` para sesiones
- `inspections` para datos del informe
- `stations` para agenda
- `inspection_files` para metadata
- Storage bucket `inspection-files` para archivos

El frontend no debe conectarse directo con `service_role`; debe seguir hablando con tu API `/api/...`.
