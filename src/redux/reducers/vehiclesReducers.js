import {
  VEHICLES_REQUEST,
  CREATE_VEHICLES_SUCCESS,
  CREATE_VEHICLES_FAILURE,
  VEHICLE_DATA
} from '../actionTypes.js';

const initialState = {
  loading: null,
  success: null,
  error: null,
  message: '',
  data: [],
};

export default function vehiclesReducer(state = initialState, action) {
  switch (action.type) {
    case VEHICLES_REQUEST:
      return { ...state, loading: true, error: null };
    case VEHICLE_DATA:
        return {
        ...state,
        loading: false,
        success: null,
        data: action.payload
        }
    case CREATE_VEHICLES_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        error: null
      };
    case CREATE_VEHICLES_FAILURE:
    return {
        ...state,
        loading: false,
        success: null,
        message: action.payload
      };
    default:
      return state;
  }
}