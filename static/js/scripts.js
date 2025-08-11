$(document).ready(function () {

  let paquetes = [];

  // Función asíncrona para leer archivo Excel usando FileReader
  // => Aquí usas Promesas + FileReader, que es asíncrono
  async function leerArchivoExcel(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const paquetes = XLSX.utils.sheet_to_json(sheet);
          resolve(paquetes); // proceso asíncrono resuelto
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject("Error leyendo archivo");
      reader.readAsArrayBuffer(file);
    });
  }

  // Evento de submit con async/await (asíncrono)
  $('#uploadForm').on('submit', async function (e) {
    e.preventDefault();
    const fileInput = $('#fileInput')[0].files[0];
    if (!fileInput) {
      alert('Por favor selecciona un archivo.');
      return;
    }
    try {
      paquetes = await leerArchivoExcel(fileInput);  // función asíncrona
      mostrarTabla(paquetes);                        // función síncrona
      $('#totalPackages').text(paquetes.length);
      $('#filterTimestamp').text("N/A");
      $('#filterButton').show();
      $('#filterWeight').val("");
    } catch (error) {
      alert("Error al procesar el archivo: " + error);
    }
  });

  // Muestra la tabla en el DOM
  // Esto es síncrono (renderiza al instante)
  function mostrarTabla(data) {
    if (!data.length) {
      $('#tableContainer').html("<p class='text-center text-muted'>No hay datos para mostrar.</p>");
      return;
    }
    let html = `
      <table class="table table-striped table-bordered" style="display:none;">
        <thead><tr>
          ${Object.keys(data[0]).map(key => `<th>${key}</th>`).join('')}
        </tr></thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${Object.values(row).map(val => `<td>${val}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>`;
    $('#tableContainer').html(html);

    // Animación con fadeIn (animaciones/transiciones)
    $('#tableContainer table').fadeIn(400);
  }

  // Evento de click (evento de mouse) en botón filtrar
  $('#filterButton').on('click', function () {
    const weight = parseFloat($('#filterWeight').val());
    if (isNaN(weight)) {
      alert('Por favor ingresa un peso válido.');
      return;
    }
    // filtrado con funciones síncronas
    const filtrados = paquetes.filter(p => {
      const peso = parseFloat(p['Peso Kg']) || 0;
      return peso > weight;
    });
    mostrarTabla(filtrados);
    $('#totalPackages').text(filtrados.length);
    $('#filterTimestamp').text(new Date().toLocaleString());

    // Animación al hacer click (transición)
    $(this).animate({ opacity: 0.6 }, 100).animate({ opacity: 1 }, 100);
  });

  // Evento doble click (evento de mouse extra)
  $('#filterButton').on('dblclick', function () {
    alert("Has hecho doble click en el botón Filtrar");
  });

  // Evento de mouseenter/mouseleave en las filas de la tabla
  // => cumplen requisito de eventos de mouse
  $(document).on('mouseenter', 'tbody tr', function () {
    $(this).css('background-color', '#dbe9ff');
  });
  $(document).on('mouseleave', 'tbody tr', function () {
    $(this).css('background-color', '');
  });

  // Evento de click para descargar Excel
  // (evento de mouse)
  $('#downloadExcel').on('click', function () {
    const table = $('#tableContainer').find('table')[0];
    if (!table) {
      alert("No hay tabla para exportar");
      return;
    }
    const wb = XLSX.utils.table_to_book(table, { sheet: "Paquetes" });
    XLSX.writeFile(wb, 'Paquetes.xlsx');
  });

  // Evento de click para descargar PDF
  $('#downloadPDF').on('click', function () {
    const table = $('#tableContainer').find('table')[0];
    if (!table) {
      alert("No hay tabla para exportar");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.html(table, {
      callback: function (doc) {
        doc.save('Paquetes.pdf');
      },
      margin: [20, 20, 20, 20],
      autoPaging: true
    });
  });

});
