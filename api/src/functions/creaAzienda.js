const { app } = require('@azure/functions');

app.http('creaAzienda', {
    methods: ['POST'], // Abilitiamo solo il metodo POST
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const baseUrl = process.env.MIDDLEWARE_BASE_URL;
            const tokenSegreto = process.env.MIDDLEWARE_API_TOKEN;

            // 1. Intercettiamo i dati inviati dal form React Native
            const datiRicevuti = await request.json();

            // 2. Il server di Azure fa la chiamata POST sicura verso il middleware
            const rispostaMiddleware = await fetch(`${baseUrl}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${tokenSegreto}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: datiRicevuti.nomeAzienda,
                    body: datiRicevuti.citta,
                    userId: 1
                })
            });

            const risultatoInviato = await rispostaMiddleware.json();

            // 3. Rispondiamo a React confermando il successo dell'operazione
            return { 
                status: 201, 
                jsonBody: { 
                    success: true, 
                    messaggio: "Azienda creata con successo!",
                    idGenerato: risultatoInviato.id // Il server ci restituisce il finto ID creato (es. 101)
                } 
            };

        } catch (errore) {
            return { status: 500, jsonBody: { success: false, errore: "Errore durante l'inserimento" } };
        }
    }
});