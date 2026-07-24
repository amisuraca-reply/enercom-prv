import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { secureFetch } from '../apiClient'; // custom http intercpetor


export default function Home() {

  const [contenuti, setContenuti] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Chiamiamo il proxy di Azure per leggere il CMS
    secureFetch('/api/getContenutiCms?page=homepage')
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
      {/* Testi renderizzati dinamicamente in base a cosa risponde Sanity */}
      <Text style={styles.title}>{contenuti?.titoloBenvenuto || "Home Page"}</Text>
      <Text style={styles.text}>{contenuti?.sottotitolo || "Nessun contenuto disponibile dal CMS."}</Text>
      
      {contenuti?.mostraTabellaAziende && (
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>💡 CMS operativo e raggiungibile</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  text: { fontSize: 16, color: '#666', lineHeight: 22, marginBottom: 20 },
  loadingText: { marginTop: 10, color: '#666' },
  alertBox: { backgroundColor: '#eef', padding: 15, borderRadius: 6, borderWidth: 1, borderColor: '#0078d4' },
  alertText: { color: '#0078d4', fontSize: 14, fontWeight: '500' }
});
