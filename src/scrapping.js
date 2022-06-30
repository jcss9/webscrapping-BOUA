const fs = require('fs');
var request = require('request-promise');
const cheerio = require('cheerio');
const cldrSegmentation = require("cldr-segmentation");
const arrayToTxtFile = require('array-to-txt-file')

let rawdata = fs.readFileSync('acuerdos.json');
let acuerdo = JSON.parse(rawdata);

var frases_parseadasES = [];
var frases_parseadasCA = [];
var texto_segmentadoES = [];
var texto_segmentadoCA = [];

async function main () {
    for (let i=0; i<acuerdo.length; i++) {
        await extraerFrases(acuerdo[i].enlaceES, acuerdo[i].enlaceCA)
        console.log(i, acuerdo[i].enlaceES)
    }
}

async function crearFicheros(){
    arrayToTxtFile(frases_parseadasES, "train.lc.norm.tok.es", err => {
        if(err) console.error(err)
    })

    arrayToTxtFile(frases_parseadasCA, "train.lc.norm.tok.va", err => {
        if(err) console.error(err)
    })
}


async function extraerFrases(urlES, urlCA) {
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
        var textoES = $es(el).next().text().replace(/[\n]/g,'') // Cambiar saltos de línea por "."
                                           .replace(/[-()/"]/g, '') // Eliminar guiones, paréntesis y barras
                                           .replace(/ +(?= )/g,'') // Eliminar dobles espacios
                                           .replace(/(\.\.)/g,'') // Eliminar dobles puntos
                                           .replace(/\:[^.]*/g,'')

        texto_segmentadoES.push(cldrSegmentation.sentenceSplit(textoES, supp))
    })
        
    $cat('.parrafos_fila').each((i, el) => {
        var textoCA = $cat(el).next().text().replace(/[\n]/g,'') // Cambiar saltos de línea por "."
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
            if (texto_segmentadoES[i].length == texto_segmentadoCA[i].length) {
                frases_parseadasES.push(texto_segmentadoES[i])
                frases_parseadasCA.push(texto_segmentadoCA[i])
            }
        }
    }
    await crearFicheros()
}

main()
