// SIMULACIÓN DE LA BASE DE DATOS EN MEMORIA (PERSISTENCIA)
let db_butacas = {
    'A1': { estado: 'Disponible', id_usuario: null, inicio_bloqueo: null },
    'A2': { estado: 'Disponible', id_usuario: null, inicio_bloqueo: null },
    'A3': { estado: 'Reservada', id_usuario: 999, inicio_bloqueo: null }, // Ya reservada para testear Val 1
    'A4': { estado: 'Disponible', id_usuario: null, inicio_bloqueo: null }
};

// Configuración inicial de UI basada en la DB simulada
document.querySelectorAll('.seat').forEach(seat => {
    let id = seat.dataset.id;
    if (db_butacas[id].estado === 'Reservada') {
        seat.classList.add('reservada');
    }
});

// VARIABLES DE ESTADO LOCAL DE LA UI
let butacaSeleccionadaId = null;
let countdownInterval = null;
const idUsuarioActual = 245; 
const idShowActual = 1;

// ELEMENTOS DEL DOM
const btnComprar = document.getElementById('btn-comprar');
const btnPagar = document.getElementById('btn-pagar');
const txtSeat = document.getElementById('selected-seat-text');
const timerContainer = document.getElementById('timer-container');
const timerDisplay = document.getElementById('timer');
const feedback = document.getElementById('feedback');

// ACCIÓN: Selección de butaca en la UI
document.getElementById('cinema-map').addEventListener('click', (e) => {
    if (e.target.classList.contains('seat') && !e.target.classList.contains('reservada') && !e.target.classList.contains('bloqueada')) {
        document.querySelectorAll('.seat').forEach(s => s.classList.remove('selected'));
        
        e.target.classList.add('selected');
        butacaSeleccionadaId = e.target.dataset.id;
        txtSeat.innerText = butacaSeleccionadaId;
        btnComprar.disabled = false;
    }
});

// ACCIÓN CONCRETA: Seleccionar botón de comprar (Envío de Datos)
btnComprar.addEventListener('click', () => {
    const datosEnvio = {
        idUsuario: idUsuarioActual,
        idButaca: butacaSeleccionadaId,
        FechaYHora: new Date().toISOString().replace('T', ' ').substring(0, 19),
        idShow: idShowActual
    };

    // Procesamiento en la Capa de Backend (Simulado)
    const respuestaBackend = backendProcesarReserva(datosEnvio);
    
    // CAPA DE FEEDBACK
    manejarFeedback(respuestaBackend);
});

// ==========================================
// CAPA 2: LÓGICA Y VALIDACIÓN DE DATOS (BACKEND SIMULADO)
// ==========================================
function backendProcesarReserva(datos) {
    const { idButaca, idUsuario } = datos;
    const ahora = new Date();
    
    // Lectura previa en DB
    let butacaEnDb = db_butacas[idButaca];

    // VALIDACIÓN 3: Comprobar si el tiempo de bloqueo superó los 5 minutos (Expiración)
    if (butacaEnDb.estado === 'Bloqueada' && butacaEnDb.inicio_bloqueo) {
        let tiempoTranscurrido = (ahora - new Date(butacaEnDb.inicio_bloqueo)) / 1000 / 60; // en minutos
        if (tiempoTranscurrido > 5) {
            // ESCRITURA: Liberar la butaca vencida
            butacaEnDb.estado = 'Disponible';
            butacaEnDb.id_usuario = null;
            butacaEnDb.inicio_bloqueo = null;
        }
    }

    // VALIDACIÓN 1: Comprobar que esté libre y no reservada previamente
    if (butacaEnDb.estado === 'Reservada') {
        return { status: 'error', msg: "La butaca ya se encuentra reservada." };
    }

    // VALIDACIÓN 2: Verificar que no esté bloqueada temporalmente por otro usuario
    if (butacaEnDb.estado === 'Bloqueada' && butacaEnDb.id_usuario !== idUsuario) {
        return { status: 'error', msg: "La butaca está siendo reservada por otro usuario." };
    }

    // PROCESAMIENTO LOGÍCO Y ESCRITURA (Si pasa filtros)
    if (butacaEnDb.estado === 'Disponible') {
        butacaEnDb.estado = 'Bloqueada';
        butacaEnDb.id_usuario = idUsuario;
        butacaEnDb.inicio_bloqueo = ahora.toISOString(); // "año-mes-día-hora"
        
        return { 
            status: 'bloqueado_exito', 
            msg: "La butaca fue bloqueada por 5 minutos. Complete el pago para confirmar la reserva." 
        };
    }
}

