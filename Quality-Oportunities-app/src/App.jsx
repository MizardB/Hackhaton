import { useState } from 'react';
import AccesoPage from './pages/acceso/AccesoPage.jsx';
import CatalogoPage from './pages/catalogo/CatalogoPage.jsx';
import DetalleRetoPage from './pages/reto/DetalleRetoPage.jsx';
import EspacioTrabajoPage from './pages/espacio/EspacioTrabajoPage.jsx';
import ResultadoPage from './pages/resultado/ResultadoPage.jsx';

export default function App() {
  const [route, setRoute] = useState('acceso');

  const renderPage = () => {
    switch (route) {
      case 'acceso':
        return <AccesoPage onLogin={() => setRoute('catalogo')} />;
      case 'catalogo':
        return <CatalogoPage onSelectReto={() => setRoute('detalle')} />;
      case 'detalle':
        return <DetalleRetoPage onIniciar={() => setRoute('espacio')} />;
      case 'espacio':
        return <EspacioTrabajoPage onEnviar={() => setRoute('resultado')} />;
      case 'resultado':
        return <ResultadoPage onVolver={() => setRoute('catalogo')} />;
      default:
        return <AccesoPage onLogin={() => setRoute('catalogo')} />;
    }
  };

  return <div className="min-h-screen bg-background text-on-surface">{renderPage()}</div>;
}
