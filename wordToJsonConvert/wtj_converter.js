const fs=require('fs');
const readline = require('readline');

let jsonStruct={
    "id":0,
    "Titulo":"",
    "Referencias":"",
    "Nivel":"",
    "Area":"",
}

let lista_mat_educa=[]
let id= 0;

// Función para procesar el texto y convertirlo a JSON
const convertirTextoAJson=(texto) =>{
    // Incrementamos el id para la nueva sección
    id++;

    // Usamos la estructura existente como base
    let json = { ...jsonStruct, id };

    // Dividimos el texto en líneas
    let lineas = texto.trim().split('\n');

    // Procesamos cada línea y asignamos la información al JSON
    lineas.forEach((linea,indice) => {
    if (linea.startsWith('Título: ')) {
        json['Titulo'] = linea.replace('Título: ', '').trim();
    } else if (linea.startsWith('Referencias: ')) {
        json['Referencias'] = linea.replace('Referencias: ', '').trim();
    } else if (linea.startsWith('Nivel: ')) {
        json['Nivel'] = linea.replace('Nivel: ', '').trim();
    } else if (linea.startsWith('Area: ')) {
        json['Area'] = linea.replace('Area: ', '').trim();
    }
});

    return json;
}


//Funcion para extraer cada Fila de la tabla que esta como texto
const procesarArchivo= async(rutaArchivo) => {
    // Crear un stream de lectura del archivo. 
    const fileStream = fs.createReadStream(rutaArchivo, {encoding: 'utf8'});

    // Crear una interfaz readline que usará el stream de archivo.
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity // Trata los finales de línea CRLF y LF igual.
    });

    let seccionActual = ""; // Almacena el texto de la sección actual
    let seccionNumero = "";  // Almacena el número de la sección actual

    // Iteramos sobre cada línea del archivo.
    for await (const linea of rl) {
        if (/^\d+$/.test(linea)) { // Verifica si la línea es un número de sección
            //Mostrar el número de la 
            if (seccionActual) {
                // Si ya hay una sección acumulada, la procesamos.
                const resultado = convertirTextoAJson(seccionActual);
                lista_mat_educa.push(resultado); // Agrega el objeto JSON al arreglo
            }
            // Reiniciamos la sección actual para la nueva sección.
            seccionActual = "";
            seccionNumero = linea;
        } else {
            // Agregamos la línea a la sección actual.
            seccionActual += linea + "\n";
        }
    }

    // Procesamos la última sección después de terminar el bucle.
    if (seccionActual) {
        const resultado = convertirTextoAJson(seccionActual);
        lista_mat_educa.push(resultado); // Agrega el objeto JSON al arreglo
    }
    
}
// Llamamos a procesarArchivo usando await en una función async
const main = async() =>{
    await procesarArchivo("SimuladoresEditado.txt");
    
    // Convertir la lista en una cadena JSON formateada
    const jsonContent = JSON.stringify(lista_mat_educa, null, 2);

    // Escribir la cadena JSON en un archivo
    fs.writeFileSync('fichero.json', jsonContent, 'utf8');
}

main();