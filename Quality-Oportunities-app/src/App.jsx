import { useState } from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import AccesoPage from './pages/acceso/AccesoPage.jsx';
import CatalogoPage from './pages/catalogo/CatalogoPage.jsx';
import DetalleRetoPage from './pages/reto/DetalleRetoPage.jsx';
import EspacioTrabajoPage from './pages/espacio/EspacioTrabajoPage.jsx';
import ResultadoPage from './pages/resultado/ResultadoPage.jsx';

export default function App() {
  const [route, setRoute] = useState('acceso');
  const [retoSeleccionado, setRetoSeleccionado] = useState(null);

  const navigate = (next, payload) => {
    setRoute(next);
    if (payload) {
      setRetoSeleccionado(payload);
    }
  };

  const renderPage = () => {
    switch (route) {
      case 'acceso':
        return <AccesoPage onLogin={() => navigate('catalogo')} />;
      case 'catalogo':
        return <CatalogoPage onSelectReto={(reto) => navigate('detalle', reto)} />;
      case 'detalle':
        return <DetalleRetoPage retoId={retoSeleccionado?.id} onIniciar={() => navigate('espacio')} onVolver={() => navigate('catalogo')} />;
      case 'espacio':
        return <EspacioTrabajoPage retoId={retoSeleccionado?.id} onEnviar={() => navigate('resultado')} onVolver={() => navigate('detalle')} />;
      case 'resultado':
        return <ResultadoPage retoId={retoSeleccionado?.id} onVolver={() => navigate('catalogo')} />;
      default:
        return <AccesoPage onLogin={() => navigate('catalogo')} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-on-surface">{renderPage()}</div>
    </AuthProvider>
  );
}
