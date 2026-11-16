import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { iniciarSesion } from './api/auth';
import ListaCanciones from './components/ListaCanciones';
import ConectarSpotify from './components/ConectarSpotify';
import CatalogoCanciones from './components/CatalogoCanciones';


function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [tokens, setTokens] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [vista, setVista] = useState('descubrir')

  async function manejarLogin(evento) {
    evento.preventDefault()
    setError('')
    setCargando(true)

    try {
      const datos = await iniciarSesion(username, password)
      setTokens(datos)
      setPassword('')
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Usuario o contraseña incorrectos.')
      } else if (!err.response) {
        setError('Error al conectar con el servidor')
      } else {
        setError('No se pudo iniciar sesión')
      } 
    } finally {
        setCargando(false)
      }
    }

  function cerrarSesion() {
    setTokens(null)
    setUsername('')
    setPassword('')
    setVista('descubrir')
    setError('')
  }

  return (
    <main className="container py-4">
      <h1>MusicSwipe</h1>
      
      {tokens ? (
        <> 
          <Alert variant="success"> 
            Sesión iniciada correctamente.
          </Alert>
          
          <Button
            variant="secondary"
            onClick={cerrarSesion}
            className="mb-3">
            Cerrar sesión
          </Button>

          <div className="d-flex justify-content-center gap-2 mb-4">
          <Button
            type="button"
            variant={vista === 'descubrir' ? 'primary' : 'outline-primary'}
            onClick={() => setVista('descubrir')}
          >
            Descubrir
          </Button>

          <Button
            type="button"
            variant={vista === 'catalogo' ? 'primary' : 'outline-primary'}
            onClick={() => setVista('catalogo')}
          >
            Catálogo
          </Button>
          </div>

          {vista === 'descubrir' ? (
            <>
              <ConectarSpotify accessToken={tokens.access} />
              <ListaCanciones accessToken={tokens.access} />
            </>
          ) : (
            <CatalogoCanciones accessToken={tokens.access} />
          )}
        </>
          ) : (
            <Form onSubmit={manejarLogin}>
              <h2> Iniciar sesión</h2>

              <Form.Group className="mb-3" controlId="login-username">
                <Form.Label> Usuario</Form.Label>
                <Form.Control
                type="text"
                autoComplete="username"
                value={username}
                onChange={(evento) => setUsername(evento.target.value)}
                required
                disabled={cargando}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="login-password">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(evento) => setPassword(evento.target.value)}
                  required
                  disabled={cargando}
              />
              </Form.Group>

              {error && <Alert variant="danger">{error}</Alert>}

              <Button type="submit" disabled={cargando}>
                {cargando ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </Form>
          )}
    </main>
  )
}

export default App