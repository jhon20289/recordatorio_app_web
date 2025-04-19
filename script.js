// script.js
document.addEventListener('DOMContentLoaded', () => {
  // Crear e insertar el modal en el DOM
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'modalOverlay';
  modalOverlay.innerHTML = `
    <div id="modal">
      <span id="modalMessage"></span>
      <button id="modalClose">OK</button>
    </div>`;
  document.body.appendChild(modalOverlay);

  // Función para reproducir un beep corto
  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 1000;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 200);
    } catch (e) {
      console.error('Error al reproducir beep:', e);
    }
  }

  function showModal(message) {
    document.getElementById('modalMessage').textContent = message;
    modalOverlay.style.display = 'flex';
    playBeep();
    alert(message); // alerta nativa como respaldo
  }

  document.getElementById('modalClose').addEventListener('click', () => {
    modalOverlay.style.display = 'none';
  });

  // ------ Variables y referencias DOM ------
  let recordatorios = JSON.parse(localStorage.getItem('recordatorios')) || [];
  const textoInput  = document.getElementById('inputRecordatorio');
  const fechaInput  = document.getElementById('inputFechaHora');
  const addBtn      = document.getElementById('addBtn');
  const listDiv     = document.getElementById('recordatorios');
  const searchInput = document.getElementById('searchInput');

  // ------ Funciones principales ------
  function saveAndRender() {
    localStorage.setItem('recordatorios', JSON.stringify(recordatorios));
    render(searchInput ? searchInput.value : '');
    addBtn.textContent = 'Aceptar';
  }

  function render(filtro = '') {
    listDiv.innerHTML = '';
    const term = filtro.trim().toLowerCase();
    recordatorios
      .filter(r => r.texto.toLowerCase().includes(term))
      .forEach(r => {
        const card = document.createElement('div');
        card.className = 'recordatorio';

        // Info
        const info = document.createElement('div');
        info.className = 'recordatorio-info';
        const spanText = document.createElement('span');
        spanText.textContent = r.texto;
        const spanFecha = document.createElement('span');
        spanFecha.textContent = new Date(r.fechaHora).toLocaleString();
        info.append(spanText, spanFecha);

        // Botones
        const btnWhats = document.createElement('button');
        btnWhats.className = 'whatsapp-btn';
        btnWhats.textContent = 'WhatsApp';
        btnWhats.addEventListener('click', () => {
          window.open(`https://wa.me/?text=${encodeURIComponent(r.texto)}`, '_blank');
        });

        const btnPos = document.createElement('button');
        btnPos.className = 'postpone-btn';
        btnPos.textContent = 'Posponer';
        btnPos.addEventListener('click', () => {
          const nueva = prompt('Nueva fecha y hora (YYYY-MM-DD HH:MM)');
          if (!nueva) return;
          const d = new Date(nueva.replace(' ', 'T'));
          if (isNaN(d)) return alert('Formato inválido.');
          r.fechaHora = d.toISOString();
          r.mostrado = false;
          saveAndRender();
        });

        const btnDel = document.createElement('button');
        btnDel.className = 'delete-btn';
        btnDel.textContent = 'Eliminar';
        btnDel.addEventListener('click', () => {
          recordatorios = recordatorios.filter(x => x.id !== r.id);
          saveAndRender();
        });

        const botonesDiv = document.createElement('div');
        botonesDiv.className = 'botones-card';
        botonesDiv.append(btnWhats, btnPos, btnDel);

        card.append(info, botonesDiv);
        listDiv.appendChild(card);
      });
  }

  // ------ Añadir nuevo recordatorio ------
  addBtn.addEventListener('click', () => {
    const texto = textoInput.value.trim();
    const fecha = fechaInput.value;
    if (!texto || !fecha) return;
    recordatorios.push({
      id: Date.now(),
      texto,
      fechaHora: new Date(fecha).toISOString(),
      mostrado: false
    });
    textoInput.value = '';
    fechaInput.value = '';
    saveAndRender();
  });

  // ------ Filtrado en tiempo real ------
  if (searchInput) {
    searchInput.addEventListener('input', () => render(searchInput.value));
  }

  // ------ Comprobación periódica de hora ------
  setInterval(() => {
    const ahora = new Date();
    let changed = false;
    recordatorios.forEach(r => {
      if (!r.mostrado && new Date(r.fechaHora) <= ahora) {
        r.mostrado = true;
        showModal(`⏰ ¡Recordatorio! ${r.texto}`);
        changed = true;
      }
    });
    if (changed) localStorage.setItem('recordatorios', JSON.stringify(recordatorios));
  }, 10000);

  // Render inicial
  render();
});
