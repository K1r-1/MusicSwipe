let promesaSdk

export function cargarSpotifySdk() {
  if (window.Spotify) {
    return Promise.resolve(window.Spotify)
  }

  if (!promesaSdk) {
    promesaSdk = new Promise((resolve, reject) => {
      const script = document.createElement('script')

      const temporizador = window.setTimeout(() => {
        script.remove()
        promesaSdk = undefined
        reject(new Error('Spotify tardó demasiado en cargar el reproductor.'))
      }, 20000)

      window.onSpotifyWebPlaybackSDKReady = () => {
        window.clearTimeout(temporizador)
        resolve(window.Spotify)
      }

      script.src = 'https://sdk.scdn.co/spotify-player.js'
      script.async = true

      script.onerror = () => {
        window.clearTimeout(temporizador)
        script.remove()
        promesaSdk = undefined
        reject(new Error('No se pudo descargar el reproductor de Spotify.'))
      }

      document.body.appendChild(script)
    })
  }

  return promesaSdk
}