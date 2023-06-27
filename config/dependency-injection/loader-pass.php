<?php

namespace Yoast\WP\SEO\Dependency_Injection;

use ReflectionClass;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Yoast\WP\Lib\Migrations\Migration;
use Yoast\WP\SEO\Commands\Command_Interface;
use Yoast\WP\SEO\Initializers\Initializer_Interface;
use Yoast\WP\SEO\Integrations\Integration_Interface;
use Yoast\WP\SEO\Loader;
use Yoast\WP\SEO\Routes\Route_Interface;
use Yoast\WP\SEO\Conditionals\Conditional;
/**
 * A pass is a step in the compilation process of the container.
 *
 * This step will automatically ensure all classes implementing the Integration interface
 * are registered with the Loader class.
 */
class Loader_Pass implements CompilerPassInterface {

	/**
	 * Checks all definitions to ensure all classes implementing the Integration interface are registered with the Loader class.
	 *
	 * @param ContainerBuilder $container The container.
	 */
	public function process( ContainerBuilder $container ) {
		if ( ! $container->hasDefinition( Loader::class ) ) {
			return;
		}

		$loader_definition = $container->getDefinition( Loader::class );
		$definitions       = $container->getDefinitions();

		foreach ( $definitions as $definition ) {
			if ( $definition->isDeprecated() ) {
				continue;
			}

			$this->process_definition( $definition, $loader_definition );
		}
	}

	/**
	 * Processes a definition in the container.
	 *
	 * @param Definition $definition        The definition to process.
	 * @param Definition $loader_definition The loader definition.
	 */
	private function process_definition( Definition $definition, Definition $loader_definition ) {
		$class = $definition->getClass();

		try {
			$reflect = new ReflectionClass( $class );
			$path    = $reflect->getFileName();
			if ( strpos( $path, 'wordpress-seo/src/helpers' )
				|| strpos( $path, 'wordpress-seo/src/actions' )
				|| strpos( $path, 'wordpress-seo/src/builders' )
				|| strpos( $path, 'wordpress-seo/src/config' )
				|| strpos( $path, 'wordpress-seo/src/context' )
				|| strpos( $path, 'wordpress-seo/src/generators' )
				|| strpos( $path, 'wordpress-seo/src/surfaces' )
				|| strpos( $path, 'wordpress-seo/src/integrations' )
				|| strpos( $path, 'wordpress-seo/src/loggers' )
				|| strpos( $path, 'wordpress-seo/src/memoizers' )
				|| strpos( $path, 'wordpress-seo/src/models' )
				|| strpos( $path, 'wordpress-seo/src/presentations' )
				|| strpos( $path, 'wordpress-seo/src/repositories' )
				|| strpos( $path, 'wordpress-seo/src/services' )
				|| strpos( $path, 'wordpress-seo/src/values' )
				|| strpos( $path, 'wordpress-seo/src/wrappers' )
				|| strpos( $path, 'wordpress-seo/src/wordpress' )
				|| strpos( $path, 'wordpress-seo/src/loader' )
				) {
				$definition->setPublic( true );
			}
		} catch ( \Exception $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
			// Catch all for non-existing classes.
		}

		if ( $this->should_make_public( $definition ) ) {
			$definition->setPublic( true );
		}

		if ( is_subclass_of( $class, Conditional::class ) ) {
			$definition->setPublic( true );
		}

		if ( \is_subclass_of( $class, Initializer_Interface::class ) ) {
			$loader_definition->addMethodCall( 'register_initializer', [ $class ] );
			$definition->setPublic( true );
		}

		if ( \is_subclass_of( $class, Integration_Interface::class ) ) {
			$loader_definition->addMethodCall( 'register_integration', [ $class ] );
			$definition->setPublic( true );
		}

		if ( \is_subclass_of( $class, Route_Interface::class ) ) {
			$loader_definition->addMethodCall( 'register_route', [ $class ] );
			$definition->setPublic( true );
		}

		if ( \is_subclass_of( $class, Command_Interface::class ) ) {
			$loader_definition->addMethodCall( 'register_command', [ $class ] );
			$definition->setPublic( true );
		}

		if ( \is_subclass_of( $class, Migration::class ) ) {
			$reflect = new \ReflectionClass( $class );
			$path    = $reflect->getFileName();
			$file    = \basename( $path, '.php' );
			$version = \explode( '_', $file )[0];
			$plugin  = $class::$plugin;
			$loader_definition->addMethodCall( 'register_migration', [ $plugin, $version, $class ] );
			$definition->setPublic( true );
		}
	}

	/**
	 * Checks if a class should be public. A class can be made public in the dependency injection by adding the
	 * `@makePublic` annotation in the doc block.
	 *
	 * @param  Definition $definition The definition to make public.
	 * @return bool
	 */
	private function should_make_public( Definition $definition ): bool {
		$doc_comment = $this->get_method_doc_block( $definition );

		if ( empty( $doc_comment ) ) {
			// If there is no doc comment, assume we should autowire.
			return false;
		}

		return strpos( $doc_comment, '* @makePublic' ) !== false;
	}

	/**
	 * Retrieves the doc block comment for the given definition.
	 *
	 * @param Definition $definition The definition to parse.
	 *
	 * @return string The doc block.
	 */
	private function get_method_doc_block( Definition $definition ) {
		$classname = $definition->getClass();
		try {
			$reflection_class = new \ReflectionClass( $classname );
		} catch ( \ReflectionException $exception ) {
			return '';
		}

		/**
		 * The DocComment for the class we're reflecting.
		 *
		 * @var string|false $doc_comment
		 */
		$doc_comment = $reflection_class->getDocComment();

		return ( $doc_comment === false ) ? '' : $doc_comment;
	}
}
