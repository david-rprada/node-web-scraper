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
    cron: "05 30 8 * * 0,2,4",
    hora_sesion: "8:00-9:00",
  },

  {
    nombre: "Ángel",
    apellido1: "Rodríguez",
    apellido2: "Rodríguez",
    fechaNac: "23/04/1950",
    sexo: "V",
    dni: "34601250G",
    movil: "653870077",
    movilNotifE164: "+34686579170",
    urlCentroCivico:
      "https://sedeelectronica.vitoria-gasteiz.org/m01-10s/actividadAction.do?accion=verObjetivos&prog=25&cen=65&anio=2020",
    cron: "05 30 8 * 4",
    hora_sesion: "9:30-10:30",
  },
];

module.exports = usuarios;
