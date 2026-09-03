// Sul web esportiamo il BrowserRouter standard commerciale
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { TouchableOpacity } from 'react-native';

// Esportiamo il motore web standard
export { BrowserRouter as Router, Routes, Route, Navigate };

// Wrapper universale per il Link senza perdite di proprietà sull'HTML
export function Link({ to, children, ...rest }) {
  const navigate = useNavigate();
  
  // Estraiamo underlayColor dall'oggetto "rest" per NON passarlo al browser
  const { underlayColor, ...proprietaWebPulite } = rest;

  return (
    <TouchableOpacity 
      onPress={() => navigate(to)} 
      {...proprietaWebPulite} // Passiamo solo gli stili o i comandi sicuri per il web
    >
      {children}
    </TouchableOpacity>
  );
}