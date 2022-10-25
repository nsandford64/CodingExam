import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import counterReducer from "../features/counter/counterSlice"
import examReducer from "../slices/examSlice"

export const store = configureStore( {
	reducer: {
		counter: counterReducer,
		exam: examReducer
	},
	middleware( getDefaultMiddleware ) {
		return getDefaultMiddleware( {
			serializableCheck: false
		} )
	}
} )

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
