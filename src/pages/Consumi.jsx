import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { VictoryBar, VictoryChart, VictoryTheme, VictoryAxis, VictoryGroup, VictoryLegend } from 'victory-native';
import { Picker } from '@react-native-picker/picker'; // <-- Importiamo il selettore universale
import { secureFetch } from '../apiClient';
import { Platform } from 'react-native';

export default function Consumi() {
  const [storico, setStorico] = useState([]);
  const [annoSelezionato, setAnnoSelezionato] = useState('confronto'); // '2025', '2026' o 'confronto'
  const [loading, setLoading] = useState(true);

  // Mobile screen width
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Calcoliamo la larghezza dinamica per il grafico (lasciamo un margine per il padding laterale)
  const chartWidth = isMobile ? width - 40 : 700;

  useEffect(() => {
    secureFetch('/api/getConsumi')
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          setStorico(resData.dati);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Errore consumi:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0078d4" />
        <Text style={styles.loadingText}>Elaborazione dati storici...</Text>
      </View>
    );
  }

  // FILTRAGGIO E DIVISIONE DEI DATI PER ANNO
  const dati2025 = storico.filter(d => d.anno === 2025);
  const dati2026 = storico.filter(d => d.anno === 2026);

  // Decidiamo cosa mostrare nel grafico in base al Picker
  const getDatiGrafico = () => {
    if (annoSelezionato === '2025') return dati2025;
    if (annoSelezionato === '2026') return dati2026;
    return []; // Gestito autonomamente da VictoryGroup nel confronto
  };

  // ELENCO DELLE VARIAZIONI MENSILI (2026 vs 2025)
  // Cicliamo sui mesi del 2026 (che ha meno mesi) per trovare il corrispettivo nel 2025
  const variazioniAnnoSuAnno = dati2026.map(m26 => {
    const m25 = dati2025.find(m => m.mese === m26.mese);
    if (!m25) return null;
    const differenza = m26.kwh - m25.kwh;
    return {
      mese: m26.mese,
      diff: differenza,
      segno: differenza > 0 ? `+${differenza}` : `${differenza}`
    };
  }).filter(Boolean);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Analisi Energetica Consumi Luce</Text>
      <Text style={styles.subtitle}>Rilevazioni storiche in tempo reale (kWh)</Text>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Seleziona Periodo:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={annoSelezionato}
            onValueChange={(itemValue) => setAnnoSelezionato(itemValue)}
            style={styles.picker}
            dropdownIconColor="#0078d4" // Forza il colore della freccetta su Android
            itemStyle={styles.pickerItemIos} // Applica l'altezza fissa specifica solo per iOS
          >
            {/* Su mobile forziamo il colore nero/grigio scuro su OGNI singolo elemento per evitare la DarkMode invisibile */}
            <Picker.Item label="📊 Confronto Anni (2025 vs 2026)" value="confronto" color="#333" />
            <Picker.Item label="Calendario Annuale 2025" value="2025" color="#333" />
            <Picker.Item label="Calendario Annuale 2026" value="2026" color="#333" />
          </Picker>
        </View>
      </View>

      {/* IL GRAFICO ADESSO USA chartWidth DINAMICO */}
      <View style={styles.chartContainer}>
        <VictoryChart theme={VictoryTheme.material} domainPadding={25} width={chartWidth} height={320}>
          <VictoryLegend x={isMobile ? 40 : 200} y={10}
            orientation="horizontal" gutter={20} style={{ labels: { fontSize: 10 } }}
            data={[{ name: "2025", symbol: { fill: "#a0c4ff" } }, { name: "2026", symbol: { fill: "#0078d4" } }]}
          />
          <VictoryAxis tickValues={storico.filter(d=>d.anno===2025).map(d => d.mese)} style={{ tickLabels: { fontSize: 9 } }} />
          <VictoryAxis dependentAxis tickFormat={(x) => `${x}k`} style={{ tickLabels: { fontSize: 9 } }} />

          {annoSelezionato === 'confronto' ? (
            <VictoryGroup offset={isMobile ? 6 : 14}>
              <VictoryBar data={storico.filter(d=>d.anno===2025)} x="mese" y="kwh" style={{ data: { fill: "#a0c4ff", width: isMobile ? 5 : 12 } }} />
              <VictoryBar data={storico.filter(d=>d.anno===2026)} x="mese" y="kwh" style={{ data: { fill: "#0078d4", width: isMobile ? 5 : 12 } }} />
            </VictoryGroup>
          ) : (
            <VictoryBar data={annoSelezionato === '2025' ? storico.filter(d=>d.anno===2025) : storico.filter(d=>d.anno===2026)} x="mese" y="kwh" style={{ data: { fill: annoSelezionato === '2025' ? "#a0c4ff" : "#0078d4", width: isMobile ? 10 : 22 } }} />
          )}
        </VictoryChart>
      </View>

      <Text style={styles.sectionTitle}>Delta Variazione Anno su Anno (YoY)</Text>
      
      {/* I BOX DEL DELTA: cambiano direzione (row o column) grazie a isMobile */}
      <View style={[styles.deltaContainer, isMobile && styles.deltaContainerMobile]}>
        {storico.filter(d=>d.anno===2026).map(v26 => {
          const m25 = storico.filter(d=>d.anno===2025).find(m => m.mese === v26.mese);
          if (!m25) return null;
          const diff = v26.kwh - m25.kwh;
          return (
            <View key={v26.mese} style={[styles.deltaCard, isMobile && styles.deltaCardMobile]}>
              <Text style={styles.deltaMese}>{v26.mese}</Text>
              <Text style={[styles.deltaValore, diff > 0 ? styles.textSu : styles.textGiu]}>
                {diff > 0 ? `+${diff}` : diff} kWh
              </Text>
              <Text style={styles.deltaSub}>{diff > 0 ? '🔺 Aumento' : '📉 Risparmio'}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: '#f4f4f9' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 13, color: '#666', marginBottom: 15 },
  filterContainer: { 
    marginBottom: 15, 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#ddd' 
  },
  filterLabel: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#444', 
    marginBottom: 6 
  },
  pickerWrapper: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 6, 
    backgroundColor: '#fafafa', 
    overflow: 'hidden',
    // Il contenitore web ha altezza fissa, il mobile deve lasciare espandere il motore nativo
    height: Platform.OS === 'web' ? 40 : undefined,
    justifyContent: 'center'
  },
  picker: { 
    width: '100%', 
    // VINCOLO STRUTTURALE: Forziamo l'altezza minima sul web e su Android per non farlo collassare
    ...Platform.select({
      web: { height: 40, color: '#333', cursor: 'pointer' },
      android: { height: 50, color: '#333' },
      ios: { width: '100%' } // iOS si autogestisce tramite itemStyle
    })
  },
  // Stile speciale extra da aggiungere sotto per la ruota nativa di iPhone
  pickerItemIos: {
    fontSize: 16,
    height: 120, // La ruota di selezione iOS richiede uno spazio verticale dedicato
    color: '#333'
  },
  chartContainer: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 5, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  
  // FLEXBOX RESPONSIVE
  deltaContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 40 },
  deltaContainerMobile: { flexDirection: 'column' }, // Se è mobile, li incolonna verticalmente
  deltaCard: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', flex: 1, minWidth: 100, alignItems: 'center' },
  deltaCardMobile: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }, // Box orizzontali su mobile
  
  deltaMese: { fontSize: 13, fontWeight: 'bold', color: '#555' },
  deltaValore: { fontSize: 15, fontWeight: 'bold' },
  deltaSub: { fontSize: 11, color: '#999' },
  textSu: { color: '#d83b01' },
  textGiu: { color: '#107c41' }
});
