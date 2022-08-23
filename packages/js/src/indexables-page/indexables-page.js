/* global wpseoIndexablesPageData */
import PropTypes from "prop-types";
import apiFetch from "@wordpress/api-fetch";
import { LinkIcon, RefreshIcon } from "@heroicons/react/outline";
import { __, _n, sprintf } from "@wordpress/i18n";
import { useEffect, useState, useCallback, useMemo, Fragment } from "@wordpress/element";
import { Button, Modal, useMediaQuery, Alert } from "@yoast/ui-library";
import { makeOutboundLink } from "@yoast/helpers";
import { addLinkToString } from "../helpers/stringHelpers";
import SuggestedLinksModal from "./components/suggested-links-modal";
import IndexableTitleLink from "./components/indexable-title-link";
import IndexablesPageCard from "./components/indexables-card";
import IndexablesTable from "./components/indexables-table";
import { SEOScoreThresholds, readabilityScoreThresholds, seoScoreAssessment, readabilityScoreAssessment, mostLinkedAssessment } from "./assessment-functions";

const Link = makeOutboundLink();

/**
 * A score representation.
 *
 * @param {string} colorClass The color of the bullet.
 *
 * @returns {WPElement} A div with a styled score representation.
 */
export function IndexableScore( { colorClass } ) {
	return <div className="yst-flex yst-items-center">
		<span className={ "yst-rounded-full yst-w-3 yst-h-3 " + colorClass } />
	</div>;
}

IndexableScore.propTypes = {
	colorClass: PropTypes.string.isRequired,
};


/**
 * A link count representation.
 *
 * @param {int} count The number of links.
 *
 * @returns {WPElement} A div with a styled link count representation.
 */
export function IndexableLinkCount( { count } ) {
	return 	<div className="yst-min-w-[36px] yst-shrink-0 yst-flex yst-items-center yst-gap-1.5">
		<LinkIcon className="yst-h-4 yst-w-4 yst-text-gray-400" />
		{ count }
	</div>;
}

IndexableLinkCount.propTypes = {
	count: PropTypes.number.isRequired,
};

const leastLinkedIntro = addLinkToString(
	// translators: %1$s and %2$s are replaced by opening and closing anchor tags.
	sprintf(
		__(
			"If you want to prevent your content from being orphaned, you need to make sure to link to that content. " +
			"Linking to it from other places on your site will help Google and your audience reach it. " +
			"%1$sLearn more about orphaned content%2$s.",
			"wordpress-seo"
		),
		"<a>",
		"</a>"
	),
	"https://www.yoast.com"
);

const leastLinkedOutro = addLinkToString(
	// translators: %1$s and %2$s are replaced by opening and closing anchor tags.
	sprintf( __( "Find and fix any orphaned content on your site by using this %1$sstep-by-step workout%2$s!", "wordpress-seo" ),
		"<a>",
		"</a>" ),
	"https://www.yoast.com"
);

const mostLinkedIntro = addLinkToString(
	// translators: %1$s and %2$s are replaced by opening and closing anchor tags.
	sprintf(
		__(
			"The content below is supposed to be your cornerstone content: the most important and extensive articles on your site. " +
			"Make sure to mark this content as cornerstone content to get all bullets green. " +
			"%1$sLearn more about cornerstone content%2$s.",
			"wordpress-seo"
		),
		"<a>",
		"</a>"
	),
	"https://www.yoast.com"
);

const mostLinkedOutro = addLinkToString(
	// translators: %1$s and %2$s are replaced by opening and closing anchor tags.
	sprintf( __( "Improve rankings for all your cornerstones by using this %1$sstep-by-step workout%2$s!", "wordpress-seo" ),
		"<a>",
		"</a>" ),
	"https://www.yoast.com"
);

/* eslint-disable camelcase */
/* eslint-disable no-warning-comments */
/* eslint-disable complexity */
/* eslint-disable max-statements */

