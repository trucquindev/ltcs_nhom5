import { configureStore } from '@reduxjs/toolkit';

import { userReducer } from './user/userSlice';
import storage from 'redux-persist/lib/storage'; //default là storage
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import { activeCardReducer } from './activeCard/activeCardSlice';
import { notificationsReducer } from './notifications/notificationsSlice';
import { workspaceReducer } from './workspace/workspaceSlice';
// CẤU HÌNH REDUX PERSIST
//https://edvins.io/how-to-use-redux-persist-with-redux-toolkit

const persistConfig = {
  key: 'root', // key cua cai persist do chung ta chi dinh, default la root
  storage: storage, // bien strorage o tren - luu vao localstorage
  whitelist: ['user'], // dinh nghia cac slice du lieu duoc phep duy tri qua moi lan f5 trinh duyet
  // blacklist: ['user'], // dinh nghia cac slice du lieu khong duoc phep duy tri qua moi lan f5 trinh duyet
};
// combine cac reducers trong du an o day
const reducers = combineReducers({

  user: userReducer,
  activeCard: activeCardReducer,
  notifications: notificationsReducer,
  workspace: workspaceReducer,
});

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
