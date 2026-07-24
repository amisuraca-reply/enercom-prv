import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Se siamo sul web usa l'URL relativo, se siamo sul telefono punta allo Staging di Azure
const BASE_URL = Platform.OS === 'web' 
  ? '' 
  : 'https://calm-river-02374e60f-versionenative.eastus2.7.azurestaticapps.net/';


// Funzione di utilità per decodificare la scadenza di un JWT (senza librerie esterne)
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const { exp } = JSON.parse(jsonPayload);
    // Controlliamo se il token scade nei prossimi 10 secondi (margine di sicurezza)
    return Date.now() >= (exp * 1000) - 10000;
  } catch (error) {
    return true; // Se il token è corrotto, lo consideriamo scaduto
  }
};

// Il nostro intercettore personalizzato universale
// Nel futuro potrebbe essere gestito da librerie specifiche, come Axios
export const secureFetch = async (url, options = {}) => {
  let accessToken = await AsyncStorage.getItem('access_token');

  // L'Access Token è scaduto o manca?
  if (!accessToken || isTokenExpired(accessToken)) {
    console.log("Access Token scaduto o mancante. Tento il refresh automatico...");
    const refreshToken = await AsyncStorage.getItem('refresh_token');

    if (refreshToken) {
      try {
        // Chiediamo ad Azure un nuovo token in background
        const res = await fetch(`${BASE_URL}/api/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          // Salviamo i nuovi token ricevuti
          await AsyncStorage.setItem('access_token', data.accessToken);
          await AsyncStorage.setItem('refresh_token', data.refreshToken);
          accessToken = data.accessToken; // Aggiorniamo la variabile per la chiamata corrente
          console.log("Refresh completato con successo!");
        } else {
          // Se il refresh fallisce, sessione distrutta (l'utente dovrà rifare il login)
          await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
          if (Platform.OS === 'web') {
            window.location.reload();
          } // Forziamo il riavvio per mostrare il Login
          throw new Error("Sessione scaduta definitivamente.");
        }
      } catch (err) {
        console.error("Errore durante il refresh automatico:", err);
      }
    }
  }

  // Componiamo la richiesta finale inserendo l'Access Token valido nell'Header
  const secureOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  };

  return fetch(`${BASE_URL}${url}`, secureOptions);
};
