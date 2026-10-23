
const API_URL = 'http://localhost:3000';

const screenLogin = document.getElementById('screen-login');
const screenHome = document.getElementById('screen-home');
const loginForm = document.getElementById('login-form');
const btnLogout = document.getElementById('btn-logout');
const listaEventos = document.getElementById('lista-eventos');
const btnAddEvento = document.getElementById('btn-add-evento');
const modalEvento = document.getElementById('modal-evento');
const closeModal = document.getElementById('close-modal');
const eventoForm = document.getElementById('evento-form');
const modalTitle = document.getElementById('modal-title');
const modalDetalhes = document.getElementById('modal-detalhes');
const closeModalDetalhes = document.getElementById('close-modal-detalhes');

let editingId = null;
let usuarioLogado = null;

function obterCampo(id) {
  return document.getElementById(id);
}

function obterSenha() {
  return document.getElementById('login-password') ||
    document.getElementById('login-senha') ||
    loginForm.querySelector('input[name="senha"]') ||
    loginForm.querySelector('input[type="password"]');
}

async function lerResposta(response) {
  const texto = await response.text();

  try {
    return texto ? JSON.parse(texto) : {};
  } catch {
    throw new Error('Resposta inválida do servidor.');
  }
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const campoEmail = obterCampo('login-email') ||
    loginForm.querySelector('input[type="email"]');

  const campoSenha = obterSenha();

  if (!campoEmail || !campoSenha) {
    alert('Erro: não foi possível encontrar os campos de e-mail e senha.');
    console.error('Verifique os campos de login no HTML.');
    return;
  }

  const email = campoEmail.value.trim();
  const senha = campoSenha.value;

  if (!email || !senha) {
    alert('Preencha o e-mail e a senha.');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/usuario/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    });

    const resultado = await lerResposta(response);

    if (!response.ok) {
      alert(resultado.error || resultado.message || 'E-mail ou senha incorretos.');
      return;
    }

    if (!resultado.usuario || !resultado.usuario.id) {
      alert('O servidor não retornou os dados do usuário.');
      return;
    }

    usuarioLogado = resultado.usuario;

    obterCampo('user-name').innerText =
      usuarioLogado.nome || usuarioLogado.email;

    campoSenha.value = '';
    showHomeScreen();
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    alert('Não foi possível realizar o login. Verifique o servidor.');
  }
});

btnLogout.addEventListener('click', () => {
  usuarioLogado = null;
  editingId = null;
  loginForm.reset();
  fecharModais();
  screenHome.classList.add('hidden');
  screenLogin.classList.remove('hidden');
});

function showHomeScreen() {
  if (!usuarioLogado) return;

  screenLogin.classList.add('hidden');
  screenHome.classList.remove('hidden');
  carregarEventos();
}

async function carregarEventos() {
  try {
    const response = await fetch(`${API_URL}/evento/listar`);

    if (!response.ok) {
      throw new Error('Erro ao carregar eventos.');
    }

    const eventos = await lerResposta(response);
    renderizarEventos(eventos);
  } catch (error) {
    console.error('Erro ao carregar eventos:', error);
    renderizarEventos([]);
  }
}

