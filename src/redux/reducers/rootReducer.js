import { combineReducers } from 'redux';
import authReducer from './authReducers.js';
import vehiclesReducer from './vehiclesReducers.js'

const rootReducer = combineReducers({
  auth: authReducer,
  vehicles: vehiclesReducer
});

export default rootReducer;
