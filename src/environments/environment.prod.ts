export const environment = {
  production: true,
  apiUrl: 'https://unable-vin-feeit-85900930.koyeb.app/api',
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
      start: '12:00',
      end: '22:00'
    }
  }
};
