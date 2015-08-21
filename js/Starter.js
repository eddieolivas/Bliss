SC.startShopping = function ()
{
	'use strict';

	var application = SC.Application('Shopping');

	application.getConfig().siteSettings = SC.ENVIRONMENT.siteSettings || {};

	SC.compileMacros(SC.templates.macros);

	// Requires all dependencies so they are bootstrapped
	require(['Content.DataModels', 'Merchandising.Rule', 'Categories'], function (ContentDataModels, MerchandisingRule, Categories)
	{
		// Loads the urls of the different pages in the conten service,
		// this needs to happend before the app starts, so some routes are registered
		if (SC.ENVIRONMENT.CONTENT)
		{
			ContentDataModels.Urls.Collection.getInstance().reset(SC.ENVIRONMENT.CONTENT);
			delete SC.ENVIRONMENT.CONTENT;

			if (SC.ENVIRONMENT.DEFAULT_PAGE)
			{
				ContentDataModels.Pages.Collection.getInstance().reset(SC.ENVIRONMENT.DEFAULT_PAGE);
				delete SC.ENVIRONMENT.DEFAULT_PAGE;
			}
		}

		if (SC.ENVIRONMENT.MERCHANDISING)
		{
			// we need to turn it into an array
			var definitions = _.map(SC.ENVIRONMENT.MERCHANDISING, function (value, key)
			{
				value.internalid = key;
				return value;
			});

			MerchandisingRule.Collection.getInstance().reset(definitions);
			delete SC.ENVIRONMENT.MERCHANDISING;
		}

        if (SC.ENVIRONMENT.CATEGORIES)
        {
            Categories.reset(SC.ENVIRONMENT.CATEGORIES);
        }

        application.initGlobals(SC.ENVIRONMENT.GLOBALS);

		// When the document is ready we call the application.start, and once that's done we bootstrap and start backbone
		application.start(function ()
		{
			////////////////////////////
			// Bootstrap some objects //
			////////////////////////////


			// Checks for errors in the context
			if (SC.ENVIRONMENT.contextError)
			{
				// Hide the header and footer.
				application.getLayout().$('#site-header').hide();

				// Shows the error.
				application.getLayout().internalError(SC.ENVIRONMENT.contextError.errorMessage,'Error ' + SC.ENVIRONMENT.contextError.errorStatusCode + ': ' + SC.ENVIRONMENT.contextError.errorCode);
			}
			else
			{
				var fragment = _.parseUrlOptions(location.search).fragment;

				if (fragment && !location.hash)
				{
					location.hash = decodeURIComponent(fragment);
				}

				// Only do push state client side.				
				Backbone.history.start({
					pushState: SC.ENVIRONMENT.jsEnvironment === 'browser' && !SC.preventPushState && !window.location.pathname.match(/index(-local)?\.ssp/)
				});
			}
		});
	});
	// remove the script added for load script function
	// only if the javascript environment is the seo server
	if (SC.ENVIRONMENT.jsEnvironment === 'server')
	{
		jQuery('.seo-remove').remove();
	}
};




SC.startShopping();

SC.Application('Shopping').getLayout().appendToDom();
