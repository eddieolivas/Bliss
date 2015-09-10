// Configuration.js
// ----------------
// All of the applications configurable defaults
(function (application)
{
	'use strict';

	application.Configuration = {};

	_.extend(application.Configuration, {

		// header_macro will show an image with the url you set here
		logoUrl: _.getAbsoluteUrl('img/homepage/logo_header.png')

		// depending on the application we are configuring, used by the NavigationHelper.js
	,	currentTouchpoint: 'home'
		// list of the applications required modules to be loaded
		// de dependencies to be loaded for each module are handled by
		// [require.js](http://requirejs.org/)
	,	modules: [
			// ItemDetails should always be the 1st to be added
			// there will be routing problmes if you change it
			['ItemDetails',  {startRouter: true}]
		,	'Profile'
		,	'NavigationHelper'
		,	'BackToTop'
		,	['Cart',  {startRouter: true, saveForLater: true}]
		,	'Content'
		,	'Facets'
		,	'GoogleAnalytics'
		,	'GoogleUniversalAnalytics'
		,	'Home'
		,	'MultiCurrencySupport'
		,	'MultiHostSupport'
		,	'PromocodeSupport'
		,	'SiteSearch'
		,	'SocialSharing'
		,	'ProductReviews'
		,	'AjaxRequestsKiller'
		,	'CookieWarningBanner'
		,	'ImageNotAvailable'
		,	'ItemImageGallery'
		,	'ErrorManagement'
		,	'Merchandising'
		,	'Merchandising.Context.DefaultHandlers'
		//,	['Categories',  {addToNavigationTabs: true}]
		,	'ProductList'
		,	'ItemRelations'
		,	'ImageLoader'
		,	'UrlHelper'
		,	'CMSadapter'
		]

		// Default url for the item list
	,	defaultSearchUrl: 'search'

		// Search preferences
	,	searchPrefs:
		{
			// keyword maximum string length - user won't be able to write more than 'maxLength' chars in the search box
			maxLength: 40

			// keyword formatter function will format the text entered by the user in the search box. This default implementation will remove invalid keyword characters like *()+-="
		,	keywordsFormatter: function (keywords)
			{
				if (keywords === '||')
				{
					return '';
				}

				var anyLocationRegex = /[\(\)\[\]\{\~\}\!\"\:\/]{1}/g // characters that cannot appear at any location
				,	beginingRegex = /^[\*\-\+]{1}/g // characters that cannot appear at the begining
				,	replaceWith = ''; // replacement for invalid chars

				return keywords.replace(anyLocationRegex, replaceWith).replace(beginingRegex, replaceWith);
			}
		}

		// flag for showing or not, "add to cart" button in facet views
	,	addToCartFromFacetsView: false
		// url for the not available image
	,	imageNotAvailable: _.getAbsoluteUrl('img/no_image_available.jpeg')
		// default macros
	,	macros: {
			facet: 'facetList'

		,	itemOptions: {
				// each apply to specific item option types
				selectorByType:
				{
					select: 'itemDetailsOptionTile'
				,	'default': 'itemDetailsOptionText'
				}
				// for rendering selected options in the shopping cart
			,	selectedByType: {
					'default': 'shoppingCartOptionDefault'
				}
			}

		,	itemDetailsImage: 'itemImageGallery'

			// default merchandising zone template
		,	merchandisingZone: 'merchandisingZone'
		}
		// array of links to be added to the header
		// this can also contain subcategories
	,	navigationTabs: [
			/*{
				text: _('Home').translate()
			,	href: '/'
			,	'class': 'tab home-tab'
			,	data: {
					touchpoint: 'home'
				,	hashtag: '#'
				}
			}
		,	{
				text: _('Shop').translate()
			,	href: '/search'
			,	'class': 'tab search-tab'
			,	data: {
					touchpoint: 'home'
				,	hashtag: '#search'
				}
			}
                ,	{
				text: _('New Arrivals').translate()
			,	href: '/new-arrivals'
			,	'class': 'tab search-tab'
			,	data: {
					touchpoint: 'home'
				,	hashtag: '#itemlist'
				}
			}
                ,	{
				text: _('Furniture').translate()
			,	href: '/Furniture-2'
			,	'class': 'tab search-tab'
			,	data: {
					touchpoint: 'home'
				,	hashtag: '#Furniture-2'
				}
                        ,       categories: [
				{
						text: _('Beds').translate()
					, 	href: '/Furniture-2/beds2'
					, 	data: {
								touchpoint: 'home'
							, 	hashtag: '#furniture-2/beds2'
						}
				},
				{
						text: _('Seating').translate()
					, 	href: '/Furniture-2/beds2'
					, 	data: {
								touchpoint: 'home'
							, 	hashtag: '#furniture-2/beds2'
						}
				},
				{
						text: _('Tables').translate()
					, 	href: '/Furniture-2/beds2'
					, 	data: {
								touchpoint: 'home'
							, 	hashtag: '#furniture-2/beds2'
						}
				},
				{
						text: _('Outdoor').translate()
					, 	href: '/Furniture-2/beds2'
					, 	data: {
								touchpoint: 'home'
							, 	hashtag: '#furniture-2/beds2'
						}
				},
				{
						text: _('Chests and Drawers').translate()
					, 	href: '/Furniture-2/beds2'
					, 	data: {
								touchpoint: 'home'
							, 	hashtag: '#furniture-2/beds2'
						}
				},
				{
						text: _('Cabinets and Bookcases').translate()
					, 	href: '/Furniture-2/beds2'
					, 	data: {
								touchpoint: 'home'
							, 	hashtag: '#furniture-2/beds2'
						}
				},{
						text: _('Custom Upholstery').translate()
					, 	href: '/Furniture-2/beds2'
					, 	data: {
								touchpoint: 'home'
							, 	hashtag: '#furniture-2/beds2'
						}
				}
				
		                ]
			}
                ,	{
				text: _('Lighting').translate()
			,	href: '/lighting-2'
			,	'class': 'tab search-tab'
			,	data: {
					touchpoint: 'home'
				,	hashtag: '#lighting-2'
				}
			}
                ,	{
				text: _('Accessories').translate()
			,	href: '/Accessories'
			,	'class': 'tab search-tab'
			,	data: {
					touchpoint: 'home'
				,	hashtag: '#Accessories'
				}
			}
                ,	{
				text: _('Décor').translate()
			,	href: '/decor'
			,	'class': 'tab decor'
			,	data: {
					touchpoint: 'home'
				,	hashtag: '#decor'
				}
			}
                ,	{
				text: _('Bedding').translate()
			,	href: '/bedding'
			,	'class': 'tab bedding'
			,	data: {
					touchpoint: 'home'
				,	hashtag: '#bedding'
				}
			}
                ,	{
				text: _('Bath/Spa').translate()
			,	href: '/Bath-spa'
			,	'class': 'tab bath-spa'
			,	data: {
					touchpoint: 'home'
				,	hashtag: '#Bath-spa'
				}
			}
                ,	{
				text: _('Kitchen/Dining').translate()
			,	href: '/Kitchen-dining'
			,	'class': 'tab kitchen-dining'
			,	data: {
					touchpoint: 'home'
				,	hashtag: '#Kitchen-dining'
				}
			}
                ,	{
				text: _('Baby').translate()
			,	href: '/baby'
			,	'class': 'tab baby'
			,	data: {
					touchpoint: 'home'
				,	hashtag: '#baby'
				}
			}
                ,	{
				text: _('Sale').translate()
			,	href: '/sale'
			,	'class': 'tab sale'
			,	data: {
					touchpoint: 'home'
				,	hashtag: '#sale'
				}
			}*/
		]

	,	footerNavigation: [{text: 'Link a', href:'#'}, {text: 'Link b', href:'#'}, {text: 'Link c', href:'#'}]

		// Macro to be rendered in the header, showing your name and nav links
		// by default, we provide 'headerProfile' or 'headerSimpleProfile'
	,	profileMacro: 'headerProfile'

		// settings for the cookie warning message (mandatory for UK stores)
	,	cookieWarningBanner: {
			closable: true
		,	saveInCookie: true
		,	anchorText: _('Learn More').translate()
		,	message: _('To provide a better shopping experience, our website uses cookies. Continuing use of the site implies consent.').translate()
		}

		// options to be passed when querying the Search API
	,	searchApiMasterOptions: {

			Facets: {
				include: 'facets'
			,	fieldset: 'search'
			}

		,	itemDetails: {
				include: 'facets'
			,	fieldset: 'details'
			}
		,	relatedItems: {
				fieldset: 'relateditems_details'
			}
		,	correlatedItems: {
				fieldset: 'correlateditems_details'
		}

			// don't remove, get extended
		,	merchandisingZone: {}

		,	typeAhead: {
				fieldset: 'typeahead'
			}
		}

		// Analytics Settings
		// You need to set up both popertyID and domainName to make the default trackers work
	,	tracking: {
			// [Google Universal Analytics](https://developers.google.com/analytics/devguides/collection/analyticsjs/)
			googleUniversalAnalytics: {
				propertyID: ''
			,	domainName: ''
			}
			// [Google Analytics](https://developers.google.com/analytics/devguides/collection/gajs/)
		,	google: {
				propertyID: ''
			,	domainName: ''
			}
		}

		// Typeahead Settings
	,	typeahead: {
			minLength: 3
		,	maxResults: 8
		,	macro: 'typeahead'
		,	sort: 'relevance:asc'
		}

		// setting it to false will search in the current results
		// if on facet list page
	,	isSearchGlobal: true

		// available values are: goToCart, showMiniCart or showCartConfirmationModal
	,	addToCartBehavior: 'showCartConfirmationModal'

	,	homeTemplate: 'home'

		// settings on how each facet should display in the "narrow your results" section. Properties:
		// * name: internationalized facet name,
		// * url: hash fragment that identified the facet in the url
		// * priority: an integer grater than zero indicating for ordering facets editors. Facets with greater priority numbers will appear above others.
		// * macro: name of installed macro that renders the facet editor. Some available macros are facetRange, facetColor
		// * uncollapsible: if true the user won't be able to collapse the facet editor
		// * behavior: can be one of "range", "multi". If "range", a double slider will be showed as the editor. If "multi", multiple facet value selection will be available
		// * titleToken: format for the facet on the document title's when it is selected. Can be a string like "from $(0) to $(1)" for range behaviour or "foo $(0) bar" for others. Also it can be a function that accept the facet object as the one parameter.
		// * titleSeparator: a string separator between facets in the document's title.
	,	facets: [
			{
				id: 'category'
			,	name: _('Category').translate()
			,	priority: 10
			,	behavior: 'hierarchical'
			,	macro: 'facetCategories'
			,	uncollapsible: true
			,	titleToken: '$(0)'
			,	titleSeparator: ', '
			}
		,	
			{
				id: 'onlinecustomerprice'
			,	name: _('Price').translate()
			,	url: 'price'
			,	priority: 7
			,	behavior: 'range'
			,	macro: 'facetRange'
			,	uncollapsible: true
			,	titleToken: 'Price $(0) - $(1)'
			,	titleSeparator: ', '
			,	parser: function (value)
				{
					return _.formatCurrency(value);
				}
			}
		,
			{
					id: 'custitembeddingcolor'
				,	name: _('Color').translate()
				,	url: 'custitembeddingcolor'
				,	priority: 8
				,	behavior: 'multi'
				,	macro: 'facetList'
				,	uncollapsible: true
				,	titleToken: '$(0)'
				,	titleSeparator: ', '
			}
		,
			{
					id: 'custitembeddingsize'
				,	name: _('Size').translate()
				,	url: 'custitembeddingsize'
				,	priority: 9
				,	behavior: 'multi'
				,	macro: 'facetList'
				,	uncollapsible: true
				,	titleToken: '$(0)'
				,	titleSeparator: ', '
			}
		]
		// This options set the title for the facet browse view.
	,	defaultSearchTitle: _('Products').translate()
	,	searchTitlePrefix: _('').translate()
	,	searchTitleSufix: _('').translate()

		// Limits for the SEO generated links in the facets browser
		// Once the limits are hitted the url is replaced with # in the links
	,	facetsSeoLimits: {
			// how many facets groups will be indexed
			numberOfFacetsGroups: 2
			// for multi value facet groups how many facets values together
		,	numberOfFacetsValues: 2
			// Which options will be indexed,
			// if you omit one here, and it's present in the url it will not be indexed
		,	options: ['page', 'keywords'] // order, page, show, display, keywords
		}

	,	facetDelimiters: {
			betweenFacetNameAndValue: '/'
		,	betweenDifferentFacets: '/'
		,	betweenDifferentFacetsValues: ','
		,	betweenRangeFacetsValues: 'to'
		,	betweenFacetsAndOptions: '?'
		,	betweenOptionNameAndValue: '='
		,	betweenDifferentOptions: '&'
		}
		// Output example: /brand/GT/style/Race,Street?display=table

		// eg: a different set of delimiters
		/*
		,	facetDelimiters: {
				betweenFacetNameAndValue: '-'
			,	betweenDifferentFacets: '/'
			,	betweenDifferentFacetsValues: '|'
			,	betweenRangeFacetsValues: '>'
			,	betweenFacetsAndOptions: '~'
			,	betweenOptionNameAndValue: '/'
			,	betweenDifferentOptions: '/'
		}
		*/
		// Output example: brand-GT/style-Race|Street~display/table

		// map of image custom image sizes
		// usefull to be customized for smaller screens
	,	imageSizeMapping: {
			thumbnail: 'thumbnail' // 175 * 175
		,	main: 'main' // 600 * 600
		,	tinythumb: 'tinythumb' // 50 * 50
		,	zoom: 'zoom' // 1200 * 1200
		,	fullscreen: 'fullscreen' // 1600 * 1600
		}
		// available options for the Results per Page dropdown
	,	resultsPerPage: [
			{items: 12, name: _('Show $(0) products per page').translate('12')}
		,	{items: 24, name: _('Show $(0) products per page').translate('24'), isDefault: true}
		,	{items: 48, name: _('Show $(0) products per page').translate('48')}
		]
		// available views for the item list by selecting the macros
	,	itemsDisplayOptions: [
			{id: 'list', name: _('List').translate(), macro: 'itemCellList', columns: 1, icon: 'icon-th-list'}
		,	{id: 'table', name: _('Table').translate(), macro: 'itemCellTable', columns: 2, icon: 'icon-th-large'}
		,	{id: 'grid', name: _('Grid').translate(), macro: 'itemCellGrid', columns: 4, icon: 'icon-th', isDefault: true}
		]
		// available sorting options for the Sort By dropdown
	,	sortOptions: [
			{id: 'relevance:asc', name: _('Sort by relevance').translate(), isDefault: true}
		,	{id: 'onlinecustomerprice:asc', name: _('Sort by price, Low to High').translate()}
		,	{id: 'onlinecustomerprice:desc', name: _('Sort by price, High to Low ').translate()}
		]

	,	recentlyViewedItems: {
			useCookie: true
		,	numberOfItemsDisplayed: 6
		}

		// Settings for displaying each of the item options in the Detailed Page
		// Each of the item options are objects that extend whats comming of the api
		// This options should have (but not limited to) this keys
		// * itemOptionId: The id of an option in the item
		// * cartOptionId: The id of an option in the cart (!required, is the primary key for the mapping)
		// * label: The label that the option will be shown
		// * url: the key of the option when its stored in the url
		// * macros: An object that contains
		//    * selector: Macro that will be rendered for selecting the options (Item list and PDP)
		//    * selected: Macro that will be rendered for the item in the cart (Cart and Cart confirmation)
		// * showSelectorInList: if true the selector will be rendered in the item list
		// Be aware that some marcos may require you to configure some exrta options in order to work properly:
		// * colors: an map of the label of the color as they key and hexa or an object as the value is required by the itemDetailsOptionColor
		// We have provided some macros for you to use but you are encouraged to create your own:
		// For the selector we have created:
		// * itemDetailsOptionColor
		// * itemDetailsOptionDropdown
		// * itemDetailsOptionRadio
		// * itemDetailsOptionText
		// * itemDetailsOptionTile
		// and for the selected we have created:
		// * shoppingCartOptionDefault
		// * shoppingCartOptionColor
	,	itemOptions: [
		// Here are some examples:
		// configure a color option to use color macro
			{
				cartOptionId: 'custitembeddingcolor'
			,	label: 'Color'
			,	url: 'custitembeddingcolor'
			,	colors: {
					'Red': 'red'
				,	'Black': { type: 'image', src: 'img/black.gif', width: 22, height: 22 }
				,	'Baltic': '#888888'
				,	'Aqua': '#000000'
				}
			,	macros: {
					selector: 'itemDetailsOptionColor'
				,	selected: 'shoppingCartOptionColor'
				}
			}
		//
		// configure Gift Certificates options to change the value on the url
		// when the user is filling the values
		//	{
		//		cartOptionId: 'GIFTCERTFROM'
		//	,	url: 'from'
		//	}
		// ,	{
		//		cartOptionId: 'GIFTCERTRECIPIENTNAME'
		//	,	url: 'to'
		//	}
		// ,	{
		//		cartOptionId: 'GIFTCERTRECIPIENTEMAIL'
		//	,	url: 'to-email'
		//	}
		// ,	{
		//		cartOptionId: 'GIFTCERTMESSAGE'
		//	,	url: 'message'
		//	}
		]

		// for multi images, option that determines the id of the option
		// that handles the image change. eg: custcol_color
	,	multiImageOption: ''
		// details fields to be displayed on a stacked list on the PDP
	,	itemDetails: [
			{
				name: _('Details').translate()
			,	contentFromKey: 'storedetaileddescription'
			,	opened: true
			,	itemprop: 'description'
			}
		]

		// This object will be merged with specific pagination settings for each of the pagination calls
		// You can use it here to toggle settings for all pagination components
		// For information on the valid options check the pagination_macro.txt
	,	defaultPaginationSettings: {
			showPageList: true
		,	pagesToShow: 9
		,	showPageIndicator: true
		}

		// Product Reviews Configuration
		// -----------------------------
	,	productReviews: {
			maxRate: 5
		,	computeOverall: true
		,	reviewMacro: 'showReview'
		,	loginRequired: false
		,	filterOptions: [
				{id: 'all', name: _('All Reviews').translate(), params: {}, isDefault: true}
			,	{id: '5star', name: _('$(0) Star Reviews').translate('5'), params: {rating: 5}}
			,	{id: '4star', name: _('$(0) Star Reviews').translate('4'), params: {rating: 4}}
			,	{id: '3star', name: _('$(0) Star Reviews').translate('3'), params: {rating: 3}}
			,	{id: '2star', name: _('$(0) Star Reviews').translate('2'), params: {rating: 2}}
			,	{id: '1star', name: _('$(0) Star Reviews').translate('1'), params: {rating: 1}}
			]
		,	sortOptions: [
				{id: 'recent', name: _('Most Recent').translate(), params: {order: 'created_on:DESC'}, isDefault: true}
			,	{id: 'oldest', name: _('Oldest').translate(), params: {order: 'created_on:ASC'}}
			,	{id: 'best', name: _('Better Rated').translate(), params: {order: 'rating:DESC'}}
			,	{id: 'worst', name: _('Worst Rated').translate(), params: {order: 'rating:ASC'}}
			]
		}

	,	cache: {
			// cdn cache duration for content pages. Valid values are 'SHORT', 'MEDIUM', 'LONG'
			contentPageCdn: 'MEDIUM'

			// application cache for content pages - value in seconds and must be between 5 minutes and 2 hours
		,	contentPageTtl: 2 * 60 * 60
		}

	,	performance:
		{
			waitForUserProfile: true
		}

	,	homePage:
		{
			carouselImages: [
				_.getAbsoluteUrl('img/homepage/carousel-1.jpg')
			,	_.getAbsoluteUrl('img/homepage/carousel-2.jpg')
			,	_.getAbsoluteUrl('img/homepage/carousel-3.jpg')
			]
			// the bottom banner images will display by default as a row, so based on bootstrap grid system, there should be a count divisible
		,	bottomBannerImages: [
				_.getAbsoluteUrl('img/homepage/banner-bottom-1.jpg')
			,	_.getAbsoluteUrl('img/homepage/banner-bottom-2.jpg')
			,	_.getAbsoluteUrl('img/homepage/banner-bottom-3.jpg')
			]
		}

	});

	// Device Specific Settings
	// ------------------------
	// Calculates the width of the device, it will try to use the real screen size.
	var screen_width = window.screen ? window.screen.availWidth : window.outerWidth || window.innerWidth;

	SC.ENVIRONMENT.screenWidth = screen_width;

		/*---------------------------
	itemsDisplayOptions is set when the user loads the page with the current width of the screen device, NOT the width of the browser.
	This option is NOT responsive, so if the user loads the page with the desktop resolution, even if he resize the browser, he will still see the view of the desktop.

	Display type and columns supported by screen resolution:

	Mobile
	Display types -> List, Table
		List -> columns  [1, 2]
		Table -> columns [1, 2]

	Tablet
	Display types  -> List, Table
		List -> columns [1, 2, 3, 4, 6, 12]
		Table -> columns [1, 2, 3, 4, 6, 12]

	Desktop
	Display types	->
		List -> columns [1, 2, 3, 4, 6, 12]
		Table -> columns [1, 2, 3, 4, 6, 12]
		Grid -> columns [1, 2, 3, 4, 6, 12]
	--------------------------*/

	if (!SC.isPageGenerator())
	{
		// Phone Specific
		if (screen_width < 768)
		{
			_.extend(application.Configuration, {

				itemsDisplayOptions: [
					{ id: 'list', name: _('List').translate(), macro: 'itemCellList', columns: 1, icon: 'icon-th-list' }
				,	{ id: 'table', name: _('Table').translate(), macro: 'itemCellTable', columns: 2, icon: 'icon-th-large', isDefault: true }
				]

			,	sortOptions: [{
					id: 'relevance:asc'
				,	name: _('Relevance').translate()
				,	isDefault: true
				}]

			,	defaultPaginationSettings: {
					showPageList: false
				,	showPageIndicator: true
				}
			});
		}
		// Tablet Specific
		else if (screen_width >= 768 && screen_width < 980)
		{
			_.extend(application.Configuration, {

				itemsDisplayOptions: [
					{id: 'list', name: _('List').translate(), macro: 'itemCellList', columns: 1, icon: 'icon-th-list' , isDefault: true}
				,	{id: 'table', name: _('Table').translate(), macro: 'itemCellTable', columns: 2, icon: 'icon-th-large'}
				]

			,	sortOptions: [
					{id: 'relevance:asc', name: _('Relevance').translate(), isDefault: true}
				,	{id: 'onlinecustomerprice:asc', name: _('Price, Low to High').translate()}
				,	{id: 'onlinecustomerprice:desc', name: _('Price, High to Low ').translate()}
				]

			,	defaultPaginationSettings: {
					showPageList: true
				,	pagesToShow: 4
				,	showPageIndicator: true
				}
			});
		}
		// Desktop
		else
		{
			_.extend(application.Configuration, {

				itemsDisplayOptions: [
					{ id: 'list', name: _('List').translate(), macro: 'itemCellList', columns: 1, icon: 'icon-th-list' }
				,	{ id: 'table', name: _('Table').translate(), macro: 'itemCellTable', columns: 2, icon: 'icon-th-large' }
				,	{ id: 'grid', name: _('Grid').translate(), macro: 'itemCellGrid', columns: 4, icon: 'icon-th', isDefault: true }
				]
			});
		}
	}


	/**
	 * SEO related configuration
	 * Search Engine Optimization
	 */
	var seo_title = function (layout)
		{
			var title = layout.$('[itemprop="name"]:eq(0)').text();
			return title && title.length ? jQuery.trim(title) : '';
		}

	,	seo_url = function ()
		{
			return window.location.protocol + '//' + window.location.hostname + '/' + Backbone.history.fragment;
		}

	,	seo_domain = function (layout)
		{
			return layout.application.getConfig('siteSettings.touchpoints.home');
		}

	,	seo_image =  function (layout, number)
		{
			var $image = layout.$('[data-type="social-image"], [itemprop="image"]')
			,	my_number = typeof number === 'undefined' ? 0 : number
			,	resized_image = $image.get(my_number) ? $image.get(my_number).src : application.Configuration.imageNotAvailable
			,	resized_id = 0 === my_number ? 'main' : 'thumbnail';

			resized_image = application.resizeImage(resized_image.split('?')[0], resized_id);

			return resized_image;
		}

	,	seo_site_name = function ()
		{
			return SC.ENVIRONMENT.siteSettings.displayname;
		}

	,	seo_description = function (layout)
		{
			var social_description = layout.$('[data-type="social-description"], [itemprop="description"]').first().text();
			social_description = jQuery.trim( social_description ).replace(/\s+/g, ' ');

			return social_description && social_description.length ? social_description : '';
		}

	,	seo_twitter_description = function (layout)
		{
			var description = seo_description(layout);

			// Twitter cards requires a description less than 200 characters
			return description && description.length ? description.substring(0, 200) : '';
		}

	,	seo_provider_name = function ()
		{
			return SC.ENVIRONMENT.siteSettings.displayname;
		}

	,	seo_price = function (layout)
		{
			var price = layout.$('[itemprop="price"]:eq(0)').text();
			price = jQuery.trim( price );

			return price && price.length ? price : '';
		}

	,	seo_price_standard_amount = function (layout)
		{
			var the_num = seo_price(layout);
			return the_num && the_num.length ? the_num.replace( /^\D+/g, '') : '';
		}

	,	seo_price_currency = function (layout)
		{
			var price_currency = layout.$('[itemprop="priceCurrency"]').attr('content');
			price_currency = jQuery.trim( price_currency );

			return price_currency && price_currency.length ? price_currency : '';
		}

	,	seo_availability = function (layout)
		{
			var $availability_href = layout.$('[itemprop="availability"]')
			,	result = ''
			,	param = '';

			$availability_href = jQuery.trim( $availability_href.attr('href') );

			result= $availability_href.split('/');
			param = result[result.length - 1];

			return param && param.length ? param : '';
		}

	,	seo_rating = function (layout)
		{
			var rating = layout.$('[itemprop="ratingValue"]:eq(0)').attr('content');
			return rating && rating.length ? rating : '';
		}

	,	seo_rating_scale = function (layout)
		{
			var rating_scale = layout.$('[itemprop="bestRating"]:eq(0)').attr('content');
			return rating_scale && rating_scale.length ? rating_scale : '';
		}

	,	seo_rating_count = function (layout)
		{
			var rating_count = layout.$('[itemprop="reviewCount"]:eq(0)').text();
			return rating_count && rating_count.length ? jQuery.trim(rating_count) : '';
		}

	,	seo_twitter_site = function ()
		{
			// Use client twitter account
            return '';
		}

	,	seo_twitter_creator = function ()
		{
			// Use client twitter account
            return '';
		}

	,	seo_twitter_label_one = function ()
		{
			return 'PRICE';
		}

	,	seo_twitter_price = function (layout)
		{
			return jQuery.trim( seo_price(layout) + ' ' + seo_price_currency(layout) );
		}

	,	seo_twitter_label_two = function ()
		{
			return 'AVAILABILITY';
		}

	,	seo_twitter_image_cero = function (layout)
		{
			return seo_image(layout, 0);
		}

	,	seo_twitter_image_one = function (layout)
		{
			return seo_image(layout, 1);
		}

	,	seo_twitter_image_two = function (layout)
		{
			return seo_image(layout, 2);
		}

	,	seo_twitter_image_three = function (layout)
		{
			return seo_image(layout, 3);
		}
	,	seo_google_plus_authorship_author = function ()
		{
			// Author for individual contents
			return 'https://plus.google.com/+Blisshomeanddesign';
		}
	,	seo_google_plus_authorship_publisher = function ()
		{
			// Publisher for brand contents
			return 'https://plus.google.com/+Blisshomeanddesign';
		}
	;

	_.extend(application.Configuration, {

		linkTagGooglePlusAuthorship: {
			'author': seo_google_plus_authorship_author
		,	'publisher': seo_google_plus_authorship_publisher
		}

	,	metaTagMappingOg: {
			// [Open Graph](http://ogp.me/)
			'og:title': seo_title

		,	'og:type': function ()
			{
				return 'product';
			}

		,	'og:url': seo_url

		,	'og:image': seo_image

		,	'og:site_name': seo_site_name

		,	'og:description': seo_description

		,	'og:provider_name': seo_provider_name

		,	'og:price:standard_amount': seo_price_standard_amount

		,	'og:price:currency': seo_price_currency

		,	'og:availability': seo_availability

		,	'og:rating': seo_rating

		,	'og:rating_scale': seo_rating_scale

		,	'og:rating_count': seo_rating_count
		}

	,	metaTagMappingTwitterProductCard: {
			// [Twitter Product Card](https://dev.twitter.com/docs/cards/types/product-card)
			'twitter:card': function ()
			{
				return 'product';
			}

		,	'twitter:site': seo_twitter_site

		,	'twitter:creator': seo_twitter_creator

		,	'twitter:title': seo_title

		,	'twitter:description': seo_twitter_description

		,	'twitter:image:src': seo_image

		,	'twitter:domain': seo_domain

		,	'twitter:data1': seo_twitter_price

		,	'twitter:label1': seo_twitter_label_one

		,	'twitter:data2': seo_availability

		,	'twitter:label2': seo_twitter_label_two
		}

	,	metaTagMappingTwitterGalleryCard: {
			// [Twitter Gallery Card](https://dev.twitter.com/docs/cards/types/gallery-card)
			'twitter:card': function ()
			{
				return 'gallery';
			}

		,	'twitter:site': seo_twitter_site

		,	'twitter:creator': seo_twitter_creator

		,	'twitter:title': seo_title

		,	'twitter:description': seo_twitter_description

		,	'twitter:image0:src': seo_twitter_image_cero

		,	'twitter:image1:src': seo_twitter_image_one

		,	'twitter:image2:src': seo_twitter_image_two

		,	'twitter:image3:src': seo_twitter_image_three
		}

		// Social Sharing Services
		// -----------------------
		// Setup for Social Sharing
	,	socialSharingIconsMacro: 'socialSharingIcons'

		// hover_pin_it_buttons
	,	hover_pin_it_button: {
			enable_pin_it_hover: true
		,	enable_pin_it_button: true
		,	image_size: 'main' // Select resize id to show on Pintrest
		,	popupOptions: {
				status: 'no'
			,	resizable: 'yes'
			,	scrollbars: 'yes'
			,	personalbar: 'no'
			,	directories: 'no'
			,	location: 'no'
			,	toolbar: 'no'
			,	menubar: 'no'
			,	width: '680'
			,	height: '300'
			,	left: '0'
			,	top: '0'
			}
		}

		// Pinterest
	,	pinterest: {
			enable: true
		,	popupOptions: {
				status: 'yes'
			,	resizable: 'yes'
			,	scrollbars: 'yes'
			,	personalbar: 'no'
			,	directories: 'no'
			,	location: 'no'
			,	toolbar: 'no'
			,	menubar: 'no'
			,	width: '632'
			,	height: '270'
			,	left: '0'
			,	top: '0'
			}
		}

	,	facebook: {
			enable: true
		,	appId: '237518639652564'
		,	pluginOptions: {
				'send': 'false'
			,	'layout': 'button_count'
			,	'width': '450'
			,	'show-faces': 'false'
			}
		}

		// Twitter
	,	twitter: {
			enable: true
		,	popupOptions: {
				status: 'yes'
			,	resizable: 'yes'
			,	scrollbars: 'yes'
			,	personalbar: 'no'
			,	directories: 'no'
			,	location: 'no'
			,	toolbar: 'no'
			,	menubar: 'no'
			,	width: '632'
			,	height: '250'
			,	left: '0'
			,	top: '0'
			}
		,	via: 'BlissHomeDesign'
		}

	,	googlePlus: {
			enable: true
		,	popupOptions: {
				menubar: 'no'
			,	toolbar: 'no'
			,	resizable: 'yes'
			,	scrollbars: 'yes'
			,	height: '600'
			,	width: '600'
			}
		}

	,	addThis: {
			enable: false
		,	pubId: 'ra-50abc2544eed5fa5'
		,	toolboxClass: 'addthis_default_style addthis_toolbox addthis_button_compact'
		,	servicesToShow: {
				pinterest: 'Pinterest'
			,	facebook: 'Facebook'
			,	twitter: 'Twitter'
			,	google_plusone: ''
			,	print: _('Print').translate()
			,	email: _('Email').translate()
			,	expanded: _('More').translate()
			}

			// http://support.addthis.com/customer/portal/articles/381263-addthis-client-api#configuration-ui
		,	options: {
				username: ''
			,	data_track_addressbar: true
			// ,	services_exclude: '',
			// ,	services_compact: '',
			// ,	services_expanded: '',
			// ,	services_custom: '',
			// ,	ui_click: '',
			// ,	ui_delay: '',
			// ,	ui_hover_direction: '',
			// ,	ui_language: '',
			// ,	ui_offset_top: '',
			// ,	ui_offset_left: '',
			// ,	ui_header_color: '',
			// ,	ui_header_background: '',
			// ,	ui_cobrand: '',
			// ,	ui_use_css: '',
			// ,	ui_use_addressbook: '',
			// ,	ui_508_compliant: '',
			// ,	data_track_clickback: '',
			// ,	data_ga_tracker: '',
			}
		}
	});

})(SC.Application('Shopping'));
