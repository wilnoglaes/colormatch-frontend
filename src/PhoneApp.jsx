import { useState } from 'react';

const ROJO = '#C1432E';

export default function PhoneApp({ colores, cargando, errorApi, colorSeleccionado, paredActiva, onElegir }) {
  const [tab, setTab] = useState('analizar');
  const [pantalla, setPantalla] = useState('inicio'); // inicio | catalogo
  const [escaneando, setEscaneando] = useState(false);
  const [historial, setHistorial] = useState([]);

  const analizar = () => {
    setEscaneando(true);
    setTimeout(() => { setEscaneando(false); setPantalla('catalogo'); }, 1200);
  };

  const elegir = (c) => {
    onElegir(c);
    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistorial(h => [{ ...c, pared: paredActiva, hora }, ...h].slice(0, 30));
  };

  const Fila = ({ h }) => (
    <div className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm">
      <div className="w-10 h-10 rounded-xl border border-gray-200" style={{ backgroundColor: h.hex }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 truncate">{h.nombre}</p>
        <p className="text-xs text-gray-500">{h.hex} · {h.pared}</p>
      </div>
      <span className="text-xs text-gray-400">{h.hora}</span>
    </div>
  );

  return (
    <div className="w-[340px] h-[690px] bg-black rounded-[2.5rem] p-2 shadow-2xl border border-gray-600">
      <div className="relative w-full h-full rounded-[2rem] overflow-hidden flex flex-col bg-[#f7f5f2] text-gray-800">

        {/* Barra de estado */}
        <div className="absolute top-0 inset-x-0 z-20 flex justify-between px-5 pt-2 text-[11px] font-semibold text-white/90">
          <span>14:33</span><span>●●● 22%</span>
        </div>

        {/* Cabecera roja */}
        <div className="px-5 pt-8 pb-12 text-white shrink-0" style={{ backgroundColor: ROJO }}>
          <div className="flex items-center gap-2 text-[11px] tracking-[0.25em] font-bold">
            <span>💧</span> MONOPOL
          </div>
          <h2 className="text-3xl font-extrabold mt-1">ColorMatch</h2>
          <p className="text-sm opacity-90">Identificación inteligente de colores</p>
          <p className="text-xs opacity-80 mt-1">Contractor</p>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-4 -mt-8 pb-3 space-y-3">

          {tab === 'analizar' && pantalla === 'inicio' && (
            <>
              <div className="bg-white rounded-3xl shadow-md divide-y divide-gray-100">
                <button onClick={analizar} className="w-full flex items-center gap-3 p-4 text-left">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl text-white" style={{ backgroundColor: ROJO }}>📷</div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Capturar imagen</p>
                    <p className="text-xs text-gray-500">Toma una foto de la superficie</p>
                  </div>
                  <span className="text-gray-400">›</span>
                </button>
                <button onClick={analizar} className="w-full flex items-center gap-3 p-4 text-left">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl text-white bg-gray-700">🖼️</div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Seleccionar de galería</p>
                    <p className="text-xs text-gray-500">Elige una imagen guardada</p>
                  </div>
                  <span className="text-gray-400">›</span>
                </button>
              </div>

              <div className="bg-white rounded-3xl shadow-sm py-4 text-center">
                <p className="text-3xl font-extrabold" style={{ color: ROJO }}>{historial.length}</p>
                <p className="text-[11px] tracking-widest text-gray-500">COLORES</p>
              </div>

              <div className="flex justify-between items-center px-1 pt-1">
                <p className="text-[11px] tracking-wider font-semibold text-gray-500">🕒 ANÁLISIS RECIENTES</p>
                <button onClick={() => setTab('historial')} className="text-xs font-bold" style={{ color: ROJO }}>Ver todo</button>
              </div>
              {historial.slice(0, 3).map((h, i) => <Fila key={i} h={h} />)}
            </>
          )}

          {tab === 'analizar' && pantalla === 'catalogo' && (
            <>
              <div className="bg-white rounded-3xl shadow-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <button onClick={() => setPantalla('inicio')} className="text-xs font-bold" style={{ color: ROJO }}>‹ Volver</button>
                  <p className="text-xs text-gray-500">Pintando: <b className="text-gray-800">{paredActiva}</b></p>
                </div>

                {cargando ? (
                  <p className="text-sm text-gray-500 py-6 text-center">Cargando catálogo…</p>
                ) : errorApi ? (
                  <p className="text-sm text-white bg-gray-700 rounded-xl p-3">No se pudo cargar el catálogo de colores. Cierra y vuelve a abrir la app.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-[330px] overflow-y-auto pr-1">
                    {colores.map(c => (
                      <button key={c.codigo} onClick={() => elegir(c)}
                        className={`rounded-2xl p-2 border-2 text-left transition ${
                          colorSeleccionado?.codigo === c.codigo ? 'bg-red-50' : 'border-gray-100 bg-gray-50'}`}
                        style={colorSeleccionado?.codigo === c.codigo ? { borderColor: ROJO } : {}}>
                        <div className="h-9 rounded-lg mb-1 border border-black/5" style={{ backgroundColor: c.hex }} />
                        <p className="text-[11px] font-bold truncate">{c.nombre}</p>
                        <p className="text-[10px] text-gray-400">{c.hex}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {colorSeleccionado && !errorApi && (
                <div className="bg-white rounded-3xl shadow-sm p-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl border border-gray-200" style={{ backgroundColor: colorSeleccionado.hex }} />
                  <div>
                    <p className="text-[10px] tracking-wider text-gray-500">COLOR SELECCIONADO</p>
                    <p className="font-bold text-sm">{colorSeleccionado.nombre}</p>
                    <p className="text-xs text-gray-500">{colorSeleccionado.hex}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'historial' && (
            <div className="pt-10 space-y-2">
              <p className="text-[11px] tracking-wider font-semibold text-gray-500 px-1">HISTORIAL</p>
              {historial.length === 0
                ? <p className="text-sm text-gray-400 text-center py-10">Aún no hay colores aplicados</p>
                : historial.map((h, i) => <Fila key={i} h={h} />)}
            </div>
          )}
        </div>

        {/* Overlay de análisis */}
        {escaneando && (
          <div className="absolute inset-0 z-30 bg-black/70 flex flex-col items-center justify-center text-white gap-3">
            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-sm">Analizando superficie…</p>
          </div>
        )}

        {/* Barra inferior */}
        <div className="flex shrink-0 bg-[#f9e8e6] border-t border-red-100">
          {[['analizar', '📷', 'Analizar'], ['historial', '🕘', 'Historial']].map(([id, ico, nombre]) => (
            <button key={id} onClick={() => { setTab(id); if (id === 'analizar') setPantalla('inicio'); }}
              className="flex-1 py-3 text-center text-xs font-bold"
              style={{ color: tab === id ? ROJO : '#6b7280' }}>
              <div className="text-lg">{ico}</div>{nombre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}