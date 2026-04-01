# People Manage API

Front - https://github.com/ggcgabriel/people-manage-ui

API REST para gerenciamento de pessoas, com CRUD completo, validação de CPF, paginação e controle de status ativo/inativo.

## Tecnologias

- **NestJS 11** — Framework Node.js
- **TypeScript** — Tipagem estática
- **Prisma** — ORM
- **PostgreSQL 16** — Banco de dados
- **Docker** — Container para o banco
- **Swagger** — Documentação interativa

## Pre-requisitos

- [Node.js](https://nodejs.org/) 18+
- [Docker](https://www.docker.com/) e Docker Compose

## Como rodar

1. Clone o repositorio:

```bash
git clone <url-do-repo>
cd people-manage-api
```

2. Copie o arquivo de variáveis de ambiente:

```bash
cp .env.example .env
```

> Os valores padrão do `.env.example` já funcionam com o `docker-compose.yml`. Ajuste a `DATABASE_URL` se necessário:
>
> ```
> DATABASE_URL="postgresql://app_user:app_password@localhost:5432/people_crud?schema=public"
> ```

3. Suba o banco de dados:

```bash
docker compose up -d
```

4. Instale as dependências:

```bash
npm install
```

5. Gere o client do Prisma e rode as migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

6. Inicie o servidor em modo de desenvolvimento:

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000`.

## Scripts disponíveis

| Script               | Comando                              | Descrição                |
| -------------------- | ------------------------------------ | ------------------------ |
| `npm run dev`        | `nest start --watch`                 | Dev com hot reload       |
| `npm run build`      | `nest build`                         | Compila para produção    |
| `npm run start:prod` | `node dist/main`                     | Roda o build de produção |
| `npm run test`       | `jest`                               | Testes unitários         |
| `npm run test:cov`   | `jest --coverage`                    | Testes com cobertura     |
| `npm run test:e2e`   | `jest --config ./test/jest-e2e.json` | Testes end-to-end        |
| `npm run lint`       | `eslint --fix`                       | Lint com auto-fix        |
| `npm run format`     | `prettier --write`                   | Formata o código         |

## Documentação da API

Com o servidor rodando, acesse a documentação Swagger em:

```
http://localhost:3000/api/docs
```

## Variáveis de ambiente

| Variável       | Descrição                       | Default                 |
| -------------- | ------------------------------- | ----------------------- |
| `DATABASE_URL` | Connection string do PostgreSQL | —                       |
| `PORT`         | Porta do servidor               | `3000`                  |
| `CORS_ORIGIN`  | Origem permitida para CORS      | `http://localhost:5173` |
