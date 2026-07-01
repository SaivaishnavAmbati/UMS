import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import studentReducer from './slices/studentSlice';
import academicReducer from './slices/academicSlice';
import registrationReducer from './slices/registrationSlice';
import reportReducer from './slices/reportSlice';
import notificationReducer from './slices/notificationSlice';

const appReducer = combineReducers({
  auth: authReducer,
  student: studentReducer,
  academic: academicReducer,
  registration: registrationReducer,
  report: reportReducer,
  notification: notificationReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'auth/logout') {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export default store;
