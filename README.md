# Extracción de frases de acuerdos del dominio Boletín Oficial de la Universidad de Alicante (BOUA).
Programa desarrollado en **Node.js** con el propósito de obtener un **corpus paralelo** de frases en castellano y valenciano extraídos del BOUA mediante la técnica de _webscrapping_. 

## Uso del programa mediante línea de comandos.
1. Instalación de módulos necesarios desde el directorio raíz. 
```
npm install
```
2. Obtención de los enlaces correspondiente a los acuerdos del BOUA. Se puede modificar la variable *num_acuerdos* en función a la cantidad de acuerdos que se quieran procesar. Situarnos en la carpeta _src_ del proyecto.
```
node index.js --num_acuerdos 
```
3. Una vez obtenido el JSON mediante el comando anterior, ejecutamos el siguiente comando para obtener las frases de los acuerdos. Situarnos en la carpeta _src_ del proyecto.
```
node scrapping.js
```

## Resultado
Finalmente, obtendremos el corpus paralelo castellano-valenciano que constará de dos ficheros denominados ***train.norm.lc.tok***. Uno contendrá las frases en castellano con la extensión _.es_ y otro las frases en valenciano con la extensión _.va_. Se situarán en la carpeta _src_ del directorio donde esté alojada la aplicación. 


## Autor
- [Juan Carlos Sánchez Sánchez](https://github.com/jcss9)
- Este código ha sido desarrollado para su uso en mi trabajo de fin de grado en Ingeniería Informática para la Universidad de Alicante. 
