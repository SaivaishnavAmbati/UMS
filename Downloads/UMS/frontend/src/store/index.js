import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import studentReducer from './slices/studentSlice';
import academicReducer from './slices/academicSlice';
import registrationReducer from './slices/registrationSlice';
import reportReducer from './slices/reportSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    student: studentReducer,
    academic: academicReducer,
    registration: registrationReducer,
    report: reportReducer,
    notification: notificationReducer,
  },
});

export default store;
