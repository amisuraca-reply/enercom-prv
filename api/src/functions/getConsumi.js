const { app } = require('@azure/functions');

app.http('getConsumi', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            // Simuliamo i dati storici dei consumi luce (kWh) divisi per mese ed anno
            const datiConsumi = [
                { mese: "Gen", anno: 2025, kwh: 320 },
                { mese: "Feb", anno: 2025, kwh: 290 },
                { mese: "Mar", anno: 2025, kwh: 250 },
                { mese: "Apr", anno: 2025, kwh: 180 },
                { mese: "Mag", anno: 2025, kwh: 150 },
                { mese: "Giu", anno: 2025, kwh: 210 },
                { mese: "Lug", anno: 2025, kwh: 280 },
                { mese: "Ago", anno: 2025, kwh: 300 },
                { mese: "Set", anno: 2025, kwh: 190 },
                { mese: "Ott", anno: 2025, kwh: 220 },
                { mese: "Nov", anno: 2025, kwh: 270 },
                { mese: "Dic", anno: 2025, kwh: 340 },
                // DATI NUOVI 2026 (Fino a Settembre corrente)
                { mese: "Gen", anno: 2026, kwh: 340 }, // +20
                { mese: "Feb", anno: 2026, kwh: 275 }, // -15
                { mese: "Mar", anno: 2026, kwh: 260 }, // +10
                { mese: "Apr", anno: 2026, kwh: 165 }, // -15
                { mese: "Mag", anno: 2026, kwh: 170 }, // +20
                { mese: "Giu", anno: 2026, kwh: 230 }, // +20
                { mese: "Lug", anno: 2026, kwh: 295 },  // +15
                { mese: "Ago", anno: 2026, kwh: 230 }, // -70
                { mese: "Set", anno: 2026, kwh: 100 }  // -140
            ];

            return { 
                status: 200, 
                jsonBody: { success: true, dati: datiConsumi } 
            };
        } catch (errore) {
            return { status: 500, jsonBody: { success: false, errore: "Errore recupero consumi" } };
        }
    }
});