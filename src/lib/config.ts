export const config = {
  googleMaps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    isConfigured: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  },
  mapbox: {
    accessToken: 'pk.eyJ1Ijoicm90YWxpemVvZmljaWFsIiwiYSI6ImNtaHdidmV2dTA1dTgya3B0dGNzZ2Q4ZHUifQ.1kJiJcybFKIyF_0rpNHmbA',
    isConfigured: true
  },
  defaultLocation: {
    // Belo Horizonte, MG
    latitude: -19.9167,
    longitude: -43.9345,
    zoom: 12
  }
}

export const getGeocodingService = () => {
  if (config.googleMaps.isConfigured) {
    return 'google'
  }
  return 'simulated'
}