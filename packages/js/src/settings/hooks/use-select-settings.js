import { useSelect } from "@wordpress/data";
import { STORE_NAME } from "../constants";

/**
 * @param {string} selector The name of the sselector.
 * @param {array} [deps] List of dependencies.
 * @param {*} [args] Selector arguments.
 * @returns {*} The result.
 */
const useSelectSettings = ( selector, deps = [], ...args ) => useSelect( select => select( STORE_NAME )[ selector ]?.( ...args ), deps );

export default useSelectSettings;
