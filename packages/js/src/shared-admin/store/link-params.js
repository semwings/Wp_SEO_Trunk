import { createSelector, createSlice } from "@reduxjs/toolkit";
import { addQueryArgs } from "@wordpress/url";
import { get } from "lodash";

export const LINK_PARAMS_NAME = "linkParams";

const slice = createSlice( {
	name: LINK_PARAMS_NAME,
	initialState: {},
	reducers: {},
} );

export const getInitialLinkParamsState = slice.getInitialState;

export const linkParamsSelectors = {
	selectLinkParam: ( state, linkParam, defaultValue = {} ) => get( state, `${ LINK_PARAMS_NAME }.${ linkParam }`, defaultValue ),
	selectLinkParams: state => get( state, LINK_PARAMS_NAME, {} ),
};
linkParamsSelectors.selectLink = createSelector(
	[
		linkParamsSelectors.selectLinkParams,
		( state, url ) => url,
	],
	( linkParams, link ) => addQueryArgs( link, linkParams )
);

export const linkParamsActions = slice.actions;

export const linkParamsReducer = slice.reducer;
