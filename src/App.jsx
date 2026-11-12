import { useEffect, useState } from 'react';
import axios from 'axios';
import Room3D from './Room3D';
import PhoneApp from './PhoneApp';

// En Vercel define VITE_API_URL con la URL de Render; en local usa localhost
const API_URL = import.meta.env.VITE_API_URL || 'https://colormatch-backend-gyj5.onrender.com';

export default function App() {
  const [colores, setColores] = useState([]);
  const [colorSeleccionado, setColorSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorApi, setErrorApi] = useState(false);

  // Pared activa y color de cada superficie
  const [paredActiva, setParedActiva] = useState('Frontal');
  const [coloresPared, setColoresPared] = useState({
    Trasera: '#b3b3b3',
    Frontal: '#b3b3b3',
    Izquierda: '#b3b3b3',
    Derecha: '#b3b3b3',
    Piso: '#2b2f3a',
    Techo: '#f5f5f5',
  });

  // Cargar colores desde la API
  useEffect(() => {
    axios.get(`${API_URL}/colores/`)
      .then(response => {
        setColores(response.data);
        if (response.data.length > 0) setColorSeleccionado(response.data[0]);
        setCargando(false);
      })
      .catch(error => {
        console.error('Error conectando a la API:', error);
        setErrorApi(true);
        setCargando(false);
      });
  }, []);

  // Al elegir un color: se selecciona y se pinta la pared activa
  const elegirColor = (color) => {
    setColorSeleccionado(color);
    setColoresPared(prev => ({ ...prev, [paredActiva]: color.hex }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex font-sans">

      {/* PANEL IZQUIERDO: HABITACIÓN 3D */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold mb-4 text-center text-white">Habitación 3D Interactiva</h1>

        <div className="w-full max-w-3xl h-[600px] shadow-2xl rounded-xl border border-gray-700">
          <Room3D
            wallColors={coloresPared}
            activeWall={paredActiva}
            onSelectWall={setParedActiva}
          />
        </div>

        <p className="text-sm text-gray-400 mt-4 text-center">
          Haz clic en una pared (o usa los botones) y luego elige un color en la app. Arrastra para rotar la cámara.
        </p>
      </div>

      {/* PANEL DERECHO: SIMULACIÓN DE LA APP MÓVIL */}
      <div className="w-[400px] bg-gray-800 p-6 flex items-center justify-center shadow-2xl border-l border-gray-700">
        <PhoneApp
          colores={colores}
          cargando={cargando}
          errorApi={errorApi}
          colorSeleccionado={colorSeleccionado}
          paredActiva={paredActiva}
          onElegir={elegirColor}
        />
      </div>

    </div>
  );
}