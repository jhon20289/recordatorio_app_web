document.addEventListener('DOMContentLoaded', () => {
  // Arreglo para guardar los recordatorios
  let recordatorios = [];

  // Referencias a elementos del DOM
  const inputRecordatorio = document.getElementById('inputRecordatorio');
  const inputFechaHora = document.getElementById('inputFechaHora');
  const addBtn = document.getElementById('addBtn');
  const recordatoriosDiv = document.getElementById('recordatorios');

  // Función para actualizar LocalStorage
  function actualizarLocalStorage() {
    localStorage.setItem('recordatorios', JSON.stringify(recordatorios));
  }

  // Función para cargar recordatorios guardados al iniciar la app
  function cargarRecordatorios() {
    const datosGuardados = localStorage.getItem('recordatorios');
    if (datosGuardados) {
      recordatorios = JSON.parse(datosGuardados);
      recordatorios.forEach(crearRecordatorioDOM);
    }
  }

  // Función para crear el DOM de un recordatorio
  function crearRecordatorioDOM(recordatorio) {
    const recordatorioDiv = document.createElement('div');
    recordatorioDiv.className = 'recordatorio';

    const infoDiv = document.createElement('div');
    infoDiv.className = 'recordatorio-info';

    // Crear elemento para el texto; si contiene "whatsapp", se convierte en enlace
    const recordatorioTexto = document.createElement('span');
    if (recordatorio.texto.toLowerCase().includes('whatsapp')) {
      const enlaceWhats = document.createElement('a');
      enlaceWhats.href = 'https://wa.me/';
      enlaceWhats.target = '_blank';
      enlaceWhats.textContent = recordatorio.texto;
      recordatorioTexto.appendChild(enlaceWhats);
    } else {
      recordatorioTexto.textContent = recordatorio.texto;
    }

    // Crear elemento para la fecha/hora formateada
    const fechaObj = new Date(recordatorio.fechaHora);
    const fechaSpan = document.createElement('span');
    fechaSpan.textContent = fechaObj.toLocaleString();

    infoDiv.appendChild(recordatorioTexto);
    infoDiv.appendChild(fechaSpan);

    // Botón "Posponer" que usa prompt para ingresar nueva fecha/hora
    const postponeBtn = document.createElement('button');
    postponeBtn.textContent = 'Posponer';
    postponeBtn.className = 'postpone-btn';
    postponeBtn.addEventListener('click', () => {
      const nuevaFecha = prompt('Ingresa la nueva fecha y hora (ej: 2025-03-23 18:30)');
      if (nuevaFecha) {
        const dateObj = new Date(nuevaFecha.replace(' ', 'T'));
        if (!isNaN(dateObj.getTime())) {
          fechaSpan.textContent = dateObj.toLocaleString();
          recordatorio.fechaHora = dateObj.toISOString();
          actualizarLocalStorage();
        } else {
          alert('Formato inválido. Usa YYYY-MM-DD HH:MM');
        }
      }
    });

    // Botón "Eliminar"
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => {
      recordatoriosDiv.removeChild(recordatorioDiv);
      recordatorios = recordatorios.filter(r => r.id !== recordatorio.id);
      actualizarLocalStorage();
    });

    recordatorioDiv.appendChild(infoDiv);
    recordatorioDiv.appendChild(postponeBtn);
    recordatorioDiv.appendChild(deleteBtn);
    recordatoriosDiv.appendChild(recordatorioDiv);
  }

  // Función para agregar un nuevo recordatorio
  function agregarRecordatorio() {
    const texto = inputRecordatorio.value.trim();
    const fechaHora = inputFechaHora.value;
    if (texto === '' || fechaHora === '') return;

    const nuevoRecordatorio = {
      id: Date.now(),
      texto: texto,
      fechaHora: new Date(fechaHora).toISOString()
    };

    recordatorios.push(nuevoRecordatorio);
    actualizarLocalStorage();
    crearRecordatorioDOM(nuevoRecordatorio);

    inputRecordatorio.value = '';
    inputFechaHora.value = '';
  }

  // Eventos: clic en "Aceptar" y tecla Enter en el campo de texto
  addBtn.addEventListener('click', agregarRecordatorio);
  inputRecordatorio.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      agregarRecordatorio();
    }
  });

  // Al cargar la app, se leen los recordatorios guardados
  cargarRecordatorios();
});
