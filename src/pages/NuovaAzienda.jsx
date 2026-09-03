import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function NuovaAzienda() {
  const [nomeAzienda, setNomeAzienda] = useState('');
  const [citta, setCitta] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSalva = async () => {
    if (!nomeAzienda || !citta) {
      setFeedback('Per favore, compila tutti i campi.');
      return;
    }

    setLoading(true);
    setFeedback('');

    try {
      // Inviamo i dati alla nostra Azure Function in POST
      const response = await fetch('/api/creaAzienda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeAzienda, citta })
      });

      const risultato = await response.json();

      if (risultato.success) {
        setFeedback(`${risultato.messaggio} (ID: ${risultato.idGenerato})`);
        setNomeAzienda('');
        setCitta('');
      } else {
        setFeedback('Errore durante il salvataggio.');
      }
    } catch (error) {
      setFeedback('Errore di connessione col server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inserisci Nuova Azienda Partner</Text>
      
      {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Nome Azienda</Text>
        <TextInput 
          value={nomeAzienda} 
          onChangeText={setNomeAzienda} 
          style={styles.input} 
          placeholder="Es. Microsoft"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Città Sede</Text>
        <TextInput 
          value={citta} 
          onChangeText={setCitta} 
          style={styles.input} 
          placeholder="Es. Milano"
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSalva}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Salvataggio...' : 'Salva nei Sistemi'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, maxWidth: 500, width: '100%' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  feedbackText: { padding: 10, backgroundColor: '#eef', borderRadius: 4, marginBottom: 15, color: '#0078d4', fontWeight: '500', textAlign: 'center' },
  formGroup: { marginBottom: 15 },
  label: { fontSize: 14, marginBottom: 5, color: '#666', fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 10, fontSize: 16, backgroundColor: '#fff' },
  button: { backgroundColor: '#0078d4', padding: 14, borderRadius: 4, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#cccccc' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});