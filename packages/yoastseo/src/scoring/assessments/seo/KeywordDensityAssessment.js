import { __, _n, sprintf } from "@wordpress/i18n";
import { merge } from "lodash-es";

import recommendedKeyphraseCount from "../../helpers/assessments/recommendedKeywordCount.js";
import Assessment from "../assessment";
import AssessmentResult from "../../../values/AssessmentResult";
import { inRangeEndInclusive, inRangeStartEndInclusive, inRangeStartInclusive } from "../../helpers/assessments/inRange";
import { createAnchorOpeningTag } from "../../../helpers/shortlinker";
import keyphraseLengthFactor from "../../helpers/assessments/keyphraseLengthFactor.js";
import getAllWordsFromTree from "../../../languageProcessing/helpers/word/getAllWordsFromTree";

/**
 * Represents the assessment that will look if the keyphrase density is within the recommended range.
 */
class KeyphraseDensityAssessment extends Assessment {
	/**
	 * Sets the identifier and the config.
	 *
	 * @param {Object} [config] The configuration to use.
	 *
	 * If word forms are not available:
	 * @param {number} [config.parameters.noWordForms.overMaximum] The percentage of keyphrase instances in the text that
	 * is way over the maximum.
	 * @param {number} [config.parameters.noWordForms.maximum] The maximum percentage of keyphrase instances in the text.
	 * @param {number} [config.parameters.noWordForms.minimum] The minimum percentage of keyphrase instances in the text.
	 *
	 * If word forms are available:
	 * @param {number} [config.parameters.multipleWordForms.overMaximum] The percentage of keyphrase instances in the text that
	 * is way over the maximum.
	 * @param {number} [config.parameters.multipleWordForms.maximum] The maximum percentage of keyphrase instances in the text.
	 * @param {number} [config.parameters.multipleWordForms.minimum] The minimum percentage of keyphrase instances in the text.
	 *
	 * @param {number} [config.scores.wayOverMaximum] The score to return if there are way too many instances of keyphrase in the text.
	 * @param {number} [config.scores.overMaximum] The score to return if there are too many instances of keyphrase in the text.
	 * @param {number} [config.scores.correctDensity] The score to return if there is a good number of keyphrase instances in the text.
	 * @param {number} [config.scores.underMinimum] The score to return if there is not enough keyphrase instances in the text.
	 *
	 * @param {string} [config.url] The URL to the relevant KB article.
	 *
	 * @returns {void}
	 */
	constructor( config = {} ) {
		super();

		const defaultConfig = {
			parameters: {
				noWordForms: {
					overMaximum: 4,
					maximum: 3,
					minimum: 0.5,
				},
				multipleWordForms: {
					overMaximum: 4,
					maximum: 3.5,
					minimum: 0.5,
				},
			},
			scores: {
				wayOverMaximum: -50,
				overMaximum: -10,
				correctDensity: 9,
				underMinimum: 4,
			},
			urlTitle: createAnchorOpeningTag( "https://yoa.st/33v" ),
			urlCallToAction: createAnchorOpeningTag( "https://yoa.st/33w" ),
			applicableIfTextLongerThan: 100,
		};

		this.identifier = "keyphraseDensity";
		this._config = merge( defaultConfig, config );
	}


	/**
	 * Determines correct boundaries depending on the availability of morphological forms.
	 *
	 * @param {Paper} paper The paper to analyze.
	 * @param {number} keyphraseLength The length of the keyphrase in words.
	 * @param {function} customGetWords A helper to get words from the text for languages that don't use the default approach.
	 *
	 * @returns {void}
	 */
	setBoundaries( paper, keyphraseLength, customGetWords ) {
		if ( this._hasMorphologicalForms ) {
			this._boundaries = this._config.parameters.multipleWordForms;
		} else {
			this._boundaries = this._config.parameters.noWordForms;
		}
		this._minRecommendedKeyphraseCount = recommendedKeyphraseCount( paper, keyphraseLength, this._boundaries.minimum, "min", customGetWords );
		this._maxRecommendedKeyphraseCount = recommendedKeyphraseCount( paper, keyphraseLength, this._boundaries.maximum, "max", customGetWords );
	}

	/**
	 * Runs the keyphrase density module, based on this returns an assessment
	 * result with score.
	 *
	 * @param {Paper} paper The paper to use for the assessment.
	 * @param {Researcher} researcher The researcher used for calling the research.
	 *
	 * @returns {AssessmentResult} The result of the assessment.
	 */
	getResult( paper, researcher ) {
		const customGetWords = researcher.getHelper( "getWordsCustomHelper" );
		this._keyphraseCount = researcher.getResearch( "getKeyphraseCount" );
		const keyphraseLength = this._keyphraseCount.keyphraseLength;

		const assessmentResult = new AssessmentResult();

		this._keyphraseDensity = researcher.getResearch( "getKeyphraseDensity" );

		this._hasMorphologicalForms = researcher.getData( "morphology" ) !== false;

		this.setBoundaries( paper, keyphraseLength, customGetWords );

		this._keyphraseDensity = this._keyphraseDensity * keyphraseLengthFactor( keyphraseLength );
		const calculatedScore = this.calculateResult();

		assessmentResult.setScore( calculatedScore.score );
		assessmentResult.setText( calculatedScore.resultText );
		assessmentResult.setHasMarks( this._keyphraseCount.count > 0 );

		return assessmentResult;
	}