/**
 * Renders the four indexable tables.
 *
 * @returns {WPElement} A div containing the main indexables page.
 */
function IndexablesPage( { setupInfo } ) {
	const listSize = parseInt( wpseoIndexablesPageData.listSize, 10 );
	const minimumIndexablesInBuffer = listSize * 2;
	const isPremiumInstalled = Boolean( wpseoIndexablesPageData.isPremium );
	const isLinkSuggestionsEnabled = Boolean( wpseoIndexablesPageData.isLinkSuggestionsEnabled );
	const [ loadedCards, setLoadedCards ] = useState( [] );
	const [ refreshInterval, setRefreshInterval ] = useState( null );

	const [ isSomethingGreenReadability, setIsSomethingGreenReadability ] = useState( false );
	const [ isSomethingGreenSEO, setIsSomethingGreenSEO ] = useState( false );

	const isSingleColumn = ! useMediaQuery( "(min-width: 1536px)" ).matches;

	const [ lastRefreshTime, setLastRefreshTime ] = useState( 0 );

	const [ indexablesLists, setIndexablesLists ] = useState(
		{
			least_readability: [],
			least_seo_score: [],
			most_linked: [],
			least_linked: [],
		}
	);

	const [ indexablesListsFetchLength, setIndexablesListsFetchLength ] = useState(
		{
			least_readability: null,
			least_seo_score: null,
			most_linked: null,
			least_linked: null,
		}
	);

	const listFeatureLookup = useMemo( () => ( {
		least_seo_score: setupInfo.enabledFeatures.isSeoScoreEnabled,
		least_readability: setupInfo.enabledFeatures.isReadabilityEnabled,
		least_linked: setupInfo.enabledFeatures.isLinkCountEnabled,
		most_linked: setupInfo.enabledFeatures.isLinkCountEnabled,
	} ), [ setupInfo ] );

	const isListFeatureEnabled = useCallback( ( listName ) => {
		return listFeatureLookup[ listName ];
	}, [ listFeatureLookup ] );

	const isListLoaded = useCallback( ( listName ) => {
		return loadedCards.includes( listName );
	}, [ loadedCards ] );

	const isListEmpty = useCallback( ( listName ) => {
		return indexablesLists[ listName ].length === 0;
	}, [ indexablesLists ] );

	const [ ignoredIndexable, setIgnoredIndexable ] = useState( null );
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ suggestedLinksModalData, setSuggestedLinksModalData ] = useState( null );

	const shouldShowDisabledAlert = useCallback( listName => {
		// If the list's feature is disabled.
		return ! isListFeatureEnabled( listName );
	}, [ isListFeatureEnabled ] );

	const shouldShowLoading = useCallback( listName => {
		// If no fetch has been completed, and the feature for the list is enabled.
		return isListFeatureEnabled( listName ) && ! isListLoaded( listName );
	}, [ isListLoaded, isListFeatureEnabled ] );


	const shouldShowTable = useCallback( listName => {
		// If a fetch has been completed, the feature for the list is enabled, and the list is not empty.
		return isListFeatureEnabled( listName ) && isListLoaded( listName ) && ! isListEmpty( listName );
	}, [ isListFeatureEnabled, isListLoaded, isListEmpty ] );


	const shouldShowEmptyAlert = useCallback( listName => {
		// If a fetch has been completed, the feature for the list is enabled, but the list is empty.
		return isListFeatureEnabled( listName ) && isListLoaded( listName ) && isListEmpty( listName );
	}, [ isListFeatureEnabled, isListLoaded, isListEmpty ] );

	/**
	 * Fetches a list of indexables.
	 *
	 * @param {string} listName           The name of the list to fetch.
	 * @param {boolean} isAdditionalFetch Whether or not this is not the first fetch.
	 *
	 * @returns {boolean} True if the request was successful.
	 */
	const fetchList = async( listName, isAdditionalFetch = false ) => {
		try {
			if ( isAdditionalFetch ) {
				setLoadedCards( prevState => [ ...prevState ].filter( loadedCard => loadedCard !== listName ) );
			}

			const response = await apiFetch( {
				path: `yoast/v1/${ listName }`,
				method: "GET",
			} );

			const parsedResponse = await response.json;

			let nonGreenIndexables = [];
			if ( parsedResponse.list.length > 0 ) {
				nonGreenIndexables = parsedResponse.list.filter( ( indexable ) => {
					if ( listName === "least_readability" ) {
						return parseInt( indexable.readability_score, 10 ) <= readabilityScoreThresholds.good;
					}
					if ( listName === "least_seo_score" ) {
						return parseInt( indexable.primary_focus_keyword_score, 10 ) <= SEOScoreThresholds.good;
					}

					return true;
				} );

				if ( nonGreenIndexables.length !== parsedResponse.list.length ) {
					if ( listName === "least_readability" ) {
						setIsSomethingGreenReadability( true );
					} else if ( listName === "least_seo_score" ) {
						setIsSomethingGreenSEO( true );
					}
				}
			}

			setIndexablesLists( prevState => {
				return {
					...prevState,
					[ listName ]: nonGreenIndexables,
				};
			} );

			setIndexablesListsFetchLength( prevState => {
				return {
					...prevState,
					[ listName ]: nonGreenIndexables.length,
				};
			} );

			setLoadedCards( prevState => [ ...prevState, listName ] );
			return true;
		} catch ( e ) {
			// URL() constructor throws a TypeError exception if url is malformed.
			console.error( e.message );
			return false;
		}
	};

	/**
	 * Updates a list in case an indexable has been ignored.
	 *
	 * @param {string} listName The name of the list to fetch.
	 *
	 * @returns {void}
	 */
	const maybeRemoveIgnored = ( listName ) => {
		if ( ignoredIndexable === null ) {
			return;
		}

		setIndexablesLists( prevState => {
			return {
				...prevState,
				[ listName ]: prevState[ listName ].filter( indexable => {
					return indexable.id !== ignoredIndexable.indexable.id;
				} ),
			};
		} );
	};

	/**
	 * Updates the content of a list of indexables.
	 *
	 * @param {string}  listName       The name of the list to fetch.
	 * @param {array}   indexablesList The current content of the list.
	 * @param {boolean} isRefresh      Whether it's a refresh.
	 *
	 * @returns {boolean} True if the update was successful.
	 */
	const updateList = ( listName, indexablesList, isRefresh ) => {
		if ( indexablesList.length === 0 || isRefresh ) {
			return fetchList( listName );
		}

		return ( indexablesList.length < minimumIndexablesInBuffer  && indexablesListsFetchLength[ listName ] >= minimumIndexablesInBuffer )
			? fetchList( listName, true )
			: maybeRemoveIgnored( listName );
	};

	/**
	 * Updates all lists.
	 *
	 * @param {boolean} isRefresh Whether it's a refresh.
	 *
	 * @returns {void}
	 */
	const updateLists = ( isRefresh ) => {
		if ( setupInfo ) {
			if ( setupInfo.enabledFeatures.isReadabilityEnabled ) {
				updateList( "least_readability", indexablesLists.least_readability, isRefresh );
			} else {
				setLoadedCards( prevState => [ ...prevState, "least_readability" ] );
			}

			if ( setupInfo.enabledFeatures.isSeoScoreEnabled ) {
				updateList( "least_seo_score", indexablesLists.least_seo_score, isRefresh );
			} else {
				setLoadedCards( prevState => [ ...prevState, "least_seo_score" ] );
			}

			if ( setupInfo.enabledFeatures.isLinkCountEnabled ) {
				updateList( "most_linked", indexablesLists.most_linked, isRefresh );
				updateList( "least_linked", indexablesLists.least_linked, isRefresh );
			} else {
				setLoadedCards( prevState => [ ...prevState, "most_linked", "least_linked" ] );
			}

			if ( refreshInterval ) {
				clearInterval( refreshInterval );
			}

			setLastRefreshTime( 0 );
			const interval = setInterval( () => {
				setLastRefreshTime( ( prevCounter ) => prevCounter + 1 );
			}, 60000 );
			setRefreshInterval( interval );
		}
	};

	const handleRefreshLists = useCallback( () => {
		setLoadedCards( [] );

		updateLists( true );
	}, [ setLoadedCards, updateLists ] );

	useEffect( () => {
		updateLists( false );
	}, [] );

	// We update a list each time the content of ignoredIndexable changes
	useEffect( async() => {
		if ( ignoredIndexable !== null ) {
			return updateList( ignoredIndexable.type, indexablesLists[ ignoredIndexable.type ] );
		}
	}, [ ignoredIndexable ] );

	/**
	 * Handles the rendering of the links modal.
	 *
	 * @param {int}    indexableId        The id of the indexable.
	 * @param {int}    incomingLinksCount The number of incoming links.
	 * @param {string} breadcrumbTitle    The title of the indexable.
	 * @param {string} permalink          The link to the indexable.
	 *
	 * @returns {boolean} True if the update was successful.
	 */
	const handleOpenModal = useCallback( async( indexableId, incomingLinksCount, breadcrumbTitle, permalink ) => {
		setIsModalOpen( true );

		if ( ! isPremiumInstalled ) {
			setSuggestedLinksModalData( {
				incomingLinksCount: incomingLinksCount,
				linksList: null,
				breadcrumbTitle: breadcrumbTitle,
				permalink: permalink,
			 } );
			 return true;
		}
		try {
			const response = await apiFetch( {
				path: "yoast/v1/workouts/link_suggestions?indexableId=" + indexableId,
				method: "GET",
			} );

			const parsedResponse = await response.json;

			if ( parsedResponse.length === 0 ) {
				setSuggestedLinksModalData( {
					incomingLinksCount: incomingLinksCount,
					linksList: [],
					breadcrumbTitle: breadcrumbTitle,
					permalink: permalink,
				 } );
				 return true;
			}
			if ( parsedResponse.length > 0 ) {
				setSuggestedLinksModalData( {
					incomingLinksCount: incomingLinksCount,
					linksList: parsedResponse,
					breadcrumbTitle: breadcrumbTitle,
					permalink: permalink,
				 } );
				return true;
			}
			return false;
		} catch ( error ) {
			// URL() constructor throws a TypeError exception if url is malformed.
			console.error( error.message );
			return false;
		}
	}, [ setSuggestedLinksModalData, setIsModalOpen ] );

	/**
	 * Handles the click event of the link button.
	 *
	 * @param {event} e The click event.
	 *
	 * @returns {void}
	 */
	const handleLink = useCallback( ( e ) => {
		handleOpenModal(
			e.currentTarget.dataset.indexableid,
			e.currentTarget.dataset.incominglinkscount,
			e.currentTarget.dataset.breadcrumbtitle,
			e.currentTarget.dataset.permalink
		);
	}, [ handleOpenModal ] );

	/**
	 * Handles the closing of the modal.
	 *
	 * @returns {void}
	 */
	const handleCloseModal = useCallback( () => {
		setIsModalOpen( false );
		setSuggestedLinksModalData( null );
	}, [] );

	/**
	 * Handles the undo action
	 * @param {object} ignored The ignored indexable.
	 *
	 * @returns {boolean} True if the action was successful.
	 */
	const handleUndo = useCallback( async( ignored ) => {
		const id = ignored.indexable.id;
		const type = ignored.type;
		const indexable = ignored.indexable;
		const position = ignored.position;

		try {
			const response = await apiFetch( {
				path: "yoast/v1/restore_indexable",
				method: "POST",
				data: { id: id, type: type },
			} );

			const parsedResponse = await response.json;
			if ( parsedResponse.success ) {
				setIndexablesLists( prevState => {
					const newData = prevState[ type ].slice( 0 );

					newData.splice( position, 0, indexable );
					return {
						...prevState,
						[ type ]: newData,
					};
				} );
				setIgnoredIndexable( null );
				return true;
			}
			/* eslint-disable-next-line no-warning-comments */
			// @TODO: Throw an error notification.
			console.error( "Undoing post has failed." );
			return false;
		} catch ( error ) {
			/* eslint-disable-next-line no-warning-comments */
			// @TODO: Throw an error notification.
			console.error( error.message );
			return false;
		}
	}, [ apiFetch, setIndexablesLists, indexablesLists, setIgnoredIndexable ] );

	const onClickUndo = useCallback( ( ignored ) => {
		return () => handleUndo( ignored );
	}, [ handleUndo ] );

	const onClickUndoAll = useCallback( async( event ) => {
		const { type } = event.target.dataset;
		try {
			const response = await apiFetch( {
				path: "yoast/v1/restore_all_indexables",
				method: "POST",
				data: { type: type },
			} );

			const parsedResponse = await response.json;
			if ( parsedResponse.success ) {
				// If there is a button to ignore a single indexable, for a list for which we are removing all indexables...
				if ( ignoredIndexable && ignoredIndexable.type === type ) {
					// ...remove that button.
					setIgnoredIndexable( null );
				}
				handleRefreshLists();
				return true;
			}
			/* eslint-disable-next-line no-warning-comments */
			// @TODO: Throw an error notification.
			console.error( "Undoing all ignored indexables has failed." );
			return false;
		} catch ( error ) {
			/* eslint-disable-next-line no-warning-comments */
			// @TODO: Throw an error notification.
			console.error( error.message );
			return false;
		}
	}, [ apiFetch, handleRefreshLists, ignoredIndexable ] );

	const singleColumn = [
		<IndexablesPageCard
			key="lowest-readability-scores"
			title={
				shouldShowLoading( "least_readability" )
					? <div className="yst-flex yst-items-center yst-h-8 yst-animate-pulse"><div className="yst-w-3/5 yst-bg-gray-200 yst-h-3 yst-rounded" /></div>
					: __( "Lowest readability scores", "wordpress-seo" )
			}
			className="2xl:yst-mb-6 2xl:last:yst-mb-0"
		>
			{
				shouldShowDisabledAlert( "least_readability" ) && <Alert type={ "info" }>
					{
						addLinkToString(
							// translators: %1$s and %2$s are the opening and closing anchor tags.
							sprintf(
								__(
									"You've disabled the 'Readability analysis' feature. " +
									"Enable this feature on the %1$sFeatures tab%2$s if you want us to calculate the Readability score of your content",
									"wordpress-seo"
								),
								"<a>",
								"</a>"
							), "/wp-admin/admin.php?page=wpseo_dashboard#top#features"

						)
					}
				</Alert>
			}
			{
				shouldShowLoading( "least_readability" ) && <IndexablesTable isLoading={ true } />
			}
			{
				shouldShowTable( "least_readability" ) && <IndexablesTable>
					{ indexablesLists.least_readability.slice( 0, listSize ).map(
						( indexable, position ) => {
							return <IndexablesTable.Row
								key={ `indexable-${ indexable.id }-row` }
								type={ "least_readability" }
								indexable={ indexable }
								addToIgnoreList={ setIgnoredIndexable }
								position={ position }
							>
								<IndexableScore
									colorClass={ readabilityScoreAssessment( indexable ) }
								/>
								<IndexableTitleLink indexable={ indexable } />
								<div>
									<Link
										id="least-readability-edit-link"
										href={ "/wp-admin/post.php?action=edit&post=" + indexable.object_id }
										className="yst-button yst-button--secondary yst-text-gray-700"
									>
										{ __( "Improve", "wordpress-seo" ) }
									</Link>
								</div>
							</IndexablesTable.Row>;
						}
					) }
				</IndexablesTable>
			}
			{
				shouldShowEmptyAlert( "least_readability" ) && ! isSomethingGreenReadability && <div className="yst-flex"><p>{ __( "Your site has no content with Readability scores left to display here.", "wordpress-seo" ) }</p></div>
			}
			{
				shouldShowEmptyAlert( "least_readability" ) && isSomethingGreenReadability && <div className="yst-flex"><IndexableScore colorClass="yst-bg-emerald-500" /><p className="yst-ml-2">{ __( "Congratulations! All of your content has a green readability score!", "wordpress-seo" ) }</p></div>
			}
		</IndexablesPageCard>,
		<IndexablesPageCard
			key="lowest-link-count"
			title={
				shouldShowLoading( "least_linked" )
					? <div className="yst-flex yst-items-center yst-h-8 yst-animate-pulse"><div className="yst-w-3/5 yst-bg-gray-200 yst-h-3 yst-rounded" /></div>
					: __( "Lowest number of incoming links", "wordpress-seo" )
			}
			className="2xl:yst-mb-6 2xl:last:yst-mb-0"
		>
			{
				shouldShowDisabledAlert( "least_linked" ) && <Alert type={ "info" }>
					{
						addLinkToString(
							// translators: %1$s and %2$s are the opening and closing anchor tags.
							sprintf(
								__(
									"You've disabled the 'Text link counter' feature. " +
									"Enable this feature on the %1$sFeatures tab%2$s if you want us to calculate the number of links in your content",
									"wordpress-seo"
								),
								"<a>",
								"</a>"
							), "/wp-admin/admin.php?page=wpseo_dashboard#top#features"

						)
					}
				</Alert>
			}
			{
				shouldShowLoading( "least_linked" ) && <IndexablesTable isLoading={ true } />
			}
			{
				shouldShowTable( "least_linked" ) && <Fragment>
					<div className="yst-mb-3 yst-text-justify yst-pr-6">
						{ leastLinkedIntro }
					</div>
					<IndexablesTable>
						{ indexablesLists.least_linked.slice( 0, listSize ).map(
							( indexable, position ) => {
								return <IndexablesTable.Row
									key={ `indexable-${ indexable.id }-row` }
									type={ "least_linked" }
									indexable={ indexable }
									addToIgnoreList={ setIgnoredIndexable }
									position={ position }
								>
									<IndexableLinkCount count={ parseInt( indexable.incoming_link_count, 10 ) } />
									<IndexableTitleLink indexable={ indexable } />
									<div key={ `least-linked-modal-button-${ indexable.id }` }  className="yst-shrink-0">
										<Button
											id="least-linked-modal-button"
											data-indexableid={ indexable.id }
											data-incominglinkscount={ indexable.incoming_link_count === null ? 0 : indexable.incoming_link_count }
											data-breadcrumbtitle={ indexable.breadcrumb_title }
											data-permalink={ indexable.permalink }
											onClick={ handleLink }
											variant="secondary"
										>
											{ __( "Add links", "wordpress-seo" ) }
										</Button>
									</div>
								</IndexablesTable.Row>;
							}
						) }
					</IndexablesTable>
					<div className="yst-mt-3 yst-text-justify yst-pr-6">
						{ leastLinkedOutro }
					</div>
				</Fragment>
			}
			{
				shouldShowEmptyAlert( "least_linked" ) && <div className="yst-flex"><p>{ __( "You have hidden all items from this list, so there is no content left to display here.", "wordpress-seo" ) }</p></div>
			}
		</IndexablesPageCard>,
	];

	const doubleColumn = [ ...singleColumn ].reverse();

	return setupInfo && <div
		className="yst-max-w-full yst-mt-6"
	>
		<Modal
			onClose={ handleCloseModal }
			isOpen={ isModalOpen }
		>
			 <SuggestedLinksModal
				isLinkSuggestionsEnabled={ isLinkSuggestionsEnabled }
				isPremium={ isPremiumInstalled }
				suggestedLinksModalData={ suggestedLinksModalData }
			 />
		</Modal>
		<div className="yst-max-w-7xl yst-text-right yst-gap-6 yst-mb-3">
			<span className="yst-italic">
				{
					// translators: %d is the number of minutes since the last refresh.
					sprintf(
						_n( "Last refreshed: %d min ago", "Last refreshed: %d mins ago", lastRefreshTime, "wordpress-seo" ),
						lastRefreshTime
					)
				}
			</span>
			<button
				type="button"
				onClick={ handleRefreshLists }
				className={ "yst-ml-6 yst-font-medium yst-text-[#4F46E5]" }
			>
				<RefreshIcon className="yst-inline-block yst-align-text-bottom yst-mr-1 yst-h-4 yst-w-4 yst-text-[#4F46E5]" />
				{ __( "Refresh data", "wordpress-seo" ) }
			</button>
		</div>
		<div
			id="indexables-table-columns"
			className="yst-max-w-7xl yst-flex yst-flex-col 2xl:yst-block 2xl:yst-columns-2 yst-gap-6"
		>
			<IndexablesPageCard
				title={
					shouldShowLoading( "least_seo_score" )
						? <div className="yst-flex yst-items-center yst-h-8 yst-animate-pulse"><div className="yst-w-3/5 yst-bg-gray-200 yst-h-3 yst-rounded" /></div>
						: __( "Lowest SEO scores", "wordpress-seo" )
				}
				className="2xl:yst-mb-6 2xl:last:yst-mb-0"
			>
				{
					shouldShowDisabledAlert( "least_seo_score" ) && <Alert type={ "info" }>
						{
							addLinkToString(
								// translators: %1$s and %2$s are the opening and closing anchor tags.
								sprintf(
									__(
										"You've disabled the 'SEO analysis' feature. " +
										"Enable this feature on the %1$sFeatures tab%2$s if you want us to calculate the SEO score of your content",
										"wordpress-seo"
									),
									"<a>",
									"</a>"
								), "/wp-admin/admin.php?page=wpseo_dashboard#top#features"

							)
						}
					</Alert>
				}
				{
					shouldShowLoading( "least_seo_score" ) && <IndexablesTable isLoading={ true } />
				}
				{
					shouldShowTable( "least_seo_score" ) && <IndexablesTable>
						{ indexablesLists.least_seo_score.slice( 0, listSize ).map(
							( indexable, position ) => {
								return <IndexablesTable.Row
									key={ `indexable-${ indexable.id }-row` }
									type={ "least_seo_score" }
									indexable={ indexable }
									addToIgnoreList={ setIgnoredIndexable }
									position={ position }
								>
									<IndexableScore
										colorClass={ seoScoreAssessment( indexable ) }
									/>
									<IndexableTitleLink indexable={ indexable } />
									<div>
										<Link
											id="least-seo-score-edit-link"
											href={ "/wp-admin/post.php?action=edit&post=" + indexable.object_id }
											className="yst-button yst-button--secondary yst-text-gray-700"
										>
											{ __( "Improve", "wordpress-seo" ) }
										</Link>
									</div>
								</IndexablesTable.Row>;
							}
						) }
					</IndexablesTable>
				}
				{
					shouldShowEmptyAlert( "least_seo_score" ) && ! isSomethingGreenSEO && <div className="yst-flex"><p>{ __( "Your site has no content with SEO scores left to display here.", "wordpress-seo" ) }</p></div>
				}
				{
					shouldShowEmptyAlert( "least_seo_score" ) && isSomethingGreenSEO && <div className="yst-flex"><IndexableScore colorClass="yst-bg-emerald-500" /><p className="yst-ml-2">{ __( "Congratulations! All of your content has a green SEO score!", "wordpress-seo" ) }</p></div>
				}
			</IndexablesPageCard>
			{ isSingleColumn ? singleColumn : doubleColumn }
			<IndexablesPageCard
				key="most-link-count"
				title={
					shouldShowLoading( "most_linked" )
						? <div className="yst-flex yst-items-center yst-h-8 yst-animate-pulse"><div className="yst-w-3/5 yst-bg-gray-200 yst-h-3 yst-rounded" /></div>
						: __( "Highest number of incoming links", "wordpress-seo" )
				}
				className="yst-mb-6"
			>
				{
					shouldShowDisabledAlert( "most_linked" ) && <Alert type={ "info" }>
						{
							addLinkToString(
								// translators: %1$s and %2$s are the opening and closing anchor tags.
								sprintf(
									__(
										"You've disabled the 'Text link counter' feature. " +
										"Enable this feature on the %1$sFeatures tab%2$s if you want us to calculate the number of links in your content",
										"wordpress-seo"
									),
									"<a>",
									"</a>"
								), "/wp-admin/admin.php?page=wpseo_dashboard#top#features"

							)
						}
					</Alert>
				}
				{
					shouldShowLoading( "most_linked" ) && <IndexablesTable isLoading={ true } />
				}
				{
					shouldShowTable( "most_linked" ) && <Fragment>
						<div className="yst-mb-3 yst-text-justify yst-pr-6">
							{ mostLinkedIntro }
						</div>
						<IndexablesTable>
							{ indexablesLists.most_linked.slice( 0, listSize ).map(
								( indexable, position ) => {
									return <IndexablesTable.Row
										key={ `indexable-${ indexable.id }-row` }
										type={ "most_linked" }
										indexable={ indexable }
										addToIgnoreList={ setIgnoredIndexable }
										position={ position }
									>
										<IndexableScore colorClass={ mostLinkedAssessment( indexable ) } />
										<IndexableLinkCount count={ parseInt( indexable.incoming_link_count, 10 ) } />
										<IndexableTitleLink indexable={ indexable } />
										<div>
											<Link
												id="most-linked-edit-link"
												href={ "/wp-admin/post.php?action=edit&post=" + indexable.object_id }
												className="yst-button yst-button--secondary yst-text-gray-700"
											>
												{ __( "Edit", "wordpress-seo" ) }
											</Link>
										</div>
									</IndexablesTable.Row>;
								}
							) }
						</IndexablesTable>
						<div className="yst-mt-3 yst-text-justify yst-pr-6">
							{ mostLinkedOutro }
						</div>
					</Fragment>
				}
				{
					shouldShowEmptyAlert( "most_linked" ) && <div className="yst-flex"><p>{ __( "Your site has no content with incoming links left to display here.", "wordpress-seo" ) }</p></div>
				}
			</IndexablesPageCard>
		</div>
		<div className="yst-w-full yst-border-t yst-border-gray-300 yst-pb-6 yst-pt-8 yst-mt-2 yst-space-x-2">
			<Button variant="secondary" onClick={ onClickUndoAll } data-type={ "least_seo_score" } disabled={ false }>{ __( "Undo hiding of all seo indexables", "wordpress-seo" ) }</Button>
			<Button variant="secondary" onClick={ onClickUndoAll } data-type={ "least_readability" } disabled={ false }>{ __( "Undo hiding of all readability indexables", "wordpress-seo" ) }</Button>
			<Button variant="secondary" onClick={ onClickUndoAll } data-type={ "least_linked" } disabled={ false }>{ __( "Undo hiding of all least linked indexables", "wordpress-seo" ) }</Button>
			<Button variant="secondary" onClick={ onClickUndoAll } data-type={ "most_linked" } disabled={ false }>{ __( "Undo hiding of all most linked indexables", "wordpress-seo" ) }</Button>
			{
				ignoredIndexable && <Button variant="secondary" onClick={ onClickUndo( ignoredIndexable ) }>
					{ `Undo ignore ${ignoredIndexable.indexable.id}` }
				</Button>
			}
		</div>
	</div>;
}

IndexablesPage.propTypes = {
	setupInfo: PropTypes.object.isRequired,
};

export default IndexablesPage;
