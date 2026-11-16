# Cobertura da auditoria — portfolio-ufpi, 16/11/2026

Estado inicial: branch `main`, HEAD `eaf599c37473e58d95ce03879b0f9d44b361652e`. Havia 37 caminhos locais modificados ou novos na preparação da publicação, incluindo a mudança preexistente de marca em `site/index.html`; preservados.

| Área | Cobertura |
| --- | --- |
| Publicação | `.github/workflows/pages.yml` publica apenas `site/` no GitHub Pages, a partir de `main`. |
| CCN Mobile | 27 arquivos da exportação web atual em `site/apps/ccn-mobile/`; HTML, bundle Expo, imagens e diretórios. Nenhum `admin/` ou `solicitacoes/` incluído. |
| Outras demonstrações | `site/apps/ccn-materiais/` e `site/apps/ccn-auditorio/`, incluindo `demo-api.js`, telas e painéis simulados. As chamadas `/api/*` são interceptadas no navegador pelo adaptador demonstrativo. |
| Páginas de apresentação | `site/index.html`, `site/projetos/ccn-mobile/`, `ccn-materiais/`, `ccn-auditorio/`; referências ao CCN Web removidas. |
| Fonte móvel | `projetos/UFPI/CCN` HEAD `4baaafa`, `src/services/api.ts`, `src/components/StartupGate.tsx`, `src/app/+html.tsx` e exportação Expo. O código do app original ficou limpo após a construção. API de produção revisada apenas pelo código e relatório anterior do próprio projeto, sem teste de autorização em produção. |
| Backend/IDs/banco | Nenhum backend, banco ou handler implantado neste repositório. A API pública externa do CCN Mobile é uma dependência de runtime; ela não faz parte do artefato GitHub Pages. |
| Dependências | O portfólio publicado usa arquivos estáticos; sem `package-lock.json` próprio no artefato. Dependências do build Expo pertencem ao repositório móvel e foram avaliadas em auditoria anterior. |

Buscas: nomes de arquivos sensíveis; valores de `.env.local` do aplicativo comparados localmente contra HTML/JS/CSS/JSON exportados, sem imprimir os valores; referências `/api/admin/` no bundle móvel; links `ccn-web` nas páginas; `innerHTML`, rotas `/api`, `localStorage` nas demos existentes. Uma análise dinâmica completa no navegador e permissões do serviço GitHub Pages não são demonstráveis pelo repositório.
