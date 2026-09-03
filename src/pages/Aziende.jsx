import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { secureFetch } from '../apiClient';

export default function Aziende() {
  const [aziende, setAziende] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    secureFetch('/api/getDatiAziendali')
      .then(res => res.json())
      .then(data => {
        setAziende(data);
        setLoading(false);
      })
      .catch(err => console.error("Errore:", err));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard Aziendale Protetta</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#0078d4" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.table}>
          {/* INTESTAZIONE DELLA FINTA TABELLA NATIVE */}
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerText, { flex: 0.5 }]}>ID</Text>
            <Text style={[styles.cell, styles.headerText, { flex: 2 }]}>Nome Azienda</Text>
            <Text style={[styles.cell, styles.headerText, { flex: 1.5 }]}>Città</Text>
          </View>
          
          {/* RIGHE DEI DATI */}
          {aziende.map(az => (
            <View key={az.id} style={styles.row}>
              <Text style={[styles.cell, { flex: 0.5 }]}>{az.id}</Text>
              <Text style={[styles.cell, styles.boldText, { flex: 2 }]}>{az.nomeAzienda}</Text>
              <Text style={[styles.cell, { flex: 1.5 }]}>{az.citta}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f4f4f9' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  table: { backgroundColor: '#fff', borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: '#ddd' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ddd', padding: 12, alignItems: 'center' },
  headerRow: { backgroundColor: '#0078d4' },
  headerText: { color: '#fff', fontWeight: 'bold' },
  cell: { fontSize: 15, color: '#333' },
  boldText: { fontWeight: 'bold' }
});
