class Navigation {

    // Calcula un TimeOut aleatorio para la navegacion entre 1 seg y 4 segs
    static getRandomNavTimeOut() {
        return Math.floor(Math.random() * (4000 - 1000 + 1)) + 1000;
    }
}

module.exports = Navigation;