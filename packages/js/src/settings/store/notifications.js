import { createSlice, nanoid } from "@reduxjs/toolkit";
import { get, omit } from "lodash";

const slice = createSlice( {
	name: "notifications",
	initialState: {},
	reducers: {
		addNotification: {
			reducer: ( state, { payload } ) => {
				state[ payload.id ] = {
					id: payload.id,
					variant: payload.variant,
					size: payload.size,
					title: payload.title,
					description: payload.description,
				};
			},
			prepare: ( { id, variant = "info", size = "default", title, description } ) => ( {
				payload: {
					id: id || nanoid(),
					variant,
					size,
					title,
					description,
				},
			} ),
		},
		removeNotification: ( state, { payload } ) => omit( state, payload ),
	},
} );

export const getInitialNotificationsState = slice.getInitialState;

export const notificationsSelectors = {
	selectNotifications: ( state ) => get( state, "notifications", {} ),
	selectNotification: ( state, id ) => get( state, `notifications.${ id }`, null ),
};

export const notificationsActions = slice.actions;

export default slice.reducer;
