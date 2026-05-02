# <img src="https://github.com/Naiimtj/NexReel/blob/main/web/public/img/logo.svg" width="50" height="50" alt="NexReel_Logo"> NexReel

## Descripción

NexReel es una plataforma social de entretenimiento que permite a los usuarios explorar y gestionar películas y series, seguir a otros usuarios, crear playlists, participar en foros, intercambiar mensajes y administrar metadatos relacionados con Plex.

## Características principales

- **Exploración Integral**: Accede a una amplia biblioteca de películas y series mediante integración con TMDB, IMDB y Plex.
- **Gestión de Contenido**: Marca títulos como "Vistos" o "Pendientes" y agrúpalos en tus propias playlists.
- **Comunidad y Socialización**: Sigue a otros usuarios, participa en foros temáticos y comparte tus opiniones.
- **Mensajería Interna**: Comunícate directamente con otros miembros de la plataforma.
- **Integración con Plex**: Sincroniza y administra metadatos de tu servidor Plex personal.
- **Personalización**: Crea perfiles personalizados y ajusta tus preferencias.

## Capturas de Pantalla

![Screenshot 1](https://github.com/Naiimtj/NexReel/blob/main/web/public/img/Screenshot_1.jpg)
![Screenshot 2](https://github.com/Naiimtj/NexReel/blob/main/web/public/img/Screenshot_2.jpg)
![Screenshot 3](https://github.com/Naiimtj/NexReel/blob/main/web/public/img/Screenshot_3.jpg)

## Tecnologías Utilizadas

| Componente  | Tecnología                              |
| ----------- | --------------------------------------- |
| Frontend    | React + Vite + Tailwind CSS             |
| Backend     | FastAPI + SQLAlchemy + Alembic          |
| Base datos  | PostgreSQL 16                           |
| Auth        | Sesiones por cookie (SessionMiddleware) |
| Backups     | Debian + cron + `pg_dump` / `psql`      |
| Infra local | Docker Compose + `just`                 |

> Nota: el directorio `old-api/` contiene una implementación anterior basada en Node/Express y MongoDB. Ya no es el backend canónico y no debe extenderse.

## Estructura del repositorio

```text
NexReel/
├── docker-compose.yml      ← postgres + fastapi + backups
├── justfile                ← atajos de desarrollo y operaciones
├── database/
│   ├── schema.sql          ← bootstrap canónico de PostgreSQL
│   └── backups/            ← imagen de backups
├── fastapi/
│   ├── alembic/            ← migraciones
│   ├── api/                ← app FastAPI (routers, core, config)
│   └── tests/              ← pytest
├── scripts/
│   └── smoke_fastapi.py    ← validación rápida de la API
├── web/                    ← frontend React/Vite
│   ├── services/           ← TMDB, IMDB, PLEX, DB (FastAPI)
│   └── src/                ← componentes y páginas
└── old-api/                ← backend legado (no usar)
```

## Instalación y arranque

Requisitos: Docker, `just`, Python 3.11+ y Node 18+.

### 1. Clonar e instalar

```bash
git clone https://github.com/Naiimtj/NexReel.git
cd NexReel
just install        # crea venv y dependencias del backend
cd web && npm install
```

### 2. Variables de entorno

- `.env` en la raíz: configuración del backend y Docker (PostgreSQL, sesiones, backups, Cloudinary).
- `web/.env`: configuración del frontend (`VITE_URL_DB`, claves de TMDB, IMDB, Plex y `VITE_USE_MOCKS`).

### 3. Desarrollo local

Solo PostgreSQL y backups en Docker, FastAPI en host:

```bash
just up-local       # levanta Postgres + servicio de backups
just dev            # arranca FastAPI en http://localhost:8000
cd web && npm run dev
```

Stack completo en contenedores:

```bash
just build
just up
just logs
just down
```

### 4. Migraciones

```bash
just migrate              # aplicar pendientes
just migrate-down         # revertir última
just migrate-status       # revisión actual
just migrate-history      # historial completo
just migrate-new "msg"    # crear nueva revisión
```

### 5. Validación

```bash
just smoke                                              # smoke test de la API
cd fastapi && ../.venv/bin/python -m pytest tests/ -v   # suite de pytest
```

## URLs principales

- Swagger: `http://localhost:8000/`
- Redoc: `http://localhost:8000/redoc`
- Health: `GET /health`
- API principal: `/v1/*`
- Backups: `/db/*`

## Sistema de mocks (frontend)

El frontend puede interceptar las llamadas a TMDB e IMDB activando `VITE_USE_MOCKS=true` en `web/.env`. Los fixtures viven en `web/services/__mocks__/data/` y permiten desarrollar sin consumir cuota de APIs externas.

## Contribución

1. Haz un fork del repositorio.
2. Crea una rama: `git checkout -b feature/mi-feature`
3. Commitea los cambios: `git commit -m 'Añade una función increíble'`
4. Push: `git push origin feature/mi-feature`
5. Abre un pull request.

## Próximas características

- **Aplicación móvil** para Android e iOS.
- **Notificaciones personalizadas** sobre estrenos y novedades.
- **Salas privadas de debate** con múltiples administradores.
- **Zona "Quedamos para ver algo"** para coordinar encuentros.
- **Zona de noticias** sobre el mundo del entretenimiento.

## Autor

  <a href="https://github.com/Naiimtj" target="_blank">
    <img src="https://github.com/Naiimtj/NexReel/blob/main/web/public/img/github.png" width="30" height="30">
  </a>
  <a href="https://github.com/Naiimtj" target="_blank" style="text-decoration: none; color: #9C92F8;">Naiim Taefy</a>

## Licencia

Este proyecto está bajo la Licencia Apache.

## Contacto

- Email: naiim.tj@gmail.com

¡Gracias por tu interés en NexReel!
