import { configureStore } from '@reduxjs/toolkit'
import routesReducer from './features/Routes/routesSlice'
const store = configureStore({
  reducer: {
    routes: routesReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export default store
