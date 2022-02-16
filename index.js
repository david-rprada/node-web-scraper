// Importar modulos
const async = require("async");
const puppeteer = require("puppeteer"); // API para realizar web scraping0
const cron = require("node-cron"); // Programdor de tareas temporizables
const emoji = require("node-emoji"); // Emojis wa
const clienteWA = require("./src/clientWA"); //  Cliente de WhatsApp para notificar
const dateTime = require("./src/utils/DateTime"); //  Clase de utilidades: fecha
const navigation = require("./src/utils/Navigation"); //  Clase de utilidades: navigation
const horaSesion = require("./src/enums/HoraSesion"); // Clase de utilidades: horaSesion
const pathHelper = require("./src/utils/PathHelper"); //  Clase de utilidades: pathHelper
const usuarios = require("./src/data/usuarios");

// Cargamos variables de entorno del archivo .env
const dotenv = require("dotenv");
dotenv.config();

// Inicio
console.log("Bot iniciado -> esperando a procesar usuarios...");

// Construimos array de tareas con los trabajos planificados
const tasks = usuarios.map(
	(user) =>
		function (cb) {
			cron.schedule(
				user.cron,
				() => {
					procesarUsuario(user).then(() => cb(null, "done"));
				},
				{
					scheduled: true,
					timezone: "Europe/Madrid",
				}
			);
		}
);

// Disparamos en paralelo de forma async todas las tareas programadas
async.parallel(tasks, (err, results) => {
	if (err) {
		console.log(`Something went wrong! -> ${err}`);
		return;
	}
	console.log("All users have been correctly processed!");
});

// Procesa la reserva del usuario de acuerdo a su configuración
async function procesarUsuario(usuario) {
	if (!usuario) return;

	console.log(`Procesando usuario -> ${usuario.nombre} ${usuario.apellido1} ${usuario.apellido2}`);

	let inscripcionCompletada = false;
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();

	// Configura el timeout de navegacion de la tab a 60 segs. (0 sería sin limite)
	await page.setDefaultNavigationTimeout(60000);

	try {
		await page.setViewport({ width: 1280, height: 800 });

		// URL configurada a procesar
		await page.goto(usuario.urlCentroCivico);
		await page.waitForTimeout(navigation.getRandomNavTimeOut());

		// Cookies
		await aceptarCookies(page);

		// Leemos los enlaces del día para Piscina Grande
		const enlaces = await getEnlaces(page);

		// Y los procesamos
		for (let enlaceDia of enlaces) {
			// Comprobamos si el día tiene plazas disponibles en la sesion configurada
			let { dia, hora, selBtnInscripcion, isDisponible } = await checkDisponibilidad(usuario, page, enlaceDia);

			// Si está disponible y ha podido realizar la inscripcion
			if (isDisponible && (await realizarInscripcion(usuario, page, selBtnInscripcion, dia, hora))) {
				// Notificar por WhatsApp
				const textoWA = `${emoji.get(
					"robot_face"
				)} Soy Botuccio, OK! Se ha completado la inscripcion correctamente para el día ${dia} y hora ${hora}. ${emoji.get("swimmer")}`;

				console.log("Enviando mensaje a WA... -> " + textoWA);
				clienteWA.CrearMensajePOST(textoWA, usuario.movilNotifE164);

				// y salimos
				inscripcionCompletada = true;
				break;
			}
		}

		// Si no ha podido inscribirse en la sesión en ningun día, lo notificamos por WhatsApp
		if (!inscripcionCompletada) {
			const textoWA = `${emoji.get(
				"robot_face"
			)} Soy Botuccio, KO! No se ha podido reservar ningún día de los publicados. Mañana lo vuelvo a intentar... `;

			console.log("Enviando mensaje a WA... -> " + textoWA);
			clienteWA.CrearMensajePOST(textoWA, usuario.movilNotifE164);
		}

		// Liberamos recursos
		await browser.close();
	} catch (error) {
		console.log("Ha ocurrido un error -> " + error.message);

		// Notificamos por WhatsApp el error
		const textoWA = `${emoji.get("robot_face")} Error! ocurrido a las ${dateTime.getDateTimeNow()} -> ${error.message}`;
		clienteWA.CrearMensajePOST(textoWA, usuario.movilNotifE164);
	}
}

// Acepta el posible panel de cookies
async function aceptarCookies(page) {
	// ¿Hay panel de cookies?
	let btnAceptarCookies = await page.evaluate((sel) => {
		return document.querySelector(sel);
	}, `#btnOk`);

	// Si lo hay, aceptarlo para que no moleste
	if (btnAceptarCookies && btnAceptarCookies.length > 0) {
		await Promise.all([await page.click("#btnOk"), page.waitForNavigation()]);
	}
}

// Obtenemos todos los enlaces del día para la Piscina Grande
async function getEnlaces(page) {
	const enlaces = await page.evaluate(() => {
		let items = document.querySelectorAll(".listaDosColumnas li a");

		// Los añadimos a nuestro array
		let allLinks = [];
		items.forEach((item) => {
			allLinks.push(item.href);
		});

		// Y devolvemos enlaces de la piscina grande x 4 días
		return allLinks.slice(0, 3);

		// Y devolvemos enlaces de la piscina pequeña x 4 días
		//return allLinks.slice(3, 6);
	});

	// Log en consola Node.js
	console.log("Enlaces: " + enlaces);

	return enlaces;
}

