export const environment = {
  production: false,
  debug: true,
  apiUrl: '/api', // This will be proxied to remote.hopeagedcare.com.au:8000/api
  accountsUrl: '/accounts', // This will be proxied to remote.hopeagedcare.com.au:8000/accounts
  csrfCookieName: 'csrftoken',
  sessionCookieName: 'sessionid',
  enableLogRequests: true,
  enableMocks: false
};

