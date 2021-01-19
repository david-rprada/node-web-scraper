// Importar modulos
const puppeteer = require('puppeteer'); // API para realizar web scraping0
const cron = require('node-cron'); // Programdor de tareas temporizables
const clienteWA = require('./src/clientWA'); //  Cliente de WhatsApp para notificar

debugger;

// Cargamos variables de entorno del archivo .env
const dotenv = require('dotenv');
dotenv.config();

// Intenta todos los días a las 5:00 am realizar una reserva en Piscina Grande en sesion 9:30 - 10:30 am
//cron.schedule('0 5 * * *', async () => {
(async () => {

    debugger;

    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    let reservaCompletada = false;

    // Vamos a la pagina de las piscinas de Salburua
    await page.goto(process.env.URL_WEB_SCRAPER);
    await page.waitForTimeout(3000);

    // Leemos los enlaces del día para Piscina Grande
    const enlaces = await getEnlaces(page);

    // Y los procesamos
    for (let enlaceDia of enlaces){
        
        // Comprobamos si el día tiene plazas disponibles en la primera sesion (8:00 - 9:00)
        let { dia, hora, actionReserva, params, isDisponible } = checkDispPrimeraSesion(page, enlaceDia);
        
        // Si está disponible y ha podido realizar la reserva
        if (isDisponible && realizarReserva(page, actionReserva, dia, hora, params)){
            
            // Notificar por WhatsApp
            const textoWA = `OK! se ha completado la reserva correctamente para el día ${dia} y hora ${hora}`;
            clienteWA.CrearMensajePOST(textoWA);

            // Marcamos flag y salimos
            reservaCompletada = true;
            break;
        }
    }

    // Si no ha podido reservar sesión en ningun día, lo notificamos por WhatsApp
    if (!reservaCompletada){
        const textoWA = `KO! No se ha podido reservar ningún día de los publicados. Mañana lo vuelvo a intentar... `;
        clienteWA.CrearMensajePOST(textoWA);
    }
    
    //await browser.close();

})();

// Obtenemos todos los enlaces del día para la Piscina Grande
async function getEnlaces(page){

    const enlaces = await page.evaluate(() => {
        let items = document.querySelectorAll('.listaDosColumnas li a');

        // Log en la consola de google chromium pq estamos en el page context por estar en evaluate
        console.log("Items: " + items.length);

        // Los añadimos a nuestro array
        let allLinks = [];
        items.forEach((item) => { allLinks.push(item.href); })

        // Y devolvemos solo los 4 primeros en orden, los de piscina grande x 4 días
        return allLinks.slice(0, 4);
    });

    // Log en consola Node.js
    console.log("Enlaces: " + enlaces);

    return enlaces;
}

// Comprueba si la primera sesión 8:00 - 9:00 hrs para el día del enlace está disponible
async function checkDispPrimeraSesion(page, enlace){
    
    //console.log(checkDispPrimeraSesion + " Enlace: " + enlace);

    // Validar argumentos
    if (!page || !enlace) 
        return {isDisponible: false};

    await page.goto(enlace);
    await page.waitForTimeout(3000);

     const sesion = await page.evaluate(() => {

        // Leemos elementos de la tabla de sesiones
        let dia = document.querySelector('table.magic-table tbody tr td:nth-child(1)').text;
        let hora = document.querySelector('table.magic-table tbody tr td:nth-child(2)').text;
        let actionReserva = document.querySelector('table.magic-table tbody tr td:nth-child(6) form').action;
        let params = document.querySelectorAll('table.magic-table tbody tr td:nth-child(6) form input[type=hidden]');

        let sesion = {dia: dia, hora: hora, actionReserva: actionReserva, params: params, isDisponible: false};

        // Si ha encontrado plaza libre, indicamos que está disponible
        if (actionReserva.length == 1)
            sesion.isDisponible = true; 
        
        return sesion;
    });

    //console.log('checkDispPrimeraSesion. Dia: ' + sesion.dia + "Hora: " + sesion.hora + "IsDisponible: " + sesion.isDisponible);

    if (sesion.isDisponible)
        console.log(`OK. Hay plaza libre encontrada en el día ${sesion.dia} a las 8:00`);
    else
        console.log(`KO. No hay plazas libres en el día ${sesion.dia} a las 8:00`);

    return sesion;
}

// Completa el formulario de reserva de plaza en el día disponible encontrado
async function realizarReserva(page, actionReserva, dia, hora, params){

    // Validar argumentos
    if (!page || !actionReserva || params.length === 0)
        return false;

    // Formamos la url del action .do (java struts) de la reserva 
    let urlReserva = actionReserva;
    params.forEach(param => { urlReserva+=param; });

    // Vamos a la pagina de la reserva
    await page.goto(urlReserva);
    await page.waitForSelector('h4');

    // Ahora nos muestra la pagina de elección de forma de inscripcion
    let urlFormulario = await page.evaluate(() => {
        let items = document.querySelectorAll('.contenido ul li a');

        // Log en la consola de google chromium pq estamos en el page context por estar en evaluate
        console.log("Items enlaces forma inscripción: " + items.length);

        // Buscamos el enlace de Inscripcion mediante datos personales        
        let enlaceDatosPer;
        for (let item of items) {
            if (item.text === 'Acceder mediante los datos personales'){
                enlaceDatosPer = item;
                break;
            }
        }
        return enlaceDatosPer;
    });
    
    // Si no hemos encontrado el enlace, no podemos continuar
    if (!urlFormulario) return false;

    // Vamos a la pagina final del formulario de la reserva
    await page.goto(urlFormulario);
    await page.waitForSelector('h4');

    // Rellenamos el formulario con los datos personales
    await page.$eval('input[name=nombre]', el => el.value = process.env.NOMBRE);
    await page.$eval('input[name=apellido1]', el => el.value = process.env.APELLIDO1);
    await page.$eval('input[name=apellido2]', el => el.value = process.env.APELLIDO2);
    await page.$eval('input[name=dni]', el => el.value = process.env.DNI);
    await page.$eval('input[name=fechaNacimiento]', el => el.value = process.env.FECHA_NACIMIENTO);
    await page.$eval('input[name=telefono]', el => el.value = process.env.TELEFONO);
    await page.select('#sexo', 'V');

    // Confirmar inscripción
    await Promise.all([
        await page.click('input[type=submit]'),
        page.waitForNavigation(),
        await page.screenshot({ path: 'reserva' + dia + '-' + hora + '.png' })
      ]);

    // Si llegamos hasta aquí, ha realizado OK la reserva
    return true;
}