const fs=require('fs');
const readline = require('readline');

let jsonStruct={
    "id":0,
    "Simulador":"",
    "Referencias":"",
    "Nivel":"",
    "Area":"",
}

let lista_mat_simulador=[]
let id= 0;
// Función para procesar el texto y convertirlo a JSON
const convertirTextoAJson=(texto) =>{
// Incrementamos el id para la nueva sección
id++;

// Usamos la estructura existente como base
let json = { ...jsonStruct, id };

// Dividimos el texto en líneas
let lineas = texto.trim().split('\n');


lineas.forEach((linea, indice) => {
    // console.log(id);
    switch (true) {
        case linea.startsWith(`${id}`):
            console.log(id);
            // Capturamos la línea de texto después del id y la asignamos al campo Simulador
            json['Simulador'] = lineas[indice + 1]?.trim() || "undefined";
            // console.log(id);
            // console.log(indice);
            // console.log(lineas[1]);
            // console.log(lineas[2]);
            break;
        case linea.startsWith('URL: '):
            // console.log(id);
            let referenciasEncontradas = [];

            for(let i = indice + 1; i<lineas.length; i++){
                const lineaReferencia = lineas[i-1]?.trim();

                if(lineaReferencia.startsWith('Escuela')||lineaReferencia.startsWith('Universidad')){
                    break;
                }
                referenciasEncontradas.push(lineaReferencia);
            
            json['Referencias'] = referenciasEncontradas.join(lineaReferencia);
            }
            json['Referencias'] = referenciasEncontradas.join(' ');
            break;

        case linea.startsWith('Escuela primaria') || linea.startsWith('Escuela intermedia') || linea.startsWith('Escuela secundaria') || linea.startsWith('Universidad'):
            let areaEncontrados = [];
            for(let i = indice + 1 ; i<lineas.length; i++){
                const lineaArea = lineas[i]?.trim();

                if(lineaArea.startsWith('Universidad')){
                    break;
                }
                areaEncontrados.push(lineaArea);

            json['Area'] = areaEncontrados.join(lineaArea);
            }
            json['Area'] = areaEncontrados.join(' ');
            break;
            
        default:
            // console.log(lineas[0]);
            console.log(id);
            json['Simulador'] = lineas[0];
            
            break;
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
                // console.log(id);
                // Si ya hay una sección acumulada, la procesamos.
                const resultado = convertirTextoAJson(seccionActual);
                lista_mat_simulador.push(resultado); // Agrega el objeto JSON al arreglo
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
        lista_mat_simulador.push(resultado); // Agrega el objeto JSON al arreglo
    }
    
}
// Llamamos a procesarArchivo usando await en una función async
const main = async() =>{
    await procesarArchivo("SimuladoresEditado.txt");
    
    // Convertir la lista en una cadena JSON formateada
    const jsonContent = JSON.stringify(lista_mat_simulador, null, 2);

    // Escribir la cadena JSON en un archivo
    fs.writeFileSync('salida.json', jsonContent, 'utf8');
}

main();

