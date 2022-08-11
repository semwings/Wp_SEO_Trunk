/* global wpseoIndexablesPageData */
import PropTypes from "prop-types";
import apiFetch from "@wordpress/api-fetch";
import { __, sprintf } from "@wordpress/i18n";
import { useEffect, useState, useCallback } from "@wordpress/element";
import { LinkIcon, ExternalLinkIcon } from "@heroicons/react/outline";
import { Badge, Button, Modal } from "@yoast/ui-library";
import { makeOutboundLink } from "@yoast/helpers";
import IndexablesTable from "./components/indexables-table";
import NotEnoughContent from "./components/not-enough-content";
import NotEnoughAnalysedContent from "./components/not-enough-analysed-content";
import { addLinkToString } from "../helpers/stringHelpers";
import SuggestedLinksModal from "./components/suggested-links-modal";

const Link = makeOutboundLink();

const SEOScoreThresholds = { medium: 40, good: 70 };
const readabilityScoreThresholds = { medium: 59, good: 89 };

/**
 * A score representation.
 *
 * @param {string} colorClass The color of the bullet.
 *
 * @returns {WPElement} A div with a styled score representation.
 */
function IndexableScore( { colorClass } ) {
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

/**
 * A link to the indexable.
 *
 * @param {object} indexable The indexable.
 *
 * @returns {WPElement} A div with a styled link to the indexable.
 */
export function IndexableTitleLink( { indexable, showType } ) {
	return <div className="yst-grow yst-min-w-0 yst-flex yst-h-3/5">
		<Link
			href={ indexable.permalink }
			className="yst-min-w-0 yst-rounded-md focus:yst-outline-none focus:yst-ring-2 focus:yst-ring-offset-2 focus:yst-ring-primary-500 yst-flex yst-items-center yst-gap-2 yst-no-underline yst-text-inherit hover:yst-text-indigo-500"
		>
			<span className="yst-text-ellipsis yst-whitespace-nowrap yst-overflow-hidden">{ indexable.breadcrumb_title }</span><ExternalLinkIcon className="yst-shrink-0 yst-h-[13px] yst-w-[13px]" />
		</Link>
		{ ( showType ) && <Badge variant="plain" className="yst-text-gray-800 yst-text-[10px] yst-self-center yst-h-4 yst-ml-2">{ indexable.object_sub_type }</Badge> }
	</div>;
}

IndexableTitleLink.propTypes = {
	indexable: PropTypes.shape( {
		permalink: PropTypes.string.isRequired,
		/* eslint-disable camelcase */
		breadcrumb_title: PropTypes.string.isRequired,
		object_sub_type: PropTypes.string,
		/* eslint-enable camelcase */
	} ).isRequired,
	showType: PropTypes.bool,
};

IndexableTitleLink.defaultProps = {
	showType: true,
};

/**
 * A card for the indexables page.
 *
 * @param {string}   title     The indexable title.
 * @param {boolean}  isLoading Wether the card is loading or not.
 * @param {JSX.node} children  The React children.
 *
 * @returns {WPElement} A div with a styled link to the indexable.
 */
function IndexablesPageCard( { title, isLoading, children } ) {
	return <div>
		<div
			className="yst-bg-white yst-rounded-lg yst-px-8 yst-py-6 yst-shadow"
		>
			<h3 className="yst-mb-4 yst-text-xl yst-text-gray-900 yst-font-medium">
				{ isLoading
					? title
					: <div className="yst-flex yst-items-center yst-h-8 yst-animate-pulse"><div className="yst-w-3/5 yst-bg-gray-200 yst-h-3 yst-rounded" /></div>
				}
			</h3>
			{ children }
		</div>
	</div>;
}

IndexablesPageCard.propTypes = {
	title: PropTypes.string.isRequired,
	isLoading: PropTypes.bool.isRequired,
	children: PropTypes.node.isRequired,
};

/* eslint-disable camelcase */
/* eslint-disable no-warning-comments */
/* eslint-disable complexity */
/**
 * Renders the four indexable tables.
 *
 * @returns {WPElement} A div containing the main indexables page.
 */
function IndexablesPage() {
	const listSize = parseInt( wpseoIndexablesPageData.listSize, 10 );
	const minimumIndexablesInBuffer = listSize * 2;
	const isPremiumInstalled = Boolean( wpseoIndexablesPageData.isPremium );
	const isLinkSuggestionsEnabled = Boolean( wpseoIndexablesPageData.isLinkSuggestionsEnabled );

	const [ indexablesLists, setIndexablesLists ] = useState(
		{
			least_readability: null,
			least_seo_score: null,
			most_linked: null,
			least_linked: null,
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

	const [ ignoredIndexable, setIgnoredIndexable ] = useState( null );
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ suggestedLinksModalData, setSuggestedLinksModalData ] = useState( null );
	const [ setupInfo, setSetupInfo ] = useState( null );

	/**
	 * Fetches a list of indexables.
	 *
	 * @param {string} listName The name of the list to fetch.
	 *
	 * @returns {boolean} True if the request was successful.
	 */
	const fetchList = async( listName ) => {
		try {
			const response = await apiFetch( {
				path: `yoast/v1/${ listName }`,
				method: "GET",
			} );

			const parsedResponse = await response.json;

			setIndexablesLists( prevState => {
				return {
					...prevState,
					[ listName ]: parsedResponse.list,
				};
			} );

			setIndexablesListsFetchLength( prevState => {
				return {
					...prevState,
					[ listName ]: parsedResponse.list.length,
				};
			} );
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

	/* eslint-disable  complexity */
	/**
	 * Updates the content of a list of indexables.
	 *
	 * @param {string} listName       The name of the list to fetch.
	 * @param {array}  indexablesList The current content of the list.
	 *
	 * @returns {boolean} True if the update was successful.
	 */
	const updateList = ( listName, indexablesList ) => {
		if ( indexablesList === null ) {
			return fetchList( listName );
		}

		return ( indexablesList.length < minimumIndexablesInBuffer  && indexablesListsFetchLength[ listName ] >= minimumIndexablesInBuffer )
			? fetchList( listName )
			: maybeRemoveIgnored( listName );
	};

	useEffect( async() => {
		try {
			const response = await apiFetch( {
				path: "yoast/v1/setup_info",
				method: "GET",
			} );

			const parsedResponse = await response.json;
			setSetupInfo( parsedResponse );
		} catch ( error ) {
			// @TODO: Throw an error notification.
			console.error( error.message );
			return false;
		}
	}, [] );

	useEffect( async() => {
		if ( setupInfo ) {
			if ( setupInfo.enoughContent && setupInfo.enoughAnalysedContent ) {
				if ( setupInfo.enabledFeatures.isReadabilityEnabled ) {
					updateList( "least_readability", indexablesLists.least_readability );
				}

				if ( setupInfo.enabledFeatures.isSeoScoreEnabled ) {
					updateList( "least_seo_score", indexablesLists.least_seo_score );
				}

				if ( setupInfo.enabledFeatures.isLinkCountEnabled ) {
					updateList( "most_linked", indexablesLists.most_linked );
					updateList( "least_linked", indexablesLists.least_linked );
				}
			}
		}
	}, [ setupInfo ] );

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
			// @TODO: Throw an error notification.
			console.error( "Undoing post has failed." );
			return false;
		} catch ( error ) {
			// @TODO: Throw an error notification.
			console.error( error.message );
			return false;
		}
	}, [ apiFetch, setIndexablesLists, indexablesLists, setIgnoredIndexable ] );

	const onClickUndo = useCallback( ( ignored ) => {
		return () => handleUndo( ignored );
	}, [ handleUndo ] );

	if ( setupInfo && Object.values( setupInfo.enabledFeatures ).every( value => value === false ) ) {
		// @TODO: needs UX
		return <span>All features deactivated.</span>;
	} else if ( setupInfo && setupInfo.enoughContent === false ) {
		return <NotEnoughContent />;
	} else if ( setupInfo && setupInfo.enoughAnalysedContent === false ) {
		return <NotEnoughAnalysedContent indexablesList={ setupInfo.postsWithoutKeyphrase } />;
	}

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
		<div
			id="indexables-table-grid"
			className="yst-max-w-7xl yst-grid yst-grid-cols-1 2xl:yst-grid-cols-2 2xl:yst-grid-flow-row 2xl:yst-auto-rows-auto yst-gap-6"
		>
			{
				( indexablesLists.least_seo_score && indexablesLists.least_seo_score.length > 0 ) && <IndexablesPageCard title={ __( "Lowest SEO scores", "wordpress-seo" ) } isLoading={ indexablesLists.least_seo_score !== null }>
					<IndexablesTable>
						{
							indexablesLists.least_seo_score.slice( 0, listSize ).map(
								( indexable, position ) => {
									const score = parseInt( indexable.primary_focus_keyword_score, 10 );
									return <IndexablesTable.Row
										key={ `indexable-${ indexable.id }-row` }
										type="least_seo_score"
										indexable={ indexable }
										addToIgnoreList={ setIgnoredIndexable }
										position={ position }
									>
										<IndexableScore
											key={ `seo-score-${ indexable.id }` }
											colorClass={ score > SEOScoreThresholds.medium ? "yst-bg-amber-500" : "yst-bg-red-500" }
										/>
										<IndexableTitleLink key={ `seo-title-${ indexable.id }` } indexable={ indexable } />
										<div key={ `seo-improve-${ indexable.id }` }>
											<Link
												href={ "/wp-admin/post.php?action=edit&post=" + indexable.object_id }
												className="yst-button yst-button--secondary yst-text-gray-700"
											>
												{ __( "Improve", "wordpress-seo" ) }
											</Link>
										</div>
									</IndexablesTable.Row>;
								}
							)
						}
					</IndexablesTable>
				</IndexablesPageCard>
			}
			{
				( indexablesLists.least_readability && indexablesLists.least_readability.length > 0 ) && <IndexablesPageCard title={ __( "Lowest readability scores", "wordpress-seo" ) } isLoading={ indexablesLists.least_readability !== null }>
					<IndexablesTable>
						{
							indexablesLists.least_readability.slice( 0, listSize ).map(
								( indexable, position ) => {
									const score = parseInt( indexable.readability_score, 10 );
									return <IndexablesTable.Row
										key={ `indexable-${ indexable.id }-row` }
										type="least_readability"
										indexable={ indexable }
										addToIgnoreList={ setIgnoredIndexable }
										position={ position }
									>
										<IndexableScore
											key={ `readability-score-${ indexable.id }` }
											colorClass={ score > readabilityScoreThresholds.medium ? "yst-bg-amber-500" : "yst-bg-red-500" }
										/>
										<IndexableTitleLink key={ `readability-title-${ indexable.id }` } indexable={ indexable } />
										<div key={ `readability-improve-${ indexable.id }` }>
											<Link
												href={ "/wp-admin/post.php?action=edit&post=" + indexable.object_id }
												className="yst-button yst-button--secondary yst-text-gray-700"
											>
												{ __( "Improve", "wordpress-seo" ) }
											</Link>
										</div>
									</IndexablesTable.Row>;
								}
							)
						}
					</IndexablesTable>
				</IndexablesPageCard>
			}
			{
				( indexablesLists.least_linked && indexablesLists.least_linked.length > 0 ) && <IndexablesPageCard title={ __( "Lowest number of incoming links", "wordpress-seo" ) } isLoading={ indexablesLists.least_linked !== null }>
					<div className="yst-mb-3 yst-text-justify yst-pr-6">
						{
							addLinkToString(
								// translators: %1$s and %2$s are replaced by opening and closing anchor tags.
								sprintf( __( "If you want to prevent your content from being orphaned, you need to make sure to link to that content. " +
							"Linking to it from other places on your site will help Google and your audience reach it. " +
							"%1$sLearn more about orphaned content%2$s.", "wordpress-seo" ),
								"<a>",
								"</a>" ),
								"https://www.yoast.com"
							)
						}
					</div>
					<IndexablesTable>
						{
							indexablesLists.least_linked.slice( 0, listSize ).map(
								( indexable, position ) => {
									return <IndexablesTable.Row
										key={ `indexable-${ indexable.id }-row` }
										type="least_linked"
										indexable={ indexable }
										addToIgnoreList={ setIgnoredIndexable }
										position={ position }
									>
										{ /* @TODO: needs to be calculated */ }
										<IndexableScore colorClass={ "yst-bg-emerald-500" } />
										<IndexableLinkCount key={ `least-linked-score-${ indexable.id }` } count={ parseInt( indexable.incoming_link_count, 10 ) } />
										<IndexableTitleLink key={ `least-linked-title-${ indexable.id }` } indexable={ indexable } />
										<div key={ `least-linked-modal-button-${ indexable.id }` }  className="yst-shrink-0">
											<Button
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
							)
						}
					</IndexablesTable>
					<div className="yst-mt-3 yst-text-justify yst-pr-6">
						{
							addLinkToString(
								// translators: %1$s and %2$s are replaced by opening and closing anchor tags.
								sprintf( __( "Find and fix any orphaned content on your site by using this %1$sstep-by-step workout%2$s!", "wordpress-seo" ),
									"<a>",
									"</a>" ),
								"https://www.yoast.com"
							)
						}
					</div>
				</IndexablesPageCard>
			}
			{
				( indexablesLists.most_linked && indexablesLists.most_linked.length > 0 ) && <IndexablesPageCard title={ __( "Highest number of incoming links", "wordpress-seo" ) } isLoading={ indexablesLists.most_linked !== null }>
					<div className="yst-mb-3 yst-text-justify yst-pr-6">
						{
							addLinkToString(
								// translators: %1$s and %2$s are replaced by opening and closing anchor tags.
								sprintf( __( "The content below is supposed to be your cornerstone content: the most important and extensive articles on your site. " +
							"Make sure to mark this content as cornerstone content to get all bullets green. " +
							"%1$sLearn more about cornerstone content%2$s.", "wordpress-seo" ),
								"<a>",
								"</a>" ),
								"https://www.yoast.com"
							)
						}
					</div>
					<IndexablesTable>
						{
							indexablesLists.most_linked.slice( 0, listSize ).map(
								( indexable, position ) => {
									return <IndexablesTable.Row
										key={ `indexable-${ indexable.id }-row` }
										type="most_linked"
										indexable={ indexable }
										addToIgnoreList={ setIgnoredIndexable }
										position={ position }
									>
										<IndexableScore colorClass={ parseInt( indexable.is_cornerstone, 10 ) ? "yst-bg-emerald-500" : "yst-bg-red-500" } />
										<IndexableLinkCount key={ `most-linked-score-${ indexable.id }` } count={ parseInt( indexable.incoming_link_count, 10 ) } />
										<IndexableTitleLink key={ `most-linked-title-${ indexable.id }` } indexable={ indexable } />
										<div key={ `most-linked-edit-${ indexable.id }` }>
											<Link
												href={ "/wp-admin/post.php?action=edit&post=" + indexable.object_id }
												className="yst-button yst-button--secondary yst-text-gray-500"
											>
												{ __( "Edit", "wordpress-seo" ) }
											</Link>
										</div>
									</IndexablesTable.Row>;
								}
							)
						}
					</IndexablesTable>
					<div className="yst-mt-3 yst-text-justify yst-pr-6">
						{
							addLinkToString(
								// translators: %1$s and %2$s are replaced by opening and closing anchor tags.
								sprintf( __( "Improve rankings for all your cornerstones by using this %1$sstep-by-step workout%2$s!", "wordpress-seo" ),
									"<a>",
									"</a>" ),
								"https://www.yoast.com"
							)
						}
					</div>
				</IndexablesPageCard>
			}
		</div>
		{ ignoredIndexable && <div className="yst-flex yst-justify-center"><Button className="yst-button yst-button--primary" onClick={ onClickUndo( ignoredIndexable ) }>{ `Undo ignore ${ignoredIndexable.indexable.id}` }</Button></div> }
	</div>;
}

export default IndexablesPage;
