// Importar modulos
const cron = require('node-cron'); // Programdor de tareas temporizables
 
cron.schedule('* * * * * *', async () => {
  console.log('running a task every minute');
});