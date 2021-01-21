
// Importamos módulos
const fetch = require('node-fetch');

class ClienteWA {

    // Cliente. Peticion asíncrona POST a CrearMensaje
    static async CrearMensajePOST(texto) {

        const urlWA = process.env.URL_API_WA;
        const data = {texto: texto, to: process.env.NUM_DESTINATARIO};

        fetch(urlWA + '/CrearMensaje', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json())
        .then(json => console.log(json));
    }
}

module.exports = ClienteWA;


