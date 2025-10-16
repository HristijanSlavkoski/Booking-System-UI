export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/escape',
  apiTimeout: 30000,
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'mk'],
  currency: 'MKD',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm',
  useBackendConfig: true,
  localConfig: {
    maxConcurrentBookings: 2,
    bookingSlotDuration: 60,
    minBookingNotice: 60,
    maxBookingAdvance: 90,
    businessHours: {
      start: '09:00',
      end: '22:00'
    }
  }
};
