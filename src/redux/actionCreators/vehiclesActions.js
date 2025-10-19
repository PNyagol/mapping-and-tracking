import {
  VEHICLES_REQUEST,
  CREATE_VEHICLES_SUCCESS,
  CREATE_VEHICLES_FAILURE,
  VEHICLE_DATA
} from '../actionTypes.js';
import apiService from '../../services/api_service.js';

export const createVehicle = (payload) => {
  return async (dispatch) => {
    dispatch({ type: VEHICLES_REQUEST });

    try {
      const response = await apiService.post('vehicles/create', payload);

      dispatch({
        type: CREATE_VEHICLES_SUCCESS
      });
    } catch (error) {
      if(error.response?.status == 401){
        // cb()
        // refresh
      }else if(error.response?.status == 403){
        dispatch({
          type: CREATE_VEHICLES_FAILURE,
          payload: 'You are not authorised to perform this action'
        });
      }else{
        dispatch({
          type: CREATE_VEHICLES_FAILURE,
          payload: error.response?.data?.detail || 'Failed to create user'
        });
      }
    }
  };
};

export const updateVehicle = (payload, vehicle_id) => {
      return async (dispatch) => {
    dispatch({ type: VEHICLES_REQUEST });

    try {
      const response = await apiService.put(`vehicles/update/${vehicle_id}`, payload);

      dispatch({
        type: CREATE_VEHICLES_SUCCESS
      });
    } catch (error) {
      if(error.response?.status == 401){
        // cb()
        // refresh
      }else if(error.response?.status == 403){
        dispatch({
          type: CREATE_VEHICLES_FAILURE,
          payload: 'You are not authorised to perform this action'
        });
      }else{
        dispatch({
          type: CREATE_VEHICLES_FAILURE,
          payload: error.response?.data?.detail || 'Failed to update vehicle'
        });
      }
    }
  };
}

export const fetchVehicle = () => {
  return async (dispatch) => {
    dispatch({ type: VEHICLES_REQUEST });

    try {
      const response = await apiService.get('vehicles/list');
      dispatch({
        type: VEHICLE_DATA,
        payload: response.data
      });
    } catch (error) {
      if(error.response?.status == 401){
        // cb()
        // refresh
      }else if(error.response?.status == 403){
        dispatch({
          type: CREATE_VEHICLES_FAILURE,
          payload: 'You are not authorised to perform this action'
        });
      }else{
        dispatch({
          type: CREATE_VEHICLES_FAILURE,
          payload: error.response?.data?.detail || 'Failed to create user'
        });
      }
    }
  };
};