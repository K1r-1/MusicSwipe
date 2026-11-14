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