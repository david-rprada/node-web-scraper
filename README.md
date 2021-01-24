# node-web-scraper
Web scraper built on Node.js to make reservations for swimming pool sessions.

Para instalar en local:

1) Descargar e instalar node.js https://nodejs.org/es/download/
2) Instalar todas las dependencias de esta app:

```
npm install
```
3) Pon la url del centro cívico que deseas configurar y tus datos personales para el formulario de reserva en el archivo .env.
   Se incluye .env.example

4) Ejecutar la aplicación:

```
node index.js
```

5) Si quieres temporizar la ejecución, se incluye en index.js comentado un ejemplo de task de node-cron. Más info en: https://www.npmjs.com/package/node-cron
