# provision-v2

## Introdução
Aplicação front-end desenvolvida com foco em dashboards, gerenciamento de usuários, autenticação, chat, mapas e visualização de dados, utilizando Next.js e React.

## Visão geral da aplicação
O projeto é uma aplicação web moderna, com múltiplas páginas e funcionalidades, incluindo dashboard analítico, chat, mapa interativo, gerenciamento de ocorrências e supervisão.

## Tecnologias principais utilizadas
- Next.js
- React
- TypeScript
- TailwindCSS
- Zustand
- React Query
- Radix UI
- Axios
- Socket.io

## Configuração do ambiente

### Pré-requisitos
- Node.js (versão 18 ou superior recomendada)
- NPM (ou Yarn)

### Passos para instalação
1. Clone o repositório.
2. Instale as dependências:
   ```sh
   npm install
   # ou
   yarn install
   ```

### Como rodar localmente
```sh
npm run dev
# ou
yarn dev
```
Acesse http://localhost:3000 no navegador.

## Estrutura de diretórios

```
src/
  app/                # Páginas e layouts principais
  components/         # Componentes reutilizáveis
  features/           # Domínios de negócio (auth, application, i18n, etc)
  hooks/              # Custom hooks
  lib/                # Funções utilitárias e serviços
  providers/          # Providers de contexto
  types/              # Tipagens TypeScript
  public/             # Arquivos estáticos
```

### Pastas principais e suas responsabilidades
- **app/**: Estrutura de rotas, layouts e páginas.
- **components/**: Componentes de UI e widgets reutilizáveis.
- **features/**: Lógica de domínio, autenticação, internacionalização, etc.
- **hooks/**: Hooks customizados para lógica compartilhada.
- **lib/**: Serviços de API, utilidades e integrações.
- **providers/**: Providers de contexto global.
- **types/**: Definições de tipos e interfaces.

## Estilo e padrões de código

### Linters, formatação, convenções de nomenclatura
- ESLint para linting.
- Prettier para formatação.
- Convenção camelCase para variáveis e funções.
- PascalCase para componentes React.

### Padrões de componentes
- Componentes funcionais.
- Componentes desacoplados e reutilizáveis.
- Uso de props tipadas com TypeScript.

## Gerenciamento de estado

### Ferramentas usadas
- Zustand para estado global.
- React Query para cache e sincronização de dados remotos.

## Boas práticas
- Separação de responsabilidades por domínio.
- Componentização e reutilização de código.
- Tipagem forte com TypeScript.

## Consumo de APIs

### Como configurar endpoints
- Os endpoints são configurados em `src/lib/api.ts`.

### Exemplos de chamadas
```ts
import { api } from "@/lib/api";
api.get("/endpoint");
```

## Componentes reutilizáveis

### Catálogo de componentes comuns
- Botões, inputs, tabelas, modais, cards, sidebar, etc. (em `src/components/ui/` e `src/components/dashboard/`)

### Exemplos de uso
```tsx
import { Button } from "@/components/ui/button";
<Button>Enviar</Button>
```

## Processo de build e deploy

### Scripts de build
- `npm run build` – Gera a build de produção.
- `npm start` – Inicia a aplicação em modo produção.

### Configuração de ambientes
- Variáveis de ambiente em `.env.local`.

## Testes

### Frameworks usados
- Jest
- Testing Library

### Como rodar os testes
- Testes unitários: `npm run test:unit`
- Testes de integração: `npm run test:integration`
- Todos os testes: `npm test`