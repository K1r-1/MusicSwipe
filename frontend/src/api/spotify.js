import client from './client'

export async function obtenerUrlSpotify(accessToken) {
  const respuesta = await client.post(
    'spotify/conectar/',
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    },
  )

  return respuesta.data.url
}

export async function obtenerTokenSpotify(accessToken) {
  const respuesta = await client.post(
    'spotify/token/',
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    },
  )

  return respuesta.data
}

let esperarHasta = 0
let intentos429 = 0

export async function reproducirCancion(
  accessToken,
  deviceId,
  spotifyId,
) {
  if (Date.now() < esperarHasta) {
    const segundos = Math.ceil((esperarHasta - Date.now()) / 1000)
    throw new Error(`Espera ${segundos} segundos antes de reproducir.`)
  }

  if (!/^[a-zA-Z0-9]{22}$/.test(spotifyId ?? '')) {
    throw new Error('Esta canción no tiene un identificador real de Spotify.')
  }

  const datos = await obtenerTokenSpotify(accessToken)

  const url = new URL('https://api.spotify.com/v1/me/player/play')
  url.searchParams.set('device_id', deviceId)

  const respuesta = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${datos.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uris: [`spotify:track:${spotifyId}`],
      position_ms: 0,
    }),
  })

  if (respuesta.status === 204) {
    intentos429 = 0
    return
  }

  const datosError = await respuesta.json().catch(() => null)
  const detalle = datosError?.error?.message

  if (respuesta.status === 429) {
    intentos429 = Math.min(intentos429 + 1, 8)

    const cabecera = Number(respuesta.headers.get('Retry-After'))
    const esperaIndicada = Number.isFinite(cabecera) && cabecera > 0
      ? cabecera
      : 30

    const espera = Math.max(esperaIndicada, 2 ** intentos429)
    esperarHasta = Date.now() + espera * 1000

    throw new Error(`Spotify limitó las solicitudes. Espera ${espera} segundos.`)
  }

  if (respuesta.status === 401) {
    throw new Error('Spotify rechazó el token. Vuelve a conectar Spotify.')
  }

  if (respuesta.status === 403) {
    throw new Error(
      detalle ?? 'Spotify no permite reproducir esta canción con tu cuenta o permisos.',
    )
  }

  if (respuesta.status === 404) {
    throw new Error('El reproductor no está disponible. Prepáralo nuevamente.')
  }

  throw new Error(
    detalle ?? `No se pudo reproducir la canción (${respuesta.status}).`,
  )
}

export async function guardarEnSpotify(accessToken, spotifyId) {
  if (Date.now() < esperarHasta) {
    const segundos = Math.ceil((esperarHasta - Date.now()) / 1000)
    throw new Error(`Espera ${segundos} segundos antes de guardar.`)
  }

  if (!/^[a-zA-Z0-9]{22}$/.test(spotifyId ?? '')) {
    throw new Error('Esta canción no tiene un identificador real de Spotify.')
  }

  const datos = await obtenerTokenSpotify(accessToken)

  const url = new URL('https://api.spotify.com/v1/me/library')
  url.searchParams.set('uris', `spotify:track:${spotifyId}`)

  const respuesta = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${datos.access_token}`,
    },
  })

  if (respuesta.status === 200) {
    intentos429 = 0
    return
  }

  const datosError = await respuesta.json().catch(() => null)
  const detalle = datosError?.error?.message

  if (respuesta.status === 429) {
    intentos429 = Math.min(intentos429 + 1, 8)

    const cabecera = Number(respuesta.headers.get('Retry-After'))
    const esperaIndicada = Number.isFinite(cabecera) && cabecera > 0
      ? cabecera
      : 30

    const espera = Math.max(esperaIndicada, 2 ** intentos429)
    esperarHasta = Date.now() + espera * 1000

    throw new Error(`Spotify limitó las solicitudes. Espera ${espera} segundos.`)
  }

  if (respuesta.status === 401) {
    throw new Error('Spotify rechazó el token. Vuelve a conectar Spotify.')
  }

  if (respuesta.status === 403) {
    throw new Error(
      detalle ?? 'Spotify no permite guardar la canción. Revisa los permisos.',
    )
  }

  throw new Error(
    detalle ?? `No se pudo guardar la canción (${respuesta.status}).`,
  )
}