// Comprueba si la sesion para el día del enlace está disponible
async function checkDisponibilidad(usuario, page, enlace) {
	// Validar argumentos
	if (!page || !enlace) return { isDisponible: false };

	// Sesion configurada a inscribir
	const sesion = horaSesion.getSesion(usuario.hora_sesion);

	// Navegamos al enlace
	await Promise.all([page.waitForNavigation(), await page.goto(enlace)]);

	await page.waitForTimeout(navigation.getRandomNavTimeOut());

	// Leemos elementos de la tabla de sesiones
	let dia = await page.evaluate((sel) => {
		return document.querySelector(sel).innerText;
	}, `.magic-table tbody tr:nth-child(${sesion}) td:nth-child(1)`);
	console.log("Dia: " + dia);

	await page.waitForTimeout(2000);

	let hora = await page.evaluate((sel) => {
		return document.querySelector(sel).innerText;
	}, `.magic-table tbody tr:nth-child(${sesion}) td:nth-child(3)`);
	console.log("Hora: " + hora);

	await page.waitForTimeout(navigation.getRandomNavTimeOut());

	// ¿Tenemos plazas libres en la sesion configurada?
	let actionInscripcion = "";
	let formInscripcion = await page.evaluate((sel) => {
		return Array.from(document.querySelectorAll(sel)).map((el) => el.action);
	}, `.magic-table tbody tr:nth-child(${sesion}) td:nth-child(6) form`);

	// Si hay botón de inscripción es que hay plazas libres, guardamos el action.do
	if (formInscripcion && formInscripcion.length == 1) actionInscripcion = formInscripcion[0];

	// Selector para el botón de inscripcion encontrado
	let selBtnInscripcion = `.magic-table tbody tr:nth-child(${sesion}) td:nth-child(6) form`;

	// Definimos JSON con los elementos de la inscripcion
	let inscripcion = {
		dia: dia,
		hora: hora,
		selBtnInscripcion: selBtnInscripcion,
		isDisponible: actionInscripcion !== "",
	};

	if (inscripcion.isDisponible) console.log(`OK. Hay plaza libre encontrada en el día ${inscripcion.dia} a la hora ${inscripcion.hora}`);
	else console.log(`KO. No hay plazas libres en el día ${inscripcion.dia} a la hora ${inscripcion.hora}`);

	return inscripcion;
}

// Completa el formulario de inscripcion de plaza en el día disponible encontrado
async function realizarInscripcion(usuario, page, selBtnInscripcion, dia, hora) {
	// Validar argumentos
	if (!page || !selBtnInscripcion) return false;

	await page.waitForTimeout(navigation.getRandomNavTimeOut());

	// Realizamos click sobre el botón de inscripcion encontrado
	await Promise.all([page.waitForNavigation(), page.$eval(selBtnInscripcion, (form) => form.submit())]);

	await page.waitForTimeout(navigation.getRandomNavTimeOut());

	// Buscamos los enlaces de tipos de inscripcion
	let enlaces = await page.evaluate(() => Array.from(document.querySelectorAll(".contenido ul li a")).map((el) => el.href));

	// Debe presentar 2 tipos de inscripcion: certificado o datos personales
	if (!enlaces || enlaces.length !== 2) return false;

	// Y vamos al formulario de inscripcion mediante enlace datos personales
	let urlFormulario = enlaces[1];
	await Promise.all([page.waitForNavigation(), await page.goto(urlFormulario)]);

	// Rellenamos el formulario
	await page.type("input[name=nombre]", usuario.nombre);
	await page.type("input[name=apellido1]", usuario.apellido1);
	await page.type("input[name=apellido2]", usuario.apellido2);
	await page.type("input[name=dni]", usuario.dni);
	await page.type("input[name=fechaNacimiento]", usuario.fechaNac);
	await page.type("input[name=telefono]", usuario.movil);
	await page.select("#sexo", "V");

	// Confirmar inscripción
	try {
		// Realizamos click sobre el botón de Confirmar Inscripcion (id #m0110ss)
		await Promise.all([page.waitForNavigation(), await page.$eval("#m0110ss", (input) => input.click())]);
	} catch (error) {
		let textoError = "KO! No ha podido completar la inscripción-> " + error.message;
		console.log(textoError);

		// Notificamos por WhatsApp el error
		const textoWA = `${emoji.get("robot_face")} Error! ocurrido a las ${dateTime.getDateTimeNow()}: ${textoError}`;
		clienteWA.CrearMensajePOST(textoWA, usuario.movilNotifE164);
	}

	// Inscripcion completada: btn Submit 'Justificante Actividad'
	let btnJustificante = await page.$eval(".form > input[type=submit]", (el) => el.value);

	await page.waitForTimeout(navigation.getRandomNavTimeOut());

	// ¿Ha podido completar la inscripcion?
	if (btnJustificante != "Justificante Actividad") return false;

	// Si llegamos hasta aquí, ha realizado OK la inscripcion
	return true;
}
