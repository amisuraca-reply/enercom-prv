const { app } = require('@azure/functions');

app.http('login', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const { username, password } = await request.json();
            const iamUrl = process.env.IAM_AUTH_URL;

            // Il server chiama l'IAM esterno del cliente in totale sicurezza
            const rispostaIam = await fetch(iamUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: username,
                    body: password,
                    userId: 1
                }) // L'IAM reale potrebbe richiedere altri dati, come client_id o grant_type
            });

            // Se l'URL su Azure o in local.settings.json è configurato male, intercettiamo l'errore
            if (!rispostaIam.ok) {
                return { status: 401, jsonBody: { success: false, errore: "L'IAM esterno ha rifiutato la richiesta." } };
            }

            // Simuliamo la risposta reale che ti darà l'IAM del cliente:
            return {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*', // Autorizza lo smartphone a leggere la risposta
                    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                },
                jsonBody: {
                    success: true,
                    // Token valido con scadenza fittizia impostata nel futuro lontanissimo
                    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4OTMwNDY0MDB9.FintoTokenValidoFinoAl2030",
                    refreshToken: "rfr_987654321_GeneratoDallIamDelCliente_ABCDE",
                    expiresIn: 900 // 15 minuti
                }
            };

        } catch (errore) {
            return { status: 500, jsonBody: { success: false, errore: "Impossibile contattare il server IAM." } };us
        }
    }
});