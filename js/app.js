/* =========================================================
   Organizaê - gerenciador de tarefas (JavaScript puro)
   Funções: cadastrar, listar, editar, concluir, excluir,
   filtrar por status, contar e salvar no localStorage.
   ========================================================= */

/* ---------- 1. Seleção dos elementos da página ---------- */
const formulario     = document.querySelector("#form-tarefa");
const tituloForm     = document.querySelector("#titulo-form");
const campoTitulo    = document.querySelector("#titulo");
const campoCategoria = document.querySelector("#categoria");
const btnSalvar      = document.querySelector("#btn-salvar");
const btnCancelar    = document.querySelector("#btn-cancelar");
const lista          = document.querySelector("#lista-tarefas");
const mensagem       = document.querySelector("#mensagem");
const botoesFiltro   = document.querySelectorAll(".filtro");

const contTotal      = document.querySelector("#cont-total");
const contPendentes  = document.querySelector("#cont-pendentes");
const contConcluidas = document.querySelector("#cont-concluidas");

/* ---------- 2. Estado da aplicação ---------- */
const CHAVE_STORAGE = "minhasTarefas"; // mesma chave de antes: tarefas antigas continuam aparecendo

let tarefas = carregarTarefas();  // array com todas as tarefas
let filtroAtual = "todas";        // "todas" | "pendentes" | "concluidas"
let idEmEdicao = null;            // id da tarefa que está sendo editada (null = modo cadastro)
let temporizadorMensagem = null;  // guarda o timeout da mensagem de feedback

/* ---------- 3. Persistência (localStorage) ---------- */
function carregarTarefas() {
    // try/catch evita que a página quebre se o JSON salvo estiver corrompido
    try {
        return JSON.parse(localStorage.getItem(CHAVE_STORAGE)) || [];
    } catch (erro) {
        return [];
    }
}

function salvarTarefas() {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(tarefas));
}

/* ---------- 4. Feedback ao usuário ---------- */
function mostrarMensagem(texto, tipo) {
    // tipo: "sucesso" ou "erro" (define a cor no CSS)
    mensagem.textContent = texto;
    mensagem.className = `mensagem visivel ${tipo}`;

    // Reinicia o tempo caso outra mensagem apareça antes de sumir
    clearTimeout(temporizadorMensagem);
    temporizadorMensagem = setTimeout(function () {
        mensagem.className = "mensagem";
    }, 3000);
}

/* ---------- 5. Contadores ---------- */
function atualizarContadores() {
    const concluidas = tarefas.filter(function (t) { return t.concluida; }).length;

    contTotal.textContent      = tarefas.length;
    contConcluidas.textContent = concluidas;
    contPendentes.textContent  = tarefas.length - concluidas;
}

/* ---------- 6. Filtro por status ---------- */
function filtrarTarefas() {
    if (filtroAtual === "pendentes") {
        return tarefas.filter(function (t) { return !t.concluida; });
    }
    if (filtroAtual === "concluidas") {
        return tarefas.filter(function (t) { return t.concluida; });
    }
    return tarefas; // "todas"
}

/* ---------- 7. Renderização da lista ---------- */
function criarBotao(texto, classe, aoClicar) {
    // Função auxiliar para não repetir código de criação de botão
    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = texto;
    botao.classList.add(classe);
    botao.addEventListener("click", aoClicar);
    return botao;
}

function renderizarTarefas() {
    lista.innerHTML = "";

    const visiveis = filtrarTarefas();

    // Estado vazio: mostra um aviso amigável
    if (visiveis.length === 0) {
        const vazio = document.createElement("li");
        vazio.classList.add("vazio");
        vazio.textContent = tarefas.length === 0
            ? "Nenhuma tarefa ainda. Cadastre a primeira!"
            : "Nenhuma tarefa neste filtro.";
        lista.appendChild(vazio);
    }

    visiveis.forEach(function (tarefa) {
        const item = document.createElement("li");
        item.classList.add("tarefa");
        if (tarefa.concluida) item.classList.add("concluida");
        if (tarefa.id === idEmEdicao) item.classList.add("editando");

        const titulo = document.createElement("strong");
        titulo.classList.add("titulo-tarefa");
        titulo.textContent = tarefa.titulo; // textContent evita injeção de HTML

        const detalhes = document.createElement("div");
        detalhes.classList.add("detalhes");

        const prioridade = document.createElement("span");
        prioridade.textContent = `Prioridade: ${tarefa.prioridade}`;

        const categoria = document.createElement("span");
        categoria.textContent = `Categoria: ${tarefa.categoria}`;

        detalhes.append(prioridade, categoria);
        item.append(titulo, detalhes);

        // Data de conclusão (só aparece se a tarefa estiver concluída)
        if (tarefa.concluida && tarefa.dataConclusao) {
            const data = document.createElement("p");
            data.classList.add("detalhes");
            data.textContent = `Concluída em: ${tarefa.dataConclusao}`;
            item.appendChild(data);
        }

        // Botões de ação
        const acoes = document.createElement("div");
        acoes.classList.add("acoes");

        acoes.append(
            criarBotao(tarefa.concluida ? "Reabrir" : "Concluir", "btn-concluir", function () {
                alternarConclusao(tarefa.id);
            }),
            criarBotao("Editar", "btn-editar", function () {
                iniciarEdicao(tarefa.id);
            }),
            criarBotao("Remover", "btn-remover", function () {
                removerTarefa(tarefa.id);
            })
        );

        item.appendChild(acoes);
        lista.appendChild(item);
    });

    atualizarContadores();
}

