import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { secureFetch } from '../apiClient'; // custom http intercpetor

export default function Profilo() {
  const [contenuti, setContenuti] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Chiamiamo il proxy di Azure per leggere il CMS
    secureFetch('/api/getContenutiCms?page=profile')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setContenuti(data.contenuti);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Errore CMS:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0078d4" />
        <Text style={styles.loadingText}>Caricamento layout dal CMS...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{contenuti?.titleProfilo || "Il Tuo Profilo"}</Text>
      <Text style={styles.text}>{contenuti?.subTitleProfilo || "Qui verranno mostrati i dati di sessione dell'utente autenticato."}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  text: { fontSize: 16, color: '#666' }
});
