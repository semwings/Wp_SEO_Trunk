/* eslint-disable global-require */
module.exports = {
	map: process.env.NODE_ENV === "production" ? false : {
		inline: false,
		annotation: true,
	},
	plugins: [
		require( "postcss-import" ),
		require( "tailwindcss/nesting" ),
		require( "tailwindcss" ),
		require( "autoprefixer" ),
		require( "postcss-rtlcss" )( {
			processKeyFrames: true,
			useCalc: true,
		} ),
		...( process.env.NODE_ENV === "production" ? [ require( "cssnano" ) ] : [] ),
	],
};
