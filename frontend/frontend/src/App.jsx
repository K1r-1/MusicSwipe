export default function App() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [editando, setEditando] = useState(null); // servicio en edición o null
  
  const cargar = useCallback(async () => { /* igual que en la Parte E */ }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // Tras crear o editar: se cierra el modo edición y se recarga la lista
  const handleGuardado = () => {
    setEditando(null);
    cargar();
  };

  const handleEliminar = async (servicio) => {
    // Confirmación antes de una acción que no se puede deshacer
    if (!window.confirm("¿Eliminar el servicio «" + servicio.nombre + "»?")) return;
    try {
      await serviciosApi.eliminar(servicio.id);
      cargar();
    } catch (e) {
      setError("No se pudo eliminar el servicio.");
    }
  };

  return (
  <main className="contenedor">
    <h1>Servicios</h1>
    <ServicioForm
    servicio={editando}
    onGuardado={handleGuardado}
    onCancelar={() => setEditando(null)}
    />
    {cargando && <p className="aviso">Cargando…</p>}
    {error && <p className="aviso error">{error}</p>}
    {!cargando && !error && (
      <ServicioList
      servicios={servicios}
      onEditar={setEditando}
      onEliminar={handleEliminar}
      />
      )}
  </main>
 );
}