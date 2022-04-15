var request = require('request-promise');
const cheerio = require('cheerio');
const cldrSegmentation = require("cldr-segmentation");

let url = "https://www.boua.ua.es/ca/acuerdo/24221";

async function init() {
    const $ = await request({
        uri: url,
        transform: body => cheerio.load(body)
    });

    // Esta función coge todos los <div class="parrafos_fila"> de <div class="parrafos_tabla"> después de lo 
    // de Titulo, Sección, Órgano, Fecha de aprobación. 
    const parrafos_fila = $('.parrafos_fila').next(); 
    var texto_prueba = parrafos_fila.text().replace(/[\n]/g,'.') // Cambiar saltos de líneas por "."
                                           .replace(/\d+[.]?(\s|)/g, '') // Eliminar enumeraciones. (pero se borran todos los num)
                                           .replace(/#[a-zA-ZÀ-ÿ\u00f1\u00d1]+\s*/g, '') // Eliminar hastags
                                           .replace(/[-()/]/g, '') // Eliminar guiones, paréntesis y barras
                                           .replace(/(\.\.)/g,' ') // Eliminar dobles puntos
                                           .replace(/ +(?= )/g,'') // Eliminar dobles espacios
    console.log(texto_prueba);                       
    segmentar_en_frases(texto_prueba)
}

function segmentar_en_frases(texto_prueba) {
    var supp = cldrSegmentation.suppressions.es; // Utilizamos el Español
    var texto_segmentado = cldrSegmentation.sentenceSplit(texto_prueba,supp);
    for (let i=0; i<texto_segmentado.length; i++) { // Para cada frase...
        // Imprimimos las frases utilizando regEx
        console.log(i + ": " + texto_segmentado[i].replace(/\.[^.]*$/,''))  // Eliminar contenido después de un punto
                                                  
    }
    console.log("frases: " + texto_segmentado.length); // Cantidad de frases
}


function cargarAcuerdos() {
    fetch ('')
}


init();