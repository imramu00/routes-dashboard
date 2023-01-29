import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import store from '../../store'
import { routesActions } from './routesAction'

const initialState = {
  total: 0,
  stops: [],
  routes: [],
  isLoading: true,
}

const routesSlice = createSlice({
  name: 'routes',
  initialState,
  reducers: {
    addRoute(state, action) {
      state.routes.push(action.payload)
      state.total += 1
    },
    deleteRoute(state, action) {
      state.routes.splice(
        state.routes.findIndex(route => route.key === action.payload.id),
        1
      )
      state.total -= 1
    },
    updateRoute(state, action) {
      state.routes.splice(
        state.routes.findIndex(route => route.key === action.payload.id),
        1
      )
      state.routes.push(action.payload)
    },
  },
})

export const { addRoute, deleteRoute, updateRoute } = routesSlice.actions
export default routesSlice.reducer
