
// Importar modulos
const puppeteer = require('puppeteer');
const cron = require('node-cron');

// Cargamos variables de entorno del archivo .env
const dotenv = require('dotenv');
dotenv.config();

// Cliente de WhatsApp para notificar
const clienteWA = require('./src/clientWA');

// Intenta todos los días a las 5:00 am realizar una reserva en Piscina Grande en sesion 9:30 - 10:30 am
//cron.schedule('0 5 * * *', async () => {
(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    // Vamos a la pagina de las piscinas de Salburua
    await page.goto(process.env.URL_WEB_SCRAPER);

    // Esperar 3 segs.
    await page.waitForTimeout(3000);

    // Seleccionamos todos los items de la ul (Piscina grande Lunes, Martes, etc... Piscina pequeña Lunes, Martes, etc...)
    // A las 5:00 am solo habrá 6 items (3 x piscina grande + 3 x piscina pequeña)
    const enlaces = await page.evaluate(() => {
        let items = document.querySelectorAll('.listaDosColumnas li a');

        // Log en la consola de google chromium
        console.log("Items: " + items.length);

        // Los añadimos a nuestro array
        let allLinks = [];
        for (let item of items) {
            allLinks.push(item.href);
        }

        // Y devolvemos solo los 3 primeros: piscina grande x 3 días
        return allLinks.slice(0, 3);
    });

    // Log en consola Node.js
    console.log("Enlaces: " + enlaces);

    // Procesamos los enlaces filtrados de la piscina grande
    for (let enlaceDia of enlaces){
        
        // Comprobamos si el día tiene sesiones disponibles sin reservar
        let { dia, hora, isDisponible } = checkDisponibilidadDia(browser, enlaceDia);
        if (isDisponible){
            // Realizar reserva

            // Notificar por WhatsApp
            //clienteWA.CrearMensajePOST(dia, hora);

            // Salimos
            break;
        }
    }
    
    await browser.close();

})();

function checkDisponibilidadDia(browser, enlace){

    // TODO comprobar disponibildad de reservas en el enlace
    
}

function realizarReserva(dia, hora){

    // TODO rellena el formulario con los datos personales para la reserva
}