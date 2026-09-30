# UFPI Digital — Projetos demonstrativos

Quatro experiências digitais criadas por **Gabriel Ribeiro · Zenvory** para explorar formas de organizar informações e serviços acadêmicos. Este é um portfólio demonstrativo independente, sem vínculo de produto oficial com a UFPI.

**[Abrir o portfólio online](https://gabrielribeiropy.github.io/portfolio-ufpi/)** · **[Conhecer Gabriel Ribeiro](https://github.com/Gabrielribeiropy)**

## O que está disponível

| Projeto | Ideia apresentada | Demonstração |
| --- | --- | --- |
| CCN Mobile | Notícias, informações e serviços em uma interface para celular. | [Abrir](https://gabrielribeiropy.github.io/portfolio-ufpi/apps/ccn-mobile/) |
| Solicitação de Materiais | Pedido, acompanhamento e gestão por setor. | [Abrir](https://gabrielribeiropy.github.io/portfolio-ufpi/apps/ccn-materiais/) |
| Auditório Afonso Sena | Disponibilidade e solicitação de reservas. | [Abrir](https://gabrielribeiropy.github.io/portfolio-ufpi/apps/ccn-auditorio/) |
| CCN Web | Conteúdo e serviços em um portal responsivo. | [Abrir](https://gabrielribeiropy.github.io/portfolio-ufpi/apps/ccn-web/) |

Cada demonstração possui uma [página de apresentação](https://gabrielribeiropy.github.io/portfolio-ufpi/#projetos) com contexto e acesso à interface. O site usa HTML, CSS e JavaScript e é publicado pelo GitHub Actions no GitHub Pages.

## Hierarquia pública

- `/projetos/ccn-mobile/`
- `/projetos/ccn-materiais/`
- `/projetos/ccn-auditorio/`
- `/projetos/ccn-web/`

Em Materiais, use `setor` para a experiência do solicitante ou `master` para o painel de gestão; qualquer senha funciona no modo demonstrativo. Auditório, Materiais e Portal salvam alterações somente no navegador do visitante.

O site é publicado automaticamente pelo workflow `.github/workflows/pages.yml` a cada push na branch `main`.

## Limite do GitHub Pages

GitHub Pages hospeda apenas arquivos estáticos. Por isso, Materiais e Auditório utilizam um modo demonstrativo interativo com dados locais. Banco de dados compartilhado, login real, e-mail, uploads, APIs e rotinas de servidor exigem uma hospedagem Node.js separada.

## Marca e responsabilidade

Todas as páginas incluem a assinatura **Gabriel Ribeiro — Design · Código · Automação** e deixam explícito que os trabalhos são projetos demonstrativos independentes, não produtos oficiais da UFPI.
