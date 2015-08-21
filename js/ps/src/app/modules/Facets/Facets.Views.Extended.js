// Facets.Views.Extended.js
// ---------------
// View that handles the item list
define('Facets.Views.Extended', ['Facets.Views', 'Cart', 'Facets.Helper', 'Categories'], function (FacetsViews, Cart, Helper, Categories)
{
	'use strict';

	_.extend(FacetsViews.Browse.prototype, {

		initialize: function (options)
		{
			this.statuses = statuses;
			this.collapsable_elements = collapsable_elements;
			this.translator = options.translator;
			this.application = options.application;

			this.category = Categories.getBranchLineFromPath(this.translator.getFacetValue('category'));
			this.category = this.category[this.category.length - 1];

			this.collapsable_elements['facet-header'] = this.collapsable_elements['facet-header'] || {
				selector: 'this.collapsable_elements["facet-header"]'
			,	collapsed: false
			};
		}

	});

	_.extend(FacetsViews.BrowseCategories.prototype, {

		initialize: function ()
		{

			var self = this;
			this.category = Categories.getBranchLineFromPath(this.options.translator.getFacetValue('category'));
			this.category = this.category[this.category.length -1];

			this.translator = this.options.translator;

			this.hasThirdLevelCategories = _.every(this.category.categories, function (sub_category)
			{
				return _.size(sub_category.categories) > 0;
			});

			this.facets = [];

			if (this.hasThirdLevelCategories)
			{
				_.each(this.category.categories, function (sub_category)
				{
					var facet = {
						configuration: {
							behavior: 'single'
						,	id: 'category'
						,	name: sub_category.itemid
						,	uncollapsible: true
						,	url: self.category.urlcomponent + '/' + sub_category.urlcomponent
						}
					,	values: {
							id: 'category'
						,	values: []
						}
					};
					_.each(sub_category.categories, function (third_level_category)
					{
						var url = self.category.urlcomponent + '/' + sub_category.urlcomponent + '/' + third_level_category.urlcomponent;

						facet.values.values.push({
							label: third_level_category.itemid
						,	url: url
						,	image: third_level_category.storedisplaythumbnail
						});
					});

					self.facets.push(facet);
				});
			}
			else
			{
				var facet = {
					configuration: {
						behavior: 'single'
					,	id: 'category'
					,	name: ''
					,	uncollapsible: true
					,	hideHeading: true
					}
				,	values: {
						id: 'category'
					,	values: []
					}
				};

				_.each(this.category.categories, function (sub_category)
				{
					var url = self.category.urlcomponent + '/' + sub_category.urlcomponent;

					facet.values.values.push({
						label: sub_category.itemid
					,	url: url
					,	image: sub_category.storedisplaythumbnail
					});
				});

				this.facets.push(facet);
			}

		}

	});

});
