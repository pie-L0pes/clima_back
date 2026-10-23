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

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;

  try {
    const response = await fetch(`${API_URL}/usuario/listar`);
    if (response.ok) {
      const usuarios = await response.json();
      const userFound = usuarios.find(u => u.email === email);

      if (userFound) {
        document.getElementById('user-name').innerText = userFound.nome || userFound.email;
      } else {
        document.getElementById('user-name').innerText = email.split('@')[0];
      }
    }
  } catch (error) {
    document.getElementById('user-name').innerText = 'Ana Silva';
  }

  showHomeScreen();
});

btnLogout.addEventListener('click', () => {
  screenHome.classList.add('hidden');
  screenLogin.classList.remove('hidden');
});

function showHomeScreen() {
  screenLogin.classList.add('hidden');
  screenHome.classList.remove('hidden');
  carregarEventos();
}

async function carregarEventos() {
  try {
    const response = await fetch(`${API_URL}/evento/listar`);
    const eventos = await response.json();
    renderizarEventos(eventos);
  } catch (error) {
    console.error("Erro ao carregar eventos:", error);
    renderizarEventos([]);
  }
}

function renderizarEventos(eventos) {
  listaEventos.innerHTML = '';

  if (!Array.isArray(eventos)) return;

  eventos.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'event-card';

    const cidade = ev.cidade || '';
    const tipoEvento = ev.tipoEvento || '';
    const nivelImpacto = ev.nivelImpacto || 'Nenhum impacto registrado';
    const temperaturaMaxima = ev.temperaturaMaxima || '--';
    const id = ev.id || ev._id;

    const texto = `${cidade}, ${tipoEvento}`;

    card.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      
      document.getElementById('det-cidade').innerText = cidade;
      document.getElementById('det-tipo').innerText = tipoEvento;
      document.getElementById('det-temp').innerText = temperaturaMaxima;
      document.getElementById('det-impacto').innerText = nivelImpacto;
      
      modalDetalhes.classList.remove('hidden');
    });

    card.innerHTML = `
      <div class="event-info">${texto}</div>
      <div class="event-actions">
        <button class="btn-outline" onclick="prepararEdicao(${id}, '${cidade}', '${tipoEvento}', '${temperaturaMaxima}', '${nivelImpacto}')">Editar</button>
        <button class="btn-outline btn-delete" onclick="excluirEvento(${id})">Excluir</button>
      </div>
    `;
    listaEventos.appendChild(card);
  });
}

eventoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const cidade = document.getElementById('evento-cidade').value;
  const tipoEvento = document.getElementById('evento-tipo').value;
  const tempInput = document.getElementById('evento-temp').value;
  const nivelImpacto = document.getElementById('evento-impacto').value;
  
  const payload = { 
    cidade: cidade, 
    tipoEvento: tipoEvento, 
    temperaturaMaxima: tempInput ? parseFloat(tempInput) : 0, 
    nivelImpacto: nivelImpacto || '',
    usuarioId: 1,
    data: new Date().toISOString()
  };

  try {
    let response;
    if (editingId) {
      response = await fetch(`${API_URL}/evento/atualizar/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      response = await fetch(`${API_URL}/evento/cadastrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      const erroTexto = await response.text();
      console.error("Detalhe do erro do servidor:", erroTexto);
      throw new Error(`Erro ao salvar: ${response.status}`);
    }

    fecharModais();
    carregarEventos();
  } catch (error) {
    console.error("Erro:", error);
  }
});

async function excluirEvento(id) {
  if (confirm('Tem a certeza de que deseja eliminar este evento?')) {
    try {
      await fetch(`${API_URL}/evento/excluir/${id}`, {
        method: 'DELETE'
      });
      carregarEventos();
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  }
}

btnAddEvento.addEventListener('click', () => {
  editingId = null;
  modalTitle.innerText = 'Novo Evento';
  eventoForm.reset();
  modalEvento.classList.remove('hidden');
});

function prepararEdicao(id, cidade, tipoEvento, temperaturaMaxima, nivelImpacto) {
  editingId = id;
  modalTitle.innerText = 'Editar Evento';
  document.getElementById('evento-cidade').value = cidade;
  document.getElementById('evento-tipo').value = tipoEvento;
  document.getElementById('evento-temp').value = temperaturaMaxima !== 'undefined' && temperaturaMaxima !== '--' ? temperaturaMaxima : '';
  document.getElementById('evento-impacto').value = nivelImpacto !== 'undefined' ? nivelImpacto : '';
  modalEvento.classList.remove('hidden');
}

closeModal.addEventListener('click', fecharModais);
closeModalDetalhes.addEventListener('click', fecharModais);

function fecharModais() {
  modalEvento.classList.add('hidden');
  modalDetalhes.classList.add('hidden');
}