class DateTime {
   
    static getDateTimeNow() {
        
        let date_ob = new Date();

        // current date
        // adjust 0 before single digit date
        let date = ("0" + date_ob.getDate()).slice(-2);

        // current month
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

        // current year
        let year = date_ob.getFullYear();

        // current hours
        let hours = date_ob.getHours();

        // current minutes
        let minutes = date_ob.getMinutes();

        // current seconds
        let seconds = date_ob.getSeconds();

        // returns date & time in DD-MM-YYYY HH:MM:SS format
        return date + "-" + month + "-" + year + " " + hours + ":" + minutes + ":" + seconds;
    }
}

module.exports = DateTime;