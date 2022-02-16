
// Horario de sesiones de las piscinas
const HoraSesion = {"8:00-9:00": 1, "9:30-10:30":2, "11:00-12:00":3, "12:30-13:30": 4, "14:00-15:00": 5,
                        "15:30-16:30": 6, "17:00-18:00": 7, "18:30-19:30": 8, "20:00-21:00": 9 };
Object.freeze(HoraSesion);

function getSesion(hora){
    return HoraSesion[hora];
}

module.exports = { HoraSesion, getSesion };