	/**
	 * Checks whether there are no keyphrase matches in the text.
	 *
	 * @returns {boolean} Returns true if the keyphrase count is 0.
	 */
	hasNoMatches() {
		return this._keyphraseCount.count === 0;
	}

	/**
	 * Checks whether there are too few keyphrase matches in the text.
	 *
	 * @returns {boolean} Returns true if the rounded keyphrase density is between 0 and the recommended minimum
	 * or if there is only 1 keyphrase match (regardless of the density).
	 */
	hasTooFewMatches() {
		return inRangeStartInclusive(
			this._keyphraseDensity,
			0,
			this._boundaries.minimum
		) || this._keyphraseCount.count === 1;
	}

	/**
	 * Checks whether there is a good number of keyphrase matches in the text.
	 *
	 * @returns {boolean} Returns true if the rounded keyphrase density is between the recommended minimum
	 * and the recommended maximum or if the keyphrase count is 2 and the recommended minimum is lower than 2.
	 */
	hasGoodNumberOfMatches() {
		return inRangeStartEndInclusive(
			this._keyphraseDensity,
			this._boundaries.minimum,
			this._boundaries.maximum
		) || ( this._keyphraseCount.count === 2 && this._minRecommendedKeyphraseCount <= 2 );
	}

	/**
	 * Checks whether the number of keyphrase matches in the text is between the
	 * recommended maximum and the specified overMaximum value.
	 *
	 * @returns {boolean} Returns true if the rounded keyphrase density is between
	 *                    the recommended maximum and the specified overMaximum
	 *                    value.
	 */
	hasTooManyMatches() {
		return inRangeEndInclusive(
			this._keyphraseDensity,
			this._boundaries.maximum,
			this._boundaries.overMaximum
		);
	}

