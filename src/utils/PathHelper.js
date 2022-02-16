
class PathHelper {

    static replaceAll(string, search, replace) {
        return string.split(search).join(replace);
    }

    static limpiarPath(path){
        let pathLimpio = PathHelper.replaceAll(path, " ", "");
        pathLimpio = PathHelper.replaceAll(pathLimpio, "/", "");
        pathLimpio = PathHelper.replaceAll(pathLimpio, "\\", "");
        pathLimpio = PathHelper.replaceAll(pathLimpio, ":", "-");
        return pathLimpio;
    }
}

module.exports = PathHelper;

