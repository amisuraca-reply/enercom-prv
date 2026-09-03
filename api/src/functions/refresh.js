const { app } = require('@azure/functions');

app.http('refresh', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const { refreshToken } = await request.json();
            const iamUrl = process.env.IAM_AUTH_URL;

            if (!refreshToken) {
                return { status: 400, jsonBody: { errore: "Refresh token mancante" } };
            }

            // Il server di Azure contatta l'IAM per rinnovare il token
            const rispostaIam = await fetch(iamUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: "RinnovoToken",
                    body: refreshToken,
                    userId: 1
                })
            });

            if (!rispostaIam.ok) {
                return { status: 401, jsonBody: { errore: "Refresh token non valido o scaduto nell'IAM" } };
            }

            // L'IAM restituisce il nuovo Access Token aggiornato
            return {
                status: 200,
                jsonBody: {
                    success: true,
                    // Nuovo token valido erogato dal refresh
                    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4OTMwNDY0MDB9.NuovoTokenRinnovatoValido",
                    refreshToken: "rfr_NuovoRefreshTokenSostitutivo..." // Spesso l'IAM ne genera uno nuovo ("Token Rotation")
                }
            };

        } catch (errore) {
            return { status: 500, jsonBody: { errore: "Errore durante il refresh del token" } };
        }
    }
});