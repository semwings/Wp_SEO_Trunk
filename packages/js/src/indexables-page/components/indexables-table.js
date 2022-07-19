import PropTypes from "prop-types";

import { Button, Table } from "@yoast/ui-library";
import { useState, useEffect } from "@wordpress/element";

function PlaceholderRows( { columnCount } ) {
	const cells = [];
	const rows = [];
	for ( let i = 0; i < columnCount; i++ ) {
		cells.push( <Table.Cell key={ `placeholder-column-${ i }` } className="yst-px-6 yst-py-4 yst-animate-pulse"><div className="yst-w-full yst-bg-gray-200 yst-h-3 yst-rounded" /></Table.Cell> );
	}
	for ( let i = 0; i < 5; i++ ) {
		rows.push( <Table.Row key={ `placeholder-row-${ i }` }>{ cells }</Table.Row> );
	}
	return rows;
}

/**
 * A table with indexables.
 *
 * @returns {WPElement} A table with the indexables.
 */
function IndexablesTable( { indexables, keyHeaderMap } ) {
	const [ isLoading, setIsLoading ] = useState( true );

	useEffect( () => {
		if ( indexables.length > 0 ) {
			setIsLoading( false );
		}
	}, [ indexables ] );

	return (
		<>
			<div className="yst-relative yst-overflow-x-scroll yst-border yst-border-gray-200 yst-shadow-sm yst-rounded-lg">
				<Table>
					<Table.Head>
						<Table.Row>
							{
								Object.values( keyHeaderMap ).map( ( header, index ) => {
									return <Table.Header key={ `indexable-header-${ index }` }>{ header }</Table.Header>;
								} )
							}
						</Table.Row>
					</Table.Head>
					<Table.Body>
						{
							isLoading
								? <PlaceholderRows columnCount={ Object.keys( keyHeaderMap ).length } />
								: indexables.map( ( indexable ) => {
									return <Table.Row
										key={ `indexable-${ indexable.id }-row` }
									>
										{
											Object.keys( keyHeaderMap ).map( ( key, index ) => {
												if ( key === "edit" ) {
													return <Table.Cell key="edit"><Button variant="secondary" data-id={ indexable.id }>Edit</Button></Table.Cell>;
												} else if ( key === "ignore" ) {
													return <Table.Cell key="ignore"><Button variant="error" data-id={ indexable.id }>Ignore</Button></Table.Cell>;
												}
												return <Table.Cell key={ `indexable-header-${ index }` }>{ indexable[ key ] }</Table.Cell>;
											} )
										}
									</Table.Row>;
								} )
						}
					</Table.Body>
				</Table>
			</div>
		</>
	);
}

export default IndexablesTable;