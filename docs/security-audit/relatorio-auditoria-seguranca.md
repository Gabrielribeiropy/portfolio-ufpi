# Relatório de Auditoria de Segurança — UFPI Digital

Data: 16/11/2026. Branch `main`; HEAD antes da publicação `eaf599c37473e58d95ce03879b0f9d44b361652e`. Escopo: portfólio estático GitHub Pages e exportação web do CCN Mobile. Método: leitura de arquivos, busca de segredos e rotas sensíveis, comparação local com valores privados, revisão do workflow e das demos. Estado local inicial: 37 caminhos alterados ou novos, preservados.

## Stack detectada

| Categoria | Observação |
| --- | --- |
| Web | HTML, CSS, JavaScript; exportação Expo/React Native Web do CCN Mobile. |
| API | Nenhuma API implantada neste repositório; CCN Mobile lê a API pública externa `ccn-mobile-vercel.vercel.app`. |
| Banco e isolamento | Nenhum banco no GitHub Pages; outras demos guardam exemplos no navegador. |
| Autenticação e autorização | Não usadas no CCN Mobile exportado; telas de gestão das outras demos são simulações locais, não proteção de dados reais. |
| Infraestrutura | GitHub Actions e GitHub Pages; `.github/workflows/pages.yml` envia somente `site/`. |
| Dependências | Não há lockfile/dependências executadas pelo site estático; Expo é construído no repositório móvel. |

## Resumo e veredito

**COM RESSALVAS para a vitrine estática.** Crítica 0; alta 0; média 0; baixa 0; informativa 1. Não há achado crítico ou alto confirmado no artefato a publicar. A ressalva é a dependência de uma API pública externa para o CCN Mobile e a falta de teste de segurança dinâmico da infraestrutura de produção. A auditoria anterior do aplicativo móvel registrou pendência de MFA de produção separada; esta publicação não implanta nem altera a API/painel.

Rechecagem do ajuste visual final: removidas três capturas antigas e seus arquivos sem referências; texto da página CCN Mobile atualizado; assinatura das páginas de detalhes alinhada à Averotech. Nenhum código executável, endpoint ou política de publicação mudou. Contagens e veredito mantidos.

## Achados confirmados

| Severidade | Arquivo:linha | Categoria | Descrição |
| --- | --- | --- | --- |
| Informativa | `README.md:23` | Dependência externa | O CCN Mobile da vitrine lê API pública externa. Disponibilidade e políticas desse serviço não são controladas pelo GitHub Pages. |

**SEC-001 — Dependência externa, informativa.** O código exportado aponta para `https://ccn-mobile-vercel.vercel.app`. Um visitante pode inspecionar e chamar endpoints públicos como qualquer cliente do app. A URL não é um segredo. Pré-condição: acesso público à vitrine. Impacto: eventual indisponibilidade da API pode prejudicar partes da demo. Recomendação: manter apenas endpoints públicos de leitura no bundle e monitorar a API; validar política de acesso no servidor. Complexidade simples; confiança alta. Não há issue de vulnerabilidade confirmada para abrir.

## Pontos fortes e cobertura profunda

- O workflow publica só `site/`; não envia a pasta de código privado do CCN.
- A exportação móvel contém 27 arquivos públicos e não inclui diretórios `admin` ou `solicitacoes`; busca no bundle encontrou zero referências a `/api/admin/`.
- Comparação local com valores não vazios de `.env.local` do app, comprimento mínimo 12, encontrou zero valores no export HTML/JS/CSS/JSON. Os valores não foram impressos.
- A base `/portfolio-ufpi/apps/ccn-mobile/` aparece no HTML e nas rotas exportadas. Imagens de marca usam o caminho relativo ao projeto.
- As demos Materiais e Auditório usam `demo-api.js` para respostas e dados locais. Credenciais como `demo123` são apenas instruções da simulação, não senhas de produção.
- Banco/tenant, IDOR, handlers privilegiados e RLS: não há handler nem dados reais no artefato GitHub Pages. XSS: a nova exportação usa o renderer React; a demonstração antiga usa trechos `innerHTML` com escapes em fluxos identificados. Não foi confirmado caminho explorável de entrada não confiável para execução de script nesta revisão.

