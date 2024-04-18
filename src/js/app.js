let paso = 1
const pasoInicial = 1
const pasoFinal = 3

const cita = {
    id: '',
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
}

document.addEventListener('DOMContentLoaded', function () {
    iniciarApp();
});

function iniciarApp() {
    mostrarSeccion(); // muestra y oculta las secciones
    tabs(); // CAmbia la seccion cuando se presione
    botonesPaginador() // Agrega o quita los botones del paginador
    paginaSiguiente()
    paginaAnterior()

    consultarAPI(); // Consulta la API en el backend de PHP

    idCliente();
    nombreCliente(); // Añade nombre del cliente al objeto CIta
    seleccionarFecha(); // Añade fecha de la cita en el objeto CIta
    seleccionarHora(); // Añade la hora de la cita en el objeto CIta

    mostrarResumen(); // Muestra resumen da la cita
}

function mostrarSeccion() {

    // Ocultar la seccion que tenga la clase de mostrar
    const seccionAnterior = document.querySelector('.mostrar')
    if (seccionAnterior) {
        seccionAnterior.classList.remove('mostrar')
    }

    // Seleccionar la seccion con el paso
    const seccion =  document.querySelector(`#paso-${paso}`)
    seccion.classList.add('mostrar')

    // Quita la clase de actual al tab
    const tabAnterior = document.querySelector('.actual')
    if(tabAnterior) {
        tabAnterior.classList.remove('actual')
    }

    // Resalta el tab actual
    const tab = document.querySelector(`[data-paso="${paso}"]`);
    tab.classList.add('actual')
}

function tabs() {
    const botones = document.querySelectorAll('.tabs button')

    botones.forEach( (boton) => {
        boton.addEventListener('click', function(e) {
            paso = parseInt(e.target.dataset.paso)
            mostrarSeccion()
            botonesPaginador()

        })
    } )
}


function botonesPaginador() {
    const paginaAnterior = document.querySelector('#anterior');
    const paginaSiguiente = document.querySelector('#siguiente');

    if(paso === 1) {
        paginaAnterior.classList.add('ocultar')
        paginaSiguiente.classList.remove('ocultar')
    } else if (paso === 3) {
        paginaAnterior.classList.remove('ocultar')
        paginaSiguiente.classList.add('ocultar')

        mostrarResumen();
    } else {
        paginaAnterior.classList.remove('ocultar')
        paginaSiguiente.classList.remove('ocultar')
    }
    mostrarSeccion();
}

function paginaAnterior() {
    const paginaAnterior = document.querySelector('#anterior')
    paginaAnterior.addEventListener('click' , function() {
        if(paso <= pasoInicial) return;
            paso--;

            botonesPaginador();
    })
}

function paginaSiguiente() {
    const paginaSiguiente = document.querySelector('#siguiente')
    paginaSiguiente.addEventListener('click' , function() {
        if(paso >= pasoFinal) return;
            paso++;

            botonesPaginador();
    })
}

async function consultarAPI() {
    try {
        const url = `${location.origin}/api/servicios`;
        const resultado = await fetch(url);
        const servicios = await resultado.json();
        mostrarServicios(servicios);

    } catch (error) {
        console.log(error);
    }
}

function mostrarServicios(servicios) {
    servicios.forEach(servicio => {
        const {id, nombre, precio} = servicio;

        const nombreServicio = document.createElement('P');
        nombreServicio.classList.add('nombre-servicio');
        nombreServicio.textContent = nombre;
        
        const precioServicio = document.createElement('P');
        precioServicio.classList.add('precio-servicio');
        precioServicio.textContent = `$${precio}`;

        const servicioDiv = document.createElement('DIV');
        servicioDiv.classList.add('servicio');
        servicioDiv.dataset.idServicio = id;
        servicioDiv.onclick = function() {
            seleccionarServicio(servicio);
        }

        servicioDiv.appendChild(nombreServicio);
        servicioDiv.appendChild(precioServicio);

        document.querySelector('#servicios').appendChild(servicioDiv);

    })
}

function seleccionarServicio(servicio) {
    const {id} = servicio;
    const {servicios} = cita;

    // Identificar al elemento que s ele da click
    const divServicio = document.querySelector(`[data-id-servicio="${id}"]`);

    // Comprobar si un servicio ya fue agregado
    if(servicios.some(agregado => agregado.id === id)) {
        // Eliminarlo
        cita.servicios = servicios.filter(agregado => agregado.id !== id)
        divServicio.classList.remove('seleccionado');

    } else {
        // Agregarlo
        cita.servicios = [...servicios, servicio];
        divServicio.classList.add('seleccionado');
    }

}

function idCliente() {
    cita.id = document.querySelector('#id').value

}

function nombreCliente() {
    cita.nombre = document.querySelector('#nombre').value
}

