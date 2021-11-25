import { createSelector } from "@reduxjs/toolkit";
import { combineReducers } from "@wordpress/data";
import { editorSelectors } from "../../editor/slice";
import { formSelectors } from "../../form/slice";
import configReducer, { configActions, configSelectors, initialConfigState } from "./config";
import resultsReducer, { resultsActions, resultsSelectors, initialResultsState } from "./results";

export const initialAnalysisState = {
	config: initialConfigState,
	results: initialResultsState,
};

export const analysisSelectors = {
	...resultsSelectors,
	...configSelectors,
	selectPaper: createSelector(
		formSelectors.selectSeoTitle,
		formSelectors.selectMetaDescription,
		formSelectors.selectSlug,
		editorSelectors.selectContent,
		editorSelectors.selectPermalink,
		editorSelectors.selectDate,
		( seoTitle, metaDescription, slug, content, permalink, date ) => ( { seoTitle, metaDescription, slug, content, permalink, date } ),
	),
};

export const analysisActions = {
	...resultsActions,
	...configActions,
};

export default combineReducers( {
	config: configReducer,
	results: resultsReducer,
} );
