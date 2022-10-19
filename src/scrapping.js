const fs = require('fs');
var request = require('request-promise');
const cheerio = require('cheerio');
const cldrSegmentation = require("cldr-segmentation");
const arrayToTxtFile = require('array-to-txt-file')

let rawdata = fs.readFileSync('acuerdos.json');
let acuerdo = JSON.parse(rawdata);

var texto_segmentadoES = [];
var frases_parseadasES = [];
var texto_segmentadoCA = [];
var frases_parseadasCA = [];

async function main () {

    fs.writeFile('train.lc.norm.tok.es', '', function(){console.log('Nuevo fichero')})
    fs.writeFile('train.lc.norm.tok.va', '', function(){console.log('Nuevo fichero')})
    for (let i=0; i<acuerdo.length; i++) {
        await extraerFrases(acuerdo[i].enlaceES, acuerdo[i].enlaceCA)
        console.log(i, acuerdo[i].enlaceES)
    }
}

function appendFrases(frases_parseadasES, frases_parseadasCA) {

    for(let i = 0; i < frases_parseadasES.length; i++ ) {
        let stringArray = frases_parseadasES[i];
        let finalString  = stringArray.join('\r\n').trim() + '\n';
        if (!finalString == '') {
            fs.appendFileSync('train.lc.norm.tok.es', finalString);
        }
        finalString = '';
    }

    for(let i = 0; i < frases_parseadasCA.length; i++ ) {
        let stringArray = frases_parseadasCA[i];
        let finalString  = stringArray.join('\r\n').trim() + '\n';
        if (!finalString == '') {
            fs.appendFileSync('train.lc.norm.tok.va', finalString);
        }
        finalString = '';
    }
}


async function extraerFrases(urlES, urlCA) {

    try {
        const $es = await request({
            uri: urlES,
            transform: body => cheerio.load(body)
        });
    
        const $cat = await request({
            uri: urlCA,
            transform: body => cheerio.load(body)
        });
    


    var supp = cldrSegmentation.suppressions.es; // Utilizamos el Español

    // Esta función coge todos los <div class="parrafos_fila"> de <div class="parrafos_tabla"> después de lo 
    // de Titulo, Sección, Órgano, Fecha de aprobación. 
    $es('.parrafos_fila').each((i, el) => {
        var textoES = $es(el).next().text().replace(/[\n]/g,'') // Cambiar saltos de línea por ""
                                            .replace(/[·]/g,'')
                                            .replace(/[-()/"]/g, '') // Eliminar guiones, paréntesis y barras
                                            .replace(/ +(?= )/g,'') // Eliminar dobles espacios
                                            .replace(/(\.\.)/g,'') // Eliminar dobles puntos
                                            .replace(/\:[^.]*/g,'')
        texto_segmentadoES.push(cldrSegmentation.sentenceSplit(textoES, supp))
    })
        
    $cat('.parrafos_fila').each((i, el) => {
        var textoCA = $cat(el).next().text().replace(/[\n]/g,'') // Cambiar saltos de línea por "."
                                            .replace(/[·]/g,'')
                                            .replace(/[-()/"]/g, '') // Eliminar guiones, paréntesis y barras
                                            .replace(/ +(?= )/g,'') // Eliminar dobles espacios
                                            .replace(/(\.\.)/g,'') // Eliminar dobles puntos
                                            .replace(/\:[^.]*/g,'')
        texto_segmentadoCA.push(cldrSegmentation.sentenceSplit(textoCA, supp));
    })

    // Primero comprobamos si tienen los mismos Divs
    if (texto_segmentadoES.length == texto_segmentadoCA.length) {
        let divsLength = texto_segmentadoES.length
        for (let i=0; i<divsLength; i++) {
            //Si tiene los mismos divs y además tiene la misma cantidad de frase por div, entra. 
            if (texto_segmentadoES[i].length === texto_segmentadoCA[i].length) {
                frases_parseadasES.push(texto_segmentadoES[i])
                frases_parseadasCA.push(texto_segmentadoCA[i])
            }
        }
    }

    appendFrases(frases_parseadasES, frases_parseadasCA)

    texto_segmentadoES = [];
    texto_segmentadoCA = [];
    frases_parseadasES = [];
    frases_parseadasCA = [];
} catch (e) {
    console.log("falló este acuerdo")
}

}

main()
