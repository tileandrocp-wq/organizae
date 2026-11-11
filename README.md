# Organizaê

Aplicação web de gerenciamento de tarefas feita com HTML, CSS e JavaScript puro, sem frameworks. Os dados ficam salvos no navegador, então as tarefas continuam lá depois de fechar a página.

**Aplicação publicada:** https://tileandrocp-wq.github.io/organizae/

## Funcionalidades

- Cadastrar tarefas com nome, prioridade (Alta, Média ou Baixa) e categoria
- Listar todas as tarefas cadastradas
- Editar o nome, a prioridade e a categoria de uma tarefa
- Concluir tarefas (registrando data e hora) e reabrir quando necessário
- Excluir tarefas, com confirmação
- Filtrar por status: Todas, Pendentes e Concluídas
- Contadores de total, pendentes e concluídas
- Bloqueio de tarefas duplicadas (mesmo nome, prioridade e categoria)
- Persistência dos dados com localStorage
- Mensagens de feedback para cada ação
- Layout responsivo para celular e computador

## Como executar

1. Baixe ou clone o repositório:
   `git clone https://github.com/SEU-USUARIO/organizae.git`
2. Abra a pasta `organizae` no VS Code.
3. Abra o arquivo `index.html` no navegador (ou use a extensão Live Server).


## Tecnologias utilizadas

- HTML5
- CSS3 (variáveis CSS, flexbox, grid e media queries)
- JavaScript puro (ES6+)
- Git e GitHub (versionamento e GitHub Pages)

## Estrutura do projeto

```
organizae/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── assets/
├── README.md
└── LICENSE
```

## Decisões de implementação

- **Um formulário para cadastrar e editar:** uma variável guarda o id da tarefa em edição. Se ela estiver vazia, o envio cria uma tarefa nova; se tiver valor, atualiza a existente.
- **Renderização a partir do array:** sempre que algo muda, o array `tarefas` é salvo no localStorage e a lista é redesenhada. Assim a tela nunca fica diferente dos dados.
- **Filtro sem alterar os dados:** o filtro só decide o que aparece na tela, o array original continua completo.
- **Feedback na própria página:** troquei os `alert()` por uma mensagem que aparece e some sozinha, com `aria-live` para leitores de tela.
- **`textContent` em vez de `innerHTML`:** evita que um texto digitado pelo usuário seja interpretado como HTML.
- **Botões reais para as ações:** concluir, editar e remover são `<button>`, o que permite usar o teclado.

## Licença

Distribuído sob a licença MIT. Veja o arquivo `LICENSE`.