function seleccionarFecha() {
    const inputFecha = document.querySelector('#fecha')
    inputFecha.addEventListener('input', function(e) {

        const dia = new Date(e.target.value).getDay()

        if([5,6].includes(dia)) {
            e.target.value = ''
            mostrarAlerta('Fines de semana no permitidos', 'error', '.formulario');
        } else {
            cita.fecha = e.target.value
        }
    })
}

function seleccionarHora() {
    const inpurHora = document.querySelector('#hora')
    inpurHora.addEventListener('input', function(e) {

        const horaCita = e.target.value
        const hora = horaCita.split(":")[0]
        if(hora < 8 || hora > 18){
            e.target.value = ''
            mostrarAlerta('Hora no valida', 'error', '.formulario')
        } else {
            cita.hora = e.target.value
        }
    })
}

function mostrarAlerta(mensaje, tipo, elemento, desaparece = true) {

    // Previene generar mas de 1 alerta
    const alertaPrevia = document.querySelector('.alerta')
    if(alertaPrevia) {
        alertaPrevia.remove()
    }

    // Creacion de alerta
    const alerta = document.createElement('DIV')
    alerta.textContent = mensaje
    alerta.classList.add('alerta')
    alerta.classList.add(tipo)

    const referencia = document.querySelector(elemento)
    referencia.appendChild(alerta);

    if(desaparece) {
        // Eliminar la alerta
        setTimeout(() => {
            alerta.remove()
        }, 3000)
    }
}

function mostrarResumen() {
    const resumen = document.querySelector('.contenido-resumen')

    // Limpiar contenido
    while(resumen.firstChild) {
        resumen.removeChild(resumen.firstChild)
    }

    if(Object.values(cita).includes('') || cita.servicios.length === 0) {
        mostrarAlerta('Faltan datos de Servicios, Fecha u Hora', 'error', '.contenido-resumen', false)
        return
    }
    
    // Formatear div
    const {nombre, fecha, hora, servicios} = cita

    // Heading servicios
    const headingServicios = document.createElement('H3')
    headingServicios.textContent = 'Resumen de Servicios'
    resumen.appendChild(headingServicios)

    // Irerando los servicios
    servicios.forEach(servicio => {
        const {id, precio, nombre} = servicio
        const contenedorServicio = document.createElement('DIV')
        contenedorServicio.classList.add('contenedor-servicio')

        const textoServicio = document.createElement('P')
        textoServicio.textContent = nombre

        const precioServicio = document.createElement('P')
        precioServicio.innerHTML = `<span>Precio:</span> $${precio}`

        contenedorServicio.appendChild(textoServicio)
        contenedorServicio.appendChild(precioServicio)

        resumen.appendChild(contenedorServicio)
    })

        // Heading servicios
        const headingCita = document.createElement('H3')
        headingCita.textContent = 'Resumen de Cita'
        resumen.appendChild(headingCita)

    const nombreCliente = document.createElement('P')
    nombreCliente.innerHTML = `<span>Nombre:</span> ${nombre}`

    const fechaObj = new Date(fecha)
    const mes = fechaObj.getMonth()
    const dia = fechaObj.getDate() + 2
    const year = fechaObj.getFullYear()

    const fechaUTC = new Date( Date.UTC(year, mes, dia))
    console.log(fechaUTC)

    const opciones = { weekday:'long', year:'numeric', month: 'long', day:'numeric'}
    const fehcaFormateada = fechaUTC.toLocaleDateString('es-CO', opciones)

    const fechaCIta = document.createElement('P')
    fechaCIta.innerHTML = `<span>Fecha:</span> ${fehcaFormateada}`

    const horeCIta = document.createElement('P')
    horeCIta.innerHTML = `<span>Hora:</span> ${hora}`

    // Boton par ala cita
    const botonReservar = document.createElement('BUTTON')
    botonReservar.classList.add('boton')
    botonReservar.textContent = 'Reservar Cita'
    botonReservar.onclick = reservarCita

    resumen.appendChild(nombreCliente)
    resumen.appendChild(fechaCIta)
    resumen.appendChild(horeCIta)

    resumen.appendChild(botonReservar)
}

async function reservarCita() {

    const {nombre, fecha, hora, servicios, id} = cita

    const idServicios = servicios.map(servicio => servicio.id)

    const datos = new FormData()
    
    datos.append('fecha', fecha)
    datos.append('hora', hora)
    datos.append('usuarioId', id)
    datos.append('servicios', idServicios)

    try {
        // Peticion hacia la API
        const url = `${location.origin}/api/citas`
        const respuesta = await fetch(url, {
            method: 'POST',
            body: datos
        })

        const resultado = await respuesta.json()
        console.log(resultado.resultado)
        if(resultado.resultado) {
            Swal.fire({
                icon: 'success',
                title: 'Cita Creada',
                text: 'Tu cita fue creada correctamente',
                button: 'OK'
            }).then(() => {
                window.location.reload()
            })
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al guardar la cita',
        });
    }


    // console.log([...datos])
}