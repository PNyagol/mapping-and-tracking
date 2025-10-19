import axios from 'axios';

const token = sessionStorage.getItem('_authToken');

const apiService = axios.create({
  baseURL: 'http://127.0.0.1:8000/',
  headers: {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
});

apiService.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('_authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiService.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If 401 Unauthorized and we haven't retried yet
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = sessionStorage.getItem('_refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
            refresh: refreshToken
          });
          console.log("***********************************ACCESS")
          console.log(res.data)
          console.log("***********************************ACCESS")
          sessionStorage.setItem('_authToken', res.data.access);

          // Update Authorization header & retry original request
          originalRequest.headers['Authorization'] = `Bearer ${res.data.access}`;
          return apiService(originalRequest);
        } catch (refreshError) {
          console.error('Refresh token expired or invalid', refreshError);
          // Optionally redirect to login
        }
      }
    }

    return Promise.reject(error);
  }
);


export default apiService;
