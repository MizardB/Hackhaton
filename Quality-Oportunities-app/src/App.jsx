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
  // El envio devuelve el identificador de la evaluacion, y la pantalla de resultado lo necesita
  // para consultar su estado. Antes se navegaba sin llevar nada.
  const [evaluacion, setEvaluacion] = useState({ id: null, tituloReto: null });

  const navigate = (next, payload) => {
    setRoute(next);
    if (payload) {
      setRetoSeleccionado(payload);
    }
  };

  const alEnviar = (evaluacionId, tituloReto) => {
    setEvaluacion({ id: evaluacionId, tituloReto: tituloReto ?? retoSeleccionado?.titulo ?? null });
    setRoute('resultado');
  };

  const renderPage = () => {
    switch (route) {
      case 'acceso':
        return <AccesoPage onLogin={() => navigate('catalogo')} />;
      case 'catalogo':
        return <CatalogoPage onSelectReto={(reto) => navigate('detalle', reto)} />;
      case 'detalle':
        return (
          <DetalleRetoPage
            retoId={retoSeleccionado?.id}
            onIniciar={() => navigate('espacio')}
            onVolver={() => navigate('catalogo')}
          />
        );
      case 'espacio':
        return (
          <EspacioTrabajoPage
            retoId={retoSeleccionado?.id}
            onEnviar={alEnviar}
            onVolver={() => navigate('detalle')}
          />
        );
      case 'resultado':
        return (
          <ResultadoPage
            evaluacionId={evaluacion.id}
            tituloReto={evaluacion.tituloReto}
            onVolver={() => navigate('catalogo')}
          />
        );
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
