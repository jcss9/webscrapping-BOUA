# Extracción de frases de acuerdos del dominio Boletín Oficial de la Universidad de Alicante (BOUA).
Programa desarrollado en **Node.js** con el propósito de obtener un **corpus paralelo** de frases en castellano y valenciano extraídos del BOUA mediante la técnica de _webscrapping_. 

## Uso del programa mediante línea de comandos.
1. Instalación de módulos necesarios:
```
npm install
```
2. Obtención de los enlaces correspondiente a losacuerdos del BOUA. Se puede modificar la variable *num_acuerdos* en función a la cantidad de acuerdos que se quieran procesar.
```
node index.js --num_acuerdos `rgb(9, 105, 218)`
```
3. Una vez obtenido el JSON mediante el comando anterior, el cuál se guardará en la carpeta raíz de la aplicación, ejecutamos el siguiente comando para obtener las frases de los acuerdos.
```
node scrapping.js
```
