const { app } = require('@azure/functions');

app.http('getContenutiCms', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const projectId = process.env.SANITY_PROJECT_ID;
            const dataset = process.env.SANITY_DATASET;
            const tokenSegreto = process.env.SANITY_API_TOKEN;

            // 1. Intercettiamo il parametro "page" inviato da React Native (es. ?page=homepage o ?page=profilo)
            const urlParams = new URL(request.url).searchParams;
            const paginaRichiesta = urlParams.get('page');

            if (!paginaRichiesta) {
                return { status: 400, jsonBody: { success: false, errore: "Specificare il parametro 'page'" } };
            }

            // 2. Componiamo la query GROQ in modo dinamico in base alla pagina richiesta!
            // (Prende il documento che ha quel determinato _type)
            const queryGroq = encodeURIComponent(`*[_type == "${paginaRichiesta}"][0]`);
            console.log("DEBUG:: sanity:: query: ", queryGroq);

            
            // Componiamo l'URL ufficiale delle API HTTP di Sanity
            const urlSanity = `https://${projectId}.api.sanity.io/v2021-10-21/data/query/${dataset}?query=${queryGroq}`;

            // Il server di Azure interroga Sanity usando il token privato nascosto al browser
            // (Per i test, se non abbiamo un progetto reale, intercettiamo l'errore o simuliamo)
            let datiCms;
            
            if (projectId === "abcde123") {
                // SIMULAZIONE: Risposta realistica del CMS per il nostro test
                if (paginaRichiesta==="homepage") {
                    datiCms = {
                        result: {
                            titoloBenvenuto: "Benvenuto in Area Privata...",
                            sottotitolo: "Contenuto dinamico erogato in sicurezza da Sanity CMS.",
                            mostraTabellaAziende: true
                        }
                    };
                }
                if (paginaRichiesta==="profile") {
                    datiCms = {
                        result: {
                            titleProfilo: "Il tuo profilo (cms)...",
                            subTitleProfilo: "Dati dell'utente in sessione... (cms)"
                        }
                    };
                }
            } else {
                // CHIAMATA REALE: Scatta quando inserirai l'ID reale del cliente
                const res = await fetch(urlSanity, {
                    headers: { 'Authorization': `Bearer ${tokenSegreto}` }
                });
                datiCms = await res.json();
            }

            return { status: 200, jsonBody: { success: true, contenuti: datiCms.result } };

        } catch (errore) {
            return { status: 500, jsonBody: { success: false, errore: "Impossibile recuperare i contenuti dal CMS" } };
        }
    }
});