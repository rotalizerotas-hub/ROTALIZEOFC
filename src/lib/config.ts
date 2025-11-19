export const config = {
  googleMaps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    isConfigured: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
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