/* ---------- 8. Ações sobre as tarefas ---------- */
function alternarConclusao(id) {
    const tarefa = tarefas.find(function (t) { return t.id === id; });
    if (!tarefa) return;

    tarefa.concluida = !tarefa.concluida;
    // Ao concluir, guarda data/hora; ao reabrir, limpa
    tarefa.dataConclusao = tarefa.concluida ? new Date().toLocaleString("pt-BR") : null;

    salvarTarefas();
    renderizarTarefas();
    mostrarMensagem(tarefa.concluida ? "Tarefa concluída!" : "Tarefa reaberta.", "sucesso");
}

function removerTarefa(id) {
    if (!confirm("Tem certeza que deseja remover esta tarefa?")) return;

    // Se estava editando justamente essa tarefa, sai do modo edição
    if (id === idEmEdicao) sairDoModoEdicao();

    tarefas = tarefas.filter(function (t) { return t.id !== id; });

    salvarTarefas();
    renderizarTarefas();
    mostrarMensagem("Tarefa removida.", "sucesso");
}

/* ---------- 9. Edição ---------- */
function iniciarEdicao(id) {
    const tarefa = tarefas.find(function (t) { return t.id === id; });
    if (!tarefa) return;

    idEmEdicao = id;

    // Preenche o formulário com os dados atuais
    campoTitulo.value = tarefa.titulo;
    campoCategoria.value = tarefa.categoria;
    document.querySelector(`input[name="prioridade"][value="${tarefa.prioridade}"]`).checked = true;

    // Troca textos para deixar claro que é edição
    tituloForm.textContent = "Editar tarefa";
    btnSalvar.textContent = "Salvar alterações";
    btnCancelar.hidden = false;

    renderizarTarefas();       // destaca o item editado
    campoTitulo.focus();
    formulario.scrollIntoView({ behavior: "smooth" });
}

function sairDoModoEdicao() {
    idEmEdicao = null;
    formulario.reset();

    tituloForm.textContent = "Nova tarefa";
    btnSalvar.textContent = "+ Adicionar tarefa";
    btnCancelar.hidden = true;
}

btnCancelar.addEventListener("click", function () {
    sairDoModoEdicao();
    renderizarTarefas();
    mostrarMensagem("Edição cancelada.", "sucesso");
});

/* ---------- 10. Envio do formulário (cadastrar OU editar) ---------- */
formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const titulo = campoTitulo.value.trim();
    const radioSelecionado = document.querySelector('input[name="prioridade"]:checked');

    // Validações com feedback na tela (sem alert)
    if (titulo === "") {
        mostrarMensagem("Digite o nome da tarefa!", "erro");
        campoTitulo.focus();
        return;
    }

    if (!radioSelecionado) {
        mostrarMensagem("Selecione uma prioridade!", "erro");
        return;
    }

    const prioridade = radioSelecionado.value;
    const categoria = campoCategoria.value;

    // Bloqueia duplicadas (ignorando a própria tarefa quando estamos editando)
    const duplicada = tarefas.some(function (t) {
        return t.id !== idEmEdicao
            && t.titulo.toLowerCase() === titulo.toLowerCase()
            && t.prioridade === prioridade
            && t.categoria === categoria;
    });

    if (duplicada) {
        mostrarMensagem("Essa tarefa já existe com a mesma prioridade e categoria!", "erro");
        return;
    }

    if (idEmEdicao !== null) {
        // MODO EDIÇÃO: atualiza a tarefa existente
        const tarefa = tarefas.find(function (t) { return t.id === idEmEdicao; });
        tarefa.titulo = titulo;
        tarefa.prioridade = prioridade;
        tarefa.categoria = categoria;

        sairDoModoEdicao();
        mostrarMensagem("Tarefa atualizada com sucesso!", "sucesso");
    } else {
        // MODO CADASTRO: cria uma tarefa nova
        tarefas.push({
            id: Date.now() + Math.random(),
            titulo: titulo,
            prioridade: prioridade,
            categoria: categoria,
            concluida: false,
            dataConclusao: null
        });

        formulario.reset();
        mostrarMensagem("Tarefa cadastrada com sucesso!", "sucesso");
    }

    salvarTarefas();
    renderizarTarefas();
    campoTitulo.focus();
});

/* ---------- 11. Clique nos botões de filtro ---------- */
botoesFiltro.forEach(function (botao) {
    botao.addEventListener("click", function () {
        filtroAtual = botao.dataset.filtro; // lê o data-filtro do HTML

        // Atualiza o visual e a acessibilidade dos botões
        botoesFiltro.forEach(function (b) {
            const ativo = b === botao;
            b.classList.toggle("ativo", ativo);
            b.setAttribute("aria-pressed", ativo);
        });

        renderizarTarefas();
    });
});

/* ---------- 12. Início ---------- */
renderizarTarefas();
