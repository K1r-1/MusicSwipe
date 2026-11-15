import { useEffect, useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import ListGroup from 'react-bootstrap/ListGroup'
import { listarCanciones, crearCancion, actualizarCancion, eliminarCancion, } from '../api/canciones'

const formularioVacio = {
  spotify_id: '',
  titulo: '',
  artista: '',
}

export default function CatalogoCanciones({ accessToken }) {
  const [canciones, setCanciones] = useState([])
  const [formulario, setFormulario] = useState(formularioVacio)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [errorCarga, setErrorCarga] = useState('')
  const [errorFormulario, setErrorFormulario] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [eliminandoId, setEliminandoId] = useState(null)

  const ocupado = guardando || eliminandoId !== null

  useEffect(() => {
    let activo = true

    async function cargar() {
      try {
        const datos = await listarCanciones(accessToken)

        if (activo) setCanciones(datos)
      } catch (err) {
        if (activo) {
          setErrorCarga(
            err.response?.status === 401
              ? 'Vuelve a iniciar sesión.'
              : 'No se pudo cargar el catálogo.',
          )
        }
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargar()

    return () => {
      activo = false
    }
  }, [accessToken])

  function cambiarCampo(evento) {
    const { name, value } = evento.target

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }))
  }


  function seleccionarCancion(cancion) {
    if (ocupado) return

    setEditandoId(cancion.id)

    setFormulario({
        spotify_id: cancion.spotify_id,
        titulo: cancion.titulo,
        artista: cancion.artista,
    })

    setErrorFormulario('')
    setMensaje('')
    }

    function cancelarEdicion() {
    if (ocupado) return

    setEditandoId(null)
    setFormulario(formularioVacio)
    setErrorFormulario('')
    setMensaje('')
    }

  async function manejarGuardar(evento) {
    evento.preventDefault()

    if (ocupado) return

    setGuardando(true)
    setErrorFormulario('')
    setMensaje('')

    try {
     if (editandoId !== null) {
        const actualizada = await actualizarCancion(
          accessToken,
          editandoId,
          formulario,
    )

        setCanciones((anteriores) =>
          anteriores.map((cancion) =>
            cancion.id === actualizada.id ? actualizada : cancion,
      ),
    )

    setMensaje('Canción actualizada.')
  } else {
    const nueva = await crearCancion(accessToken, formulario)

    setCanciones((anteriores) => [...anteriores, nueva])
    setMensaje('Canción agregada al catálogo.')
  }

  setEditandoId(null)
  setFormulario(formularioVacio)
} catch (err) {
      if (err.response?.status === 400) {
        const errores = Object.entries(err.response.data)
          .map(([campo, mensajes]) =>
            `${campo}: ${Array.isArray(mensajes) ? mensajes.join(' ') : mensajes}`,
          )
          .join(' ')

        setErrorFormulario(errores)
      } else if (err.response?.status === 401) {
        setErrorFormulario('Vuelve a iniciar sesión.')
      } else if (err.response?.status === 404) {
        setErrorFormulario('La canción ya no existe. Vuelve a abrir el catálogo.')
      } else {
        setErrorFormulario('No se pudo guardar. Comprueba la conexión con Django.')
      }
    } finally {
      setGuardando(false)
    }
  }

  async function manejarEliminar(cancion) {
      if (ocupado) return

      const confirmado = window.confirm(
        `¿Eliminar "${cancion.titulo}" del catálogo?`,
      )

      if (!confirmado) return

      setEliminandoId(cancion.id)
      setErrorFormulario('')
    setMensaje('')

      try {
        await eliminarCancion(accessToken, cancion.id)

        setCanciones((anteriores) =>
          anteriores.filter((actual) => actual.id !== cancion.id),
        )

        if (editandoId === cancion.id) {
          setEditandoId(null)
          setFormulario(formularioVacio)
        }

        setMensaje('Canción eliminada del catálogo.')
      } catch (err) {
        if (err.response?.status === 401) {
          setErrorFormulario('Vuelve a iniciar sesión.')
        } else if (err.response?.status === 404) {
          setErrorFormulario('La canción ya no existe. Vuelve a abrir el catálogo.')
        } else {
          setErrorFormulario('No se pudo eliminar. Comprueba la conexión con Django.')
        }
      } finally {
        setEliminandoId(null)
      }
    }


  return (
    <section>
      <h2>Catálogo</h2>

      <Form onSubmit={manejarGuardar} className="mb-4 text-start">
        <fieldset disabled={cargando || ocupado || Boolean(errorCarga)}>
        <legend className="h5">
          {editandoId !== null ? 'Editar canción' : 'Agregar canción'}
        </legend>
          <Form.Group className="mb-3" controlId="catalogo-spotify-id">
            <Form.Label>Identificador de Spotify</Form.Label>
            <Form.Control
              name="spotify_id"
              value={formulario.spotify_id}
              onChange={cambiarCampo}
              required
              minLength={22}
              maxLength={22}
              pattern="[a-zA-Z0-9]{22}"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="catalogo-titulo">
            <Form.Label>Título</Form.Label>
            <Form.Control
              name="titulo"
              value={formulario.titulo}
              onChange={cambiarCampo}
              required
              maxLength={100}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="catalogo-artista">
            <Form.Label>Artista</Form.Label>
            <Form.Control
              name="artista"
              value={formulario.artista}
              onChange={cambiarCampo}
              required
              maxLength={100}
            />
          </Form.Group>

        <div className="d-flex gap-2">
          <Button type="submit">
            {guardando
              ? 'Guardando...'
              : editandoId !== null
                ? 'Guardar cambios'
                : 'Agregar canción'}
          </Button>

          {editandoId !== null && (
            <Button
              type="button"
              variant="outline-secondary"
              onClick={cancelarEdicion}
            >
              Cancelar edición
            </Button>
            )}
        </div>
        </fieldset>
      </Form>

      {mensaje && <Alert variant="success">{mensaje}</Alert>}

      {errorFormulario && (
        <Alert variant="danger">{errorFormulario}</Alert>
      )}

      {cargando ? (
        <p>Cargando catálogo...</p>
      ) : errorCarga ? (
        <Alert variant="danger">{errorCarga}</Alert>
      ) : canciones.length === 0 ? (
        <p>No hay canciones en el catálogo.</p>
      ) : (
        <ListGroup>
          {canciones.map((cancion) => (
            <ListGroup.Item
            key={cancion.id}
            className="d-flex justify-content-between align-items-center flex-wrap gap-3"
            >
          <span>
            <strong>{cancion.titulo}</strong>
            {' — '}
            {cancion.artista}
          </span>

          <div className="d-flex gap-2">
            <Button
              type="button"
              variant="outline-primary"
              disabled={ocupado}
              onClick={() => seleccionarCancion(cancion)}
            >
              Editar
            </Button>

            <Button
              type="button"
              variant="outline-danger"
              disabled={ocupado}
              onClick={() => manejarEliminar(cancion)}
            >
              {eliminandoId === cancion.id ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </section>
  )
}