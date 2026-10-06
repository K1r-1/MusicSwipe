// Formatea un número como pesos chilenos: 250000 -> $250.000
// Dado la adaptación al contexto del proyecto, no se utiliza esta función
const formatoCLP = (valor) =>
    Number(valor).toLocaleString("es-CL", { style: "currency", currency: "CLP" });

export default function ServicioList({ servicios, onEditar, onEliminar }) {
 if (servicios.length === 0) {
  return <p className="aviso">Aún no hay servicios registrados.</p>;
}

return (
 <table className="tabla">
  <thead>
   <tr>
    <th>Titulo</th>
    <th>Artista</th>
    <th>Lanzamiento</th>
    <th>Acciones</th>
   </tr>
  </thead>
  <tbody>
   {servicios.map((s) => (
    // key: identificador único para que React distinga cada fila
    <tr key={s.id}>
     <td>{s.titulo}</td>
     <td>{s.artista}</td>
     <td>{s.lanzamiento}</td>
     <td>
      <button onClick={() => onEditar(s)}>Editar</button>
      <button onClick={() => onEliminar(s)}>Eliminar</button>
     </td>
    </tr>
    ))}
   </tbody>
  </table>
 );
}