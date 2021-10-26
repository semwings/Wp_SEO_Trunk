import { ASYNC_STATUS } from "./constants";

// Proposed state:
export const state = {
	data: {
		// Do we need to send locale here?
		seoTitle: "Title",
		metaDescription: "",
		date: "",
		permalink: "",
		slug: "",
		content: "",
		// Editor data we could use, for example in replacevars or for fallbacks.
		title: "",
		excerpt: "",
		featuredImage: {},
		// Fallbacks? Make a solution similar to replacevars.
	},
	targets: {
		keyphrases: {
			focus: "focus",
			rej2oirj: "a keyphrase", // nanoid as key?
		},
		synonyms: {
			focus: "",
			rej2oirj: "a synonym",
		},
	},
	config: {
		// Do we need other config here?
		analysisType: "post",
		isSeoActive: true,
		isReadabilityActive: true,
		researches: [ "morphology" ],
	},
	results: {
		status: ASYNC_STATUS.IDLE,
		error: "",
		seo: {
			focus: {},
			rej2oirj: {},
		},
		readability: {},
		research: {
			morphology: {},
		},
	},
};