function renderizarEventos(eventos) {
  listaEventos.innerHTML = '';

  if (!Array.isArray(eventos)) {
    console.error('A resposta de eventos não é uma lista.');
    return;
  }

  eventos.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'event-card';

    const cidade = ev.cidade || '';
    const tipoEvento = ev.tipoEvento || '';
    const nivelImpacto = ev.nivelImpacto || '';
    const temperaturaMaxima = ev.temperaturaMaxima ?? '';
    const id = ev.id ?? ev._id;

    const info = document.createElement('div');
    info.className = 'event-info';
    info.textContent = `${cidade}, ${tipoEvento}`;

    const actions = document.createElement('div');
    actions.className = 'event-actions';

    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn-outline';
    btnEditar.textContent = 'Editar';
    btnEditar.type = 'button';

    btnEditar.addEventListener('click', (e) => {
      e.stopPropagation();
      prepararEdicao(id, cidade, tipoEvento, temperaturaMaxima, nivelImpacto);
    });

    const btnExcluir = document.createElement('button');
    btnExcluir.className = 'btn-outline btn-delete';
    btnExcluir.textContent = 'Excluir';
    btnExcluir.type = 'button';

    btnExcluir.addEventListener('click', (e) => {
      e.stopPropagation();
      excluirEvento(id);
    });

    card.addEventListener('click', () => {
      obterCampo('det-cidade').innerText = cidade;
      obterCampo('det-tipo').innerText = tipoEvento;
      obterCampo('det-temp').innerText =
        temperaturaMaxima === '' ? '--' : temperaturaMaxima;
      obterCampo('det-impacto').innerText =
        nivelImpacto || 'Nenhum impacto registrado';

      modalDetalhes.classList.remove('hidden');
    });

    actions.appendChild(btnEditar);
    actions.appendChild(btnExcluir);
    card.appendChild(info);
    card.appendChild(actions);
    listaEventos.appendChild(card);
  });
}

eventoForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!usuarioLogado) {
    alert('Você precisa estar logado.');
    return;
  }

  const cidade = obterCampo('evento-cidade').value.trim();
  const tipoEvento = obterCampo('evento-tipo').value;
  const tempInput = obterCampo('evento-temp').value;
  const nivelImpacto = obterCampo('evento-impacto').value;

  if (!cidade || !tipoEvento) {
    alert('Preencha os campos obrigatórios.');
    return;
  }

  const payload = {
    cidade,
    tipoEvento,
    temperaturaMaxima: tempInput === '' ? 0 : Number(tempInput),
    nivelImpacto: nivelImpacto || '',
    usuarioId: usuarioLogado.id,
    data: new Date().toISOString()
  };

  try {
    const editando = editingId !== null;

    const url = editando
      ? `${API_URL}/evento/atualizar/${editingId}`
      : `${API_URL}/evento/cadastrar`;

    const response = await fetch(url, {
      method: editando ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const resultado = await lerResposta(response);

    if (!response.ok) {
      throw new Error(resultado.error || 'Erro ao salvar evento.');
    }

    fecharModais();
    await carregarEventos();
  } catch (error) {
    console.error('Erro ao salvar evento:', error);
    alert(error.message);
  }
});

async function excluirEvento(id) {
  if (!usuarioLogado) {
    alert('Você precisa estar logado.');
    return;
  }

  if (!confirm('Tem certeza de que deseja excluir este evento?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/evento/excluir/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const resultado = await lerResposta(response);
      throw new Error(resultado.error || 'Erro ao excluir evento.');
    }

    await carregarEventos();
  } catch (error) {
    console.error('Erro ao excluir evento:', error);
    alert(error.message);
  }
}

btnAddEvento.addEventListener('click', () => {
  if (!usuarioLogado) return;

  editingId = null;
  modalTitle.innerText = 'Novo Evento';
  eventoForm.reset();
  modalEvento.classList.remove('hidden');
});

function prepararEdicao(id, cidade, tipoEvento, temperaturaMaxima, nivelImpacto) {
  if (!usuarioLogado) return;

  editingId = id;
  modalTitle.innerText = 'Editar Evento';

  obterCampo('evento-cidade').value = cidade;
  obterCampo('evento-tipo').value = tipoEvento;
  obterCampo('evento-temp').value = temperaturaMaxima ?? '';
  obterCampo('evento-impacto').value = nivelImpacto || '';

  modalEvento.classList.remove('hidden');
}

closeModal.addEventListener('click', fecharModais);
closeModalDetalhes.addEventListener('click', fecharModais);

function fecharModais() {
  modalEvento.classList.add('hidden');
  modalDetalhes.classList.add('hidden');
}
