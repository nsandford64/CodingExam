import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import examReducer from "../slices/examSlice"

export const store = configureStore( {
	reducer: {
		exam: examReducer
	},
	middleware( getDefaultMiddleware ) {
		return getDefaultMiddleware( {
			serializableCheck: false
		} )
	}
} )

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
