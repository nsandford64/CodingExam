import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"
import examReducer from "../slices/examSlice"
import gradingReducer from "../slices/gradingSlice"

export const store = configureStore( {
	reducer: {
		exam: examReducer,
		grading: gradingReducer
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
