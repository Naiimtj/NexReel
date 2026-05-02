FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:0.11.1 /uv /uvx /usr/local/bin/

# UV settings for Docker: copy mode avoids hardlink issues on overlay fs;
# bytecode compilation speeds up cold starts in production
ENV UV_LINK_MODE=copy \
    UV_COMPILE_BYTECODE=1

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends postgresql-client && \
    rm -rf /var/lib/apt/lists/*

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY . .

RUN chmod +x start.sh

EXPOSE 8000

CMD ["./start.sh"]
