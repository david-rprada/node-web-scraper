// Importamos módulos
const fetch = require('node-fetch');

class ClienteWA {

    // Cliente. Peticion asíncrona POST a CrearMensaje
    static async CrearMensajePOST(texto, to) {

        const urlWA = process.env.URL_API_WA;
        const data = {texto: texto, to: to};

        fetch('https://wa-api-rest.azurewebsites.net/api/CrearMensaje', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json())
        .then(json => console.log(json));
    }
}

module.exports = ClienteWA;


