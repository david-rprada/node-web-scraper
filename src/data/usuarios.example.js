// Array json de usuarios de las piscinas
// movilNotifE164: móvil en formato E.164 a donde notificar por WhatsApp
// cron: configuración de la temporalidad en la tarea node-cron

// Atención: node-cron no observa los Daylight savings (hora verano/invierno) dentro de las zonas horarias UTC.
// Así que cuando pasamos a horario de verano (28 Marzo - 31 de Octubre) la hora debe ser -1.
const usuarios = [
	{
		nombre: "User1",
		apellido1: "Surname1",
		apellido2: "Surname2",
		fechaNac: "15/10/1950",
		sexo: "V",
		dni: "99887766T",
		movil: "655123456",
		movilNotifE164: "+34655123456",
		urlCentroCivico: "https://sedeelectronica.vitoria-gasteiz.org/m01-10s/actividadAction.do?accion=verObjetivos&prog=25&cen=65&anio=2020",
		cron: "18 15 * * *",
		hora_sesion: "8:00-9:00",
	},

	{
		nombre: "User2",
		apellido1: "Surname2-1",
		apellido2: "Surname2-2",
		fechaNac: "05/05/1980",
		sexo: "M",
		dni: "11223344T",
		movil: "655111111",
		movilNotifE164: "+34655111111",
		urlCentroCivico: "https://sedeelectronica.vitoria-gasteiz.org/m01-10s/actividadAction.do?accion=verObjetivos&prog=25&cen=65&anio=2020",
		cron: "16 15 * * *",
		hora_sesion: "8:00-9:00",
	},
];

module.exports = usuarios;