	/**
	 * Returns the score for the keyphrase density.
	 *
	 * @returns {Object} The object with calculated score and resultText.
	 */
	calculateResult() {
		if ( this.hasNoMatches() ) {
			return {
				score: this._config.scores.underMinimum,
				resultText: sprintf(
					/* Translators:
					%1$s and %4$s expand to links to Yoast.com,
					%2$s expands to the anchor end tag,
					%3$d expands to the recommended minimal number of times the keyphrase should occur in the text. */
					__(
						// eslint-disable-next-line max-len
						"%1$sKeyphrase density%2$s: The keyphrase was found 0 times. That's less than the recommended minimum of %3$d times for a text of this length. %4$sFocus on your keyphrase%2$s!",
						"wordpress-seo"
					),
					this._config.urlTitle,
					"</a>",
					this._minRecommendedKeyphraseCount,
					this._config.urlCallToAction
				),
			};
		}

		if ( this.hasTooFewMatches() ) {
			return {
				score: this._config.scores.underMinimum,
				resultText: sprintf(
					/* Translators:
					%1$s and %4$s expand to links to Yoast.com,
					%2$s expands to the anchor end tag,
					%3$d expands to the recommended minimal number of times the keyphrase should occur in the text,
					%5$d expands to the number of times the keyphrase occurred in the text. */
					_n(
						// eslint-disable-next-line max-len
						"%1$sKeyphrase density%2$s: The keyphrase was found %5$d time. That's less than the recommended minimum of %3$d times for a text of this length. %4$sFocus on your keyphrase%2$s!",
						// eslint-disable-next-line max-len
						"%1$sKeyphrase density%2$s: The keyphrase was found %5$d times. That's less than the recommended minimum of %3$d times for a text of this length. %4$sFocus on your keyphrase%2$s!",
						this._keyphraseCount.count,
						"wordpress-seo"
					),
					this._config.urlTitle,
					"</a>",
					this._minRecommendedKeyphraseCount,
					this._config.urlCallToAction,
					this._keyphraseCount.count
				),
			};
		}

		if ( this.hasGoodNumberOfMatches()  ) {
			return {
				score: this._config.scores.correctDensity,
				resultText: sprintf(
					/* Translators:
					%1$s expands to a link to Yoast.com,
					%2$s expands to the anchor end tag,
					%3$d expands to the number of times the keyphrase occurred in the text. */
					_n(
						"%1$sKeyphrase density%2$s: The keyphrase was found %3$d time. This is great!",
						"%1$sKeyphrase density%2$s: The keyphrase was found %3$d times. This is great!",
						this._keyphraseCount.count,
						"wordpress-seo"
					),
					this._config.urlTitle,
					"</a>",
					this._keyphraseCount.count
				),
			};
		}

		if ( this.hasTooManyMatches() ) {
			return {
				score: this._config.scores.overMaximum,
				resultText: sprintf(
					/* Translators:
					%1$s and %4$s expand to links to Yoast.com,
					%2$s expands to the anchor end tag,
					%3$d expands to the recommended maximal number of times the keyphrase should occur in the text,
					%5$d expands to the number of times the keyphrase occurred in the text. */
					_n(
						// eslint-disable-next-line max-len
						"%1$sKeyphrase density%2$s: The keyphrase was found %5$d time. That's more than the recommended maximum of %3$d times for a text of this length. %4$sDon't overoptimize%2$s!",
						// eslint-disable-next-line max-len
						"%1$sKeyphrase density%2$s: The keyphrase was found %5$d times. That's more than the recommended maximum of %3$d times for a text of this length. %4$sDon't overoptimize%2$s!",
						this._keyphraseCount.count,
						"wordpress-seo"
					),
					this._config.urlTitle,
					"</a>",
					this._maxRecommendedKeyphraseCount,
					this._config.urlCallToAction,
					this._keyphraseCount.count
				),
			};
		}

		// Implicitly returns this if the rounded keyphrase density is higher than overMaximum.
		return {
			score: this._config.scores.wayOverMaximum,
			resultText: sprintf(
				/* Translators:
				%1$s and %4$s expand to links to Yoast.com,
				%2$s expands to the anchor end tag,
				%3$d expands to the recommended maximal number of times the keyphrase should occur in the text,
				%5$d expands to the number of times the keyphrase occurred in the text. */
				_n(
					// eslint-disable-next-line max-len
					"%1$sKeyphrase density%2$s: The keyphrase was found %5$d time. That's way more than the recommended maximum of %3$d times for a text of this length. %4$sDon't overoptimize%2$s!",
					// eslint-disable-next-line max-len
					"%1$sKeyphrase density%2$s: The keyphrase was found %5$d times. That's way more than the recommended maximum of %3$d times for a text of this length. %4$sDon't overoptimize%2$s!",
					this._keyphraseCount.count,
					"wordpress-seo"
				),
				this._config.urlTitle,
				"</a>",
				this._maxRecommendedKeyphraseCount,
				this._config.urlCallToAction,
				this._keyphraseCount.count
			),
		};
	}


	/**
	 * Marks the occurrences of keyphrase in the text for the keyphrase density assessment.
	 *
	 * @returns {Array<Mark>} Marks that should be applied.
	 */
	getMarks() {
		return this._keyphraseCount.markings;
	}


	/**
	 * Checks whether the paper has a text of the minimum required length and a keyphrase is set. Language-specific length requirements and methods
	 * of counting text length may apply (e.g. for Japanese, the text should be counted in characters instead of words, which also makes the minimum
	 * required length higher).
	 *
	 * @param {Paper} 		paper 		The paper to use for the assessment.
	 * @param {Researcher}  researcher  The paper to use for the assessment.
	 *
	 * @returns {boolean} True if applicable.
	 */
	isApplicable( paper, researcher ) {
		const customCountLength = researcher.getHelper( "customCountLength" );
		const customApplicabilityConfig = researcher.getConfig( "assessmentApplicability" ).keyphraseDensity;
		if ( customApplicabilityConfig ) {
			this._config.applicableIfTextLongerThan = customApplicabilityConfig;
		}

		const textLength = customCountLength ? customCountLength( paper.getText() ) : getAllWordsFromTree( paper ).length;

		return paper.hasText() && paper.hasKeyword() && textLength >= this._config.applicableIfTextLongerThan;
	}
}

/**
 * This assessment checks if the keyphrase density is within the recommended range.
 * KeywordDensityAssessment was the previous name for KeyphraseDensityAssessment (hence the name of this file).
 * We keep (and expose) this assessment for backwards compatibility.
 *
 * @deprecated Since version 20.12 Use KeyphraseDensityAssessment instead.
 */
class KeywordDensityAssessment extends KeyphraseDensityAssessment {
	/**
	 * Sets the identifier and the config.
	 *
	 * @param {Object} config   The configuration to use.
	 * @returns {void}
	 */
	constructor( config = {} ) {
		super( config );
		this.identifier = "keywordDensity";
		console.warn( "This object is deprecated, use KeyphraseDensityAssessment instead." );
	}
}

export {
	KeyphraseDensityAssessment,
	KeywordDensityAssessment,
};

export default KeyphraseDensityAssessment;
