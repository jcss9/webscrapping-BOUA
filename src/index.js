const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');

const numAcuerdos = process.argv[2];

const body = {
    "pag":1, 
    "items_pag": numAcuerdos, 
    "texto":"",
    "fecha_apro_desde":"",
    "fecha_apro_hasta":"",
    "fecha_publ_hasta":"",
    "organo":-1,
    "categoria":-1,
    "unipersonal":-1,
    "centro":-1,
    "publicados":true
}

async function init() {
    const response = await fetch('https://www.boua.ua.es/Acuerdos/buscarAcuerdos', { 
        method: 'POST',
        body: JSON.stringify(body),
        headers: {'Content-Type': 'application/json'}
    });

    const data = await response.json();
    let acuerdos = [];
    
    for (let i=0; i<data.acuerdos.length; i++) {
        console.log("https://www.boua.ua.es/ca/acuerdo/" + data.acuerdos[i].ID
                   +"\nhttps://www.boua.ua.es/es/acuerdo/" + data.acuerdos[i].ID + "\n");

        var acuerdo = {
            "id" : data.acuerdos[i].ID,
            "enlaceVA" : "https://www.boua.ua.es/ca/acuerdo/" + data.acuerdos[i].ID,
            "enlaceES" : "https://www.boua.ua.es/es/acuerdo/" + data.acuerdos[i].ID
        }
        acuerdos.push(acuerdo);
    }
     
    fs.writeFile('acuerdos.json', JSON.stringify(acuerdos),'utf8', (err) => { 
      if (err) throw err; 
      console.log('Se ha guardado el fichero JSON con ' + data.acuerdos.length + ' enlaces y sus identificadores.'); 
    });
}

init();
