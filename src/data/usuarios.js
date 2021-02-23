// Array json de usuarios de las piscinas
// movilNotifE164: móvil en formato E.164 a donde notificar por WhatsApp
// cron: configuración de la temporalidad en la tarea node-cron
const usuarios = [
  {
    nombre: "David",
    apellido1: "Rodríguez",
    apellido2: "Prada",
    fechaNac: "20/09/1982",
    sexo: "V",
    dni: "72727173T",
    movil: "686579170",
    movilNotifE164: "+34686579170",
    urlCentroCivico:
      "https://sedeelectronica.vitoria-gasteiz.org/m01-10s/actividadAction.do?accion=verObjetivos&prog=25&cen=65&anio=2020",
    cron: "53 10 * * *",
    hora_sesion: "8:00-9:00",
  },

  {
    nombre: "Test",
    apellido1: "Test",
    apellido2: "Test",
    fechaNac: "Test",
    sexo: "V",
    dni: "Test",
    movil: "Test",
    movilNotifE164: "+34686579170",
    urlCentroCivico:
      "https://sedeelectronica.vitoria-gasteiz.org/m01-10s/actividadAction.do?accion=verObjetivos&prog=25&cen=65&anio=2020",
    cron: "53 10 * * *",
    hora_sesion: "8:00-9:00",
  },
];

module.exports = usuarios;
