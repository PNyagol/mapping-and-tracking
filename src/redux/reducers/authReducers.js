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
  USER_DATA
} from '../actionTypes.js';

const initialState = {
  loading: false,
  token: sessionStorage.getItem('_authToken') || null,
  user: null,
  error: null,
  isAuthenticated: !!sessionStorage.getItem('_authToken'),
  isSuccess: false,
  resetUID: null,
  resetToken: null,
  data: [],
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN_REQUEST:
      return { ...state, loading: true, error: null };

    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true
      };
    case REQUEST_PASSWORD_RESET_SUCCESS:
      return {
        ...state,
        loading: false,
        isSuccess: true,
        resetUID: action.payload.uid,
        resetToken: action.payload.token
      };
    case REQUEST_PASSWORD_RESET_FAILURE:
      return {
        ...state,
        loading: false,
        isSuccess: false,
        error: action.payload
      };
    case RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        isSuccess: true,
      };
    case RESET_PASSWORD_FAILURE:
      return {
        ...state,
        loading: false,
        isSuccess: false,
        error: action.payload
      };
    case CREATE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        isSuccess: true,
      };
    case CREATE_USER_FAILURE:
      return {
        ...state,
        loading: false,
        isSuccess: false,
        error: action.payload
      };
    case USER_DATA:
      return {
        ...state,
        loading: false,
        data: action.payload
      };
    case LOGIN_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case LOGOUT:
      return { ...state, token: null, user: null, loading: false, isAuthenticated: false };

    default:
      return state;
  }
}
