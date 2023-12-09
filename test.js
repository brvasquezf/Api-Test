const axios = require('axios');
const xml2js = require('xml2js');

// Función para obtener la semilla
const getSeed = async () => {
    try {
        const response = await axios({
            method: 'get',
            url: 'https://apicert.sii.cl/recursos/v1/boleta.electronica.semilla',
            headers: {
                'Accept': 'application/xml'
            }
        });

        // Parsea la respuesta XML a un objeto JavaScript
        const resp = await xml2js.parseStringPromise(response.data);
        
        // Extrae la semilla del objeto parseado
        const seed = resp['SII:RESPUESTA']['SII:RESP_BODY'][0]['SEMILLA'][0];

        // Devuelve la semilla para su uso posterior si es necesario
        return seed;
    } catch (error) {
        console.error("Error fetching or parsing data:", error);
        throw error; // Propaga el error para manejarlo externamente si es necesario
    }
}

// Función para crear el contenido XML con la semilla
const createXML = (Seed) => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
    <getToken>
        <item>
            <Semilla>${Seed}</Semilla>
        </item>
    </getToken>`;

    return xmlContent;
}

// Función para obtener el token usando la semilla
const getToken = async (xmlContent) => {
    try {
        const response = await axios({
            method: 'POST',
            url: 'https://apicert.sii.cl/recursos/v1/boleta.electronica.token',
            headers: {
                'Accept': 'application/xml',
                'Content-Type': 'application/xml'
            },
            data: xmlContent,
            validateStatus: () => true
        });

        // Parsea la respuesta XML a un objeto JavaScript
        const resp = await xml2js.parseStringPromise(response.data);

        // Extrae el token del objeto parseado
        const token = resp['SII:RESPUESTA']['SII:RESP_BODY'];

        // Verifica si el token es nulo y lanza un error si es así
        if(token == null){
            throw new Error('No es posible ingresar al TAG <SII:RESP_BODY></SII:RESP_BODY>. No es posible obtener un Token.');
        }

        // Devuelve el token para su uso posterior si es necesario
        return token;
    } catch (error) {
        throw error;
    }
}

// Función principal que realiza el flujo principal del programa
const main = async () => {
    try {
        // Obtiene la semilla
        const seed = await getSeed();
        console.log("Seed:", seed);

        // Crea el contenido XML con la semilla
        const xmlDocument = createXML(seed);

        // Obtiene el token usando el XML con la semilla
        const response = await getToken(xmlDocument);

        // Muestra el token en la consola
        console.log(response); 
    } catch (error) {
        console.error(error);
    }
}

// Llama a la función principal para iniciar el programa
main();