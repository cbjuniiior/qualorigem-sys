# 🛠️ Stack Tecnológico

## Visão Geral

O QualOrigem-Sys utiliza uma stack moderna focada em performance, developer experience e manutenibilidade.

## Frontend

### Core
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React** | 18.3+ | Biblioteca UI principal |
| **TypeScript** | 5.5+ | Tipagem estática |
| **Vite** | 5.4+ | Build tool e dev server |

### Estilização
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Tailwind CSS** | 3.4+ | Framework CSS utilitário |
| **shadcn/ui** | - | Componentes base |
| **tailwindcss-animate** | 1.0+ | Animações |

### Roteamento e Estado
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React Router** | 6.26+ | Roteamento SPA |
| **TanStack React Query** | 5.56+ | Cache e estado do servidor |

### Formulários e Validação
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React Hook Form** | 7.59+ | Gerenciamento de formulários |
| **Zod** | 3.23+ | Validação de schemas |
| **@hookform/resolvers** | 3.9+ | Integração RHF + Zod |

### UI/UX
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Radix UI** | Vários | Primitivos de acessibilidade |
| **Phosphor Icons** | 2.1+ | Ícones |
| **Recharts** | 2.12+ | Gráficos |
| **Sonner** | 1.5+ | Notificações toast |
| **Leaflet** | 1.9+ | Mapas interativos |
| **qrcode.react** | 4.2+ | Geração de QR Codes |
| **date-fns** | 3.6+ | Manipulação de datas |

### Utilitários
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **clsx** | 2.1+ | Classes condicionais |
| **tailwind-merge** | 2.5+ | Merge de classes Tailwind |
| **class-variance-authority** | 0.7+ | Variantes de componentes |
| **cmdk** | 1.0+ | Command palette |
| **next-themes** | 0.3+ | Gerenciamento de temas |

## Backend (Supabase)

### Database
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **PostgreSQL** | 17.6+ | Banco de dados principal |
| **PostgREST** | 13.0+ | API REST automática |

### Autenticação
| Tecnologia | Uso |
|------------|-----|
| **GoTrue** | Servidor de autenticação |
| **JWT** | Tokens de sessão |

### Storage
| Tecnologia | Uso |
|------------|-----|
| **S3 Compatible** | Armazenamento de arquivos |

### SDK
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **@supabase/supabase-js** | 2.50+ | Cliente JavaScript |

## DevOps

### Build & Desenvolvimento
| Tecnologia | Uso |
|------------|-----|
| **Vite** | Dev server e bundler |
| **ESLint** | Linting |
| **PostCSS** | Processamento CSS |
| **Autoprefixer** | Prefixos CSS |

### Deploy
| Tecnologia | Uso |
|------------|-----|
| **Docker** | Containerização |
| **Nginx** | Servidor web |
| **EasyPanel** | Plataforma de deploy |

## Requisitos de Sistema

### Desenvolvimento
- Node.js 18+
- npm 9+

### Produção
- Docker
- 512MB RAM mínimo
- Supabase (Cloud ou Self-Hosted)

## Compatibilidade de Navegadores

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Scripts NPM

```json
{
  "dev": "vite",
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

## Arquivos de Configuração

| Arquivo | Descrição |
|---------|-----------|
| `vite.config.ts` | Configuração do Vite |
| `tailwind.config.ts` | Configuração do Tailwind |
| `tsconfig.json` | Configuração do TypeScript |
| `postcss.config.js` | Configuração do PostCSS |
| `eslint.config.js` | Configuração do ESLint |
| `components.json` | Configuração do shadcn/ui |
