import { configureStore } from '@reduxjs/toolkit';
import authReducer, { saveAuthState } from './authSlice';
import toastReducer from './toastSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    toast: toastReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
        ignoredActionPaths: [],
        ignoredPaths: ['auth.user'],
      },
    }).concat(saveAuthState),
});

export default store;
