const fs = require('fs');
var request = require('request-promise');
const cheerio = require('cheerio');
const cldrSegmentation = require("cldr-segmentation");

// Leemos el fichero JSON donde se encuentran los enlaces
let rawdata = fs.readFileSync('acuerdos.json');
let acuerdo = JSON.parse(rawdata);

var texto_segmentadoES = [];
var frases_parseadasES = [];
var texto_segmentadoVA = [];
var frases_parseadasVA = [];

async function main () {

    fs.writeFile('train.lc.norm.tok.es', '', function(){ console.log('Nuevo fichero frases español') })
    fs.writeFile('train.lc.norm.tok.va', '', function(){ console.log('Nuevo fichero frases valenciano') })
    for (let i=0; i<acuerdo.length; i++) {
        await extraerFrases(acuerdo[i].enlaceES, acuerdo[i].enlaceVA)
        console.log(i, acuerdo[i].enlaceES)
    }
}

function appendFrases(frases_parseadasES, frases_parseadasVA) {

    for(let i = 0; i < frases_parseadasES.length; i++ ) {
        let stringArray = frases_parseadasES[i];
        let finalString  = stringArray.join('\r\n').trim() + '\n';
        if (!finalString == '') {
            fs.appendFileSync('train.lc.norm.tok.es', finalString);
        }
        finalString = '';
    }

    for(let i = 0; i < frases_parseadasVA.length; i++ ) {
        let stringArray = frases_parseadasVA[i];
        let finalString  = stringArray.join('\r\n').trim() + '\n';
        if (!finalString == '') {
            fs.appendFileSync('train.lc.norm.tok.va', finalString);
        }
        finalString = '';
    }
}


async function extraerFrases(urlES, urlVA) {

    try {
        const $es = await request({
            uri: urlES,
            transform: body => cheerio.load(body)
        });
    
        const $va = await request({
            uri: urlVA,
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
            var textoVA = $va(el).next().text().replace(/[\n]/g,'') // Cambiar saltos de línea por "."
                                                .replace(/[·]/g,'')
                                                .replace(/[-()/"]/g, '') // Eliminar guiones, paréntesis y barras
                                                .replace(/ +(?= )/g,'') // Eliminar dobles espacios
                                                .replace(/(\.\.)/g,'') // Eliminar dobles puntos
                                                .replace(/\:[^.]*/g,'')
            texto_segmentadoVA.push(cldrSegmentation.sentenceSplit(textoVA, supp));
        })

        // Primero comprobamos si tienen los mismos Divs
        if (texto_segmentadoES.length == texto_segmentadoVA.length) {
            let divsLength = texto_segmentadoES.length
            for (let i=0; i<divsLength; i++) {
                //Si tiene los mismos divs y además tiene la misma cantidad de frase por div, entra. 
                if (texto_segmentadoES[i].length === texto_segmentadoVA[i].length) {
                    frases_parseadasES.push(texto_segmentadoES[i])
                    frases_parseadasVA.push(texto_segmentadoVA[i])
                }
            }
        }

        appendFrases(frases_parseadasES, frases_parseadasVA)

        texto_segmentadoES = [];
        texto_segmentadoVA = [];
        frases_parseadasES = [];
        frases_parseadasVA = [];

    } catch (e) {
        console.log("Falló la extracción del acuerdo");
    }

}

main();
