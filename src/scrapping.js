const fs = require('fs');
var request = require('request-promise');
const cheerio = require('cheerio');
const cldrSegmentation = require("cldr-segmentation");
const { create } = require('domain');

//let url = "https://www.boua.ua.es/ca/acuerdo/24221";

async function extraerFrases(url, id, tipo) {
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
    //console.log(texto_prueba);                       
    segmentar_en_frases(texto_prueba,id,tipo)
}

function segmentar_en_frases(texto_prueba,id,tipo) {
    var supp = cldrSegmentation.suppressions.es; // Utilizamos el Español
    var texto_segmentado = cldrSegmentation.sentenceSplit(texto_prueba,supp);
    for (let i=0; i<texto_segmentado.length; i++) { // Para cada frase...
        // Imprimimos las frases utilizando regEx
        //console.log(i + ": " + texto_segmentado[i].replace(/\.[^.]*$/,''))  // Eliminar contenido después de un punto
                                                  
    }
    console.log("\n---------------------\nfrases: " + texto_segmentado.length); // Cantidad de frases
    console.log(texto_segmentado)

    createFile(texto_segmentado,id,tipo)
    
}

function createFile(data,id,tipo) {
    var filename = id + '.' + tipo;
    fs.open(filename,'r',function(err, fd){
        if (err) {
            fs.writeFile(filename, JSON.stringify(data),'utf8', (err) => { 
                console.log('Se ha guardado el fichero ' + filename); 
            });
        } 
    });
}

let rawdata = fs.readFileSync('acuerdos.json');
let student = JSON.parse(rawdata);

for (let i=0; i<student.length; i++) {
    extraerFrases(student[i].enlaceCA, student[i].id, "ca")
    extraerFrases(student[i].enlaceES, student[i].id, "es")
    // Ahora habría que crear un archivo para cada enlace. acuerdo2244.es, acuerdo2244.ca
}