// ACCIÓN: Confirmación de Pago por parte del usuario
btnPagar.addEventListener('click', () => {
    // Simulación Escritura de Pago Exitoso en DB
    let butacaEnDb = db_butacas[butacaSeleccionadaId];
    
    if (butacaEnDb.estado === 'Bloqueada' && butacaEnDb.id_usuario === idUsuarioActual) {
        // Al confirmar el pago cambian los campos en la tabla Butaca:
        butacaEnDb.estado = 'Reservada';
        
        clearInterval(countdownInterval);
        timerContainer.style.display = 'none';
        btnPagar.style.display = 'none';
        
        let asientoElement = document.querySelector(`[data-id="${butacaSeleccionadaId}"]`);
        asientoElement.className = 'seat reservada'; // Cambia a rojo
        
        showMsg("Reserva confirmada correctamente.", 'success');
        btnComprar.disabled = true;
        txtSeat.innerText = "Ninguna";
    }
});

// ==========================================
// CAPA 4: RETORNO Y VISUALIZACIÓN (FEEDBACK)
// ==========================================
function manejarFeedback(respuesta) {
    if (respuesta.status === 'bloqueado_exito') {
        showMsg(respuesta.msg, 'info');
        
        // Actualización Visual: Cambio a Amarillo (Bloqueada)
        let asientoElement = document.querySelector(`[data-id="${butacaSeleccionadaId}"]`);
        asientoElement.className = 'seat bloqueada';
        btnComprar.style.display = 'none';
        btnPagar.style.display = 'block';
        
        // Iniciar Temporizador de 5 minutos
        iniciarTemporizador(5 * 60);
    } else if (respuesta.status === 'error') {
        showMsg(respuesta.msg, 'error');
    }
}

function iniciarTemporizador(duracionSegundos) {
    timerContainer.style.display = 'block';
    let tiempoRestante = duracionSegundos;

    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        let minutos = Math.floor(tiempoRestante / 60);
        let segundos = tiempoRestante % 60;

        minutos = minutos < 10 ? '0' + minutos : minutos;
        segundos = segundos < 10 ? '0' + segundos : segundos;

        timerDisplay.innerText = `${minutos}:${segundos}`;

        if (--tiempoRestante < 0) {
            clearInterval(countdownInterval);
            // El tiempo expiró sin completar el pago:
            db_butacas[butacaSeleccionadaId].estado = 'Disponible';
            db_butacas[butacaSeleccionadaId].id_usuario = null;
            db_butacas[butacaSeleccionadaId].inicio_bloqueo = null;

            // Reinicio Visual a Gris
            let asientoElement = document.querySelector(`[data-id="${butacaSeleccionadaId}"]`);
            asientoElement.className = 'seat'; 
            timerContainer.style.display = 'none';
            btnPagar.style.display = 'none';
            btnComprar.style.display = 'block';
            btnComprar.disabled = true;
            txtSeat.innerText = "Ninguna";
            
            showMsg("El tiempo de reserva ha expirado. La butaca vuelve a estar disponible.", 'error');
        }
    }, 1000);
}

function showMsg(texto, tipo) {
    feedback.innerText = texto;
    feedback.className = `feedback-msg ${tipo}`;
    feedback.style.display = 'block';
}