## Checklist dos 20 controles

| Controle | Estado | Evidência |
| --- | --- | --- |
| 1 MFA | Não se aplica | Vitrine sem contas. |
| 2 RBAC no servidor | Não se aplica | Sem servidor próprio. |
| 3 Rate limit | Não se aplica | Sem endpoints neste Pages. |
| 4 HTTPS | Não verificável pelo repositório | Configuração TLS ativa do GitHub Pages deve ser conferida após publicação. |
| 5 Dados em repouso/hash | Não se aplica | Sem contas ou banco. |
| 6 WAF | Não verificável pelo repositório | Serviço do provedor. |
| 7 Logs | Não verificável pelo repositório | Serviço do provedor. |
| 8 `.env` fora do Git | Verificado | Nenhum `.env` na exportação. |
| 9 Backup | Não verificável pelo repositório | Retenção externa do provedor. |
| 10 Segredo exposto | Verificado | Busca local e comparação com valores privados: zero correspondências. |
| 11 Posse de IDs | Não se aplica | Sem recursos privados. |
| 12 Admin no servidor | Não se aplica | Nenhum admin do CCN Mobile exportado; outras telas são simulações. |
| 13 Endpoints sensíveis no frontend | Verificado | Zero `/api/admin/` no bundle móvel. |
| 14 RLS | Não se aplica | Sem banco neste deploy. |
| 15 Rate limit de abuso | Não se aplica | Sem endpoints neste Pages. |
| 16 Chamadas sensíveis no frontend | Parcial | API pública externa; política do servidor fora deste repositório. |
| 17 Limites de custo | Não verificável pelo repositório | Cotas da API externa. |
| 18 IP de origem | Não se aplica | GitHub Pages público. |
| 19 IDs previsíveis | Não se aplica | Sem recursos privados nesta vitrine. |
| 20 Recuperação de senha | Não se aplica | Sem contas nesta vitrine. |

## Checklist das 11 práticas

| Prática | Estado | Evidência |
| --- | --- | --- |
| 1 Segredos | Verificado | Nenhum valor privado localizado no bundle. |
| 2 API no frontend | Parcial | API pública de leitura é visível; autorização depende do servidor externo. |
| 3 Inputs | Parcial | Revisão estática das páginas; sem teste dinâmico completo. |
| 4 Autorização | Não se aplica | Sem escrita real neste Pages. |
| 5 Injeção/XSS | Parcial | Busca de sinks e escapes; sem exploração confirmada. |
| 6 Logging | Não verificável pelo repositório | Provedor. |
| 7 Senhas | Não se aplica | Demos locais, sem senha real. |
| 8 Backup | Não verificável pelo repositório | Provedor. |
| 9 Dependências | Não se aplica | Site estático sem dependências instaladas. |
| 10 HTTPS/headers | Não verificável pelo repositório | Conferir resposta HTTP publicada. |
| 11 Não confiar no frontend | Verificado | Nenhuma decisão de autorização real no artefato; controles das demos são declarados fictícios. |

## Recomendações e limitações

P1: conferir HTTPS, assets e navegação na URL publicada. P2: manter o fluxo de exportação allowlist para atualizações futuras. P3: revisar a API pública do CCN no próprio projeto sempre que seus endpoints mudarem. O banco, MFA oficial, TLS da API e acesso físico ao app não foram verificados nesta auditoria da vitrine. O relatório anterior do CCN Mobile cobre código de API/painel em escopo próprio. Nenhuma linha do código-fonte foi alterada por esta auditoria; apenas `docs/security-audit/` foi criado.

## ISSUES PARA O GITHUB

Nenhuma issue de vulnerabilidade confirmada nesta revisão. As recomendações acima são verificações operacionais, sem achado alto ou crítico que bloqueie a publicação.
