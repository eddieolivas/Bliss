// Content.DataModels.js
// ---------------------
// Defines the Models, Collections and functions that interact with the Content Delivery Service
// BEWARE: If you change the URL Root of your "Content Delivery Service" SSP Application
// you need to update all the routes of the models
define('Content.DataModels', function ()
{
	'use strict';

	// Pages:
	var Pages = {};

	// Pages.Model:
	// Represents the definition of a page
	Pages.Model = Backbone.CachedModel.extend({
		urlRoot: '../cds/services/page.ss'
	});

	// Pages.Collection:
	// Singleton containing a reference of all pages already loaded
	Pages.Collection = Backbone.CachedCollection.extend({
		url: '../cds/services/page.ss'

	,	model: Pages.Model
	}, SC.Singleton);

	// Urls:
	var Urls = {};

	// Urls.Model:
	// Represents a single url and the page definition they point to
	Urls.Model = Backbone.Model.extend({
		urlRoot: '../cds/services/url.ss'
	});

	// Urls.Collection:
	// Implements the url matching logic
	Urls.Collection = Backbone.Collection.extend({

		url: '../cds/services/url.ss'

	,	model: Urls.Model

	,	initialize: function ()
		{
			this.regExpGraphRoot = new Urls.Model({ childs: [] });
			this.regExpGraphHelper = [];
			this.landingPages = [];
			this.exactMatchHash = {};

			this.on('reset', this.reseter);
		}

		// Urls.Collection.reseter:
		// Everytime this collection is reseted, this function generates a couple of helper structures:
		// * Urls.Collection.landingPages: Array of all url pointing to a landing page
		// * Urls.Collection.exactMatchHash: Hash table of all url that does not have * in it
		// * Urls.Collection.regExpGraphRoot: Graph were urls are farther from the root when they are more specific.
	,	reseter: function ()
		{
			this.regExpGraphRoot = new Urls.Model({ childs: [] });
			this.regExpGraphHelper = [];
			this.landingPages = [];
			this.exactMatchHash = {};

			var self = this;

			// Iteates all urls
			this.each(function (model)
			{
				// If the url is * and its and its not a Landing page, it will be set as Urls.Collection.defaultModel
				if (model.get('query') === '*' && model.get('type') !== '1')
				{
					if (!Urls.Collection.defaultModel)
					{
						Urls.Collection.defaultModel = model;
					}
				}
				// If the url contains * and its and its not a Landing page,
				// It gets translated to a regular expresion and injected into the this.regExpGraphRoot
				// By compareing one another with other regular expressions (this.insertInGraph)
				else if (~model.get('query').indexOf('*') && model.get('type') !== '1')
				{
					// Creates the Regular Expresion to match urls against
					var regular_expresion = new RegExp('^' + _.map(model.get('query').split('*'), function (token)
					{
						return token.replace(/\//ig, '\\/').replace(/\?/ig, '\\?');
					}).join('(.*?)') + '$');

					// Sets the proper attributess
					model.set({
						regexp: regular_expresion,
						childs: []
					});

					// Now we insert it in the graph
					self.insertInGraph(model, self.regExpGraphRoot);

					/// We will just check if the new node is parent of a previously added node
					_.each(self.regExpGraphHelper, function (currentNode)
					{
						if (!_.contains(model.get('childs'), currentNode) && model.get('regexp').test(currentNode.get('query')))
						{
							model.get('childs').push(currentNode);
						}
					});
					self.regExpGraphHelper.push(model);
				}
				// Otherways its an exact match then we add it to this.exactMatchHash
				else
				{
					self.exactMatchHash[model.get('query')] = model;

					// if it's a landing page we should add it to the colection of url we will be adding to the router
					if (model.get('type') === '1')
					{
						self.landingPages.push(model);
					}
				}
			});
		}

		// Urls.Collection.insertInGraph:
		// Given a node it tries to injected into the graph
	,	insertInGraph: function (node, root)
		{
			var isParent = true,
				self = this;

			// walks all child nodes
			_.each(root.get('childs'), function (branch)
			{
				if (branch.get('query') !== node.get('query'))
				{
					// is it covered by a more broad expresion?
					if (branch.get('regexp').test(node.get('query')))
					{
						isParent = false;
						self.insertInGraph(node, branch);
					}
					// Is it broader than then current branch
					else if (node.get('regexp').test(branch.get('query')))
					{
						node.get('childs').push(branch);
						root.set('childs', _.without(root.get('childs'), branch));
					}
				}
			});

			// the node is not a child nor a parent is a broder
			if (isParent && !~_.indexOf(root.get('childs'), node))
			{
				root.get('childs').push(node);
			}
		}

		// Urls.Collection.findUrl:
		// For the passed in url looks for the most apropiate url model to return
	,	findUrl: function (url)
		{
			// Here we do a table hash lookup (Super fast!)
			var exact_match = this.exactMatchHash[url];

			if (exact_match)
			{
				return exact_match;
			}
			else
			{
				// lets do a lookup in our regexp graph
				this.candidates = {}; // Here we will store URL_ID : Number of edges
				this.walkRegExpGraph(url, this.regExpGraphRoot, 1);

				var result = _.max(_.pairs(this.candidates), function (candidate)
				{
					return candidate[1];
				});

				return result && typeof result === 'object' ? this.get(result[0]) : false;
			}
		}

		// Urls.Collection.walkRegExpGraph:
		// Recursive function used by the findUrl to traverse the url graph
	,	walkRegExpGraph: function (url, branch, deepth)
		{
			var self = this;
			// Walks all the childs of the current branch
			_.each(branch.get('childs'), function (new_branch)
			{
				if (new_branch.get('regexp').test(url))
				{
					// if the current child (which is also a branch) passes the test it will go down the line
					// and it adds 1 edge to the candidates object
					self.candidates[new_branch.cid] = (self.candidates[new_branch.cid]) ? self.candidates[new_branch.cid] + deepth : deepth;
					self.walkRegExpGraph(url, new_branch, deepth + 1);
				}
			});
		}

	}, SC.Singleton);

	// This is a private variable that will holds all the requests we have made, tho it's public you should try to avoid using it, and call Content.load instead
	var currentRequests = [];

	// loadPage:
	// This Function takes care of loading the content for the passed url.
	// if a done function is passed it will be called whenever we have content,
	// if no content is provided for the current url,
	// the done function will be called wirght away with false as a parameter
	function loadPage (url, donefn)
	{
		/*jshint validthis:true*/
		donefn = donefn || jQuery.noop;

		if (url)
		{
			// Looks in the array of registered urls
			var foundUrl = Urls.Collection.getInstance().findUrl(url);

			// The url is registered in the collection
			if (foundUrl)
			{
				// Gets the page for the url
				var page = Pages.Collection.getInstance().get(foundUrl.get('pageid'));

				if (page)
				{
					donefn(page);
				}
				// We don't have it need to be fetched
				else
				{
					// Fetches the page
					new Pages.Model({internalid: foundUrl.get('pageid'), id: foundUrl.get('pageid')}).fetch({
						data: {
                                                        cache: 'short'
						,	ttl: '300'
							//cache: this.Application.getConfig('cache.contentPageCdn')
						//,	ttl: this.Application.getConfig('cache.contentPageTtl')
						}
					,	killerId: this.Application.killerId
					,	reset: true
					}).done(function (page)
					{
						var pageModel = new Backbone.Model(page);
						Pages.Collection.getInstance().add(pageModel);
						donefn(pageModel);
					});
				}
			}
			// No url is found
			else
			{
				donefn(false);
			}
		}
		// No url is passed
		else
		{
			donefn(false);
		}
	}

	return {
		Urls: Urls,
		Pages: Pages,
		currentRequests: currentRequests,
		loadPage: loadPage
	};
});
