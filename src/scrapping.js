const fs = require('fs');
const path = require('path');
var request = require('request-promise');
const cheerio = require('cheerio');
const cldrSegmentation = require("cldr-segmentation");
const { create } = require('domain');
const arrayToTxtFile = require('array-to-txt-file')

const valenciano = "ca";
const español = "es";

let rawdata = fs.readFileSync('acuerdos.json');
let acuerdo = JSON.parse(rawdata);

async function main () {
    for (let i=0; i<acuerdo.length; i++) {

        var id = acuerdo[i].id;
        
        var frasesEspañol = await extraerFrases(acuerdo[i].enlaceES)
        var frasesValenciano = await extraerFrases(acuerdo[i].enlaceCA)

        var numFrasesES = frasesEspañol.length
        var numFrasesVA = frasesValenciano.length
        console.log("Frases español: " + numFrasesES);
        console.log("Frases valenciano: "+ numFrasesVA);
        console.log("----------------------------------------")
        
        if(numFrasesES == numFrasesVA) {
            fs.mkdir(path.join(__dirname, '' + id), (err) => {
                console.log('Directorio: ' + id);
            });
            crearFichero(frasesEspañol, id, español)
            crearFichero(frasesValenciano, id, valenciano)
        }
    }
}
    
    
async function crearFichero(frases_parseadas, id, tipo){
    var filename = id + '.' + tipo; // 23442.ca o 23442.es
    arrayToTxtFile(frases_parseadas, id + '/' + filename, err => {
        if(err) console.error(err)
        //console.log('Se ha guardado el fichero ' + filename); 
    })
}

async function extraerFrases(url) {
    const $ = await request({
        uri: url,
        transform: body => cheerio.load(body)
    });

    // Esta función coge todos los <div class="parrafos_fila"> de <div class="parrafos_tabla"> después de lo 
    // de Titulo, Sección, Órgano, Fecha de aprobación. 
    const parrafos_fila = $('.parrafos_fila').next(); 
     var texto_prueba = parrafos_fila.text().replace(/[\n]/g,'.') // Cambiar saltos de líneas por "."
    //                                        .replace(/\d+[.]?(\s|)/g, '') // Eliminar enumeraciones. (pero se borran todos los num)
    //                                        .replace(/#[a-zA-ZÀ-ÿ\u00f1\u00d1]+\s*/g, '') // Eliminar hastags
                                            .replace(/[-()/"]/g, '') // Eliminar guiones, paréntesis y barras
                                            .replace(/ +(?= )/g,'') // Eliminar dobles espacios
                                            .replace(/(\.\.)/g,'') // Eliminar dobles puntos
                                                      
    var supp = cldrSegmentation.suppressions.es; // Utilizamos el Español
    var texto_segmentado = cldrSegmentation.sentenceSplit(texto_prueba,supp);
    var frases_parseadas = [];
    for(let i = 0; i<texto_segmentado.length; i++) {
        texto_segmentado[i] = texto_segmentado[i].replace(/\.[^.]*/g,'').replace(/\:[^.]*/g,'');
        if(texto_segmentado[i] != "" && texto_segmentado[i].length > 2) {
            frases_parseadas.push(texto_segmentado[i]);
        }
    }
    //console.log("\n---------------------\nfrases: " + frases_parseadas.length); // Cantidad de frases

    return frases_parseadas
}

main()