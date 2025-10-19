import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  REQUEST_PASSWORD_RESET_SUCCESS,
  REQUEST_PASSWORD_RESET_FAILURE,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAILURE,
  CREATE_USER_SUCCESS,
  CREATE_USER_FAILURE,
  USER_DATA,
  FETCH_USER_FAILURE,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAILURE
} from '../actionTypes.js';
import apiService from '../../services/api_service.js';

// Login Action (Async)
export const login = (email, password) => {
  return async (dispatch) => {
    dispatch({ type: LOGIN_REQUEST });
    try {
      const response = await apiService.post('users/login', { email, password });

      const { access, user, refresh } = response.data;

      sessionStorage.setItem('_authToken', access);
      sessionStorage.setItem('_refreshToken', refresh);
      sessionStorage.setItem('_user', JSON.stringify(user));
      dispatch({
        type: LOGIN_SUCCESS,
        payload: { access, user }
      });
    } catch (error) {
      console.log("Login error:", error);
      console.log(error.response?.data);
      dispatch({
        type: LOGIN_FAILURE,
        payload: error.response?.data?.message || error.response?.data?.error || 'Login failed'
      });
    }
  };
};

export const requestResetPassword = (email) => {
  return async (dispatch) => {
    dispatch({ type: LOGIN_REQUEST });
    try {
      const response = await apiService.post('users/request_password_reset', { email });

      const { token, user } = response.data;

      sessionStorage.setItem('token', token);

      dispatch({
        type: REQUEST_PASSWORD_RESET_SUCCESS,
        payload: { token, user }
      });
    } catch (error) {
      console.log("Login error:", error);
      console.log(error.response?.data);
      dispatch({
        type: REQUEST_PASSWORD_RESET_FAILURE,
        payload: error.response?.data?.message || error.response?.data?.error || 'Login failed'
      });
    }
  };
};

export const resetPassword = (email, password) => {
  return async (dispatch) => {
    dispatch({ type: LOGIN_REQUEST });
    try {
      const response = await apiService.post('users/login', { email, password });

      const { token, user } = response.data;

      sessionStorage.setItem('token', token);

      dispatch({
        type: RESET_PASSWORD_SUCCESS,
        payload: { token, user }
      });
    } catch (error) {
      console.log("Login error:", error);
      console.log(error.response?.data);
      dispatch({
        type: RESET_PASSWORD_FAILURE,
        payload: error.response?.data?.message || error.response?.data?.error || 'Login failed'
      });
    }
  };
};

export const createUser = (username, email, firstName, lastName, phoneNumber, role, password, cb) => {
  return async (dispatch) => {
    dispatch({ type: LOGIN_REQUEST });

    try {
      const response = await apiService.post('users/user_create', { username, email, first_name: firstName, last_name: lastName, phoneNumber, role, password });

      dispatch({
        type: CREATE_USER_SUCCESS,
        payload: 'Account Created successfully'
      });
    } catch (error) {

      if(error.response?.status == 401){
        cb()
      }else if(error.response?.status == 403){
        dispatch({
          type: CREATE_USER_FAILURE,
          payload: 'You are not authorised to perform this action'
        });
      }else{
        dispatch({
          type: CREATE_USER_FAILURE,
          payload: error.response?.data?.detail || 'Failed to create user'
        });
      }
    }
  };
};

export const updateUser =( email, firstName, lastName, phoneNumber, role, password, cb) => {
  return async (dispatch) => {
    dispatch({ type: LOGIN_REQUEST });

    try {
      const response = await apiService.post('users/user_update', {email, first_name: firstName, last_name: lastName, role});

      dispatch({
        type: UPDATE_USER_SUCCESS,
        payload: 'Account Created successfully'
      });
    } catch (error) {

      if(error.response?.status == 401){
        cb()
      }else if(error.response?.status == 403){
        dispatch({
          type: UPDATE_USER_FAILURE,
          payload: 'You are not authorised to perform this action'
        });
      }else{
        dispatch({
          type: UPDATE_USER_FAILURE,
          payload: error.response?.data?.detail || 'Failed to create user'
        });
      }
    }
  };
};

export const getAllUsers = (startDate, endDate, page, perPage, cb) => {
  return async (dispatch) => {
    dispatch({ type: LOGIN_REQUEST });

    try {
      const response = await apiService.get('users/user_list');

      dispatch({
        type: USER_DATA,
        payload: response.data
      });
    } catch (error) {
      if(error.response?.status == 401){
        // cb()
        // refresh
      }else if(error.response?.status == 403){
        dispatch({
          type: FETCH_USER_FAILURE,
          payload: 'You are not authorised to perform this action'
        });
      }else{
        dispatch({
          type: FETCH_USER_FAILURE,
          payload: error.response?.data?.detail || 'Failed to create user'
        });
      }
    }
  };
};


// Logout Action
export const logout = (navigate) => {
  sessionStorage.removeItem('_authToken');
  sessionStorage.removeItem('_refreshToken');
  sessionStorage.removeItem('_user');
  navigate('/')
  return { type: LOGOUT };
};
