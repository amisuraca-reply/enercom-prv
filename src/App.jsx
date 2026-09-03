import { useState, useEffect } from 'react';
import { Router, Routes, Route, Link, Navigate } from './CustomRouter'; 
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, useWindowDimensions } from 'react-native';
import Home from './pages/Home';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Profilo from './pages/Profilo';
import Aziende from './pages/Aziende';
import NuovaAzienda from './pages/NuovaAzienda';
import Consumi from './pages/Consumi';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true); // Stato di caricamento iniziale

  // Mobile screen width
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // Ritorna true se lo schermo è piccolo


  // Controlla se esiste già una sessione attiva all'avvio dell'app (o dopo un F5)
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Errore durante il recupero del token:", error);
      } finally {
        setCheckingAuth(false); // Fine del controllo iniziale
      }
    };

    checkToken();
  }, []);

  const handleLogin = () => setIsAuthenticated(true);

  const handleLogout = async () => {
    try {
      // CANCELLIAMO I TOKEN DALLA MEMORIA (Valido per Browser e Smartphone)
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Errore durante il logout:", error);
    }
  };

  // Se l'app sta ancora verificando la presenza del token in memoria, mostra una schermata di caricamento
  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f4f9' }}>
        <ActivityIndicator size="large" color="#0078d4" />
        <Text style={{ marginTop: 10, color: '#666' }}>Verifica sessione in corso...</Text>
      </View>
    );
  }

  // Se l'utente NON è loggato, mostriamo solo il Login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  return (
    <Router>
      <SafeAreaView style={styles.container}>
        {/* HEADER RESPONSIVE: cambia direzione (row o column) in base a isMobile */}
        <View style={[styles.header, isMobile && styles.headerMobile]}>
          <Text style={styles.logo}>Azure Portal App</Text>
          
          <View style={[styles.nav, isMobile && styles.navMobile]}>
            <Link to="/" underlayColor="transparent"><Text style={styles.navLink}>Home</Text></Link>
            <Link to="/aziende" underlayColor="transparent"><Text style={styles.navLink}>Aziende</Text></Link>
            <Link to="/nuova-azienda" underlayColor="transparent"><Text style={styles.navLink}>+ Nuova</Text></Link>
            <Link to="/consumi" underlayColor="transparent"><Text style={styles.navLink}>Consumi</Text></Link>
            <Link to="/profilo" underlayColor="transparent"><Text style={styles.navLink}>Profilo</Text></Link>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Esci</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* CORPO DELLE PAGINE GESTITO DAL ROUTER */}
        <View style={styles.main}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/aziende" element={<Aziende />} />
            <Route path="/nuova-azienda" element={<NuovaAzienda />} />
            <Route path="/profilo" element={<Profilo />} />
            <Route path="/consumi" element={<Consumi />} />
            <Route path="/login" element={<Navigate to="/" />} />
          </Routes>
        </View>
      </SafeAreaView>
    </Router>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f9' },
  header: { backgroundColor: '#0078d4', paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  // Stile aggiuntivo se siamo su mobile (incolonna logo e menu)
  headerMobile: { flexDirection: 'column', gap: 15, alignItems: 'flex-start' },
  logo: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  // Stile nav mobile (permette ai link di andare a capo se non c'è spazio)
  navMobile: { flexWrap: 'wrap', gap: 15, width: '100%' },
  navLink: { color: '#fff', fontSize: 15, fontWeight: '500' },
  logoutButton: { backgroundColor: '#d83b01', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  main: { flex: 1 }
});

export default App;
