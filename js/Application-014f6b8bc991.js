
// Main.js
// -------
// Defines
//  Namespace
//  a model for SiteSettings (used on the Applications)
//  methods to:
//   create and get applications
//   create singletons
//   get the SiteSettings
// Relinquish jQuery's control of the $ variable.
(function ()
{
	'use strict';
	
	// Global Name Space SC, stands for SuiteCommerce.
	var SC = window.SC = _.extend(window.SC || {}, Backbone.Events);
	
	// Make jQuery not use the $ alias
	jQuery.noConflict();
	
	// Application Creation:
	// Applications will provide by default: Layout (So your views can talk to)
	// and a Router (so you can extend them with some nice defaults)
	// If you like to create extensions to the Skeleton you should extend SC.ApplicationSkeleton
	SC._applications = {};
	SC.Application = function (application_name)
	{
		SC._applications[application_name] = SC._applications[application_name] || new SC.ApplicationSkeleton(application_name);
		return SC._applications[application_name];
	};
	
	// SC.Singleton:
	// Defines a simple getInstance method for:
	// models, collections, views or any other object to use to be used as singletons
	// How to use:
	// Backbone.[Collection, Model, View].extend({Your code}, SC.Singleton);
	// or _.extend({Object literal}, SC.Singleton);
	SC.Singleton = {
		getInstance: function ()
		{
			var This = this;
			this.instance = this.instance || new This();
			return this.instance;
		}
	};

	// Defines the template function as a noop, so it needs to be implemented by an extension
	SC.template = jQuery.noop;
	
})();

// Utils.js
// --------
// A collection of utility methods
// This are added to both SC.Utils, and Underscore.js
// eg: you could use SC.Utils.formatPhone() or _.formatPhone()
(function ()
{
	'use strict';

	// _.formatPhone:
	// Will try to reformat a phone number for a given phone Format,
	// If no format is given, it will try to use the one in site settings.
	function formatPhone (phone, format)
	{
		// fyi: the tilde (~) its used as !== -1
		var extentionSearch = phone.search(/[A-Za-z#]/)
		,	extention = ~extentionSearch ? ' '+ phone.substring(extentionSearch) : ''
		,	phoneNumber = ~extentionSearch ? ' '+ phone.substring(0, extentionSearch) : phone;

		format = format || SC.ENVIRONMENT.siteSettings.phoneformat;

		if (/^[0-9()-.\s]+$/.test(phoneNumber) && format)
		{
			var format_tokens = {}
			,	phoneDigits = phoneNumber.replace(/[()-.\s]/g, '');

			switch (format)
			{
			// c: country, ab: area_before, aa: area_after, d: digits
			case '(123) 456-7890':
				format_tokens = {c: ' ', ab: '(', aa: ') ', d: '-'};
				break;
			case '123 456 7890':
				format_tokens = {c: ' ', ab: '', aa: ' ', d: ' '};
				break;
			case '123-456-7890':
				format_tokens = {c: ' ', ab: '', aa: '-', d: '-'};
				break;
			case '123.456.7890':
				format_tokens = {c: ' ', ab: '', aa: '.', d: '.'};
				break;
			default:
				return phone;
			}

			switch (phoneDigits.length)
			{
			case 7:
				return phoneDigits.substring(0, 3) + format_tokens.d + phoneDigits.substring(3) + extention;
			case 10:
				return format_tokens.ab + phoneDigits.substring(0, 3) + format_tokens.aa + phoneDigits.substring(3, 6) + format_tokens.d + phoneDigits.substring(6) + extention;
			case 11:
				return phoneDigits.substring(0, 1) + format_tokens.c + format_tokens.ab + phoneDigits.substring(1, 4) + format_tokens.aa + phoneDigits.substring(4, 7) + format_tokens.d + phoneDigits.substring(7) + extention;
			default:
				return phone;
			}
		}

		return phone;
	}

	// Convert a date object to string using international format YYYY-MM-dd
	// Useful for inputs of type="date"
	function dateToString (date)
	{
		var month = ''+(date.getMonth()+1)
		,	day = ''+ date.getDate();

		if (month.length === 1)
		{
			month = '0' + month;
		}

		if (day.length === 1)
		{
			day = '0'+day;
		}

		return date.getFullYear() + '-' + month + '-' + day;
	}

	//This method parse a string date into a date object.
	// str_date: String date.
	// options.format: String format that specify the format of the input string. By Default YYYY-MM-dd.
	// options.plusMonth: Number that indicate how many month offset should be applied whne creating the date object.
	function stringToDate (str_date, options)
	{
		options = _.extend({
			format: 'YYYY-MM-dd'
		,	plusMonth: -1
		,	dateSplitCharacter: '-'
		}, options || {});

		//plumbing
		var date_parts = str_date ? str_date.split(options.dateSplitCharacter) : []
		,	format_parts = options.format ? options.format.split('-') : []
		,	year_index = _.indexOf(format_parts, 'YYYY') >= 0 ? _.indexOf(format_parts, 'YYYY') : 2
		,	month_index = _.indexOf(format_parts, 'MM') >= 0 ? _.indexOf(format_parts, 'MM') : 1
		,	day_index = _.indexOf(format_parts, 'dd') >= 0 ? _.indexOf(format_parts, 'dd') : 0
		//Date parts
		,	year = parseInt(date_parts[year_index], 10)
		,	month = parseInt(date_parts[month_index], 10) + (options.plusMonth || 0)
		,	day = parseInt(date_parts[day_index], 10)
		,	result = new Date(year, month, day);

		if (!(result.getMonth() !== month || day !== result.getDate() || result.getFullYear() !== year))
		{
			return result;
		}
	}

	function isDateValid (date)
	{
		if (Object.prototype.toString.call(date) === '[object Date]')
		{
			// it is a date
			if (isNaN(date.getTime()))
			{
				// d.valueOf() could also work
				// date is not valid
				return false;
			}
			else
			{
				// date is valid
				// now validate the values of day, month and year
				var dtDay = date.getDate()
				,   dtMonth= date.getMonth() + 1
				,   dtYear = date.getFullYear()
				,   pattern = /^\d{4}$/;

				if (!pattern.test(dtYear))
				{
					return false;
				}
				else if (dtMonth < 1 || dtMonth > 12)
				{
					return false;
				}
				else if (dtDay < 1 || dtDay > 31)
				{
					return false;
				}
				else if ((dtMonth === 4 || dtMonth ===6 || dtMonth === 9 || dtMonth === 11) && dtDay  === 31)
				{
					return false;
				}
				else if (dtMonth === 2)
				{
					var isleap = (dtYear % 4 === 0 && (dtYear % 100 !== 0 || dtYear % 400 === 0));
					if (dtDay> 29 || (dtDay === 29 && !isleap))
					{
						return false;
					}
				}

				return true;
			}
		}
		else
		{
			// not a date
			return false;
		}
	}

	function paymenthodIdCreditCart (cc_number)
	{
		// regex for credit card issuer validation
		var cards_reg_ex = {
			'VISA': /^4[0-9]{12}(?:[0-9]{3})?$/
		,	'Master Card': /^5[1-5][0-9]{14}$/
		,	'American Express': /^3[47][0-9]{13}$/
		,	'Discover': /^6(?:011|5[0-9]{2})[0-9]{12}$/
		,	'Maestro': /^(?:5[0678]\d\d|6304|6390|67\d\d)\d{8,15}$/
		}

		// get the credit card name
		,	paymenthod_name;

		// validate that the number and issuer
		_.each(cards_reg_ex, function (reg_ex, name)
		{
			if (reg_ex.test(cc_number))
			{
				paymenthod_name = name;
			}
		});

		var paymentmethod = paymenthod_name && _.findWhere(SC.ENVIRONMENT.siteSettings.paymentmethods, {name: paymenthod_name.toString()});

		return paymentmethod && paymentmethod.internalid;
	}


	function validateSecurityCode (value)
	{
		var ccsn = jQuery.trim(value);

		if (!ccsn)
		{
			return _('Security Number is required').translate();
		}

		if (!(Backbone.Validation.patterns.number.test(ccsn) && (ccsn.length === 3 || ccsn.length === 4)))
		{
			return _('Security Number is invalid').translate();
		}
	}

	function validatePhone (phone)
	{
		var minLength = 7;


		if (_.isNumber(phone))
		{
			// phone is a number so we can't ask for .length
			// we elevate 10 to (minLength - 1)
			// if the number is lower, then its invalid
			// eg: phone = 1234567890 is greater than 1000000, so its valid
			//     phone = 123456 is lower than 1000000, so its invalid
			if (phone < Math.pow(10, minLength - 1))
			{
				return _('Phone Number is invalid').translate();
			}
		}
		else if (phone)
		{
			// if its a string, we remove all the useless characters
			var value = phone.replace(/[()-.\s]/g, '');
			// we then turn the value into an integer and back to string
			// to make sure all of the characters are numeric

			//first remove leading zeros for number comparison
			while(value.length && value.substring(0,1) === '0')
			{
				value = value.substring(1, value.length);
			}
			if (parseInt(value, 10).toString() !== value || value.length < minLength)
			{
				return _('Phone Number is invalid').translate();
			}
		}
		else
		{
			return _('Phone is required').translate();
		}

	}

	function validateState (value, valName, form)
	{
		var countries = SC.ENVIRONMENT.siteSettings.countries || {};
		if (countries[form.country] && countries[form.country].states && value === '')
		{
			return _('State is required').translate();
		}
	}

	function validateZipCode (value, valName, form)
	{
		var countries = SC.ENVIRONMENT.siteSettings.countries || {};
		if (!value && (!form.country || countries[form.country] && countries[form.country].isziprequired === 'T'))
		{
			return _('Zip Code is required').translate();
		}
	}

	// translate:
	// used on all of the harcoded texts in the templates
	// gets the translated value from SC.Translations object literal
	function translate (text)
	{
		if (!text)
		{
			return '';
		}

		text = text.toString();
		// Turns the arguments object into an array
		var args = Array.prototype.slice.call(arguments)

		// Checks the translation table
		,	result = SC.Translations && SC.Translations[text] ? SC.Translations[text] : text;

		if (args.length && result)
		{
			// Mixes in inline variables
			result = result.format.apply(result, args.slice(1));
		}

		return result;
	}

	// getFullPathForElement:
	// returns a string containing the path
	// in the DOM tree of the element
	function getFullPathForElement (el)
	{
		var names = [], c, e;

		while (el.parentNode)
		{
			if (el.id)
			{
				// if a parent element has an id, that is enough for our path
				names.unshift('#'+ el.id);
				break;
			}
			else if(el === document.body)
			{
				names.unshift('HTML > BODY');
				break;
			}
			else if(el === (document.head || document.getElementsByTagName('head')[0]))
			{
				names.unshift('HTML > HEAD');
				break;
			}
			else if (el === el.ownerDocument.documentElement)
			{
				names.unshift(el.tagName);
				break;
			}
			else
			{
				e = el;
				for (c = 1; e.previousElementSibling; c++)
				{
					e = e.previousElementSibling;
				}
				names.unshift(el.tagName +':nth-child('+ c +')');
				el = el.parentNode;
			}
		}

		return names.join(' > ');
	}

	function formatCurrency (value, symbol)
	{
		var value_float = parseFloat(value);

		if (isNaN(value_float))
		{
			return value;
		}

		var negative = value_float < 0;
		value_float = Math.abs(value_float);
		value_float = parseInt((value_float + 0.005) * 100, 10) / 100;

		var value_string = value_float.toString()

		,	groupseparator = ','
		,	decimalseparator = '.'
		,	negativeprefix = '('
		,	negativesuffix = ')'
		,	settings = SC && SC.ENVIRONMENT && SC.ENVIRONMENT.siteSettings ? SC.ENVIRONMENT.siteSettings : {};

		if (Object.prototype.hasOwnProperty.call(window,'groupseparator'))
		{
			groupseparator = window.groupseparator;
		}
		else if (Object.prototype.hasOwnProperty.call(settings,'groupseparator'))
		{
			groupseparator = settings.groupseparator;
		}

		if (Object.prototype.hasOwnProperty.call(window,'decimalseparator'))
		{
			decimalseparator = window.decimalseparator;
		}
		else if (Object.prototype.hasOwnProperty.call(settings, 'decimalseparator'))
		{
			decimalseparator = settings.decimalseparator;
		}

		if (Object.prototype.hasOwnProperty.call(window,'negativeprefix'))
		{
			negativeprefix = window.negativeprefix;
		}
		else if (Object.prototype.hasOwnProperty.call(settings,'negativeprefix'))
		{
			negativeprefix = settings.negativeprefix;
		}

		if (Object.prototype.hasOwnProperty.call(window,'negativesuffix'))
		{
			negativesuffix = window.negativesuffix;
		}
		else if (Object.prototype.hasOwnProperty.call(settings,'negativesuffix'))
		{
			negativesuffix = settings.negativesuffix;
		}

		value_string = value_string.replace('.',decimalseparator);
		var decimal_position = value_string.indexOf(decimalseparator);

		// if the string doesn't contains a .
		if (!~decimal_position)
		{
			value_string += decimalseparator+'00';
			decimal_position = value_string.indexOf(decimalseparator);
		}
		// if it only contains one number after the .
		else if (value_string.indexOf(decimalseparator) === (value_string.length - 2))
		{
			value_string += '0';
		}

		var thousand_string = '';
		for (var i=value_string.length-1; i>=0; i--)
		{
								//If the distance to the left of the decimal separator is a multiple of 3 you need to add the group separator
			thousand_string =	(i > 0 && i < decimal_position && (((decimal_position-i) % 3) === 0) ? groupseparator : '') +
								value_string[i] + thousand_string;
		}

		if (!symbol)
		{
			if (typeof session !== 'undefined' && session.getShopperCurrency)
			{
				symbol = session.getShopperCurrency().symbol;
			}
			else if (settings.shopperCurrency)
			{
				symbol = settings.shopperCurrency.symbol;
			}
			else if (SC.getSessionInfo('currentCurrency'))
			{
				symbol = SC.getSessionInfo('currentCurrency').symbol;
			}

			if (!symbol)
			{
				symbol = '$';
			}
		}

		value_string  = symbol + thousand_string;

		return negative ? (negativeprefix + value_string + negativesuffix) : value_string;
	}

	// Formats a non-negative number with commas as thousand separator (e.g. for displaying quantities)
	function formatQuantity (number)
	{
		var result = []
		,	parts = ('' + number).split('.')
		,	integerPart = parts[0].split('').reverse();

		for (var i = 0; i < integerPart.length; i++)
		{
			if (i > 0 && (i % 3 === 0))
			{
				result.unshift(',');
			}

			result.unshift(integerPart[i]);
		}

		if (parts.length > 1)
		{
			result.push('.');
			result.push(parts[1]);
		}

		return result.join('');
	}

	function highlightKeyword (text, keyword)
	{
		text = text || '';
		if(!keyword)
		{
			return text;
		}

		keyword = jQuery.trim(keyword).replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');

		return text.replace(new RegExp('('+ keyword +')', 'ig'), function ($1, match)
		{
			return '<strong>' + match + '</strong>';
		});
	}

	function substitute (text, object)
	{
		text = text || '';

		return text.replace(/\{(\w+)\}/g, function (match, key)
		{
			return typeof object[key] !== 'undefined' ? object[key] : match;
		});
	}

	// iterates a collection of objects, runs a custom function getValue on each item and then joins them
	// returns a string.
	function collectionToString (options)
	{
		var temp = [];
		_.each(options.collection, function (item)
		{
			temp.push(options.getValue(item));
		});

		return temp.join(options.joinWith);
	}

	// params map
	function addParamsToUrl (baseUrl, params)
	{
		// We get the search options from the config file
		if (params && _.keys(params).length)
		{
			var paramString = jQuery.param(params)
			,	join_string = ~baseUrl.indexOf('?') ? '&' : '?';

			return baseUrl + join_string + paramString;
		}
		else
		{
			return baseUrl;
		}
	}

	// parseUrlOptions:
	// Takes a url with options (or just the options part of the url) and returns an object. You can do the reverse operation (object to url string) using jQuery.param()
	function parseUrlOptions (options_string)
	{
		options_string = options_string || '';

		if (~options_string.indexOf('?'))
		{
			options_string = _.last(options_string.split('?'));
		}

		if (~options_string.indexOf('#'))
		{
			options_string = _.first(options_string.split('#'));
		}

		var options = {};

		if (options_string.length > 0)
		{
			var tokens = options_string.split(/\&/g)
			,	current_token;

			while (tokens.length > 0)
			{
				current_token = tokens.shift().split(/\=/g);

				if (current_token[0].length === 0)
				{
					continue;
				}

				options[current_token[0]] = decodeURIComponent(current_token[1]);
			}
		}

		return options;
	}

	function objectToStyles (obj)
	{
		return _.reduce(obj, function (memo, value, index)
		{
			return memo += index + ':' + value + ';';
		}, '');
	}

	// simple hyphenation of a string, replaces non-alphanumerical characters with hyphens
	function hyphenate (string)
	{
		return string.replace(/[\W]/g, '-');
	}

	function objectToAtrributes (obj, prefix)
	{
		prefix = prefix ? prefix + '-' : '';

		return _.reduce(obj, function (memo, value, index)
		{
			if (index !== 'text' && index !== 'categories')
			{
				memo += ' ' + prefix;

				if (index.toLowerCase() === 'css' || index.toLowerCase() === 'style')
				{
					index = 'style';
					// styles value has to be an obj
					value = objectToStyles(value);
				}

				if (_.isObject(value))
				{
					return memo += objectToAtrributes(value, index);
				}

				memo += index;

				if (value)
				{
					memo += '="' + value + '"';
				}
			}

			return memo;
		}, '');
	}

	function resizeImage (sizes, url, size)
	{
		var resize = _.where(sizes, {name: size})[0];

		if (!!resize)
		{
			return url + (~url.indexOf('?') ? '&' : '?') + resize.urlsuffix;
		}

		return url;
	}

	function getAbsoluteUrl (file)
	{
		var base_url = SC.ENVIRONMENT.baseUrl
		,	fileReplace = file ? file : '';
		return base_url ? base_url.replace('{{file}}', fileReplace) : file;
	}

	function getDownloadPdfUrl (params)
	{
		params = params || {};
		params.n = SC.ENVIRONMENT.siteSettings.siteid;

		var origin = window.location.origin ? window.location.origin :
				(window.location.protocol + '//' + window.location.hostname + (window.location.port ? (':' + window.location.port) : ''));
		return  _.addParamsToUrl(origin + _.getAbsoluteUrl('download.ssp'), params);
	}

	//Fixes anchor elements, preventing default behavior so that
	//they do not change the views (ie: checkout steps)
	function preventAnchorNavigation (selector)
	{
		jQuery(selector).on('click', function (e)
		{
			e.preventDefault();
		});
	}

	// The reason for this method is be able to test logic regarding window.location - so tests can mock the window object
	function getWindow()
	{
		return window;
	}

	// Performs a POST operation to a specific url
	function doPost (url)
	{
		var form = jQuery('<form id="do-post" method="POST" action="' + url + '"></form>').hide();

		// we have to append it to the dom  for browser compatibility
		// check if the form already exists (user could cancel the operation before it gets to the submit)
		var do_post = jQuery('#do-post');
		if(do_post && do_post[0])
		{
			do_post[0].action = url;
			do_post[0].method = 'POST';
		}
		else
		{
			jQuery('html').append(form);
			do_post = jQuery('#do-post');
		}

		do_post[0].submit();
	}

	function getPathFromObject (object, path, default_value)
	{
		if (!path)
		{
			return object;
		}
		else if (object)
		{
			var tokens = path.split('.')
			,	prev = object
			,	n = 0;

			while (!_.isUndefined(prev) && n < tokens.length)
			{
				prev = prev[tokens[n++]];
			}

			if (!_.isUndefined(prev))
			{
				return prev;
			}
		}

		return default_value;
	}

	function setPathFromObject(object, path, value)
	{
		if (!path)
		{
			return;
		}
		else if (!object)
		{
			return;
		}

		var tokens = path.split('.')
		,	prev = object;

		for(var token_idx = 0; token_idx < tokens.length-1; ++token_idx)
		{
			var current_token = tokens[token_idx];

			if( _.isUndefined(prev[current_token]))
			{
				prev[current_token] = {};
			}
			prev = prev[current_token];
		}
		
		prev[_.last(tokens)] = value;
	}

	function getItemLinkAttributes (item)
	{
		var url = _(item.get('_url') + item.getQueryStringWithQuantity(1)).fixUrl()
		,	link_attributes = '';

		if (url)
		{
			link_attributes = {
				href: url
			};

			if (SC.ENVIRONMENT.siteType === 'ADVANCED')
			{
				_.extend(link_attributes, {
					data: {
						touchpoint: 'home'
					,	hashtag: '#' + url
					}
				});
			}
		}

		return _.objectToAtrributes(link_attributes);
	}

	function ellipsis (selector)
	{
		if (!jQuery(selector).data('ellipsis'))
		{
			var values = ['', '.', '..', '...', '..', '.']
			// var values = ['┏(°.°)┛', '┗(°.°)┛', '┗(°.°)┓', '┏(°.°)┓']
			,	count = 0
			,	timer = null
			,	element = jQuery(selector);

			element.data('ellipsis', true);
			element.css('visibility', 'hidden');
			element.html('...');
			// element.html('┏(°.°)┛');
			element.css('width', element.css('width'));
			element.css('display', 'inline-block');
			element.html('');
			element.css('visibility', 'visible');

			timer = setInterval(function ()
			{
				if (jQuery(selector).length)
				{
					element.html(values[count % values.length]);
					count++;
				}
				else
				{
					clearInterval(timer);
					element = null;
				}
			}, 250);
		}
	}

	function reorderUrlParams (url)
	{
		var params = []
		,	url_array = url.split('?');

		if (url_array.length > 1)
		{
			params = url_array[1].split('&');
			return url_array[0] + '?' + params.sort().join('&');
		}

		return url_array[0];
	}

	// search within a given url the values of the shopper session 
	function getSessionParams (url)
	{
		// add session parameters to target host
		var params = {}
		,	ck = _.getParameterByName(url, 'ck')
		,	cktime = _.getParameterByName(url, 'cktime');

		if (ck && cktime)
		{
			params.ck = ck;
			params.cktime = cktime;
		}

		return params;
	}

	function getParameterByName(url, param_name) {
		param_name = param_name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + param_name + '=([^&#]*)')
		,	results = regex.exec(url);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	}

	// Algorithm to search an item in the cart
	// We can't use internalid only because for matrix items, the internalid change when is added to the cart
	function findItemInCart(findItem, cart)
	{
		return cart.get('lines').find(function(item) 
		{
			var internalid = findItem.get('internalid')
			,	childs = findItem.getSelectedMatrixChilds();
			
			item = item.get('item');

			if (childs && childs.length === 1)
			{
				internalid = childs[0].get('internalid');
			}

			if ((findItem.get('internalid') === item.get('internalid') || internalid === item.get('internalid')) && _.size(findItem.itemOptions) === _.size(item.itemOptions))
			{
				var keys = _.keys(item.itemOptions);
				for (var i = 0; i < keys.length; i++) 
				{
					if (!findItem.itemOptions[keys[i]] || findItem.itemOptions[keys[i]].internalid !== item.itemOptions[keys[i]].internalid)
					{
						return;
					}
				}

				return item;
			}
		});
	}

	SC.Utils = {
		translate: translate
	,	substitute: substitute
	,	paymenthodIdCreditCart: paymenthodIdCreditCart
	,	formatPhone: formatPhone
	,	dateToString: dateToString
	,	isDateValid: isDateValid
	,	stringToDate: stringToDate
	,	validatePhone: validatePhone
	,	validateState: validateState
	,	validateZipCode: validateZipCode
	,	validateSecurityCode: validateSecurityCode
	,	formatCurrency: formatCurrency
	,	formatQuantity: formatQuantity
	,	highlightKeyword: highlightKeyword
	,	getFullPathForElement: getFullPathForElement
	,	collectionToString: collectionToString
	,	addParamsToUrl: addParamsToUrl
	,	parseUrlOptions: parseUrlOptions
	,	objectToAtrributes: objectToAtrributes
	,	resizeImage: resizeImage
	,	hyphenate: hyphenate
	,	getAbsoluteUrl: getAbsoluteUrl
	,	preventAnchorNavigation: preventAnchorNavigation
	,	getWindow: getWindow
	,	getDownloadPdfUrl: getDownloadPdfUrl
	,	doPost: doPost
	,	getPathFromObject: getPathFromObject
	,	setPathFromObject: setPathFromObject
	,	getItemLinkAttributes: getItemLinkAttributes
	,	ellipsis: ellipsis
	,	reorderUrlParams: reorderUrlParams
	,	getSessionParams: getSessionParams
	,	findItemInCart: findItemInCart
	,	getParameterByName: getParameterByName
	};

	// We extend underscore with our utility methods
	// see http://underscorejs.org/#mixin
	_.mixin(SC.Utils);

})();

// ApplicationSkeleton.js
// ----------------------
// Defines the top level components of an application
// like the name, layout, or the start function
(function ()
{
	'use strict';

	function ApplicationSkeleton (name)
	{
		// Enforces new object to be created even if you do ApplicationSkeleton() (without new)
		if (!(this instanceof ApplicationSkeleton))
		{
			return new ApplicationSkeleton();
		}

		// Application Default settings:
		this.Configuration = {};

		this.name = name;
	}

		// Wraps the SC.Utils.resizeImage and passes in the settings it needs
	ApplicationSkeleton.prototype.resizeImage = function (url, size)
	{
		var mapped_size = this.getConfig('imageSizeMapping.'+ size, size);
		return SC.Utils.resizeImage(this.getConfig('siteSettings.imagesizes', []), url, mapped_size);
	};

	// Layout:
	// This View will be created and added to the dom as soon as the app starts.
	// All module's views will get into the dom through this view by calling
	// either showContent, showInModal, showError or other application specific method
	ApplicationSkeleton.prototype.Layout = Backbone.View.extend({
		// this is the tag asociated to the .txt file
		template: 'layout'
		// where it will be appended
	,	container_element: '#main'
		// where the content (views) will be apended
	,	content_element: '#content'

	,	key_elements: {}

	,	events: {}

	,	initialize: function (Application)
		{
			this.events =
			{
				'click [data-type="post-to-touchpoint"]': 'touchpointPost'
			,	'click [data-action="items-expander"]' : 'itemsExpander'
			,	'click [data-action="dropdown-expander"]' : 'dropdownExpander'
			};
			this.application = Application;

			this.afterAppendViewPromise = jQuery.Deferred();
			var self = this;
			this.once('afterAppendView', function ()
			{
				self.afterAppendViewPromise.resolve();
			});
		}

	,	render: function ()
		{
			this.trigger('beforeRender', this);

			Backbone.View.prototype.render.call(this);

			this.updateUI();

			this.trigger('afterRender', this);
		}

	,	updateHeader: function ()
		{
			if (this.application.getConfig('siteSettings.sitetype') === 'ADVANCED')
			{
				this.$('.site-header').html(SC.macros.header(this));
				this.updateUI(); //notify the layout we have change its internal DOM
			}
		}

	,	updateFooter: function()
		{
			if (this.application.getConfig('siteSettings.sitetype') === 'ADVANCED')
			{
				this.$('.site-footer').html(SC.macros.footer(this));
				this.updateUI(); //notify the layout we have change its internal DOM
			}
		}

		// update the internal dom references (this.key_elements) . Since this method (should) is called when important markup is updated/added dynamically it is wrapped by those modules who need to enrich the content like the Content Delivery module.
	,	updateUI: function ()
		{
			var self = this;

			// Re-usable Layout Dom elements
			// We will generate an association to the jQuery version of the elements in the key_elements obj
			_.each(this.key_elements, function (element_selector, element_name)
			{
				self['$' + element_name] = self.$(element_selector);
			});

			// We need to ensure the content element is this.content_element
			// if you wish to change the selector do it directly to this prop
			this.$content = this.$(this.content_element);
			this.trigger('afterRender', this);
		}

	,	appendToDom: function ()
		{
			var self = this;
			this.afterAppendViewPromise.done(function ()
			{
				var isPageGenerator = _.result(SC,'isPageGenerator');
				
				self.trigger('beforeAppendToDom', self);

				if (isPageGenerator && !SC.blurInitialHTML) 
				{
					jQuery('<noscript></noscript>').append(self.$el).appendTo(jQuery(self.container_element)); 
				}
				else 
				{
					jQuery(self.container_element).html(self.$el);
				}

				if (!isPageGenerator)
				{
					jQuery(self.container_element).removeClass('blurred').removeClass('ie').css('filter', '');
				}
				self.trigger('afterAppendToDom', self);
			});

		}

	,	getApplication: function ()
		{
			return this.application;
		}

		// perform a POST operation to the specified touchpoint ('post-touchpoint')
	,	touchpointPost: function(e)
		{
			var touchpoint = this.$(e.target).data('post-touchpoint')
			,	touchpoints = SC.getSessionInfo('touchpoints')
			,	target_touchpoint = (touchpoints ? touchpoints[touchpoint] : '') || ''
			,	new_url = _.fixUrl(target_touchpoint);

			_.doPost(new_url);
		}

	,	itemsExpander: function (e)
		{
			e.preventDefault();

			jQuery(e.currentTarget)
				.parent().find('[data-action="items-expander"] a i').toggleClass('icon-minus').end()
				.find('[data-content="items-body"]').stop().slideToggle();
		}

	,	dropdownExpander: function (e)
		{
			e.preventDefault();

			jQuery(e.currentTarget)
				.parent().find('[data-action="dropdown-expander"] a i').toggleClass('icon-chevron-up').end()
				.find('[data-content="items-body"]').stop().slideToggle();
		}

		// Defining the interface for this class
		// All modules will interact with the layout trough this methods
		// some others may be added as well
	,	showContent: jQuery.noop
	,	showInModal: jQuery.noop
	,	showError: jQuery.noop
	,	showSuccess: jQuery.noop

	});

	ApplicationSkeleton.prototype.getLayout = function getLayout ()
	{
		this._layoutInstance = this._layoutInstance || new this.Layout(this);
		return this._layoutInstance;
	};


	// ApplicationSkeleton.getConfig:
	// returns the configuration object of the aplication
	// if a path is applied, it returns that attribute of the config
	// if nothing is found, it returns the default value
	ApplicationSkeleton.prototype.getConfig = function getConfig (path, default_value)
	{
		return _.getPathFromObject(this.Configuration, path, default_value);
	};

	ApplicationSkeleton.prototype.UserModel = Backbone.Model.extend({});

	ApplicationSkeleton.prototype.getUser = function ()
	{

		if (!this.user_instance)
		{
			this.user_instance = new this.UserModel();
		}
		return this.user_instance;
	};

	// Because the application MAY load the user's profile asynchronous some modules may want to register when the profile is ready
	// to be used application.getUser(). Note: from views is OK to call getUser() directly, but for mountToApp(), please call getUserPromise() first!
	// the profile itself it is responsible of resolving the SC.PROFILE_PROMISE global promise (like in sc.user.environment.ssp)
	ApplicationSkeleton.prototype.getUserPromise = function()
	{
		var self = this;
		if (!SC.PROFILE_PROMISE)
		{
			SC.PROFILE_PROMISE = jQuery.Deferred().done(function(profile)
			{
				self.getUser().set(profile);
			});
		}

		if (SC.ENVIRONMENT.PROFILE && SC.PROFILE_PROMISE.state() !== 'resolved')
		{
			SC.PROFILE_PROMISE.resolve(SC.ENVIRONMENT.PROFILE);
		}
		return SC.PROFILE_PROMISE;
	};

	ApplicationSkeleton.prototype.start = function start (done_fn)
	{

		// trigger beforeStart before loading modules so users have a chance to include new modules at this point.
		this.trigger('beforeStart', self);

		var self = this
			// Here we will store
		,	module_options = {}
			// we get the list of modules from the config file
		,	modules_list = _.map(self.getConfig('modules', []), function (module)
			{
				// we check all the options are strings
				if (_.isString(module))
				{
					return module;
				}
				// for the ones that are the expectation is that it's an array,
				// where the 1st index is the name of the modules and
				// the rest are options for the mountToApp function
				else if (_.isArray(module))
				{
					module_options[module[0]] = module.slice(1);
					return module[0];
				}
			});

		// we use require.js to load the modules
		// require.js takes care of the dependencies between modules
		require(modules_list, function ()
		{
			// then we set the modules to the aplication
			// the keys are the modules_list (names)
			// and the values are the loaded modules returned in the arguments by require.js
			self.modules = _.object(modules_list, arguments);

			self.modulesMountToAppResult = {};

			// we mount each module to our application
			_.each(self.modules, function (module, module_name)
			{
				// We pass the application and the arguments from the config file to the mount to app function
				var mount_to_app_arguments = _.union([self], module_options[module_name] || []);
				if (module && _.isFunction(module.mountToApp))
				{
					self.modulesMountToAppResult[module_name] = module.mountToApp.apply(module, mount_to_app_arguments);
				}
			});

			// This checks if you have registered modules
			if (!Backbone.history)
			{
				throw new Error('No Backbone.Router has been initialized (Hint: Are your modules properly set?).');
			}

			self.trigger('afterModulesLoaded', self);

			done_fn && _.isFunction(done_fn) && done_fn(self);

			self.trigger('afterStart', self);
		});
	};

	// We allow ApplicationSkeleton to listen and trigger custom events
	// http://backbonejs.org/#Events
	_.extend(ApplicationSkeleton.prototype, Backbone.Events);

	SC.ApplicationSkeleton = ApplicationSkeleton;

})();

// ApplicationSkeleton.Layout.showContent.js
// -----------------------------------------
// Renders a View into the layout
// if the view needs to be rendered in a modal, it does so
// triggers a few different events on the layout
(function ()
{
	'use strict';

	SC.ApplicationSkeleton.prototype.Layout.prototype.showContent = function showContent (view, dont_scroll)
	{
		// if the user profile has not been loaded this makes it wait untill its done.
		var user_promise = this.application.getUserPromise();
		if (user_promise.state() !== 'resolved')
		{
			var self = this;
			user_promise.done(function()
			{
				self.render();
				// force backbone to reroute the current route. https://github.com/jashkenas/backbone/issues/652
				Backbone.history.loadUrl(Backbone.history.fragment);
			});

			if (this.application.getConfig('performance.waitForUserProfile'))
			{
				return jQuery.Deferred();
			}
		}

		var current_view = this.currentView;

		// if the current view displays a bootstrap modal manually (without calling view.showInModal)
		// then it is neccessary to clean up the modal backdrop manually here
		jQuery('.modal').modal('hide');

		if (view.inModal)
		{
			return view.showInModal();
		}

		// We render the layout only once, the first time showContent is called
		if (!this.rendered)
		{
			this.render();
			this.rendered = true;
		}

		// This line will destroy the view only if you are adding a diferent instance of a view
		if (current_view && current_view !== view)
		{
			current_view.destroy();

			if (current_view.bodyClass)
			{
				this.$el.removeClass(current_view.bodyClass);
			}
		}

		// the layout should have only one view, the currentView
		this.currentView = view;

		// Empties the content first, so events dont get unbind
		this.$content.empty();
		view.render();

		if (view.bodyClass)
		{
			this.$el.addClass(view.bodyClass);
		}

		//document's title
		document.title = view.title || '';

		this.trigger('beforeAppendView', view);
		this.$content.append(view.$el);
		this.trigger('afterAppendView', view);

		view.isRenderedInLayout = true;

		// Sometimes we do not want to scroll top when the view is rendered
		// Eventually we might change view and dont_scroll to an option obj
		if (!dont_scroll)
		{
			jQuery(document).scrollTop(0);
		}

		// we need to return a promise always, as show content might be async
		return jQuery.Deferred().resolveWith(this, [view]);
	};

})();

// ApplicationSkeleton.Layout.showInModal.js
// -----------------------------------------
// Shows a view inside of a modal
// Uses Bootstrap's Modals http://twitter.github.com/bootstrap/javascript.html#modals
// All of the ids are added the prefix 'in-modal-' to avoid duplicated ids in the DOM
(function ()
{
	'use strict';

	// the last opened modal will be hold in this var
	var current_modal;

	_.extend(SC.ApplicationSkeleton.prototype.Layout.prototype, {

		wrapModalView: function (view)
		{
			// If the view doesn't has a div with the class modal-body
			// we need to wrap it inside of a div that does for propper styling
			var $modal_body = view.$containerModal.find('.modal-body');

			// The view has it's own body so the template is probably doing some fancy stuff, so lets remove the other body
			if (view.$('.modal-body').length && $modal_body.length)
			{
				$modal_body.remove();
				$modal_body = [];
			}
			// if there is no body anywere lets wrap it with one
			else if (!$modal_body.length)
			{
				view.$el = view.$el.wrap('<div class="modal-body"/>').parent();
			}

			if ($modal_body.length)
			{
				$modal_body.append(view.$el);
			}
			else
			{
				view.$containerModal.find('.modal-content').append(view.$el);
			}

			return this;
		}

	,	prefixViewIds: function (view, prefix)
		{
			if (typeof view === 'string')
			{
				prefix = view;
				view = this.currentView;
			}

			if (view instanceof Backbone.View)
			{
				prefix = prefix || '';
				// Adding the prefix to all ids
				view.$('[id]').each(function ()
				{
					var el = jQuery(this);
					if (el.parents('svg').length > 0)
					{
						return; // don't overwrite svg child ids
					}

					el.attr('id', function (i, old_id)
					{
						return prefix + old_id;
					});
				});

				// Adding the prefix to all fors, so labels still work
				view.$('[for]').each(function ()
				{
					jQuery(this).attr('for', function (i, old_id)
					{
						return prefix + old_id;
					});
				});
			}
		}

	,	addModalListeners: function (view)
		{
			var self = this;

			// hidden is an even triggered by the bootstrap modal plugin
			// we obliterate anything related to the view once the modal is closed
			view.$containerModal.on('hidden.bs.modal', function ()
			{
				view.$containerModal.closest('.modal-container').remove();
				view.$containerModal = null;
				self.$containerModal = null;
				self.modalCurrentView = null;
				current_modal = false;
				view.destroy();

				//After closing te modal, impose the underlying view's title
				document.title = self.currentView && self.currentView.getTitle() || '';
			});

			//Only trigger afterAppendView when finished showing the modal (has animation which causes a delay)
			view.$containerModal.on('shown.bs.modal',function ()
			{
				// 271487 set properties in media tag for browsers not supporting them.
				// Important: Keep in sync with modals.less
				if (!(window.matchMedia || window.msMatchMedia))
				{
					if (jQuery(window).width() >= 768)
					{
						var props = {
							left: '50%',
							right: 'auto',
							width: '600px',
							paddingTop: '30px',
							paddingBottom: '30px'
						};
						view.$containerModal.find('.modal-dialog').first().css(props);
					}
				}

				self.trigger('afterAppendView', view);
			});
		}

	,	showInModal: function (view, options)
		{
			options = jQuery.extend({ modalOptions: {} }, options);

			// we tell the view its beeing shown in a Modal
			view.inModal = true;

			// we need a different variable to know if the view has already been rendered in a modal
			// this is to add the Modal container only once to the DOM
			if (!view.hasRenderedInModal)
			{
				var element_id = view.$el.attr('id');

				this.$containerModal = view.$containerModal = jQuery(
					SC.macros.modal(view.page_header || view.title || '')
				).closest('div');

				this.$containerModal
					.addClass(view.modalClass || element_id ? ('modal-'+ element_id) : '')
					.attr('id', view.modalId || element_id ? ('modal-'+ element_id) : '');

				this.modalCurrentView = view;
				view.options.layout = this;
			}

			this.trigger('beforeAppendView', view);
			// Generates the html for the view based on its template
			// http://backbonejs.org/#View-render
			view.render();

			this.wrapModalView(view).prefixViewIds(view, 'in-modal-');

			if (!view.hasRenderedInModal)
			{
				// if there was a modal opened we close it
				current_modal && current_modal.modal('hide');
				// Stores the modal dom reference
				current_modal = view.$containerModal;

				this.addModalListeners(view);
				// So, now we add the wrapper modal with the view in it to the dom - we append it to the Layout view instead of body, so modal links are managed by NavigationHelper.
				view.$containerModal.appendTo(this.el).wrap('<div class="modal-container"/>');

				// We trigger the plugin, it can be passed custom options
				// http://twitter.github.com/bootstrap/javascript.html#modals
				view.$containerModal.modal(options.modalOptions);
			}

			if (options.className)
			{
				view.$containerModal.addClass(options.className);
			}

			// the view has now been rendered in a modal
			view.hasRenderedInModal = true;

			return jQuery.Deferred().resolveWith(this, [view]);
		}
	});
})();

// ApplicationSkeleton.Tracking.js
// -----------------------------------------
// Extends the application's prototype to allow multiple tracking methods.
// Also warps the Layout's showContent to track the page view each time a view is rendered.
(function ()
{
	'use strict';

	var application_prototype = SC.ApplicationSkeleton.prototype
	,	layout_prototype = application_prototype.Layout.prototype;

	_.extend(application_prototype, {
		// Application.trackers
		// Place holder for tracking modules.
		// When creating your own tracker module, be sure to push it to this array.
		trackers: []
		// Tracking
	,	track: function (method)
		{
			var self = this
				// Each method could be called with different type of parameters.
				// So we pass them all what ever they are.
			,	parameters = Array.prototype.slice.call(arguments, 1);

			_.each(this.trackers, function (tracker)
			{
				// Only call the method if it exists, the context is the application.
				tracker[method] && tracker[method].apply(self, parameters);
			});

			return this;
		}

	,	trackPageview: function (url)
		{
			return this.track('trackPageview', url);
		}

	,	trackEvent: function (event)
		{
			var GoogleUniversalAnalytics = null
			,	has_universal_analytics = false;

			this.track('trackEvent', event);

			if (event.callback)
			{
				GoogleUniversalAnalytics = require('GoogleUniversalAnalytics');

				has_universal_analytics = _.find(this.trackers, function (tracker)
				{
					return tracker === GoogleUniversalAnalytics;
				});
				// GoogleUniversalAnalytics has an asynchronous callback.
				// So we anly call the non async ones if UniversalAnalytics is not there.
				!has_universal_analytics && event.callback();
			}

			return this;
		}

	,	trackTransaction: function (transaction)
		{
			return this.track('trackTransaction', transaction);
		}

		// Application.addCrossDomainParameters:
		// Some tracking services require to pass special parameters when navigating to a different domain.
		// This method will be call for each of the services whenever that happens.
	,	addCrossDomainParameters: function (url)
		{
			_.each(this.trackers, function (tracker)
			{
				if (tracker.addCrossDomainParameters)
				{
					url = tracker.addCrossDomainParameters(url);
				}
			});

			return url;
		}
	});

	_.extend(layout_prototype, {

		showContent: _.wrap(layout_prototype.showContent, function (fn, view)
		{
			var application = view.application || view.options.application
				// Prefix is added so the only application that tracks the root ('/') is Shopping
				// any other application that has '/' as the home, like MyAccount
				// will track '/APPLICATION-NAME'
			,	prefix = application.name !== 'Shopping' ? '/' + application.name.toLowerCase() : '';

			application.trackPageview(prefix + '/' + Backbone.history.fragment);

			return fn.apply(this, _.toArray(arguments).slice(1));
		})
	});
})();

// Backbone.cachedSync.js
// ----------------------
// This module defines a new type of Module and Collection and an alternative 
// to Backbone.sync that adds a cacheing layer to all read requests, but 
// leaves all write actions unmodified
(function ()
{
	
	'use strict';
	
	// The cache is an object where keys are a request identifier and values are a the result of the request and some metadata 
	Backbone.localCache = {};
	// We will cap the size of the cache by an arbitratry number, fell free to change it to meet your needs.
	Backbone.cacheSize = 100;
	
	// Removes the oldest requests once the limit is reached
	function evictRecords()
	{
		var keys = _.keys(Backbone.localCache)
		,	cache_size = keys.length;
		if (cache_size > Backbone.cacheSize)
		{
			delete Backbone.localCache[keys[0]];
		}
	}
	
	// Backbone.cachedSync:
	// Can be used interchangeably with Backbone.sync, it will retun a jQuery promise
	// once it's done will call the apropiate function 
	Backbone.cachedSync = function (action, self, options)
	{
		if (action === 'read')
		{
			// Generates an uninque url that will be used as the request identifier
			var url = _.result(this, 'url');
			if (options && options.data)
			{
				url += ((~url.indexOf('?')) ? '&' : '?') + jQuery.param(options.data);
			}

			// Generates a new deferred for every new sync, no matter if its or not in the cache
			// This is the responce of this method, this promice will be resolved by the ajax request
			var deferred = jQuery.Deferred();

			// jQuery.ajax maps error to fail and success to done
			deferred.error = deferred.fail;
			deferred.success = deferred.done;

			// Now we make sure the success and error options are called
			deferred.success(options.success);
			deferred.error(options.error);

			// We then delete them from the options that will be passed to the real call so they are not called twice, for the 1st request
			delete options.success;
			delete options.error;

			// Force ajaxSetup cache to be true and not append a &_={timestamp} to the end of the URL
			options.cache = true;

			// Now we get the actual request from the cache or we perform it
			Backbone.localCache[url] = Backbone.localCache[url] || Backbone.sync.apply(this, arguments);

			// Now we resolve the Deferred by listeinig to the resolution of the real request
			// if the request was already resolved our methods will be called imediatelly
			Backbone.localCache[url].then(
				// Success Callback 
				function (response, status, jqXhr)
				{
					// Sometimes parse modifies the responce object (that is passed by reference)
					response = (jqXhr.responseText) ? JSON.parse(jqXhr.responseText) : response;
					// now we resolve the defered one with results 
					deferred.resolveWith(Backbone.localCache[url], [response, status, jqXhr]);
					// This make sure the cache is keept short
					evictRecords();
				}
				// Error Callback 
			,	function ()
				{
					// if it fails we make sure the next time its requested, dont read from cache
					delete Backbone.localCache[url];
					deferred.rejectWith(Backbone.localCache[url], arguments);
				}
				// Progess Callback
			,	function ()
				{
					deferred.notifyWith(Backbone.localCache[url], arguments);
				}
			);

			// Then we just return the defered
			return deferred;
			// Bottom line: we are piping a fake ajax deferred from the original one
		}

		// if cache is not present we just call the original Backbone.sync
		return  Backbone.sync.apply(this, arguments);
	};
	
	
	function addToCache (data, params)
	{
		/*jshint validthis:true*/
		// Generates an uninque url that will be used as the request identifier
		var url = _.result(this, 'url');
		url += ((~url.indexOf('?')) ? '&' : '?') + jQuery.param(params || {});

		// This defered will be used as a fake Ajax Request we are gonna store in the cache
		var deferred =  jQuery.Deferred();

		// We resolve the defered with the data you sent and some fake ajax info
		deferred.resolveWith(this, [
			data
		,	'success'
		,	{
				response: data
			,	status: 'success'
			,	statusCode: '200'
			,	readyState: 4
			,	statusText: 'OK'
			,	responseText: false // So it will use response instead of responseText
			}
		]);

		// Stores this fake promice in the cache
		Backbone.localCache[url] = deferred;
	}

	function isCached(data)
	{
		/*jshint validthis:true*/
		// Generates an uninque url that will be used as the request identifier
		var url = _.result(this, 'url');
		if (data)
		{
			url += ((~url.indexOf('?')) ? '&' : '?') + jQuery.param(data);
		}
		return !!Backbone.localCache[url];
	}

	
	// Backbone.CachedCollection: 
	// It's just an extention of the original Backbone.Collection but it uses the Backbone.cachedSync
	Backbone.CachedCollection = Backbone.Collection.extend({
		sync: Backbone.cachedSync
	,	addToCache: addToCache
	,	isCached: isCached
	});
	
	// Backbone.CachedModel: 
	// It's just an extention of the original Backbone.Model but it uses the Backbone.cachedSync
	Backbone.CachedModel = Backbone.Model.extend({
		sync: Backbone.cachedSync
	,	addToCache: addToCache
	,	isCached: isCached
	});
	
})();

// Backbone.History.js
// -----------------
// Extends native Backbone.History to override the getFragment to include the location.search
(function ()
{  
  'use strict';

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;
  // Cached regex for removing a trailing slash.
  var trailingSlash = /\/$/;

  //Add query string parameters in case of using push state
  _.extend(Backbone.History.prototype, {
      getFragment: function(fragment, forcePushState) {
        if (!fragment)
        {
          if (this._hasPushState || !this._wantsHashChange || forcePushState)
          {
            fragment = this.location.pathname + this.location.search;
            var root = this.root.replace(trailingSlash, '');
            if (!fragment.indexOf(root))
            {
              fragment = fragment.substr(root.length);
            }
          } 
          else 
          {
            fragment = this.getHash();
          }
        }
        return fragment.replace(routeStripper, '');
      }
  });
})();
// Backbone.Model.js
// -----------------
// Extends native Backbone.Model to make internalid the idAttribute
(function ()
{
	'use strict';

	_.extend(Backbone.Model.prototype, {

		url: function ()
		{
			// http://underscorejs.org/#result
			var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url');

			if (this.isNew()) 
			{
				return base;
			}

			/// This will pass the id as a parameter instead of as part of the url
			return base +'?internalid='+ encodeURIComponent(this.id);
		}

	,	idAttribute: 'internalid'

	});

})();
// Backbone.Sync.js
// -----------------
// Extends native Backbone.Sync to pass company and site id on all requests
(function ()
{
	'use strict';

	Backbone.sync = _.wrap(Backbone.sync, function (fn, method, model, options)
	{
		var url = options.url || _.result(model, 'url');

		if (url)
		{
			options = options || {};

			options.url = url + (~url.indexOf('?') ? '&' : '?') + jQuery.param({
				// Account Number
				c: SC.ENVIRONMENT.companyId
				// Site Number
			,	n: SC.ENVIRONMENT.siteSettings.siteid
			});
		}

		return fn.apply(this, [method, model, options]);
	});
})();
// Backbone.Validation.callbacks.js
// --------------------------------
// Extends the callbacks of the Backbone Validation plugin
// https://github.com/thedersen/backbone.validation
(function ()
{
	'use strict';

	//
	//	Usage: 
	//		First the view must have a model or collection attribute in order to activate the validation
	//		callbacks
	// 
	//		MyView = Backbone.View.extend({
	//			template: 'my_template'
	//		,	model: MyModel	
	//		});
	//
	//		The view template must have for each control group (or field) a '.controls' element
	//		where the error message is shown.
	//
	//		Example:
	//
	//		<div class="form-group">
	//			<label class="control-label" for="city">City:</label>
	//			<span  class="controls pull-right"></span>
	//			<input class="form-control" id="city" name="city" value="">
	//		</div>
	//
	//		If you are using bootstrap3, be sure that you call Backbone.Validation.callbacks.setSelectorStyle('bootstrap3')
	//		or your error messages will not be shown.
	//	
	_.extend(Backbone.Validation.callbacks, {
		//	control-group is used for Bootstrap2 and form-group is used for Bootstrap3
		control_group_selector: '.control-group, .form-group'
		//	error is used for Bootstrap2 and has-error is used for Bootstrap3
	,	error_state_class: 'error has-error'

	,	valid: function (view, attr, selector)
		{
			var $control = view.$el.find('['+ selector +'="'+ attr +'"]')
				// if its valid we remove the error classnames
			,	$group = $control.parents(this.control_group_selector).removeClass(this.error_state_class);

			// we also need to remove all of the error messages
			return $group.find('.backbone-validation').remove().end();
		}

	,	invalid: function (view, attr, error, selector)
		{
			var $target
			,	$control = view.$el.find('['+ selector +'="'+ attr +'"]')
			,	$group = $control.parents(this.control_group_selector).addClass(this.error_state_class);


			view.$('[data-type="alert-placeholder"]').html(
				SC.macros.message(_(' Sorry, the information you provided is either incomplete or needs to be corrected.').translate(), 'error', true)
			);

			//This case happens when calling validation on attribute setting with { validate: true; }
			if (!view.$savingForm)
			{
				view.$savingForm = $control.closest('form');
			}

			view.$savingForm.find('*[type=submit], *[type=reset]').attr('disabled', false);

			view.$savingForm.find('input[type="reset"], button[type="reset"]').show();

			if ($control.data('error-style') === 'inline')
			{
				// if we don't have a place holder for the error
				// we need to add it. $target will be the placeholder
				if (!$group.find('.help-inline').length)
				{
					$group.find('.controls').append('<span class="help-inline backbone-validation"></span>');
				}

				$target = $group.find('.help-inline');
			}
			else
			{
				// if we don't have a place holder for the error
				// we need to add it. $target will be the placeholder
				if (!$group.find('.help-block').length)
				{
					$group.find('.controls').append('<p class="help-block backbone-validation"></p>');
				}

				$target = $group.find('.help-block');
			}

			return $target.text(error);
		}
	});
})();
// Backbone.View.js
// ----------------
// Extends native Backbone.View with a bunch of required methods
// most of this were defined as no-ops in ApplicationSkeleton.js
(function ()
{
	'use strict';
	
	_.extend(Backbone.View.prototype, {
		// Default error message, usally overwritten by server response on error
		errorMessage: 'Sorry, the information you provided is either incomplete or needs to be corrected.'
		
		// dont_scroll will eventually be changed to an object literal
	,	showContent: function (dont_scroll)
		{
			return this.options.application && this.options.application.getLayout().showContent(this, dont_scroll);
		}

	,	showInModal: function (options)
		{
			return this.options.application && this.options.application.getLayout().showInModal(this, options);
		}

		// Get view's SEO attributes
	,	getMetaDescription: function ()
		{
			return this.metaDescription;
		}

	,	getMetaKeywords: function ()
		{
			return this.metaKeywords;
		}

	,	getMetaTags: function ()
		{
			return jQuery('<head/>').html(this.metaTags || '').children('meta');
		}

		//Backbone.View.getTitle() : returns the document's title to show when this view is active. 
	,	getTitle: function ()
		{
			return this.title;
		}

	,	getCanonical: function ()
		{
			var canonical = window.location.protocol + '//' + window.location.hostname + '/' + Backbone.history.fragment
			,	index_of_query = canonical.indexOf('?');

			// !~ means: indexOf == -1
			return !~index_of_query ? canonical : canonical.substring(0, index_of_query);
		}

		// For paginated pages, you should implement this operations
		// to return the url of the previous and next pages
	,	getRelPrev: jQuery.noop
	,	getRelNext: jQuery.noop

		// "private", shouldn't be overwritten
		// if a custom destroy method is required
		// override the destroy method.
		// This method should still be called
	,	_destroy: function ()
		{
			// http://backbonejs.org/#View-undelegateEvents
			this.undelegateEvents();

			// http://backbonejs.org/#Events-off
			this.model && this.model.off(null, null, this);
			this.collection && this.collection.off(null, null, this);
		}
		
	,	destroy: function ()
		{
			this._destroy();
		}

	,	showConfirmationMessage: function (message)
		{
			var $msg_el = jQuery(SC.macros.message(message, 'success', true))
			,	$confirmation_message = jQuery('[data-confirm-message]');
			
			$msg_el.find('.close').click(function() 
			{
				$confirmation_message.hide();
			});

			$confirmation_message.show().empty().append($msg_el);

			setTimeout(function() 
			{
				$confirmation_message.fadeOut(3000);
			}, 5000);
		}

	,	showWarningMessage: function (message)
		{
			var $msg_el = jQuery(SC.macros.message(message, 'warning', true));
			
			this.$('[data-confirm-message]').empty().append($msg_el);			
		}

		// Disables and re-enables a given set of elements based on a promise
	,	disableElementsOnPromise: function (promise, selector)
		{
			var $target = this.$(selector);

			if ($target.length === 0)
			{
				return;
			}

			$target.attr('disabled', true);

			promise.always(function ()
			{
				$target.attr('disabled', false);
			});
		}
	});
})();
// Backbone.View.render.js
// -----------------------
// Extends native Backbone.View with a custom rendering method
(function ()
{
	'use strict';

	_.extend(Backbone.View.prototype, {

		_render: function ()
		{
			// http://backbonejs.org/#View-undelegateEvents
			this.undelegateEvents();

			// if there is a collection or a model, we
			(this.model || this.collection) && Backbone.Validation.bind(this);


			// Renders the template
			var tmpl = SC.template(this.template+'_tmpl', {view: this});

			// Workaround for internet explorer 7. href is overwritten with the absolute path so we save the original href
			// in data-href (only if we are in IE7)
			// IE7 detection courtesy of Backbone
			// More info: http://www.glennjones.net/2006/02/getattribute-href-bug/
			var isExplorer = /msie [\w.]+/
			,	docMode = document.documentMode
			,	oldIE = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

			if (oldIE)
			{
				tmpl = tmpl.replace(/href="(.+?)(?=")/g,'$&" data-href="$1');
			}

			//Apply permissions
			var $tmpl = this.applyPermissions(tmpl);

			this.$el.empty();

			this.trigger('beforeViewRender', this);

			// appends the content to the view's element
			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				// in SEO we append the content this way because of a envjs bug. 
				this.$el[0].innerHTML = $tmpl[0].innerHTML;
			}
			else
			{
				this.$el.append($tmpl);
			}

			this.$('[data-toggle="tooltip"]').tooltip({html: true});

			this.trigger('afterViewRender', this);

			// http://backbonejs.org/#View-delegateEvents
			this.delegateEvents();

			return this;
		}

		// Given an HTML template string, removes the elements from the DOM that
		// do not comply with the list of permissions level
		// The permission level is specified by using the data-permissions attribute and data-permissions-operator (the latter is optional)
		// on any html tag in the following format:
		// <permission_category>.<permission_name>.<minimum_level>
		// permission_category and permission_name come from SC.ENVIRONMENT.permissions. (See commons.js)
		// e.g:
		//     <div data-permissions="transactions.tranFind.1"></div>
		//     <div data-permissions="transactions.tranCustDep.3,transactions.tranDepAppl.1 lists.tranFind.1"></div>
		// Notice several permissions can be separated by space or comma, by default (in case that data-permissions-operator is missing) all permission will be evaluates
		// as AND, otherwise data-permissions-operator should have the value OR
		// e.g:
		//     <div data-permissions="transactions.tranFind.1"></div>
		//     <div data-permissions="transactions.tranCustDep.3,transactions.tranDepAppl.1 lists.tranFind.1" data-permissions-operator="OR" ></div>

	,	applyPermissions: function (tmpl)
		{
			// We need to wrap the template in a container so then we can find
			// and remove parent nodes also (jQuery.find only works in descendants).
			var $template = SC.ENVIRONMENT.jsEnvironment === 'server' ? jQuery('<div/>').append(tmpl) : jQuery(tmpl)
			,	$permissioned_elements = $template.find('[data-permissions]');

			$permissioned_elements.each(function ()
			{
				var $el = jQuery(this)
				,	element_permission = $el.data('permissions')
				,	perms = element_permission.split(/[\s,]+/)
				,	perm_operator = $el.data('permissions-operator') || 'AND'
				,	perm_eval
				,	perm_evaluation = perm_operator !== 'OR';

				_.each(perms, function (perm)
				{
					var perm_tokens = perm.split('.');

					perm_eval = !(perm_tokens.length === 3 &&
						perm_tokens[2] < 5 &&
						SC.ENVIRONMENT.permissions &&
						SC.ENVIRONMENT.permissions[perm_tokens[0]] &&
						SC.ENVIRONMENT.permissions[perm_tokens[0]][perm_tokens[1]] < perm_tokens[2]);

					if (perm_operator === 'OR')
					{
						perm_evaluation = perm_evaluation || perm_eval;
					}
					else
					{
						perm_evaluation = perm_evaluation &&  perm_eval;
					}
				});

				if (!perm_evaluation)
				{
					$el.remove();
				}
			});

			return $template;
		}

	,	render: function ()
		{
			return this._render();
		}
	});
})();
// Backbone.View.saveForm.js
// -------------------------
// Extends native Backbone.View with a custom saveForm function to be called when forms are submited
(function ()
{
	'use strict';

	_.extend(Backbone.View.prototype, {
		
		// view.saveForm
		// Event halders added to all views
		saveForm: function (e, model, props)
		{
			e.preventDefault();

			model = model || this.model;
			
			this.$savingForm = jQuery(e.target).closest('form');
			
			if (this.$savingForm.length)
			{
				// Disables all for submit buttons, to prevent double submitions
				this.$savingForm.find('input[type="submit"], button[type="submit"]').attr('disabled', true);
				// and hides reset buttons 
				this.$savingForm.find('input[type="reset"], button[type="reset"]').hide();
			}
			
			this.hideError();

			var self = this;

			// Returns the promise of the save acction of the model
			return model.save(props || this.$savingForm.serializeObject(), {

					wait: true

					// Hides error messages, re enables buttons and triggers the save event 
					// if we are in a modal this also closes it 
				,	success: function (model, response)
					{
						if (self.inModal && self.$containerModal)
						{
							self.$containerModal.modal('hide');
						}
						
						if (self.$savingForm.length)
						{
							self.hideError(self.$savingForm);
							self.$savingForm.find('[type="submit"], [type="reset"]').attr('disabled', false);
							model.trigger('save', model, response);
						}
					}

					// Re enables all button and shows an error message
				,	error: function (model, response)
					{
						self.$savingForm.find('*[type=submit], *[type=reset]').attr('disabled', false);

						if (response.responseText)
						{
							model.trigger('error', jQuery.parseJSON(response.responseText));
						}
					}
				}
			);
		}
	});
})();
/* ==========================================================
 * RATER
 * We developed jQuery plugin to provide rate selection functionality
 * Used on file: star_rating_macro.txt
 * 
 * We tried to follow same syntax and practices as Bootstrap.js
 * so we are using Bootstrap's jsHint settings
 * http://blog.getbootstrap.com/2012/04/19/bootstrap-jshint-and-recess/
 * ==================================================================== */

!function ($) {

	'use strict'; 

	/* RATER CLASS DEFINITION
	 * ====================== */

	var Rater = function (element, options) {
		this.init(element, options);
	};

	Rater.prototype = {

		init: function (element, options)
		{
			this.options = options;
			this.$element = $(element);

			// The element that displays the rating selection
			this.$fill = this.$element.children('.rating-area-fill');

			var data = this.$element.data();

			this.max = data.max;
			this.value = data.value;
			// used as an identifier from the outside
			this.name = data.name;

			this.listen();
		}

	,	listen: function () 
		{
			var self = this;

			// The .rater and .data-api are namespacing convention
			this.$element
				.on('click.rater.data-api', function (e) {
					self.handleClick.call(self, e);
				})
				.on('mousemove.rater.data-api', function (e) {
					self.handleMouseMove.call(self, e);
				})
				.on('mouseleave.rater.data-api', function (e) {
					self.handleMouseLeave.call(self, e);
				});
		}
		
	,	handleClick: function (e)
		{
			e.preventDefault();
			
			// our rating area is composed by buttons
			// when one is clicked, we set its value to this
			if (e.target.tagName.toLowerCase() === 'button')
			{
				this.setValue(e.target.value);
			}
		}
		
	,	handleMouseMove: function (e)
		{
			e.preventDefault();
			
			// our rating area is composed by buttons
			// when one is hovered, we fill the bar with that value
			if (e.target.tagName.toLowerCase() === 'button')
			{
				this.setFillStatus(e.target.value);
			}
		}
		
	,	handleMouseLeave: function ()
		{
			// on mouse leave we reset the value
			this.setFillStatus(this.value);
		}
		
	,	setValue: function (value, silent)
		{
			this.value = typeof value === 'number' ? Math.round(value) : parseInt(value, 10);

			// we set the value so it can be listened from the outside
			this.$element.data('value', this.value);
			// then fill the rating selection with that value
			this.setFillStatus(this.value);

			!silent && this.$element.trigger('rate', this);
		}
		
	,	setFillStatus: function (value)
		{
			// the percentage value is calculated
			// and the area to be filled is filled
			this.$fill.css('width', (value * 100 / this.max) +'%');
		}
	};

	/* RATER PLUGIN DEFINITION
	 * ======================= */

	// standar jQuery plugin definition
	$.fn.rater = function (options)
	{
		return this.each(function ()
		{
			var $this = $(this)
			,	data = $this.data('rater');

			if (!data){
				$this.data('rater', (data = new Rater(this, options)));
			}
		});
	};

	$.fn.rater.Constructor = Rater;

	$.fn.rater.defaults = {};

	/* Rater DATA-API
	 * ============== */

	$(window).on('load', function () {
		$('[data-toggle="rater"]').rater();
	});

}(window.jQuery);
/* ====================================================================
 * SLIDER
 * We developed jQuery plugin to provide range slider functionality
 * Used on file: facet_range_macro.txt
 *
 * We tried to follow same syntax and practices as Bootstrap.js
 * so we are using Bootstrap's jsHint settings
 * http://blog.getbootstrap.com/2012/04/19/bootstrap-jshint-and-recess/
 * ==================================================================== */

!function ($) {

	'use strict';

	/* SLIDER CLASS DEFINITION
	 * ======================= */

	var Slider = function (element, options) {
		this.init(element, options);
	};

	Slider.prototype = {

		init: function (element, options)
		{
			var $element = $(element)
			,	$children = $element.children();

			this.$element = $element;
			this.options = options;

			this.values = this.parseValues(options.values, $element.data());
			this.$bar = $children.filter('.bar');

			this.controls = {
				$low: $children.filter('[data-control="low"]')
			,	$high: $children.filter('[data-control="high"]')
			};

			this.slideToInitial(true);
			this.listen();
		}

	,	parseValues: function (defaults, dom_data)
		{
			var values = {
				min: dom_data.min || defaults.min
			,	max: dom_data.max || defaults.max
			};

			$.extend(values, {
				low: Math.max(dom_data.low || defaults.min, values.min)
			,	high: Math.min(dom_data.high || defaults.high, values.max)
			});

			return values;
		}

	,	listen: function ()
		{
			var proxy = jQuery.proxy;

			this.$element
				.on('mousedown.slider.data-api', proxy(this.handleMouseDown, this))
				.on('touchstart.slider.data-api', proxy(this.handleMouseDown, this));

			$('html')
				.on('mousemove.slider.data-api', proxy(this.handleMouseMove, this))
				.on('touchmove.slider.data-api', proxy(this.handleMouseMove, this))

				.on('mouseup.slider.data-api', proxy(this.handleMouseUp, this))
				.on('touchend.slider.data-api', proxy(this.handleMouseUp, this))
				.on('touchcancel.slider.data-api', proxy(this.handleMouseUp, this));
		}

	,	getMinBoundary: function () {
			return this.$element.offset().left;
		}

	,	getMaxBoundary: function () {
			return this.getMinBoundary() + this.$element.innerWidth();
		}

	,	handleMouseDown: function (e)
		{
			if (e.which !== 1 && e.type !== 'touchstart') {
				return;
			} 

			var page_x = this.getPageX(e)
			,	$target = $(e.target);

			if ($target.is('a') || $target.is('button'))
			{
				if (this.values.low === this.values.max || this.values.high === this.values.min)
				{
					$target = this.controls['$'+ (page_x < this.$element.offset().left + this.$element.innerWidth() / 2 ? 'high':'low')];
				}

				this.$dragging = $target;
				this.$element.trigger('start', this);
			}
			else
			{
				this.$dragging = this.getClosestControl(page_x);
				this.slideToValue(this.getSlidValue(page_x));
			}

			e.preventDefault();
		}

	,	handleMouseMove: function (e)
		{
			if (!this.$dragging) {
				return;	
			} 

			var page_x = this.getPageX(e)
			,	slid_value = this.getSlidValue(page_x)

			,	is_low = this.$dragging.data('control') === 'low'
			,	value = Math[is_low ? 'min':'max'](slid_value, this.values[is_low ? 'high':'low']);

			this.slideToValue(value);

			e.preventDefault();	
		}

	,	handleMouseUp: function (e)
		{
			if (!this.$dragging) {
				return;
			}

			this.$dragging = null;
			this.$element.trigger('stop', this);

			e.preventDefault();
		}

	,	getPageX: function (e)
		{
			var touch = e.originalEvent && e.originalEvent.touches ? e.originalEvent.touches[0] || e.originalEvent.changedTouches[0] : null;
			return touch ? touch.pageX : e.pageX;
		}

	,	getSlidValue: function (page_x)
		{
			var minBoundary = this.getMinBoundary()
			,	maxBoundary = this.getMaxBoundary()
			,	location = page_x > maxBoundary ? maxBoundary : page_x < minBoundary ? minBoundary : page_x;

			return ((location - minBoundary) / this.$element.innerWidth() * this.getSizeInValue() + this.values.min);
		}

	,	getClosestControl: function (page_x)
		{
			var value = this.getSlidValue(page_x)
			,	distance_low = Math.abs(this.values.low - value)
			,	distance_high = Math.abs(this.values.high - value)
			,	$low = this.controls.$low;

			if (distance_low !== distance_high)
			{
				return distance_low < distance_high ? $low : this.controls.$high;
			}
			else
			{
				return page_x < $low.offset().left ? $low : this.controls.$high;
			}
		}

	,	getSizeInValue: function () {
			return this.values.max - this.values.min;
		}

	,	moveControl: function ($control, value)
		{
			return $control.css({
				left: ((value - this.values.min) * 100 / this.getSizeInValue()) +'%'
			});
		}
	
	,	resizeBar: function ()
		{
			return this.$bar.css({
				left: ((this.values.low - this.values.min) * 100 / this.getSizeInValue()) +'%'
			,	width: ((this.values.high - this.values.low) / this.getSizeInValue()) * 100 +'%'
			});
		}

	,	slideToInitial: function (trigger)
		{
			this.slideControls();
			this.resizeBar();

			if (trigger)
			{
				this.$element.trigger('slide', this);
			}
		}

	,	slideControls: function ()
		{
			this.moveControl(this.controls.$low, this.values.low);
			this.moveControl(this.controls.$high, this.values.high);
		}

	,	slideToValue: function (value)
		{
			var is_low = this.$dragging.data('control') === 'low';
			this.values[is_low ? 'low':'high'] = value;
			
			this.moveControl(this.$dragging, value);
			this.resizeBar();

			this.$element.trigger('slide', this);
		}
	};

	/* SLIDER PLUGIN DEFINITION
	 * ======================== */

	// standar jQuery plugin definition
	$.fn.slider = function (option)
	{
		return this.each(function ()
		{
			var $this = $(this)
			,	data = $this.data('slider');

			// if it wasn't initialized, we do so
			if (!data) {
				// we extend the passed options with the default ones
				var options = $.extend({}, $.fn.slider.defaults, typeof option === 'object' && options);
				$this.data('slider', (data = new Slider(this, options)));	
			}
		});
	};

	$.fn.slider.Constructor = Slider;

	$.fn.slider.defaults = {
		values: {
			min: 0
		,	max: 100
		}
	};

	/* SLIDER DATA-API
	 * =============== */

	$(window).on('load', function () {
		$('[data-toggle="slider"]').slider();
	});

}(window.jQuery);
// jQuery.ajaxSetup.js
// -------------------
// Adds the loading icon, updates icon's placement on mousemove
// Changes jQuery's ajax setup defaults
(function ()
{
	'use strict';

	// Variable used to track the mouse position
	var mouse_position = {
		top: 0
	,	left: 0
	};

	jQuery(document).ready(function ()
	{
		var $body = jQuery(document.body)
		,	$loading_icon = jQuery('#loadingIndicator');

		if (!$loading_icon.length && !SC.ENVIRONMENT.isTouchEnabled)
		{
			// if the icon wasn't there, lets add it and make a reference in the global scope
			$loading_icon = jQuery('<img/>', {
				id: 'loadingIndicator'
			,	'class': 'global-loading-indicator'
			,	src: _.getAbsoluteUrl('img/ajax-loader.gif')
			,	css: {
					zIndex: 9999
				,	position: 'absolute'
				}
			}).hide();

			if (!_.result(SC, 'isPageGenerator'))
			{
				$loading_icon.appendTo($body);
			}
		}

		SC.$loadingIndicator = $loading_icon;

		// loading icon sizes, used for positioning math
		var icon_height = 16
		,	icon_width = 16;

		$body.on({
			// On mouse move, we update the icon's position, even if its not shown
			mousemove: _.throttle(function (e)
			{
				mouse_position = {
					top: Math.min($body.innerHeight() - icon_height, e.pageY + icon_width)
				,	left: Math.min($body.innerWidth() - icon_width, e.pageX + icon_height)
				};

				$loading_icon.filter(':visible').css(mouse_position);
			}, 50)
			// when the body resizes, we move the icon to the bottom of the page
			// so we don't get some empty white space at the end of the body
		,	resize: _.throttle(function ()
			{
				var icon_offset = $loading_icon.offset();
				if(!icon_offset){
					return;
				}
				mouse_position = {
					top: Math.min($body.innerHeight() - icon_height, icon_offset.top)
				,	left: Math.min($body.innerWidth() - icon_width, icon_offset.left)
				};

				$loading_icon.filter(':visible').css(mouse_position);
			}, 50)
		});
	});

	SC.loadingIndicatorShow = function ()
	{
		SC.$loadingIndicator && SC.$loadingIndicator.css(mouse_position).show();
	};

	SC.loadingIndicatorHide = function ()
	{
		SC.$loadingIndicator && SC.$loadingIndicator.hide();
	};

	// This registers an event listener to any ajax call
	jQuery(document)
		// http://api.jquery.com/ajaxStart/
		.ajaxStart(SC.loadingIndicatorShow)
		// http://api.jquery.com/ajaxStop/
		.ajaxStop(SC.loadingIndicatorHide);

	// http://api.jquery.com/jQuery.ajaxSetup/
	jQuery.ajaxSetup({
		beforeSend: function (jqXhr, options)
		{
			// BTW: "!~" means "== -1"
			if (!~options.contentType.indexOf('charset'))
			{
				// If there's no charset, we set it to UTF-8
				jqXhr.setRequestHeader('Content-Type', options.contentType + '; charset=UTF-8');
			}
		}
	});
})();

// jQuery.serializeObject.js
// -------------------------
// Used to transform a $form's data into an object literal
// with 'name: value' pairs
(function ()
{
	'use strict';

	jQuery.fn.serializeObject = function ()
	{
		var o = {}
			// http://api.jquery.com/serializeArray/
		,	a = this.serializeArray();
		
		// When a checkbox is not checked, we need to send the "unchecked value"
		// that value is held as a data attribute: "data-unchecked-value"
		this.find('input[type=checkbox]:not(:checked)[data-unchecked-value]').each(function ()
		{
			var $this = jQuery(this);

			a.push({
				name: $this.prop('name')
			,	value: $this.data('unchecked-value')
			});
		});
		
		// Then we just loop through the array to create the object
		jQuery.each(a, function ()
		{
			if (o[this.name] !== undefined)
			{
				if (!o[this.name].push)
				{
					o[this.name] = [o[this.name]];
				}

				o[this.name].push(this.value || '');
			}
			else
			{
				o[this.name] = this.value || '';
			}
		});
		
		return o;
	};
	
})();
// String.format.js
// ----------------
// Used for the translation method in Utils.js
// Will replace $(n) for the n parameter entered 
// eg: "This $(0) a $(1), $(0) it?".format("is", "test");
//     returns "This is a test, is it?"
(function ()
{
	'use strict';
	
	String.prototype.format = function ()
	{
		var args = arguments;

		return this.replace(/\$\((\d+)\)/g, function (match, number)
		{ 
			return typeof args[number] !== 'undefined' ? args[number] : match;
		});
	};

})();
// Underscore.templates.js
// -----------------------
// Handles compiling for the templates
// Pre-compiles all of the macros
// Adds comments to the begining and end of each template/macro
// to make it easier to spot templates with development tools
(function ()
{
	'use strict';

	SC.handleMacroError = function (error, macro_name)
	{
		console.error('Error in macro: '+ macro_name + '\n' + error + '\n ' + error.stack);
	};

	var isPageGenerator = function ()
	{
		return SC.isPageGenerator ? SC.isPageGenerator() : false; 
	}; 

	SC.compileMacros = function compileMacros(macros)
	{
		// Exports all macros to SC.macros
		SC.macros = {};

		var context = {

			// registerMacro:
			// method used on every macro to define itself
			registerMacro: function (name, fn)
			{
				var original_source = fn.toString()
				,	prefix = isPageGenerator() ? '' : '\\n\\n<!-- MACRO STARTS: ' + name + ' -->\\n'
				,	posfix = isPageGenerator() ? '' : '\\n<!-- MACRO ENDS: ' + name + ' -->\\n'
					// Adds comment lines at the begining and end of the macro
					// The rest of the mumbo jumbo is to play nice with underscore.js
				,	modified_source = ';try{var __p="' + prefix + '";' + original_source.replace(/^function[^\{]+\{/i, '').replace(/\}[^\}]*$/i, '') +';__p+="' + posfix + '";return __p;}catch(e){SC.handleMacroError(e,"'+ name +'")}' || []
					// We get the parameters from the string with a RegExp
				,	parameters = original_source.slice(original_source.indexOf('(') + 1, original_source.indexOf(')')).match(/([^\s,]+)/g) || [];

				parameters.push(modified_source);

				// Add the macro to SC.macros
				SC.macros[name] = _.wrap(Function.apply(null, parameters), function (fn)
				{
					var result = fn.apply(this, _.toArray(arguments).slice(1));
					result = minifyMarkup(result);
					result = removeScripts(result);
					return result;
				});
			}
		};

		// Now we compile de macros
		_.each(macros, function (macro)
		{
			try
			{
				// http://underscorejs.org/#template
				_.template(macro, context);
			}
			catch (e)
			{
				// if there's an arror compiling a macro we just
				// show the name of the macro in the console and carry on
				SC.handleMacroError(e, macro.substring(macro.indexOf('(') + 2, macro.indexOf(',') - 1));
			}
		});
	};

	// Template compiling and rendering.
	// We compile the templates as they are needed
	var processed_templates = {};

	function template (template_id, obj)
	{
		// Makes sure the template is present in the template collection
		if (!SC.templates[template_id])
		{
			throw new Error('Template \''+template_id+'\' is not present in the template hash.');
		}

		try
		{
			// If the template hasn't been compiled we compile it and add it to the dictionary
			processed_templates[template_id] = processed_templates[template_id] || _.template(SC.templates[template_id] || '');
			var prefix = isPageGenerator() ? '' : '\n\n<!-- TEMPLATE STARTS: '+ template_id +'-->\n'
			,	posfix = isPageGenerator() ? '' : '\n<!-- TEMPLATE ENDS: '+ template_id +' -->\n';
			// Then we return the template, adding the start and end comment lines
			return prefix + processed_templates[template_id](_.extend({}, SC.macros, obj)) + posfix;
		}
		catch (err)
		{
			// This adds the template id to the error message so you know which template to look at
			err.message = 'Error in template '+template_id+': '+err.message;
			throw err;
		}
	}

	// This is the noop function declared on Main.js
	SC.template = template;

	// needed to reset already processed templates
	function resetTemplates()
	{
		processed_templates = {};
	}
	SC.resetTemplates = resetTemplates;


	// heads up! - we override the _.template function for removing scripts.
	// Also we remove spaces and comments if the current runtime is the SEO engine for performance.
	// <script>s are removed for avoiding accidentally XSS injections on code evaluation using external values.
	var SCRIPT_REGEX = /<\s*script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi

		// Recursively removes all the appearances of script tags from tempaltes&macros output - only for SEO output. Originally this was designed to prevent XSS attacks but now it is only for cleaning up SEO output.
	,	removeScripts = function (text)
		{
			if (isPageGenerator() && text)
			{
				text = text.replace(/(<!--[\s\S]*?-->)/g, ' $1 '); //invalidates de XSS attack like <scr<!--cheat-->ipt> - keep the comment and add spaces
				while (SCRIPT_REGEX.test(text))
				{
					text = text.replace(SCRIPT_REGEX, '');
				}
			}
			return text || '';
		}

		// minifyMarkup
		// function that runs only in SEO and minifies templates&macros output, jQuery.html() and jQuery.append(). It minifies HTML output, remove comments and wrap images with noscript for performance.
	,	minifyMarkup = function (text)
		{
			if (isPageGenerator() && text)
			{
				text = text
					// remove spaces between tags.
					.replace(/\>\s+</g, '><')
					// remove html comments that our markup could have.
					.replace(/<!--[\s\S]*?-->/g, '')
					// replace multiple spaces with a single one.
					.replace(/\s+/g, ' ');

				if (SC.blurInitialHTML)
				{
					// if SC.blurInitialHTML is turned on then the @main is not wrapped with no script that's why we need to wrap image by image:
					// Performance: wrap all images with noscript if in SEO so the browser don't start loading the images when parsing the SEO markup.
					// We do this with a regexp instead using parsed object because of the SEO engine. The following regexp wrap all <img> tags
					// with <noscript> only if they are not already wrapped. It supports the three formats: <img />, <img></img> and <img>
					text = text.replace(/(<img\s+[^>]*>\s*<\/img>|<img\s+[^>]*\/>|(?:<img\s+[^>]*>)(?!\s*<\/img>))(?!\s*<\s*\/noscript\s*>)/gmi,'<noscript>$1</noscript>');
				}					
			}
			if (!isPageGenerator() && window.fixImagesForLoader)
			{
				text = window.fixImagesForLoader(text); 
			}
			return text || '';
		};

	// if in SEO we also override jQuery.html() and jQuery.append() so html output is minified. Also remove scripts - so content scripts don't appear in SEO output.
	if (isPageGenerator())
	{
		var jQuery_originalHtml = jQuery.fn.html;
		jQuery.fn.html = function(html)
		{
			if (typeof html === 'string')
			{
				html = minifyMarkup(html);
				html = removeScripts(html);
			}
			return jQuery_originalHtml.apply(this, [html]);
		};

		var jQuery_originalAppend = jQuery.fn.append;
		jQuery.fn.append = function(html)
		{
			if (typeof html === 'string')
			{
				html = minifyMarkup(html);
				html = removeScripts(html);
			}
			return jQuery_originalAppend.apply(this, [html]);
		};
	}

	// _.template
	// Patch to the _.template function that removes all the script tags in the processed template
	_.template_original = _.template;

	_.template = _.wrap(_.template, function(_template)
	{
		// Calls the original _.template(), wrap if neccesary and filter the output with minifyMarkup() and removeScripts()
		var compiled_or_executed_template = _template.apply(this, Array.prototype.slice.call(arguments, 1));

		// The original has two signatures - we override both _.template('', {}) and _.template('').apply(this, [{}]);
		// _.template(source), generates a compiled version of the template to be executed at later time
		if (typeof compiled_or_executed_template === 'function')
		{
			return _.wrap(compiled_or_executed_template, function(compiled_template_function)
			{
				var result = compiled_template_function.apply(this, Array.prototype.slice.call(arguments, 1));
				result = minifyMarkup(result);
				result = removeScripts(result);
				return result;
			});
		}
		else
		{
			compiled_or_executed_template = minifyMarkup(compiled_or_executed_template);
			compiled_or_executed_template = removeScripts(compiled_or_executed_template);
			return compiled_or_executed_template;
		}
	});

})();

/*!
* Description: SuiteCommerce Reference ShopFlow
*
* @copyright (c) 2000-2013, NetSuite Inc.
* @version 1.0
*/

// Application.js
// --------------
// Extends the application with Shopping specific core methods

/*global _:true, SC:true, jQuery:true, Backbone:true*/

(function (Shopping)
{
	'use strict';

	// Get the layout from the application
	var Layout = Shopping.getLayout();

	// This will change the url when a "select" DOM element
	// of the type "navigator" is changed
	_.extend(Layout, {

		changeUrl: function (e)
		{
			// Disable other navigation links before redirection
            this.$('select[data-type="navigator"], .pagination-links a').attr('disabled','disabled');
            
            // Get the value of the select and navigate to it
			// http://backbonejs.org/#Router-navigate
			Backbone.history.navigate(this.$(e.target).val(), {trigger: true});
		}
		
	});

	_.extend(Layout.events, {
		'change select[data-type="navigator"]': 'changeUrl'
	});

	// Wraps the SC.Utils.resizeImage and passes in the settings it needs
	_.extend(Shopping, {

		resizeImage: function (url, size)
		{
			var mapped_size = Shopping.getConfig('imageSizeMapping.' + size, size);
			return SC.Utils.resizeImage(Shopping.getConfig('siteSettings.imagesizes', []), url, mapped_size);
		}	
	});

	// This is necessary for showing Cases menu option in header_profile_macro menu. Cases should only be available in My Account application.
	// By doing so, we are avoiding copying the entire module to ShopFlow but we preserve the same logic. We need to check if backend 
	// configuration is present and if the feature is enabled, keeping the same behavior My Account currently has.
	_.extend(Shopping, {
		
		CaseModule: {
			
			// Is Case functionality available for this application?
			isEnabled: function () 
			{
				return !_.isUndefined(SC.ENVIRONMENT.CASES) && !_.isUndefined(SC.ENVIRONMENT.CASES.CONFIG) && SC.ENVIRONMENT.CASES.enabled;
			}
		}
	});

	// Setup global cache for this application
	jQuery.ajaxSetup({cache:true});

	jQuery.ajaxPrefilter(function(options)
	{
		if (options.url)
		{
			if (options.type === 'GET' && options.data)
			{
				var join_string = ~options.url.indexOf('?') ? '&' : '?';
				options.url = options.url + join_string + options.data;
				options.data = '';
			}

			options.url = SC.Utils.reorderUrlParams(options.url);
		}

		if (options.pageGeneratorPreload && SC.ENVIRONMENT.jsEnvironment === 'server')
		{
			jQuery('<img />', { src: options.url }).prependTo('head').hide();
		}
	});

	//It triggers main nav collapse when any navigation occurs
	Backbone.history.on('all', function()
	{
		jQuery('.main-nav.in').collapse('hide');
	});


})(SC.Application('Shopping'));

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
			/*{
				id: 'category'
			,	name: _('Category').translate()
			,	priority: 10
			,	behavior: 'hierarchical'
			,	macro: 'facetCategories'
			,	uncollapsible: true
			,	titleToken: '$(0)'
			,	titleSeparator: ', '
			}
		,	*/
			{
				id: 'onlinecustomerprice'
			,	name: _('Price').translate()
			,	url: 'price'
			,	priority: 0
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
		//	{
		//	,	cartOptionId: 'custcol_color_option'
		//	,	label: 'Color'
		//	,	url: 'color'
		//	,	colors: {
		//			'Red': 'red'
		//		,	'Black': { type: 'image', src: 'img/black.gif', width: 22, height: 22 }
		//		}
		//	,	macros: {
		//			selector: 'itemDetailsOptionColor'
		//		,	selected: 'shoppingCartOptionColor'
		//		}
		//	}
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

// ItemsKeyMapping.js
// ------------------
// Holds the mapping of whats retuned by the search api / Commerce api for items
// to what is used all across the application.
// The main reason behind this file is that you may eventually want to change were an attribute of the item is comming from,
// for example you may want to set that the name of the items are store in a custom item field instead of the display name field,
// then you just change the mapping here instead of looking for that attribute in all templates and js files
(function ()
{
	'use strict';

	// itemImageFlatten:
	// helper function that receives the itemimages_detail (returned by the search api)
	// and flatens it into an array of objects containing url and altimagetext
	function itemImageFlatten (images)
	{
		if ('url' in images && 'altimagetext' in images)
		{
			return [images];
		}

		return _.flatten(_.map(images, function (item)
		{
			if (_.isArray(item))
			{
				return item;
			}

			return itemImageFlatten(item);
		}));
	}

	function getKeyMapping (application)
	{
		return {
			// Item Internal Id: used as a fallback to the url and to add to cart
			// You should not need to change this tho
			_id: 'internalid'

			// Item SKU number
		,   _sku: function (item)
			{
				var childs = item.getSelectedMatrixChilds()
				,	sku = item.get('itemid') || '';

				if (childs && childs.length === 1)
				{
					sku = childs[0].get('itemid') || sku;
				}

				return sku;
			}

			// Name of the item, some times displayname is empty but storedisplayname2 tends to be set always
		,   _name: function (item)
			{
				// If its a matrix child it will use the name of the parent
				if (item.get('_matrixParent').get('internalid'))
				{
					return item.get('_matrixParent').get('storedisplayname2') || item.get('_matrixParent').get('displayname');
				}

				// Otherways return its own name
				return item.get('storedisplayname2') || item.get('displayname');
			}

			// Page Title of the PDP
		,   _pageTitle: ['pagetitle', 'storedisplayname2', 'displayname']

			// h1 of the PDP and also the title of the modal
		,   _pageHeader: ['storedisplayname2', 'displayname']

		,	_keywords: 'searchkeywords'

		,	_metaTags: 'metataghtml'

			// This retuns the breadcrum json obj for the PDP
		,   _breadcrumb: function (item)
			{
				var breadcrumb = [{
					href: '/'
				,   text: _('Home').translate()
				}];

				// defaultcategory_detail attribute of the item is not consistent with the facets values,
				// so we are going to use the facet values instead
				/*var categories = _.findWhere(item.get('facets'), {id: 'category'})
				,	walkCategories = function walkCategories(category)
					{
						breadcrumb.push({
							href: '/' + category.id
						,   text: category.url
						});

						category.values && category.values.length && walkCategories(category.values[0]);
					};

				if (categories)
				{
					categories.values && categories.values.length && walkCategories(categories.values[0]);
				}*/

				breadcrumb.push({
					href: item.get('_url')
				,   text: item.get('_name')
				});

				return breadcrumb;
			}

			// Url of the item
		,   _url: function (item)
			{

				// If this item is a child of a matrix return the url of the parent
				if (item.get('_matrixParent') && item.get('_matrixParent').get('internalid'))
				{
					return item.get('_matrixParent').get('_url');
				}
				// if its a standar version we need to send it to the canonical url
				else if (SC.ENVIRONMENT.siteType && SC.ENVIRONMENT.siteType === 'STANDARD')
				{
					return item.get('canonicalurl');
				}
				// Other ways it will use the url component or a default /product/ID
				return item.get('urlcomponent') ? '/'+ item.get('urlcomponent') : '/product/'+ item.get('internalid');
			}

			// For an item in the cart it returns the url for you to edit the item
		,	_editUrl: function (item)
			{
				var url = (item.get('_matrixParent').get('_id')) ? item.get('_matrixParent').get('_url') : item.get('_url');

				// Appends the options you have configured in your item to the url
				url += item.getQueryString();

				// adds the order item id, the view will update the item in the cart instead of adding it
				if (item.get('line_id'))
				{
					var sep = url.indexOf('?') === -1 ? '?' : '&'; 
					url += sep + 'cartitemid='+ item.get('line_id');
				}

				return url;
			}

			// Object containing the url and the altimagetext of the thumbnail
		,   _thumbnail: function (item)
			{
				var item_images_detail = item.get('itemimages_detail') || {};

				// If you generate a thumbnail position in the itemimages_detail it will be used
				if (item_images_detail.thumbnail)
				{
					if (_.isArray(item_images_detail.thumbnail.urls) && item_images_detail.thumbnail.urls.length)
					{
						return item_images_detail.thumbnail.urls[0]; 
					}

					return item_images_detail.thumbnail; 
				}

				// otherwise it will try to use the storedisplaythumbnail
				if (SC.ENVIRONMENT.siteType && SC.ENVIRONMENT.siteType === 'STANDARD' && item.get('storedisplaythumbnail'))
				{
					return {
						url: item.get('storedisplaythumbnail')
					,	altimagetext: item.get('_name')
					};
				}
				// No images huh? carry on

				var parent_item = item.get('_matrixParent');
				// If the item is a matrix child, it will return the thumbnail of the parent
				if (parent_item && parent_item.get('internalid'))
				{
					return parent_item.get('_thumbnail');
				}

				var images = itemImageFlatten(item_images_detail);
				// If you using the advance images features it will grab the 1st one
				if (images.length)
				{
					return images[0];
				}

				// still nothing? image the not available
				return {
					url: application.Configuration.imageNotAvailable
				,	altimagetext: item.get('_name')
				};
			}

			// Array of objects containing the url and the altimagetext of the images of the item
		,	_images: function (item)
			{
				var result = []
				,	selected_options = item.itemOptions
				,	item_images_detail = item.get('itemimages_detail') || {}
				,   swatch = selected_options && selected_options[application.getConfig('multiImageOption')] || null;

				item_images_detail = item_images_detail.media || item_images_detail;

				if (swatch && item_images_detail[swatch.label])
				{
					result = itemImageFlatten(item_images_detail[swatch.label]);
				}
				else
				{
					result = itemImageFlatten(item_images_detail);
				}

				return result.length ? result : [{
					url: application.Configuration.imageNotAvailable
				,	altimagetext: item.get('_name')
				}];
			}

			// For matrix child items in the cart we generate this position so we have a link to the parent
		,	_matrixParent: 'matrix_parent'

			// For matrix parent items, where are the attribures of the children
		,   _matrixChilds: 'matrixchilditems_detail'

			// The definition of the options of items with options
		,   _optionsDetails: 'itemoptions_detail'

			// Related items
		,   _relatedItems: 'related_items'

			// Related items in the PDP.
		,	_relatedItemsDetail: 'relateditems_detail'

			// Correlated (Upsell) items in the PDP.
		,	_correlatedItemsDetail: 'correlateditems_detail'

			// Item price information
		,   _priceDetails: 'onlinecustomerprice_detail'
		,	_price: function (item)
			{
				return (item.get('onlinecustomerprice_detail') && item.get('onlinecustomerprice_detail').onlinecustomerprice) || '';
			}

		,	_price_formatted: function (item)
			{
				return (item.get('onlinecustomerprice_detail') && item.get('onlinecustomerprice_detail').onlinecustomerprice_formatted) || '';
			}

		,   _comparePriceAgainst: 'pricelevel1'
		,   _comparePriceAgainstFormated: 'pricelevel1_formatted'

			// Item Type
		,   _itemType: 'itemtype'

			// Stock, the number of items you have available
		,   _stock: 'quantityavailable'

		,	_minimumQuantity: function (item)
			{
				// if there is an unique child selected then we show its message. Otherwise we show the parent's
				var childs = item.getSelectedMatrixChilds();
				if (childs && childs.length === 1)
				{
					return childs[0].get('minimumquantity') || 1;
				}
				return item.get('minimumquantity') || 1;
			}

		,	_isReturnable: function (item)
			{
				var type = item.get('itemtype');

				return type === 'InvtPart' || type === 'NonInvtPart' || type === 'Kit';
			}

		,	_isInStock: 'isinstock'
		,	_isPurchasable: 'ispurchasable'
		,	_isBackorderable: 'isbackorderable'
		,	_showOutOfStockMessage: 'showoutofstockmessage'

			// Show the IN STOCK label, this can be configured in a per item basis
		,   _showInStockMessage: function ()
			{
				return false;
			}

			// Should we show the stock description?
		,   _showStockDescription: function ()
			{
				return true;
			}

			// Stock Description, some times used to display messages like New Arrival, Ships in 3 days or Refubrished
		,   _stockDescription: 'stockdescription'

			// Stock Description class, we use this to add a class to the html element containig the _stockDescription so you can easily style it.
			// This implementation will strip spaces and other punctuations from the _stockDescription and prepend stock-description-
			// so if your _stockDescription is Ships in 3 days your _stockDescriptionClass will be stock-description-ships-in-3-days
		,   _stockDescriptionClass: function (item)
			{
				return 'stock-description-'+ (item.get('_stockDescription') || '').toLowerCase().replace(/[\W\"]+/g,'-').replace(/\-+/g,'-');
			}

			// What to write when the item is out of stock
		,   _outOfStockMessage: function (item)
			{
				return item.get('outofstockmessage2') || item.get('outofstockmessage');
			}

			// What to write when the item is in stock
		,   _inStockMessage: function ()
			{
				return _('In Stock').translate();
			}

			// Reviews related item attributes

			// Overal item rating
		,   _rating: function (item)
			{
				return Math.round(item.get('custitem_ns_pr_rating') * 10) / 10 || 0;
			}

			// How many times this item was reviewd
		,   _ratingsCount: function (item)
			{
				return item.get('custitem_ns_pr_count') || 0;
			}

			// What are the posible attributes I want this item to be rated on
		,   _attributesToRateOn: function (item)
			{
				var attributes = item.get('custitem_ns_pr_item_attributes') || '';

				return _.reject(attributes.split(', '), function (attribute)
				{
					return !attribute || attribute === '&nbsp;';
				});
			}

			// returns a object containing the average rating per atribute
		,   _attributesRating: function (item)
			{
				return JSON.parse(item.get('custitem_ns_pr_attributes_rating'));
			}

			// returns an object containig how many reviews it the item has for each particular rating
		,   _ratingsCountsByRate: function (item)
			{
				return item.get('custitem_ns_pr_rating_by_rate') && JSON.parse(item.get('custitem_ns_pr_rating_by_rate')) || {};
			}
		};
	}

	function mapAllApplications ()
	{
		// This file can be used for multiple applications, so we avoided making it application specific
		// by iterating the collection of defined applications.
		_.each(SC._applications, function (application)
		{
			// Makes double sure that the Configuration is there
			application.Configuration = application.Configuration || {};

			// Extends the itemKeyMapping configuration
			// The key mapping object is simple object were object keys define how the application is going to call it
			// and values define from which key to read in the result of the search api
			// There are three posible ways to define a key mapping:
			//   - _key: "search_api_key" -- This means, Whenever I ask you for the _key returned anythig that you have in the search_api_key key of the item object
			//   - _key: ["search_api_key", "second_options"] -- similar as avobe, but if the 1st key in the array is falsy go and try the next one, it will retun the 1st truthful value
			//   - _key: function (item){ return "something you want"; } -- you can also set up a function that will recive the item model as argument and you can set what to return.
			application.Configuration.itemKeyMapping = _.defaults(application.Configuration.itemKeyMapping || {}, getKeyMapping(application));
		});
	}

	if (typeof require !== 'undefined')
	{
		define('ItemsKeyMapping', [], function ()
		{
			return {
				getKeyMapping: getKeyMapping
			,	mapAllApplications: mapAllApplications
			};
		});
	}

	mapAllApplications();
})();

// Address.Collection.js
// -----------------------
// Addresses collection
define('Address.Collection', ['Address.Model'], function (Model)
{
	'use strict';
	
	return Backbone.Collection.extend(
	{
		model: Model
	,	url: 'services/address.ss'

	});
});

// Address.Model.js
// -----------------------
// Model for handling addresses (CRUD)
define('Address.Model', function ()
{
	'use strict';

	function isCompanyRequired()
	{
		return	SC.ENVIRONMENT.siteSettings &&
				SC.ENVIRONMENT.siteSettings.registration &&
				SC.ENVIRONMENT.siteSettings.registration.companyfieldmandatory === 'T';
	}

	return Backbone.Model.extend(
	{
		urlRoot: 'services/address.ss'

	,	validation: {
			fullname: { required: true, msg: _('Full Name is required').translate() }
		,	addr1: { required: true, msg: _('Address is required').translate() }
		,	company: { required: isCompanyRequired(), msg: _('Company is required').translate() }
		,	country: { required: true, msg: _('Country is required').translate() }
		,	state: { fn: _.validateState }
		,	city: { required: true, msg: _('City is required').translate() }
		,	zip: { fn: _.validateZipCode }
		,	phone: { fn: _.validatePhone }
		}

		// Returns an array of localized attributes that are invalid for the current address
	,	getInvalidAttributes: function ()
		{
			//As this model is not always used inside a model's view, we need to check that the validation is attached
			var attributes_to_validate = _.keys(this.validation)
			,	attribute_name
			,	invalid_attributes = [];

			this.get('isvalid') !== 'T' && this.isValid(true) && _.extend(this, Backbone.Validation.mixin);

			_.each(attributes_to_validate, function (attribute)
			{
				if (!this.isValid(attribute))
				{
					switch (attribute)
					{
						case 'fullname':
							attribute_name = _('Full Name').translate();
							break;
						case 'addr1':
							attribute_name = _('Address').translate();
							break;
						case 'city':
							attribute_name = _('City').translate();
							break;
						case 'zip':
							attribute_name = _('Zip Code').translate();
							break;
						case 'country':
							attribute_name = _('Country').translate();
							break;
						case 'phone':
							attribute_name = _('Phone Number').translate();
							break;
					}
					invalid_attributes.push(attribute_name);
				}
			},this);

			return invalid_attributes;
		}

	});
});

/* global CMS: false */
/**
 *	CMSadapter
 *	@summary Allows a SCA app to get content & interact with the CMS.
 *	@copyright (c) 2000-2014, NetSuite Inc.
 *
 *	NOTE: Assuming the main SCA app has included Underscore.js and left it on the global window object (Just like other SCA modules).
 */

define('CMSadapter'
,	['jquery','Merchandising.ItemCollection', 'Merchandising.Zone', 'Merchandising.Context']
,	function ($, MerchandisingItemCollection, MerchandisingZone, MerchandisingContext)
{
	'use strict';

	var CMSMerchandisingZone = function (element, options)
	{
		var application = options && options.application
		,	layout = application && application.getLayout && application.getLayout()
		,	items_url = decodeURIComponent(options.fields.clob_merch_rule_url)
		,	CMSMerchandisingItemCollection = MerchandisingItemCollection.extend({url: items_url})
		,	exclude = [];

		if (options.fields.boolean_exclude_current)
		{
			exclude.push('$current');
		}

		if (options.fields.boolean_exclude_cart)
		{
			exclude.push('$cart');
		}

		if (!element || !layout)
		{
			return;
		}

		this.$element = jQuery(element).empty();

		// Convert CMS data into SCA Merchandising models
		this.model = new Backbone.Model(options);
		this.model.set('show', options.fields.number_merch_rule_count || 100);
		this.model.set('exclude', exclude);
		this.model.set('template', options.fields.string_merch_rule_template);
		this.model.set('description', options.desc);

		this.options = options;
		this.application = application;
		this.items = new CMSMerchandisingItemCollection();
		this.context = new MerchandisingContext(layout.modalCurrentView || layout.currentView || layout);

		this.initialize();
	};

	_.extend(CMSMerchandisingZone.prototype, MerchandisingZone.prototype, {
		//We override the initialize method to NOT generate the URL from the model, as the URL is already calculate from the CXM code
		initialize: function ()
		{
			this.addLoadingClass();
			// the listeners MUST be added before the fetch occurs
			this.addListeners();

			// fetch the items
			this.items.fetch({
				cache: true
			});
		}
	});

	var startup_cms_load_done = false
	,	adapter_config = {
			IMAGE_CONTENT_DEFAULT_TEMPLATE: 'image_default'
		}
		// NOTE: Not polyfilling the addEventListener & removeEventListener methods in the browser
		// so libs like jQuery will continue to work without issue in legacy IE.
	,	ie_prop_listeners = {}
	,	addEventListener = function (type, callback)
		{
			var prop_fn = function (e)
				{
					if (e.propertyName === type)
					{
						callback();
					}
				};
			// Modern browsers have addEventListener.
			if (document.addEventListener)
			{
				document.addEventListener(type, callback);
			// IE5-8 handled here.
			// The cms will update a property with the same name as the event on the documentElement.
			}
			else if (document.attachEvent)
			{
				document.documentElement.attachEvent('onpropertychange', prop_fn);
				ie_prop_listeners[type] = prop_fn; // Keep track of our new function for removal later.
			}
		}
	,	removeEventListener = function (type, listener)
		{
			if (document.removeEventListener)
			{
				document.removeEventListener(type, listener);
			}
			else if (document.detachEvent)
			{
				if (ie_prop_listeners[type])
				{
					document.documentElement.detachEvent('onpropertychange', ie_prop_listeners[type]);
				}
				ie_prop_listeners[type] = null;
			}
		}

	,	CMSadapter = {
			// App start
			mountToApp: function (Application)
			{
				var self = this
				,	readyHandler = function ()
					{
						removeEventListener('cms:ready', readyHandler);
						CMS.api.setApplication(self.application);
						self.start(self.application);
					};

				self.application = Application;

				Application.getLayout().once('afterAppendView', function ()//(view)
				{
					// CMS start
					if (typeof CMS !== 'undefined' && CMS.api && CMS.api.is_ready())
					{
						readyHandler();
					}
					else
					{
						addEventListener('cms:ready', readyHandler);
					}
				});
			}
			// Start - listen for events
		,	start: function (Application)
			{
				var self = this
				,	loadHandler = function ()
					{
						removeEventListener('cms:load', loadHandler);
						startup_cms_load_done = true;
						self.getPage();
					};

				// Initial load
				if (CMS.api.has_loaded())
				{
					loadHandler();
				}
				else
				{
					addEventListener('cms:load', loadHandler);
				}

				// ==================
				// App listeners
				// =====================
				// App events:
				// beforeStart
				// afterModulesLoaded
				// afterStart

				// afterAppendView fires when html is added to the page. Usually when a user has navigated to another page. But can also fire on things like modals for the "quick look" on products.
				// This is the only event we have currently to know that SCA might have loaded a page.
				// We wait until startup_cms_load_done is true before really listening to afterAppendView requests. This prevents extra requests during page startup due to race-conditions/timing of SCA and CMS.
				Application.getLayout().on('afterAppendView', function ()//(view)
				{
					// Adapter needs to get new content in case it was a page load that happened.
					// This is outside of the cms on purpose. When a normal user is not authenticated, the website still needs to get content.
					if (startup_cms_load_done)
					{
						// 'AFTER APPENDVIEW GET PAGE'
						self.getPage();

						// let the cms know
						CMS.trigger('adapter:page:changed');
					}
				});

				// ==================
				// CMS listeners - CMS tells us to do something, could fire anytime
				// =====================

				CMS.on('cms:get:setup', function ()
				{
					// default values the cms needs upon startup
					var setup = {
						site_id: SC.ENVIRONMENT.siteSettings.id
					};

					CMS.trigger('adapter:got:setup', setup);
				});

				CMS.on('cms:new:content', function (content)
				{
					// A content model is provided, and should be rendered on the current page.
					var context = _.findWhere(content.context, {id: content.current_context})
					,	sequence = context.sequence
					,	area = $('[data-cms-area="'+context.area+'"]')
					,	children = area.children().not('.ns_ContentDropzone')
						// NOTE: Currently, all new content should be blank by default
					,	new_html = '<div class="'+ self.generateContentHtmlClass(content) +'" id="'+ self.generateContentHtmlID(content) +'">'+ self.renderContentByType(content, true) +'</div>';

					// TODO: Any need to verify context matches current page context (from sca)? Should always match but do we need to check?

					// insert at proper index, assuming only children of area can be "content",
					// even if they have been wrapped with new html (by cms internal code) it's safe to still inject based on index
					if (sequence === 0 || children.length === 0)
					{
						area.prepend(new_html);
					}
					else if (sequence > (children.length - 1))
					{
						area.append(new_html);
					}
					else
					{
						children.eq(sequence).before(new_html);
					}

					CMS.trigger('adapter:rendered'); // let CMS know we're done
				});

				// Re-render an existing piece of content. Changing only the content values, NOT creating/re-creating the cms-content wrapper divs.
				CMS.on('cms:rerender:content', function (content)
				{
					var selector = self.generateContentHtmlID(content, true)
					,	html_content = self.renderContentByType(content, true);

					if (html_content)
					{
						$(selector).html(html_content);
					}
					CMS.trigger('adapter:rendered');
				});

				CMS.on('cms:get:context', function ()
				{
					var context = self.getPageContext();
					CMS.trigger('adapter:got:context', context);
				});

				// This is for times when the CMS is telling the adapter to re-render the page, even though the adapter did not initiate the request for page data
				CMS.on('cms:render:page', function (page)
				{
					self.renderPageContent(page);
				});

				// ==================
				// END CMS listeners
				// =====================

				// ADAPTER TRIGGERED READY.
				CMS.trigger('adapter:ready');
			}

		,	renderPageContent: function (page)
			{
				var self = this;
				$.each(page.areas, function (indx, area)
				{
					var selector = '[data-cms-area="'+ area.name +'"]'
					,	ele_string = '';

					// build html string for all content in the area
					$.each(area.contents, function (sub_indx, content)
					{
						// Start new content div.
						ele_string += '<div class="'+ self.generateContentHtmlClass(content) +'" id="'+ self.generateContentHtmlID(content) +'">';
						ele_string += self.renderContentByType(content);
						ele_string += '</div>'; // Close new content div.
					});

					// inject content
					$(selector).html(ele_string);
				});
				CMS.trigger('adapter:rendered');
			}

		,	renderContentByType: function (content, is_edit_preview)
			{
				if (typeof is_edit_preview !== 'boolean')
				{
					is_edit_preview = false;
				}

				var self = this
				,	content_type = content.type
				,	trimmed_text_content
				,	content_html = '';

				switch (content_type)
				{
					case 'TEXT':
						trimmed_text_content = $.trim(content.fields.clob_html);
						if (trimmed_text_content !== '')
						{
							content_html = trimmed_text_content;
						}
					break;
					case 'IMAGE':
						if (content.fields.string_src)
						{
							content_html = SC.macros[adapter_config.IMAGE_CONTENT_DEFAULT_TEMPLATE](content);
						}
					break;
					case 'MERCHZONE':
					// NOTE: merchzone doesn't set content_html. Instead an Ajax call is made to fill in content later.
						if (content.fields.clob_merch_rule_url)
						{
							// Call items api.
							// NOTE: It's OK to use fields.clob_merch_rule_url here instead of making an additional request for merchzone data because this value should be the latest available when merchzone content is being edited.
							if (is_edit_preview)
							{
								var element_selector = self.generateContentHtmlID(content, true);
								//The creation of the CMS merchandising will take care of the entire rendering

								new CMSMerchandisingZone(element_selector, _.extend({application: self.application}, content));
							}
							else
							{
								// NOTE: We need the most currently available items api URL (so we get merchzone data), can't rely on content.fields.clob_merch_rule_url, it could be old (and we only use that for preview when editing anyway).
								CMS.api.getMerchzone({
									merch_rule_id: content.fields.number_merch_rule_id
								,	success: function (zone)
									{
										if (zone && zone.merch_zone && !zone.merch_zone.is_inactive && zone.merch_zone.is_approved && zone.merch_zone.query_string )
										{
											var element_selector = self.generateContentHtmlID(content, true);
											//The creation of the CMS merchandising will take care of the entire rendering
											//Pass the current application, the content that contains which items to exclude, and the zone that contains its name and description

											new CMSMerchandisingZone(element_selector, _.extend({application: self.application}, content, zone.merch_zone));

										// If the rule was set to inactive after it was placed on the page we need to clear out the content rule URL.
										}
										else if (zone.merch_zone.is_inactive || !zone.merch_zone.is_approved)
										{
											content.fields.clob_merch_rule_url = undefined;
										}
									}
								});
							}
						}
					break;
					default:
						// do nothing
				}

				return content_html;
			}

		,	generateContentHtmlClass: function (content, include_dot)
			{
				return (include_dot ? '.': '') + 'cms-content cms-content-'+ content.type.toLowerCase();
			}
		,	generateContentHtmlID: function (content, include_hash)
			{
				return (include_hash ? '#': '') + 'cms-content-'+ content.id +'-'+ content.current_context;
			}
		,	getPage: function ()
			{
				var self = this;
				// CMS requests
				// get current page's content on load
				CMS.api.getPage({
					page: self.getPageContext()
				,	success: function (page)
					{
						self.renderPageContent(page);
					}
				,	error: function ()
					{

					}
				});
			}
		,	getPagePath: function ()
			{
				var canonical = Backbone.history.fragment
				,	index_of_query = canonical.indexOf('?');

				return !~index_of_query ? canonical : canonical.substring(0, index_of_query);
			}
			//@method getPageContext
		,	getPageContext: function ()
			{
				// returning a new object every-time, so no need to clone
				return {
					site_id: SC.ENVIRONMENT.siteSettings.id
				// ,	path: this.application.getLayout().getCanonical()
				,	path: this.getPagePath()
				,	page_type: this.application.getLayout().currentView.el.id
				};
			}
		};
	// NOTE: outside of mount to app and the CMSadapter class! - will run as soon as requirejs loads module
	return CMSadapter;
});

// AjaxRequestsKiller.js
// ---------------------
// Keeps trak of ongoing ajax requests and of url (or hash) changes,
// so when the url changes it kills all pending ajax requests that other routers may have initiated.
// It's important to note that not all ajax request are opened by the change of the url,
// for that reason it's important that you tag thouse who do by adding a killerId: this.application.killerId to the request (collection.fetch and model.fetch may trigger a request)
define('AjaxRequestsKiller', function ()
{
	'use strict';

	return {
		mountToApp: function (application)
		{
			// Sets the first Killer ID
			// Every time the url changes this will be reseted,
			// but as we are the last listening to the url change event
			// this only happends after all request are made
			application.killerId = _.uniqueId('ajax_killer_');

			// Every time a request is made, a ref to it will be store in this collection.
			application.lambsToBeKilled = [];

			// Wraps the beforeSend function of the jQuery.ajaxSettings
			jQuery.ajaxSettings.beforeSend = _.wrap(jQuery.ajaxSettings.beforeSend, function (fn, jqXhr, options)
			{
				// If the killerId is set we add it to the collection
				if (options.killerId)
				{

					jqXhr.killerId = options.killerId;
					application.lambsToBeKilled.push(jqXhr);
				}

				// Finnaly we call the original jQuery.ajaxSettings.beforeSend
				fn.apply(this, _.toArray(arguments).slice(1));
			});

			// We listen to the afterStart because Backbone.history is *potentialy* not ready untill after that
			application.on('afterStart', function ()
			{
				// There is a timinig issue involved,
				// the on all event happends after the 2nd requests is done
				Backbone.history.on('all', function ()
				{
					// Check previous ongoing requests
					_.each(application.lambsToBeKilled, function (prev_jqXhr)
					{
						// if the new id is different than the old one, it means that there is a new killer id,
						// so we kill the old one if its still ongoing
						if (application.killerId && application.killerId !== prev_jqXhr.killerId)
						{
							if (prev_jqXhr.readyState !== 4)
							{
	
								// If we are killing this request we dont want the ErrorHandling.js to handle it
								prev_jqXhr.preventDefault = true;
								prev_jqXhr.abort();
							}

							// we take it off the lambsToBeKilled collection to free some space and processing.
							application.lambsToBeKilled = _.without(application.lambsToBeKilled, prev_jqXhr);
						}
					});

					// Generates a new id for the **next** request
					application.killerId = _.uniqueId('ajax_killer_');
				});
			});
		}
	};
});

// BackToTop.js
// ------------
// Adds a back to top functionality to any element that has data-action="back-to-top"
define('BackToTop', function () 
{
	'use strict';

	return {
		mountToApp: function (Application)
		{
			var Layout = Application.getLayout();
			
			// adding BackToTop function in Layout 
			_.extend(Layout, {
				backToTop: function ()
				{
					jQuery('html, body').animate({scrollTop: '0px'}, 300);
				}
			});
			
			// adding events for elements of DOM with data-action="back-to-top" as parameter.
			_.extend(Layout.events, {
				'click [data-action="back-to-top"]': 'backToTop'
			});
		}
	};
});
// Cart.js
// -------
// Defines the Cart module (Model, Collection, Views, Router)
// mountToApp handles some environment issues
// Add some function to the application
// * getCart()
// * loadCart()
// and to the layout
// * updateMiniCart()
// * showMiniCart()
// * showCartConfirmationModal()
// * goToCart()
// * showCartConfirmation()
define('Cart'
,	['LiveOrder.Model', 'Cart.Views', 'Cart.Router']
,	function (LiveOrderModel, Views, Router)
{
	'use strict';

	return {
		Views: Views
	,	Router: Router
	,	mountToApp: function (application, options)
		{
			var layout = application.getLayout();

			// application.getCart():
			// Use it to acuire the cart model instance
			application.getCart = function ()
			{
				if (!application.cartInstance)
				{
					//In cases were the cart is bootstrapped (Checkout) the Starter.js is the responsible for set each attribute from the SC.ENVIRONMENT
					application.cartInstance = new LiveOrderModel({internalid: 'cart'});
					application.cartInstance.application = application;
					application.cartInstance.bootstraped = SC.ENVIRONMENT.CART_BOOTSTRAPED;
					application.cartInstance.isLoading = !SC.ENVIRONMENT.CART_BOOTSTRAPED;
				}

				return application.cartInstance;
			};

			// Get the cart fetch promise
			application.loadCart = function ()
			{
				// if the Page Generator is on, do not fetch the cart. Instead, return an empty solved promise
				if(SC.isPageGenerator())
				{
					return jQuery.Deferred().resolve();
				}

				var self = this;
				if (this.cartLoad)
				{
					if (application.cartInstance.isLoading)
					{
						application.cartInstance.isLoading = false;
						layout.updateMiniCart();
					}
					return this.cartLoad;
				}
				else
				{
					this.cartLoad = jQuery.Deferred();
					application.getUserPromise().done(function ()
					{
						self.getCart().fetch()
							.done(function ()
							{
								self.cartLoad.resolve.apply(this, arguments);
							})
							.fail(function ()
							{
								self.cartLoad.reject.apply(this, arguments);
							})
							.always(function ()
							{
								if (application.cartInstance.isLoading)
								{
									application.cartInstance.isLoading = false;
									layout.updateMiniCart();
								}
							});
					});
				}

				return this.cartLoad;
			};

			_.extend(layout.key_elements, {
				miniCart: '#mini-cart-container'
			,	miniCartSummary: '.mini-cart-summary'
			});

			// layout.updateMiniCart()
			// Updates the minicart by running the macro and updating the miniCart key Element
			layout.updateMiniCart = function ()
			{
				if (application.getConfig('siteSettings.sitetype') === 'ADVANCED')
				{
					var cart = application.getCart();
					this.$miniCart.html(SC.macros.miniCart(cart, application));
					this.$miniCartSummary.html(SC.macros.miniCartSummary(cart.getTotalItemCount(), application.cartInstance.isLoading));
				}
			};

			// layout.showMiniCart()
			layout.showMiniCart = function ()
			{
				jQuery(document).scrollTop(0);
				// Hide the modal
				layout.$containerModal && layout.$containerModal.length && layout.$containerModal.modal('hide');
				this.$(layout.key_elements.miniCart + ' .dropdown-toggle').parent().addClass('open');
			};

			// layout.showCartConfirmationModal()
			layout.showCartConfirmationModal = function ()
			{
				this.showInModal(new Views.Confirmation({
					layout: this
				,	application: application
				,	model: application.getCart()
				}));
			};

			// layout.goToCart()
			layout.goToCart = function ()
			{
				Backbone.history.navigate('cart', { trigger: true });
			};

			// layout.showCartConfirmation()
			// This reads the configuration object and execs one of the fuctions avome
			layout.showCartConfirmation = function ()
			{
				// Available values are: goToCart, showMiniCart and showCartConfirmationModal
				layout[application.getConfig('addToCartBehavior')]();
			};

			// Every time the cart changes the mini cart gets updated
			layout.on('afterRender', function ()
			{
				application.getCart().on('change', function ()
				{
					layout.updateMiniCart();
				});
			});

			// Check if cart was bootstrapped
			var cart_bootstrap = application.getCart().bootstraped;
			if(!cart_bootstrap)
			{
				// Load the cart information
				application.loadCart();
			}

			// Initializes the router
			if (options && options.startRouter)
			{
				return new Router(application, options.saveForLater);
			}
		}
	};
});

// Cart.Router.js
// --------------
// Creates the cart route
define('Cart.Router', ['Cart.Views'], function (Views)
{
	'use strict';

	return Backbone.Router.extend({

		routes: {
			'cart': 'showCart'
		,	'cart?*options': 'showCart'
		}

	,	initialize: function (Application, isSaveForLater)
		{
			this.isSaveForLater = isSaveForLater;
			this.application = Application;
		}

	,	showCart: function ()
		{
			if (this.application.ProductListModule && this.application.ProductListModule.isProductListEnabled() && this.isSaveForLater)
			{
				var self = this;

				require(['Cart.SaveForLater.View'], function (saveForLaterCartView)
				{
					self.renderView(saveForLaterCartView);
				});
			}
			else
			{
				this.renderView(Views);
			}
		}

	,	renderView: function (CartView)
		{
			var self = this
			,	optimistic_promise = self.application.getCart().optimistic && self.application.getCart().optimistic.promise
			,	cart_promise = self.application.loadCart();

			jQuery.when(optimistic_promise || jQuery.Deferred().resolve(), cart_promise).done(function ()
			{
				var view = new CartView.Detailed({
					model: self.application.getCart()
				,	application: self.application
				});

				view.showContent();
			});
		}
	});
});

define('Cart.SaveForLater.View', ['ErrorManagement', 'ProductListDetails.View', 'ProductList.Model', 'ProductListItem.Model', 'Cart.Views', 'Session'], function (ErrorManagement, ProductListDetailsView, ProductListModel, ProductListItemModel, CartViews, Session)
{
	'use strict';

	var view = CartViews.Detailed.extend({

		render : function()
		{
			CartViews.Detailed.prototype.render.apply(this, arguments);

			this.renderSaveForLaterSection();
		}

    ,	renderSaveForLaterSection: function()
		{
			var application = this.model.application;
			
			if (application.getUser().get('isLoggedIn') !== 'T')
			{		
				return;
			}

			var self = this;

			application.getSavedForLaterProductList().done(function(json)
			{
				self.renderSaveForLaterSectionHelper(new ProductListModel(json));
			});		
		}

	,	renderSaveForLaterSectionHelper: function(pl_model)
		{
			var self = this
			,	application = this.model.application;
			
			this.product_list_details_view = new application.ProductListModule.Views.Details({ application: application, model: pl_model, sflMode:true, addToCartCallback:function() {self.addToCart(); } } );
			this.product_list_details_view.template = 'product_list_details_later';
			
			this.$('[data-type=saved-for-later-placeholder]').empty();
			this.$('[data-type=saved-for-later-placeholder]').append(this.product_list_details_view.render().el);
		}

	,	addToCart: function()
		{
			this.showContent();
		}

		// save for later: 
		// handles the click event of the save for later button
		// removes the item from the cart and adds it to the saved for later list
	,	saveForLaterItem: function (e)
		{
			e.preventDefault();

			if (!this.validateLogin())
			{
				return;
			}
			
			this.storeColapsiblesState();

			var product = this.model.get('lines').get(jQuery(e.target).data('internalid'))
			,	internalid = product.get('internalid')
			,	whole_promise = jQuery.Deferred()
			,	self = this;

			if (product.ongoingPromise)
			{
				product.ongoingPromise.then(function (new_line)
				{
					product = self.model.get('lines').get(new_line.latest_addition);

					self.saveForLaterItemHelper(whole_promise, product);
				});
			}
			else
			{
				this.saveForLaterItemHelper(whole_promise, product);
			}	

			this.disableElementsOnPromise(whole_promise, 'article[id="' + internalid + '"] a, article[id="' + internalid + '"] button');
		}

	,	saveForLaterItemHelper: function (whole_promise, product)
		{
			var self = this;

			jQuery.when(this.model.removeLine(product), self.addItemToList(product.get('item'))).then(function() 
			{
				self.showContent();

				self.showConfirmationMessage(_('Good! You saved the item for later. If you want to add it back to your cart, see below in <b>"Saved for later"</b>').translate());

				whole_promise.resolve();
			});
		}
		
		// Add a new product list item into a product list		
	,	addItemToList: function (product)
		{
			var defer = jQuery.Deferred();

			if (this.validateGiftCertificate(product))
			{
				var self = this
				,	application = this.model.application;

				application.getSavedForLaterProductList().done(function(pl_json)
				{
					if (!pl_json.internalid)
					{
						var pl_model = new ProductListModel(pl_json);

						pl_model.save().done(function (pl_json)
						{
							self.doAddItemToList(pl_json.internalid, product, defer);						
						});		
					}
					else
					{
						self.doAddItemToList(pl_json.internalid, product, defer);
					}
				});
			}			
			else
			{
				defer.resolve();
			}			

			return defer.promise();
		}

	,	getItemOptions: function (itemOptions)
		{
			var result = {};

			_.each(itemOptions, function (value, name)
			{
				result[name] = { value: value.internalid, displayvalue: value.label };
			});

			return result;
		}

		// Adds the new item to the collection
	,	doAddItemToList: function (pl_internalid, product, internal_promise)
		{
			var application = this.model.application
			,	product_list_item = {
					description: ''
				,	options: this.getItemOptions(product.itemOptions)
				,	quantity: product.get('quantity')
				,	productList: {
						id: pl_internalid
					}
				,	item: {
						internalid: application.ProductListModule.internalGetProductId(product)
					}
			}
			,	product_list_item_model = new ProductListItemModel(product_list_item);

			product_list_item_model.save().done(function () 
			{				
				internal_promise.resolve();
			});
		}

	,	validateLogin: function ()
		{
			var application = this.model.application;

			if (application.getUser().get('isLoggedIn') === 'F')
			{
				var login = Session.get('touchpoints.login');
				
				login += '&origin=' + application.getConfig('currentTouchpoint');
				login += '&origin_hash=' + Backbone.history.fragment;
				window.location.href = login;
				
				return false;
			}

			return true;
		}
	});

	_.extend(view.prototype.events, 
	{
		'click [data-action="save-for-later-item"]': 'saveForLaterItem'
	});

	return { Detailed: view };
});

// Cart.Views.js
// -------------
// Cart and Cart Confirmation views
define('Cart.Views', ['ErrorManagement'], function (ErrorManagement)
{
	'use strict';

	var Views = {}
	,	colapsibles_states = {};

	// Views.Detailed:
	// This is the Shopping Cart view
	Views.Detailed = Backbone.View.extend({

		template: 'shopping_cart'

	,	title: _('Shopping Cart').translate()

	,	page_header: _('Shopping Cart').translate()

	,	attributes: {
			'id': 'shopping-cart'
		,	'class': 'view shopping-cart'
		}

	,	events: {
			'change [name="quantity"]': 'updateItemQuantity'
		,	'keyup [name="quantity"]': 'updateItemQuantity'
		,	'blur [name="quantity"]': 'updateItemQuantityBlur'
		,	'submit [data-action="update-quantity"]': 'updateItemQuantityFormSubmit'

		,	'click [data-action="remove-item"]': 'removeItem'

		,	'submit form[data-action="apply-promocode"]': 'applyPromocode'
		,	'click [data-action="remove-promocode"]': 'removePromocode'

		,	'submit form[data-action="estimate-tax-ship"]': 'estimateTaxShip'
		,	'click [data-action="remove-shipping-address"]': 'removeShippingAddress'
		,	'change [data-action="estimate-tax-ship-country"]': 'changeCountry'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
		}

		// showContent:
		// calls the layout's default show content method
	,	showContent: function ()
		{
			var self = this;

			return this.application.getLayout().showContent(this, true).done(function (view)
			{
				self.renderRelatedAndCorrelatedItemsHelper(view);
			});
		}

	,	renderRelatedAndCorrelatedItemsHelper: function (view)
		{
			// related items
			var related_items_placeholder = view.$('[data-type="related-items-placeholder"]')
			,	application = this.application;

			// check if there is a related items placeholders
			if (related_items_placeholder.length)
			{
				application.showRelatedItems && application.showRelatedItems(view.model.getItemsIds(), related_items_placeholder);
			}

			// correlated items
			var correlated_items_placeholder = view.$('[data-type="correlated-items-placeholder"]');
			// check if there is a related items placeholders
			if (correlated_items_placeholder.length)
			{
				application.showRelatedItems && application.showCorrelatedItems(view.model.getItemsIds(), correlated_items_placeholder);
			}
		}

	,	hideError: function (selector)
		{
			var el = (selector)? selector.find('[data-type="alert-placeholder"]') : this.$('[data-type="alert-placeholder"]');
			el.empty();
		}

	,	showError: function (message, line, error_details)
		{
			var placeholder;

			this.hideError();

			if (line)
			{
				// if we detect its a rolled back item, (this i an item that was deleted
				// but the new options were not valid and was added back to it original state)
				// We will move all the references to the new line id
				if (error_details && error_details.status === 'LINE_ROLLBACK')
				{
					var new_line_id = error_details.newLineId;

					line.attr('id', new_line_id);

					line.find('[name="internalid"]').attr({
						id: 'update-internalid-' + new_line_id
					,	value: new_line_id
					});
				}

				placeholder = line.find('[data-type="alert-placeholder"]');
				this.hideError(line);
			}
			else
			{
				placeholder = this.$('[data-type="alert-placeholder"]');
				this.hideError();
			}

			// Finds or create the placeholder for the error message
			if (!placeholder.length)
			{
				placeholder = jQuery('<div/>', {'data-type': 'alert-placeholder'});
				this.$el.prepend(placeholder);
			}

			// Renders the error message and into the placeholder
			placeholder.append(
				SC.macros.message(message, 'error', true)
			);

			// Re Enables all posible disableded buttons of the line or the entire view
			if (line)
			{
				line.find(':disabled').attr('disabled', false);
			}
			else
			{
				this.$(':disabled').attr('disabled', false);
			}
		}

	,	updateItemQuantityBlur: function(e)
		{
			e.preventDefault();
			var $form = jQuery(e.target).closest('form')
			,	options = $form.serializeObject()
			,	internalid = options.internalid
			,	line = this.model.get('lines').get(internalid)
			,	$input = $form.find('[name="quantity"]')
			,	validInput = this.validInputValue($input[0]);

			if (!$input.prop('disabled') && validInput && !options.quantity)
			{
				$input.val(parseInt(line.get('quantity'), 10));
			}
			else
			{
				this.updateItemQuantity(e);
			}
		}

		// Check if the input[type="number"] has empty string or NaN value
		// input.val() == '' && validInput == false: NaN
		// input.val() == '' && validInput == true: empty string
	,	validInputValue: function(input)
		{
			// if html5 validation says it's bad: it's bad
			if ((input.validity) && (!input.validity.valid))
			{
				return false;
			}
		
			// Fallback to browsers that don't yet support html5 input validation
			if (isNaN(input.value))
			{
				return false;
			}

			return true;
		}

		// updateItemQuantity:
		// executes on blur of the quantity input
		// Finds the item in the cart model, updates its quantity and saves the cart model
	,	updateItemQuantity: _.debounce(function (e)
		{
			e.preventDefault();

			var self = this
			,	$line = null
			,	$form = jQuery(e.target).closest('form')
			,	options = $form.serializeObject()
			,	internalid = options.internalid
			,	line = this.model.get('lines').get(internalid)
			,	$input = $form.find('[name="quantity"]')
			,	validInput = this.validInputValue($input[0]);

			if (!line || this.isRemoving)
			{
				return;
			}

			if (!validInput || options.quantity)
			{
				var	new_quantity = parseInt(options.quantity, 10)
				,	current_quantity = parseInt(line.get('quantity'), 10);

				new_quantity = (new_quantity > 0) ? new_quantity : current_quantity;

				$input.val(new_quantity);

				this.storeColapsiblesState();

				if (new_quantity !==  current_quantity)
				{

					$line = this.$('#' + internalid);
					$input.val(new_quantity).prop('disabled', true);
					line.set('quantity', new_quantity);

					var invalid = line.validate();

					if (!invalid)
					{
						var update_promise = this.model.updateLine(line);

						this.disableElementsOnPromise(update_promise, 'article[id="' + internalid + '"] a, article[id="' + internalid + '"] button');

						update_promise.done(function ()
						{
							self.showContent().done(function (view)
							{
								view.resetColapsiblesState();
							});
						}).fail(function (jqXhr)
						{
							jqXhr.preventDefault = true;
							var result = JSON.parse(jqXhr.responseText);

							self.showError(result.errorMessage, $line, result.errorDetails);
							line.set('quantity', current_quantity);
						}).always(function ()
						{
							$input.prop('disabled', false);
						});
					}
					else
					{
						var placeholder = this.$('#' + internalid + ' [data-type="alert-placeholder"]');
						placeholder.empty();

						_.each(invalid, function(value) 
						{
							placeholder.append(
								SC.macros.message(value, 'error', true)
							);
						});

						$input.prop('disabled', false);
						line.set('quantity', current_quantity);
					}
				}
			}
		}, 400)

	,	updateItemQuantityFormSubmit: function (e)
		{
			e.preventDefault();
			this.updateItemQuantity(e);
		}

		// removeItem:
		// handles the click event of the remove button
		// removes the item from the cart model and saves it.
	,	removeItem: function (e)
		{
			this.storeColapsiblesState();

			var self = this
			,	product = this.model.get('lines').get(jQuery(e.target).data('internalid'))
			,	remove_promise = this.model.removeLine(product)
			,	internalid = product.get('internalid');

			this.isRemoving = true;

			this.disableElementsOnPromise(remove_promise, 'article[id="' + internalid + '"] a, article[id="' + internalid + '"] button');

			remove_promise
				.done(function ()
				{
					self.showContent().done(function (view)
					{
						view.resetColapsiblesState();
					});
				})
				.always(function ()
				{
					self.isRemoving = false;
				});

			return remove_promise;
		}

		// validates the passed gift cert item and return false and render an error message if invalid.
	,	validateGiftCertificate: function (item)
		{
			if (item.itemOptions && item.itemOptions.GIFTCERTRECIPIENTEMAIL)
			{
				if (!Backbone.Validation.patterns.email.test(item.itemOptions.GIFTCERTRECIPIENTEMAIL.label))
				{
					this.render(); //for unchecking the just checked checkbox
					this.showError(_('Recipient email is invalid').translate());
					return false;
				}
			}
			return true;
		}

		// applyPromocode:
		// Handles the submit of the apply promo code form
	,	applyPromocode: function (e)
		{
			e.preventDefault();

			this.$('[data-type=promocode-error-placeholder]').empty();

			var self = this
			,	$target = jQuery(e.target)
			,	options = $target.serializeObject();

			// disable inputs and buttons
			$target.find('input, button').prop('disabled', true);

			this.model.save({
				promocode: {
					code: options.promocode
				}
			}).done(function ()
			{
				self.showContent();
			}).fail(function (jqXhr)
			{
				self.model.unset('promocode');
				jqXhr.preventDefault = true;
				var message = ErrorManagement.parseErrorMessage(jqXhr, self.options.application.getLayout().errorMessageKeys);
				self.$('[data-type=promocode-error-placeholder]').html(SC.macros.message(message,'error',true));
				$target.find('input[name=promocode]').val('').focus();
			}).always(function ()
			{
				// enable inputs and buttons
				$target.find('input, button').prop('disabled', false);
			});
		}

		// removePromocode:
		// Handles the remove promocode button
	,	removePromocode: function (e)
		{
			e.preventDefault();

			var self = this;

			this.model.save({promocode: null}).done(function ()
			{
				self.showContent();
			});
		}

		// estimateTaxShip
		// Sets a fake address with country and zip code based on the options.
	,	estimateTaxShip: function (e)
		{
			var model = this.model
			,	options = jQuery(e.target).serializeObject()
			,	address_internalid = options.zip + '-' + options.country + '-null';

			e.preventDefault();

			if (!options.zip)
			{
				return this.showError(_('Zip code is required.').translate());
			}

			model.get('addresses').push({
				internalid: address_internalid
			,	zip: options.zip
			,	country: options.country
			});

			model.set('shipaddress', address_internalid);

			model.save().done(jQuery.proxy(this, 'showContent'));
		}

		// removeShippingAddress:
		// sets a fake null address so it gets removed by the backend
	,	removeShippingAddress: function (e)
		{
			e.preventDefault();

			var self = this;

			this.model.save({
				shipmethod: null
			,	shipaddress: null
			}).done(function ()
			{
				self.showContent();
			});
		}

	,	changeCountry: function (e)
		{
			e.preventDefault();
			this.storeColapsiblesState();
			var options = jQuery(e.target).serializeObject();

			var AddressModel = this.model.get('addresses').model;
			this.model.get('addresses').add(new AddressModel({ country: options.country, internalid: options.country }));
			this.model.set({ shipaddress: options.country });

			this.showContent().done(function (view)
			{
				view.resetColapsiblesState();
			});

		}

	,	resetColapsiblesState: function ()
		{
			var self = this;
			_.each(colapsibles_states, function (is_in, element_selector)
			{
				self.$(element_selector)[ is_in ? 'addClass' : 'removeClass' ]('in').css('height',  is_in ? 'auto' : '0');
			});
		}

	,	storeColapsiblesState: function ()
		{
			this.storeColapsiblesStateCalled = true;
			this.$('.collapse').each(function (index, element)
			{
				colapsibles_states[SC.Utils.getFullPathForElement(element)] = jQuery(element).hasClass('in');
			});
		}
	});

	// Views.Confirmation:
	// Cart Confirmation Modal
	Views.Confirmation = Backbone.View.extend({

		template: 'shopping_cart_confirmation_modal'

	,	title: _('Added to Cart').translate()

	,	page_header: _('Added to Cart').translate()

	,	attributes: {
			'id': 'shopping-cart'
		,	'class': 'cart-confirmation-modal shopping-cart'
		}

	,	events: {
			'click [data-trigger=go-to-cart]': 'dismisAndGoToCart'
		}

	,	initialize: function (options)
		{
			this.line = options.model.getLatestAddition();

			var self = this
			,	optimistic = this.options.application.getCart().optimistic;
			
			if (optimistic && optimistic.promise && optimistic.promise.state() === 'pending')
			{
				this.line = options.model.optimisticLine;
				delete options.model.optimisticLine;
				optimistic.promise.done(function ()
				{
					self.line = options.model.getLatestAddition();
					self.render();
				});
			}
		}


		// dismisAndGoToCart
		// Closes the modal and calls the goToCart
	,	dismisAndGoToCart: function (e)
		{
			e.preventDefault();

			this.$containerModal.modal('hide');
			this.options.layout.goToCart();
		}
	});

	return Views;
});

// Categories.js
// -------------
// Utility Class to handle the Categories tree 
define('Categories', function ()
{
	'use strict';
	
	return {
		
		tree: {}
		
		// Categories.reset: 
		// Refreshes the tree
	,	reset: function (tree)
		{
			this.tree = tree;
		}
	
		// Categories.getTree: 
		// Returns a deep copy of the category tree
	,	getTree: function ()
		{
			return jQuery.extend(true, {}, this.tree);
		}
		
		// Categories.getBranchLineFromPath:
		// given a path retuns the branch that fullfil that path,
	,	getBranchLineFromPath: function (path)
		{
			var tokens = path && path.split('/') || [];

			if (tokens.length && tokens[0] === '')
			{
				tokens.shift();
			}
			
			return this.getBranchLineFromArray(tokens);
		}
		
		// Categories.getBranchLineFromArray:
		// given an array of categories it retuns the branch that fullfil that array.
		// Array will be walked from start to bottom and the expectation is that its in the correct order
	,	getBranchLineFromArray: function (array)
		{
			var branch = []
			,	slice = {categories: this.tree};
			
			for (var i = 0; i < array.length; i++)
			{
				var current_token = array[i];
				
				if (slice.categories && slice.categories[current_token])
				{
					branch.push(slice.categories[current_token]);
					slice = slice.categories[current_token];
				}
				else
				{
					break;
				}
			}
			
			return branch;
		}
		
		// Categories.getTopLevelCategoriesUrlComponent
		// returns the id of the top level categories
	,	getTopLevelCategoriesUrlComponent: function ()
		{
			return _.pluck(_.values(this.tree), 'urlcomponent');
		}	

	,	makeNavigationTab: function (categories, memo)
		{
			var result = []
			,	self = this;

			_.each(categories, function (category)
			{
				var href = (memo ? memo + '/' : '') + category.urlcomponent

				,	tab = {
						href: '/' + href
					,	text: category.itemid
					,	data: 
						{
							hashtag: '#' + href
						,	touchpoint: 'home'
						}
					};

				if (category.categories)
				{
					tab.categories = self.makeNavigationTab(category.categories, href);
				}

				result.push(tab);
			});

			return result;
		}

        /**
         * @param application
         * @param method "prepend", "append" or integer index to splice into
         */
	,	addToNavigationTabs: function (application, method)
		{
			var tabs = this.makeNavigationTab(this.getTree());

            if(!method) {
                method = 'prepend';
            }
            var originalTabs = application.Configuration.navigationTabs,
                navigationTabs;
            switch(method) {
                case 'prepend': {
                    navigationTabs = _.union(tabs, originalTabs);
                    break;
                }
                case 'append': {
                    navigationTabs = _.union(originalTabs, tabs);
                    break;
                }
                default: {
                    navigationTabs = originalTabs;
                    if(typeof method == "number") {
                        Array.prototype.splice.apply(navigationTabs, [method, 0].concat(tabs));
                    }
                    break;
                }
            }

			application.Configuration.navigationTabs = navigationTabs;

			return;
		}

	,	mountToApp: function (application, options)
		{
			if (options && options.addToNavigationTabs)
			{
				this.addToNavigationTabs(application, options.navigationAddMethod);
			}
		}
	};
});
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

// Content.EnhancedViews.js
// ------------------------
// Provides functions that based in a view, sets the title,
// meta tags and inject html content in the dom
define('Content.EnhancedViews', ['Content.DataModels'], function (DataModels)
{
	'use strict';

	var EnhancedViews = {
			previousPlaceholders: []
		};

	_.extend(EnhancedViews, {

		// EnhancedViews.overrideViewSettings:
		// Updates attributes of the view with the info camming in the page model passed in
		overrideViewSettings: function (view, page)
		{
			view.contentZones = view.contentZones || [];

			if (page)
			{
				// All info comming off the page has presedence to whats already defined in the view
				view.title = page.get('title') || view.getTitle();
				view.page_header = page.get('pageheader') || view.page_header;
				view.description = page.get('description') || view.description;
				view.metaDescription = page.get('metadescription') || view.getMetaDescription();
				view.metaKeywords = page.get('metakeywords') || view.getMetaKeywords();
				view.template = page.get('template') || view.template;
				view.metaextra = page.get('metaextra') || '';
				// Everything but the banners, who are merged with other that the view may have,
				view.contentZones = _.union(view.contentZones, page.get('pagecontent'));
			}

			// If you have a default page (this is a page that is pointed by the * url)
			// it will be always merged
			var default_url = DataModels.Urls.Collection.defaultModel
			,	default_page = default_url && DataModels.Pages.Collection.getInstance().get(default_url.get('pageid'));

			if (default_page)
			{
				view.contentZones = _.union(view.contentZones, default_page.get('pagecontent'));
			}

			return view;
		}

	,	initalizeHead: function ()
		{
			return jQuery('head')
				.not(':has(title)').append('<title/>').end()
				.not(':has(link[rel="canonical"])').append('<link rel="canonical"/>').end()
				.not(':has(meta[name="keywords"])').append('<meta name="keywords"/>').end()
				.not(':has(meta[name="description"])').append('<meta name="description"/>').end();
		}

	,	enhanceHead: function (view)
		{
			var title = view.getTitle();

			if (title)
			{
				document.title = title;
			}
			// Sets the text of the title element if we are in the server
			// we only do it on the server side due to an issue modifying
			// the title tag on IE :(
			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				this.$head.find('title').text(title);
			}

			return this.enhanceMetaTags(view).enhanceCanonicalLinks(view);
		}

	,	enhanceMetaTags: function (view)
		{
			this.$head
				// then we add the description
				.find('meta[name="description"]').attr('content', view.metaDescription || view.getMetaDescription() || '').end()
				// and keywords meta tags
				.find('meta[name="keywords"]').attr('content', view.metaKeywords ||  view.getMetaKeywords() || '').end()
				// then we append the tags specific to this view
				// excluding any extra descriptions and keywords meta tags
				.append(view.getMetaTags().not('[name="description"]').not('[name="keywords"]'));

			// remove head's elements that are between enhanceMetaTagsStart and enhanceMetaTagsEnd
			var remove_element = false; //flag used to determine when remove elements.
			
			jQuery('head').children().each(function ()
			{
				var $element = jQuery(this)
				,	element_id = $element.attr('id');

				if (element_id === 'enhanceMetaTagsStart')
				{
					remove_element = true;
				}

				if (remove_element)
				{
					$element.remove();
				}

				if (remove_element && element_id === 'enhanceMetaTagsEnd')
				{
					remove_element = false;
				}
			});
				
	
			//add meta extra elements between enhanceMetaTagsStart and enhanceMetaTagsEnd
			if (view.metaextra)
			{
				jQuery('<script id="enhanceMetaTagsStart"></script>' + view.metaextra + '<script id="enhanceMetaTagsEnd"></script>').appendTo(this.$head)
			}

			return this;
		}

	,	enhanceCanonicalLinks: function (view)
		{
			this.$head
				.find('link[rel="canonical"]').attr('href', view.getCanonical()).end()
				// we remove any existing next/prev tags every time
				// a page is rendered in case the previous view was paginated
				.find('link[rel="next"], link[rel="prev"]').remove();

			// if the current page is paginated
			// set prev/next link rel
			this.setLinkRel('prev', view.getRelPrev());
			this.setLinkRel('next', view.getRelNext());

			return this;
		}

	,	setLinkRel: function (rel, link) 
		{
			link && jQuery('<link />', {
				rel: rel
			,	href: link
			}).appendTo(this.$head);
		}

		// EnhancedViews.enhancePage:
		// enhace the dom bassed on the attributes of the view
	,	enhancePage: function (view, Layout)
		{
			this.$head = this.$head || this.initalizeHead();
			// changes the page head based on the view attributes
			this.enhanceHead(view);

			// emptyies the place holders dom element
			EnhancedViews.clearPlaceholders();

			// walks the content zones and injects them in the site
			_.each(view.contentZones || [], function (content_zone)
			{
				// its in the layout
				if (view.$(content_zone.target).length === 0)
				{
					// it's empty
					if (jQuery(content_zone.target + ':empty').length === 0)
					{
						return;
					}
				}

				Layout.trigger('renderEnhancedPageContent', view, content_zone);
			});
		}

	,	renderHTMLContent: function (view, content_zone)
		{
			var target = content_zone.target;
			// If the target is inside the view
			if (view.$(target).length)
			{
				view.$(target).html(content_zone.content);
				EnhancedViews.previousPlaceholders.push(content_zone.target);
			}
			else
			{
				// Otherwise, if the target is on the layout
				// we have to make sure it's empty
				view.options.application.getLayout().$(target).filter(':empty').each(function (index, element)
				{
					jQuery(element).html(content_zone.content);
					EnhancedViews.previousPlaceholders.push(content_zone.target);
				});
			}
		}

		// EnhancedViews.clearPlaceholders:
		// This clears all content that was previosly added to the Layout,
		// this method is called by the EnhancedViews.enhancePage
		// for every new page
	,	clearPlaceholders: function ()
		{
			_.each(EnhancedViews.previousPlaceholders, function (previous_placeholder)
			{
				jQuery(previous_placeholder).empty();
			});

			EnhancedViews.previousPlaceholders = [];
		}
	});

	return EnhancedViews;
});

// Content.js
// ----------
// Integration to the Content Delivery Serivce Boundle
define(
	'Content'
,	['Content.DataModels', 'Content.EnhancedViews', 'Content.LandingPages']
,	function (DataModels, EnhancedViews, LandingPages)
{
	'use strict';

	return {
		DataModels: DataModels,
		EnhancedViews: EnhancedViews,
		LandingPages: LandingPages,
		mountToApp: function (Application)
		{
			// Wires the models to the assets root
			DataModels.Pages.Model.prototype.urlRoot = _.getAbsoluteUrl(DataModels.Pages.Model.prototype.urlRoot);
			DataModels.Urls.Model.prototype.urlRoot = _.getAbsoluteUrl(DataModels.Urls.Model.prototype.urlRoot);
			// Now we wire the collection
			DataModels.Pages.Collection.prototype.url = _.getAbsoluteUrl(DataModels.Pages.Collection.prototype.url);
			DataModels.Urls.Collection.prototype.url = _.getAbsoluteUrl(DataModels.Urls.Collection.prototype.url);

			DataModels.Application = Application;

			var Layout = Application.getLayout()
			,	show_content_wrapper = function (fn, view)
				{
					var promise = jQuery.Deferred();
					var args = arguments;

					// Check the url and loads the page definition if needed
					DataModels.loadPage('/' + Backbone.history.fragment, function (page)
					{
						// override the title and page header of the view with the page returned
						EnhancedViews.overrideViewSettings(view, page);

						// Calls the original function with all the parameters (slice to exclude fn)
						fn.apply(Layout, Array.prototype.slice.call(args, 1)).done(function ()
						{
							// once the original func is done this reads the attributes of the view and
							// sets title, metas and adds banners
							EnhancedViews.enhancePage(view, Layout);

							//only after enhancing the view we resolve the promise
							promise.resolveWith(this, arguments);
						});
					});

					return promise;
				};

			// Wraps the layout.showContent and Layout.showInModal methods
			// This make sure that every time you try to show content in the
			// application the page will be enhaced by setting title, header, meta tags and banners
			Layout.showContent = _.wrap(Layout.showContent, show_content_wrapper);
			Layout.showInModal = _.wrap(Layout.showInModal, show_content_wrapper);

			// Wraps the layout.updateUI function for rendering Content when importants part of the UI are updated dynamically.
			Layout.updateUI = _.wrap(Layout.updateUI, function (fn)
			{
				fn.apply(Layout, []);
				
				// This function could be triggered before history started. If so, fragment will be undefined.
				// The above could lead to content rules expected to be loaded on root to be loaded on any other url
				// containing a fragment.
				if (!Backbone.History.started)
				{
					return;
				}
				
				DataModels.loadPage('/' + (Backbone.history.fragment||''), function (page)
				{
					var view = Layout;
					EnhancedViews.overrideViewSettings(view, page);
					EnhancedViews.enhancePage(view, Layout);
				});
			});

			Layout.on('renderEnhancedPageContent', function (view, content_zone)
			{
				if (content_zone.contenttype === 'html')
				{
					EnhancedViews.renderHTMLContent(view, content_zone);
				}
				else if (content_zone.contenttype === 'merchandising')
				{
					EnhancedViews.previousPlaceholders.push(content_zone.target);
				}
			});

			Application.on('afterModulesLoaded', function ()
			{
				var query = '';

				_.each(DataModels.Urls.Collection.getInstance().landingPages, function (landing_page)
				{
					query = landing_page.get('query')[0] === '/' ? landing_page.get('query').substring(1) : landing_page.get('query');
					LandingPages.Router.prototype.routes[query + '?*options'] = 'displayLandingPage';
					LandingPages.Router.prototype.routes[query] = 'displayLandingPage';
				});

				return new LandingPages.Router(Application);
			});

			Application.on('afterStart', function ()
			{
				// Every time the url changes we call the DataModels.loadPage,
				// so if we need to load content from the server, the request starts as soon as posible,
				// Probably while other ajax request are being made
				Backbone.history && Backbone.history.on('all', function ()
				{
					DataModels.loadPage('/' + Backbone.history.fragment);
				});

				// After the application Starts we will do the same, since the url have not changed yet
				Backbone.history && DataModels.loadPage('/' + Backbone.history.fragment);
			});
		}
	};
});
// Content.EnhancedViews.js
// ------------------------
// The Landing pages Module uses the Content.DataModels to connect to the servers,
// That's why there is only a view and a router here
define(
	'Content.LandingPages'
,	['Content.DataModels', 'Content.EnhancedViews']
,	function (DataModels, EnhancedViews)
{
	'use strict';

	// Categories is an optional dependency
	var Categories = false;
	try {
		Categories = require('Categories');
	}
	catch (e)
	{
		//console.log('Couldn\'t load Categories. ' + e);
	}

	// View:
	// Tho most of the content is driven by the content service 
	// we need a view to extend upon
	var View = Backbone.View.extend({
		
		template: 'landing_page'
	,	title: ''
	,	page_header: ''
	,	attributes: {
			'id': 'landing-page'
		,	'class': 'landing-page'
		}
	,	events: {}
		
	,	initialize: function ()
		{
			this.url = Backbone.history && Backbone.history.fragment;
		}
		
		// View.showContent:
	,	showContent: function (page)
		{
			this.page_header = page.get('pageheader');
			this.page = page;
			this.options.layout.showContent(this);
		}
		
		// View.getBreadcrumb:
		// It will try to figure the breadcrumb out of the url
	,	getBreadcrumb: function ()
		{
			var breadcrumb = [{
					href: '/'
				,	text: _('Home').translate()
				}];
			
			if (this.url && Categories)
			{
				var category_path = '';
				_.each(Categories.getBranchLineFromPath(this.url), function (cat)
				{
					category_path += '/'+cat.id;
					
					breadcrumb.push({
						href: category_path
					,	text: cat.title
					});
				});
			}

			breadcrumb.push({
				href: this.url 
			,	text: this.page_header
			});

			return breadcrumb;
		}
	});
	
	// Router:
	var Router = Backbone.Router.extend({
		
		// Routes are created based on the urls in the content.mountToApp
		routes: {}
		
	,	initialize: function (Application)
		{
			this.Application = Application;
		}
		
		// Router.displayLandingPage
		// uses the DataModels.loadPage to load the data and create the model
	,	displayLandingPage: function (option) 
		{
			var self = this
			,	page_url = option ? unescape(Backbone.history.fragment).replace('?' + option, '') : Backbone.history.fragment
			,	view = new View({
					application: this.Application
				,	layout: this.Application.getLayout()
				});
			
			DataModels.loadPage('/' + page_url, function (page)
			{
				if (page)
				{
					EnhancedViews.overrideViewSettings(view, page);
					view.showContent(page);					
				}
				else
				{
					self.Application.getLayout().notFound();
				}
			});
		}
	});
	
	return {
		View: View
	,	Router: Router
	};
});
// CookieWarningBanner.js
// ----------------------
// Handles the display of the banner to be displayed
// warning the customers about the site's use of cookies

define('CookieWarningBanner', function ()
{
	'use strict';

	return {
		mountToApp: function (application)
		{
			var cookie_message = ''
			,	$cookie_message_element = ''
			,	Layout = application.getLayout()
			,	cookie_warning_settings = application.getConfig('cookieWarningBanner')
				// The cookie policy is set up in the backend
			,	cookie_warning_policy = application.getConfig('siteSettings.cookiepolicy')
			,	show_cookie_warning_banner = application.getConfig('siteSettings.showcookieconsentbanner') === 'T';

			jQuery.cookie.json = true;

			// If we need to show the banner and it hasn't been closed
			if (show_cookie_warning_banner && !(cookie_warning_settings.saveInCookie && jQuery.cookie('isCookieWarningClosed')))
			{
				cookie_message = cookie_warning_settings.message;
				// if there's a file
				if (cookie_warning_policy)
				{
					cookie_message += ' <a href="https://system.netsuite.com' + cookie_warning_policy +
						'" data-toggle="show-in-modal" data-page-header="' + cookie_warning_settings.anchorText +
						'">' + cookie_warning_settings.anchorText + '</a>';
				}
				// html for the message
				$cookie_message_element = jQuery(SC.macros.message(cookie_message, 'cookie-banner no-margin-bottom', cookie_warning_settings.closable));

				Layout.on('afterRender', function ()
				{
					// We prepend the html to the view
					Layout.$('[data-type=message-placeholder]').prepend($cookie_message_element);
					
					$cookie_message_element.on('close', function ()
					{
						if (cookie_warning_settings.saveInCookie)
						{
							jQuery.cookie('isCookieWarningClosed', true);
						}
					});
				});
			}
		}
	};
});
// CreditCard.Collection.js
// -----------------------
// Credit cards collection
define('CreditCard.Collection', ['CreditCard.Model'], function (Model)
{
	'use strict';

	return Backbone.Collection.extend({

		model: Model
	,	url: 'services/creditcard.ss'
	
	});
});

// CreditCard.Model.js
// -----------------------
// Model for handling credit cards (CRUD)
define('CreditCard.Model', function ()
{
	'use strict';

	// validate that the expiration date is bigger than today
	function validateExpirationDate (value, name, data)
	{

		var current = new Date();

		if (!value || new Date(current.getFullYear(), current.getMonth()).getTime() > new Date(data.expyear, data.expmonth - 1).getTime())
		{
			return _('Please select a date in the future').translate();
		}
	}
	
	return Backbone.Model.extend({

		urlRoot: 'services/creditcard.ss',

		validation: {
			ccname: { fn: function (cc_name)
				{	
					if (!cc_name)
					{
						return _('Name is required').translate();
					}
					else if (cc_name.length > 26)
					{
						return _('Name too long').translate();
					}
				}
			}
		,	ccnumber: {	fn: function (cc_number, attr, form)
				{

					// credit card number validation
					// It validates that the number pass the Luhn test and also that it has the right starting digits that identify the card issuer
					if (!cc_number)
					{
						return _('Card Number is required').translate();
					}

					// this check shouldn't be necessary, maybe it needs to be removed
					if (_.isUndefined(form.internalid) && (_.isUndefined(this.attributes.ccnumber) || cc_number === this.attributes.ccnumber))
					{
						cc_number = cc_number.replace(/\s/g, '');

						//check Luhn Algorithm
						var	verify_luhn_algorithm = _(cc_number.split('').reverse()).reduce(function (a, n, index)
							{
								return a + _((+n * [1, 2][index % 2]).toString().split('')).reduce(function (b, o)
									{ return b + (+o); }, 0);
							}, 0) % 10 === 0

						// get the credit card name 
						,	paymenthod_id = _.paymenthodIdCreditCart(cc_number);

						//check that card type is supported by validation
						if (!paymenthod_id)
						{
							return _('Credit Card type is not supported').translate();	
						}
						
						else if (!verify_luhn_algorithm)
						{
							// we throw an error if the number fails the regex or the Luhn algorithm 
							return _('Credit Card Number is invalid').translate();
						}

					}
				}
			}
			
		,	expyear: { fn: validateExpirationDate }
		,	expmonth: { fn: validateExpirationDate }
		}

	,	initialize: function (attributes, options)
		{
			this.options = options;
			delete this.validation.ccsecuritycode;
		}

	});
});

/* global nsglobal */
// ErrorManagement.js
// ------------------
// Handles all errors related to api calls and provides a 404 and 500 error pages
// Also it manages 401 error (session expires) and do the redirect to login
define('ErrorManagement', ['Session'], function (Session)
{
	'use strict';

	var Views = {};

	// Views.PageNotFound:
	// Will be rendered if there is a page we can not identify
	Views.PageNotFound = Backbone.View.extend({

		template: 'page_not_found'
	,	title: _('Page not found').translate()
	,	page_header: _('Page not found').translate()

	,	attributes: {
			'id': 'page-not-found'
		,	'class': 'page-not-found'
		}

	,	initialize: function ()
		{
			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				nsglobal.statusCode = 404;
			}
		}
	});

	Views.ForbiddenError = Backbone.View.extend({

		template: 'forbidden_error'
	,	title: _('Forbidden Error').translate()
	,	page_header: _('NOT ALLOWED').translate()

	,	attributes: {
			'id': 'forbidden-error'
		,	'class': 'forbidden-error'
		}

	,	initialize: function ()
		{
			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				nsglobal.statusCode = 403;
			}
		}
	});

	// Views.InternalError:
	// Will be rendered if there is an internal error
	// May be an api request that went bad or some other issue
	Views.InternalError = Backbone.View.extend({

		template: 'internal_error'
	,	title: _('Internal Error').translate()
	,	page_header: _('Internal Error').translate()

	,	attributes: {
			'id': 'internal-error'
		,	'class': 'internal-error'
		}

	,	initialize: function (options)
		{
			if (options.page_header)
			{
				this.page_header = options.page_header;
			}

			if (options.title)
			{
				this.title = options.title;
			}

			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				nsglobal.statusCode = 500;
			}
		}
	});

	Views.ExpiredLink = Backbone.View.extend({

		template: 'expired_link'

	,	attributes: {
			'id': 'expired_link'
		,	'class': 'expired_link'
		}

	,	initialize: function (options)
		{
			if (options.page_header)
			{
				this.page_header = options.page_header;
			}

			if (options.title)
			{
				this.title = options.title;
			}

			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				nsglobal.statusCode = 500;
			}
		}
	});


	Views.LoggedOut = Backbone.View.extend({
		template: 'logged_out'
	,	title : _('Logged out').translate()
	,	initialize: function()
		{
			this.labels = {
				title: 'You have been logged out'
			,	explanation: 'Your session expired or someone else logged in another device with your account. You must log in again to continue.'
			,	login: 'Log in'
			};
			_.each(this.labels, function(val, label, labels)
			{
				labels[label] = _(val).translate();
			});
		}
	,	showError: function()
		{
		}
	});

	// We extend the view to provide with a showError and hideError to all instances of it
	_.extend(Backbone.View.prototype, {

		// we empty all of the error placeholders of the view
		hideError: function ()
		{
			this.$('[data-type="alert-placeholder"]').empty();
		}

	,	showError: function (message,type)
		{
			this.hideError();
			// Finds or create the placeholder for the error message
			var placeholder = this.$('[data-type="alert-placeholder"]');
			if (!placeholder.length)
			{
				placeholder = jQuery('<div/>', {'data-type': 'alert-placeholder'});
				this.$el.prepend(placeholder);
			}

			// Renders the error message and into the placeholder
			placeholder.append(
				SC.macros.message(message, type ? type : 'error', true)
			);

			// Re Enables all posible disableded buttons of the view
			this.$(':disabled').attr('disabled', false);

			//If the backToTop module is loaded, we scroll to the top of the view to show the error.
			if (this.application)
			{
				_.result(this.application.getLayout(), 'backToTop');
			}
		}

	,	showErrorInModal: function (message)
		{
			jQuery('.modal').modal('hide');
			var view = new Backbone.View({application: this.application});
			view.title = _('Error').translate();
			view.render = function ()
			{
				this.$el.append('<p class="error-message">' + message + '</p>');
			};
			view.showInModal();
		}
	});

	var parseErrorMessage = function (jqXhr, messageKeys)
	{
		var message = null, i, current_key;
		try
		{
			// Tries to parse the responseText and try to read the most common keys for error messages
			var response = JSON.parse(jqXhr.responseText);
			if (response)
			{
				for (i=0; i < messageKeys.length; i++)
				{
					current_key = messageKeys[i];
					if (response[current_key])
					{
						message = _.isArray(response[current_key]) ? response[current_key][0] : response[current_key];
						break;
					}
				}
			}
		}
		catch (err) {}

		return message;
	};

	return {
		Views: Views
	,	parseErrorMessage: parseErrorMessage
	,	mountToApp: function (application)
		{
			var Layout = application.getLayout();

			_.extend(Layout, {

				// layout.errorMessageKeys:
				// They will be use to try to get the error message of a faild ajax call
				// Extend this as needed
				errorMessageKeys: ['errorMessage', 'errors', 'error', 'message']

				// layout.notFound:
				// Shortcut to display the Views.PageNotFound
			,	notFound: function ()
				{
					var view = new Views.PageNotFound({
						application: application
					});

					view.showContent();
				}

				// layout.notFound:
				// Shortcut to display the Views.InternalError
			,	internalError: function (message, page_header, title)
				{
					var view = new Views.InternalError({
						application: application
					,	message: message
					,	page_header: page_header
					,	title: title
					});

					view.showContent();
				}

			,	expiredLink: function (message)
				{
					var view = new Views.ExpiredLink({
						application: application
					,	page_header: message
					,	title: message
					});

					view.showContent();
				}

			,	forbiddenError: function ()
				{
					var view = new Views.ForbiddenError({
						application: application
					});
					view.showContent();
				}
			,	unauthorizedError: function()
				{
					if (application.getConfig('currentTouchpoint') === 'checkout')
					{
						application.getUser().set({ isLoggedIn: 'F', isGuest: 'F' });
						application.Configuration.currentTouchpoint = 'login';
						Backbone.history.navigate('login-register', { trigger: true });
					}
					else
					{
						var url = Session.get('touchpoints.login');
						if (application.getConfig('currentTouchpoint'))
						{
							url += '&origin=' + application.getConfig('currentTouchpoint');
						}

						if (url)
						{
							window.location = url;
						}
					}
				}
			});

			jQuery(document).ajaxError(function (e, jqXhr, options, error_text)
			{
				var intStatus = parseInt(jqXhr.status, 10);

				if (error_text === 'abort' || intStatus === 0)
				{
					return;
				}

				// Unauthorized Error, customer must be logged in - we pass origin parameter with the right touchpoint for redirect the user after login
				if (intStatus === 401)
				{
					Layout.unauthorizedError(jqXhr);
					return;
				}

				// You can bypass all this logic by capturing the error callback on the fetch using preventDefault = true on your jqXhr object
				if (!jqXhr.preventDefault)
				{
					// if its a write operation we will call the showError of the currentView or of the modal if presetn
					var message = parseErrorMessage(jqXhr, Layout.errorMessageKeys);

					if (!message || _.isObject(message))
					{
						message =  _('Theres been an internal error').translate();
					}

					if (options.type === 'GET' && options.killerId)
					{
						if  (intStatus === 403)
						{
							// Not Found error, we show that error
							Layout.forbiddenError();
						}
						// Its a read operation that was ment to show a page
						else if (intStatus === 404)
						{
							// Not Found error, we show that error
							Layout.notFound();
						}
						else
						{
							// Other ways we just show an internal error page
							Layout.internalError(message);
						}
					}
					else if (Layout.currentView)
					{
						//Do not show error message if forbidden
						if (intStatus !== 403)
						{
							// Calls the showError of the modal if present or the one of the currentView (content view)
							if (Layout.modalCurrentView)
							{
								Layout.modalCurrentView.showError(message);
							}
							else
							{
								Layout.currentView.showError(message);
							}
						}
						else
						{
							var view = Layout.modalCurrentView || Layout.currentView;
							if (view && _.isFunction(view.forbiddenError))
							{
								view.forbiddenError();
							}
							else
							{
								Layout.forbiddenError();
							}
						}
					}
					else
					{
						// We allways default to showing the internalError of the layout
						Layout.internalError();
					}
				}
			});
		}
	};
});

// Facets.Helper.js
// ----------------
// Helps you with the creation of translators
define('Facets.Helper', ['Facets.Translator'], function (Translator)
{
	'use strict';

	return {
		settings_stack: []

		// Helper.parseUrl
		// Returns a Facet.Translator for the passed url and configuration
	,	parseUrl: function (url, configuration) {
			return new Translator(url, null, configuration);
		}

	,	setCurrent: function (settings) {
			this.settings_stack.push(settings);
		}
	
	,	getCurrent: function () { 
			return this.settings_stack[this.settings_stack.length - 1];
		}
		
	,	getPrevious: function () {
			return this.settings_stack[this.settings_stack.length - 2];
		}
	};
});
// Facets.js
// ---------
// AKA Item List.
// This is the index, routes in the router are assigned here
define(
	'Facets'
,	['Facets.Translator', 'Facets.Helper', 'Facets.Model', 'Facets.Router', 'Facets.Views', 'Categories']
,	function (Translator, Helper, Model, Router, Views, Categories)
{
	'use strict';

	function prepareRouter(application, router)
	{
		// we are constructing this regexp like:
		// /^\b(toplevelcategory1|toplevelcategory2|facetname1|facetname2|defaulturl)\b\/(.*?)$/
		// and adding it as a route

		// Get the facets that are in the sitesettings but not in the config.
		// These facets will get a default config (max, behavior, etc.) - Facets.Translator
		// Include facet aliases to be conisdered as a possible route
		var facets_data = application.getConfig('siteSettings.facetfield')
		,	facets_to_include = [];

		_.each(facets_data, function(facet) {
			facets_to_include.push(facet.facetfieldid);

			// Include URL Component Aliases...
			_.each(facet.urlcomponentaliases, function(facet_alias) {
				facets_to_include.push(facet_alias.urlcomponent);
			});
		});
		
		facets_to_include = _.union(facets_to_include, _.pluck(application.getConfig('facets'), 'id'));
		facets_to_include = _.uniq(facets_to_include);		

		// Here we generate an array with:
		// * The default url
		// * The Names of the facets that are in the siteSettings.facetfield config
		// * the url of the configured facets
		// * And the url of the top level categories
		var components = _.compact(_.union(
			[application.translatorConfig.fallbackUrl]
		,	facets_to_include || []
		,	_.pluck(application.translatorConfig.facets, 'url') || []
		,	Categories.getTopLevelCategoriesUrlComponent() || []
		));
		
		// Generate the regexp and adds it to the instance of the router
		var facet_regex = '^\\b(' + components.join('|') + ')\\b(.*?)$';	

		router.route(new RegExp(facet_regex), 'facetLoading');
	}

	function setTranslatorConfig(application)
	{
		// Formats a configuration object in the way the translator is expecting it
		application.translatorConfig = {
			fallbackUrl: application.getConfig('defaultSearchUrl')
		,	defaultShow: _.find(application.getConfig('resultsPerPage'), function (show) { return show.isDefault; }).items || application.getConfig('resultsPerPage')[0].items
		,	defaultOrder: _.find(application.getConfig('sortOptions'), function (sort) { return sort.isDefault; }).id || application.getConfig('sortOptions')[0].id
		,	defaultDisplay: _.find(application.getConfig('itemsDisplayOptions'), function (display) { return display.isDefault; }).id || application.getConfig('itemsDisplayOptions')[0].id
		,	facets: application.getConfig('facets')
		,	facetDelimiters: application.getConfig('facetDelimiters')
		,	facetsSeoLimits: application.getConfig('facetsSeoLimits')
		};
	}

	return {
		Translator: Translator
	,	Helper: Helper
	,	Model:  Model
	,	Router: Router
	,	Views: Views
	,	setTranslatorConfig: setTranslatorConfig
	,	prepareRouter: prepareRouter
	,	mountToApp: function (application)
		{
			setTranslatorConfig(application);
			
			var routerInstance = new Router(application);
			
			prepareRouter(application, routerInstance);
			
			// Wires some config to the model
			Model.mountToApp(application);
			return routerInstance;
		}
	};
});

// Facets.Model.js
// ---------------
// Connects to the search api to get all the items and the facets
// A Model Contains a Collection of items and the list of facet groups with its values
define('Facets.Model', ['ItemDetails.Collection', 'Session'], function (ItemDetailsCollection, Session)
{
	'use strict';
	
	var original_fetch = Backbone.CachedModel.prototype.fetch;

	return Backbone.CachedModel.extend({
		
		url: function()
		{
			var url = _.addParamsToUrl(
				'/api/items'
			,	_.extend(
					{}
				,	this.searchApiMasterOptions
				,	Session.getSearchApiParams()
				)
			);
			
			return url;
		}

	,	initialize: function ()
		{
			// Listen to the change event of the items and converts it to an ItemDetailsCollection
			this.on('change:items', function (model, items)
			{
				if (!(items instanceof ItemDetailsCollection))
				{
					// NOTE: Compact is used to filter null values from response
					model.set('items', new ItemDetailsCollection(_.compact(items)));
				}
			});
		}

		// model.fetch
		// -----------
		// We need to make sure that the cache is set to true, so we wrap it
	,	fetch: function (options)
		{
			options = options || {};

			options.cache = true;

			return original_fetch.apply(this, arguments);
		}


	}, {
		mountToApp: function (application) 
		{
			// sets default options for the search api
			this.prototype.searchApiMasterOptions = application.getConfig('searchApiMasterOptions.Facets', {});
		}
	});
});
/* global nsglobal */
// Facets.Router.js
// ----------------
// Mixes the Translator, Model and View
define('Facets.Router', ['Facets.Views', 'Facets.Helper', 'Facets.Model', 'Categories'], function (Views, Helper, Model, Categories)
{
	'use strict';
	
	return Backbone.Router.extend({
		
		initialize: function (application)
		{
			this.application = application;
			this.translatorConfig = application.translatorConfig;
		}
	
	,	getFacetsAliasesMapping: function (corrections)
		{
			var facets_aliases_mapping = {};

			_.each(corrections, function(correction) 
			{
				facets_aliases_mapping[correction.usedAlias] = correction.url;
			});

			return facets_aliases_mapping;
		}

	,	unaliasUrl: function (aliased_url, corrections)
		{
			if (aliased_url.indexOf('http://') === 0 || aliased_url.indexOf('https://') === 0)
			{
				throw new Error('URL must be relative');
			}

			aliased_url = (aliased_url[0] === '/') ? aliased_url.substr(1) : aliased_url;

			var facet_delimiters = this.translatorConfig.facetDelimiters
			,	facets_n_options = aliased_url.split(facet_delimiters.betweenFacetsAndOptions)
			,	facets = (facets_n_options[0] && facets_n_options[0] !== this.translatorConfig.fallbackUrl) ? facets_n_options[0] : ''
			,	options = facets_n_options[1] || ''
			,	facet_tokens = facets.split(new RegExp('[\\'+ facet_delimiters.betweenDifferentFacets +'\\'+ facet_delimiters.betweenFacetNameAndValue +']+', 'ig'))
			,	translated_facets = ''
			,	facets_aliases_mapping = this.getFacetsAliasesMapping(corrections);

			while (facet_tokens.length > 0)
			{
				var facet_name = facet_tokens.shift()
				,	facet_value = facet_tokens.shift();

				if (facets_aliases_mapping[facet_name])
				{
					translated_facets += facets_aliases_mapping[facet_name] + facet_delimiters.betweenFacetNameAndValue + facet_value;
				}
				else
				{
					translated_facets += facet_name + facet_delimiters.betweenFacetNameAndValue + facet_value;
				}

				if (facet_tokens.length > 0)
				{
					translated_facets += facet_delimiters.betweenDifferentFacets;
				}			
			}

			var unaliased_url = translated_facets;
			
			if (options)
			{
				unaliased_url += facet_delimiters.betweenFacetsAndOptions + options;
			}

			return unaliased_url;
		}

		// router.facetLoading
		// This handles all the routes of the item list
	,	facetLoading: function ()
		{
			// If the previouse view was a Views.Browse (Item List) we 
			// re render the facets so links gets upated (For the nervous clicker)
			var current_view = this.application.getLayout().currentView;
			
			if (current_view instanceof Views.Browse)
			{
				current_view.renderFacets(Backbone.history.fragment); // calls parse url
			}
			
			// Creates a translator
			var translator = Helper.parseUrl(Backbone.history.fragment, this.translatorConfig)
			,	url = Backbone.history.fragment;

			// Should we show the category Page?
			if (this.isCategoryPage(translator))
			{
				return this.showCategoryPage(translator);
			}

			// Model
			var model = new Model()
			// and View
			,	view = new Views.Browse({
					translator: translator
				,	translatorConfig: this.translatorConfig
				,	application: this.application
				,	model: model
				})
			,	self = this;
			
			model.fetch({
				data: translator.getApiParams()
			,	killerId: this.application.killerId
			,	pageGeneratorPreload: true }).then(function (data) {

				if (data.corrections && data.corrections.length > 0)
				{
					var unaliased_url = self.unaliasUrl(url, data.corrections);

					if (SC.ENVIRONMENT.jsEnvironment === 'server')
					{			
						nsglobal.statusCode = 301;
						nsglobal.location = '/' + unaliased_url;
					}
					else
					{
						Backbone.history.navigate('#' + unaliased_url, {trigger: true});
					}
				}
				else
				{
					translator.setLabelsFromFacets(model.get('facets') || []);
					view.showContent();
				}
			});		
		}

		// router.¡sCategoryPage
		// Returs true if this is the top category page, 
		// override it if your implementation difers from this behavior 
	,	isCategoryPage: function(translator)
		{
			var current_facets = translator.getAllFacets()
			,	categories = Categories.getBranchLineFromPath(translator.getFacetValue('category'));

			return (current_facets.length === 1 && current_facets[0].id === 'category' && categories.length === 1 && _.size(categories[0].categories));
		}

	,	showCategoryPage: function(translator)
		{
			var view = new Views.BrowseCategories({
				translator: translator
			,	translatorConfig: this.translatorConfig
			,	application: this.application
			});
			
			view.showContent();
		}
	});
});

// Facets.Translator.js
// --------------------
// Holds the mapping of a url compoment with an api call,
// is able to translate and to return different configurations of himself with diferent options
define('Facets.Translator'
,	function ()
{
	'use strict';

	// Categories is not a rea l dependency, so if it is present we use it other ways we dont
	var Categories = false;
	try {
		Categories = require('Categories');
	}
	catch (e)
	{
		//console.log('Couldn\'t load Categories. ' + e);
	}

	// This is just for internal use only, DO NOT EDIT IT HERE!!
	// the same options should be somewhere in the configuration file
	var default_config = {
		fallbackUrl: 'search'
	,	defaultShow: null
	,	defaultOrder: null
	,	defaultDisplay: null
	,	facets: []
	,	facetDelimiters: {
			betweenFacetNameAndValue: '/'
		,	betweenDifferentFacets: '/'
		,	betweenDifferentFacetsValues: ','
		,	betweenRangeFacetsValues: 'to'
		,	betweenFacetsAndOptions: '?'
		,	betweenOptionNameAndValue: '='
		,	betweenDifferentOptions: '&'
		}
	};

	function FacetsTranslator(facets, options, configuration)
	{
		// Enforces new
		if (!(this instanceof FacetsTranslator))
		{
			return new FacetsTranslator(facets, options, configuration);
		}

		// Facets go Here
		this.facets = [];

		// Other options like page, view, etc. goes here
		this.options = {};

		// This is an object that must contain a fallbackUrl and a lists of facet configurations
		this.configuration = configuration || default_config;

		// We cast on top of the passed in parameters.
		if (facets && options)
		{
			this.facets = facets;
			this.options = options;
		}
		else if (_.isString(facets))
		{
			// It's a url
			this.parseUrl(facets);
		}
		else if (facets)
		{
			// It's an API option object
			this.parseOptions(facets);
		}
	}

	_.extend(FacetsTranslator.prototype, {

		defaultFacetConfig: {
			behavior: 'single'
		,	max: 5
		}

		// facetsTranslator.parseUrl:
		// Url strings get translated into the differnts part of the object, facets and options
	,	parseUrl: function (url)
		{
			// We remove a posible 1st / (slash)
			url = (url[0] === '/') ? url.substr(1) : url;

			// given an url with options we split them into 2 strings (options and facets)
			var facets_n_options = url.split(this.configuration.facetDelimiters.betweenFacetsAndOptions)
			,	facets = (facets_n_options[0] && facets_n_options[0] !== this.configuration.fallbackUrl) ? facets_n_options[0] : ''
			,	options = facets_n_options[1] || '';

			// We treat category as the 1st unmaned facet filter, so if you are using categories
			// we will try to take that out by comparig the url with the category tree
			if (this.getFacetConfig('category'))
			{
				var categories = Categories && Categories.getBranchLineFromPath(facets) || [];

				if (categories && categories.length)
				{
					// We set the value for this facet
					var category_string = _.pluck(categories, 'urlcomponent').join('/');
					this.parseFacet('category', category_string);

					// And then we just take it out so other posible facets are computed
					facets = facets.replace(category_string, '');
				}

				// We remove a posible 1st / (slash) (again, it me be re added by taking the category out)
				facets = (facets[0] === '/') ? facets.substr(1) : facets;
			}

			// The facet part of the url gets splited and computed by pairs
			var facet_tokens = facets.split(new RegExp('[\\'+ this.configuration.facetDelimiters.betweenDifferentFacets +'\\'+ this.configuration.facetDelimiters.betweenFacetNameAndValue +']+', 'ig'));
			while (facet_tokens.length > 0)
			{
				this.parseUrlFacet(facet_tokens.shift(), facet_tokens.shift());
			}

			// The same for the options part of the url
			var options_tokens = options.split(new RegExp('[\\'+ this.configuration.facetDelimiters.betweenOptionNameAndValue +'\\'+ this.configuration.facetDelimiters.betweenDifferentOptions +']+', 'ig'))
			,	tmp_options = {};

			while (options_tokens.length > 0)
			{
				tmp_options[options_tokens.shift()] = options_tokens.shift();
			}

			this.parseUrlOptions(tmp_options);
		}

		// facetsTranslator.sanitizeValue:
		// Translates values that came from the url into JS data types that this objects know of
		// Examples for different types:
		// - range/10to100 gets translated to {from: '10', to: '100'}
		// - range/100 gets translated to {from: '0', to: '100'}
		// - multi/1,2,3 gets translated to ['1', '2', '3']
	,	sanitizeValue: function (value, behavior)
		{
			var parsed_value;
			switch (behavior)
			{
			case 'range':
				// we return an object like {from: string, to: string }
				if (_.isString(value))
				{
					if (value.indexOf(this.configuration.facetDelimiters.betweenRangeFacetsValues) !== -1)
					{
						var tokens = value.split(this.configuration.facetDelimiters.betweenRangeFacetsValues);
						parsed_value = {from: tokens[0], to: tokens[1]};
					}
					else
					{
						parsed_value = {from: '0', to: value};
					}
				}
				else
				{
					parsed_value = value;
				}

				break;
			case 'multi':
				// we allways return an array for a multi value
				if (value.indexOf(this.configuration.facetDelimiters.betweenDifferentFacetsValues) !== -1)
				{
					parsed_value = value.split(this.configuration.facetDelimiters.betweenDifferentFacetsValues);
				}
				else
				{
					parsed_value = [value];
				}
				break;
			default:
				parsed_value = value;
			}
			return parsed_value;
		}

		// facetsTranslator.getUrlFacetValue
		// Returns the value of an active facet by the facet URL component
	,	getUrlFacetValue: function (facet_url)
		{
			return (_.find(this.facets, function (facet)
			{
				return facet.url === facet_url;
			}) || {}).value;
		}

		// facetsTranslator.getFacetValue:
		// Returns the value of an active facet by the facet id
	,	getFacetValue: function (facet_id)
		{
			return (_.find(this.facets, function (facet)
			{
				return facet.id === facet_id;
			}) || {}).value;
		}

		// facetsTranslator.getAllFacets:
		// Returns a copy of the internal array of facets containing values and configuration
	,	getAllFacets: function ()
		{
			return this.facets.slice(0);
		}

		// facetsTranslator.getOptionValue:
		// Returns the value of an active options or it's default value
	,	getOptionValue: function (option_id)
		{
			return this.options[option_id] || null;
		}

		// facetsTranslator.parseUrlFacet:
		// for a given name value, it gets the config, sanitaze the value and stores it all in the internal facets array
	,	parseUrlFacet: function (name, value)
		{
			// Gets the config for the current facet
			var config = this.getFacetConfig(name, 'url');

			if (config.id === 'category' || !name)
			{
				return;
			}

			this.facets.push({
				config: config
			,	id: config.id
			,	url: config.url
			,	value: this.sanitizeValue(value, config.behavior)
			});
		}

		// facetsTranslator.parseFacet:
		// Same as parseUrlFacet but from id
	,	parseFacet: function (facet_id, value)
		{
			// Gets the config for the current facet
			var config = this.getFacetConfig(facet_id, 'id');

			this.facets.push({
				config: config
			,	id: config.id
			,	url: config.url
			,	value: this.sanitizeValue(value, config.behavior)
			});
		}

		// facetsTranslator.parseUrlOptions:
		// Sets options from the options argument or sets default values
	,	parseUrlOptions: function (options)
		{
			this.options.show = options.show || this.configuration.defaultShow;
			this.options.order = options.order || this.configuration.defaultOrder;
			this.options.page = parseInt(options.page, 10) || 1;
			this.options.display = options.display || this.configuration.defaultDisplay;
			this.options.keywords = options.keywords ? decodeURIComponent(options.keywords) : this.configuration.defaultKeywords;
		}

		// facetsTranslator.getFacetConfig:
		// Gets the configuration for a given facet by id,
		// You can also get it by name or url component if you pass the second parameter
	,	getFacetConfig: function (name, by)
		{
			var result =  _.find(this.configuration.facets, function (facet)
			{
				return facet[by || 'id'] === name;
			});

			return result || _.extend({ id: name, name: name, url: name }, this.defaultFacetConfig);
		}

		// facetsTranslator.getUrl:
		// Gets the url for current stae of the object
	,	getUrl: function ()
		{
			var url = ''
			,	self = this;

			// Prepears the seo limits
			var facets_seo_limits = {};
			if (SC.ENVIRONMENT.jsEnvironment === 'server')
			{
				facets_seo_limits = {
					numberOfFacetsGroups: this.configuration.facetsSeoLimits && this.configuration.facetsSeoLimits.numberOfFacetsGroups || false
				,	numberOfFacetsValues: this.configuration.facetsSeoLimits && this.configuration.facetsSeoLimits.numberOfFacetsValues || false
				,	options: this.configuration.facetsSeoLimits && this.configuration.facetsSeoLimits.options || false
				};
			}

			// If there are too many facets selected
			if (facets_seo_limits.numberOfFacetsGroups && this.facets.length > facets_seo_limits.numberOfFacetsGroups)
			{
				return '#';
			}

			// Adds the category if it's prsent
			var category_string = this.getFacetValue('category');
			if (category_string)
			{
				url = self.configuration.facetDelimiters.betweenDifferentFacets + category_string;
			}

			// Encodes the other Facets
			var sorted_facets = _.sortBy(this.facets, 'url');
			for (var i = 0; i < sorted_facets.length; i++)
			{
				var facet = sorted_facets[i];
				// Category should be already added
				if (facet.id === 'category')
				{
					break;
				}
				var name = facet.url || facet.id,
					value = '';
				switch (facet.config.behavior)
				{
				case 'range':
					facet.value = (typeof facet.value === 'object') ? facet.value : {from: 0, to: facet.value};
					value = facet.value.from + self.configuration.facetDelimiters.betweenRangeFacetsValues + facet.value.to;
					break;
				case 'multi':
					value = facet.value.sort().join(self.configuration.facetDelimiters.betweenDifferentFacetsValues);

					if (facets_seo_limits.numberOfFacetsValues && facet.value.length > facets_seo_limits.numberOfFacetsValues)
					{
						return '#';
					}

					break;
				default:
					value = facet.value;
				}

				url += self.configuration.facetDelimiters.betweenDifferentFacets + name + self.configuration.facetDelimiters.betweenFacetNameAndValue + value;
			}

			url = (url !== '') ? url : '/'+this.configuration.fallbackUrl;

			// Encodes the Options
			var tmp_options = {}
			,	separator = this.configuration.facetDelimiters.betweenOptionNameAndValue;
			if (this.options.order && this.options.order !== this.configuration.defaultOrder)
			{
				tmp_options.order = 'order' + separator + this.options.order;
			}

			if (this.options.page && parseInt(this.options.page, 10) !== 1)
			{
				tmp_options.page = 'page' + separator + encodeURIComponent(this.options.page);
			}

			if (this.options.show && parseInt(this.options.show, 10) !== this.configuration.defaultShow)
			{
				tmp_options.show = 'show' + separator + encodeURIComponent(this.options.show);
			}

			if (this.options.display && this.options.display !== this.configuration.defaultDisplay)
			{
				tmp_options.display = 'display' + separator + encodeURIComponent(this.options.display);
			}

			if (this.options.keywords && this.options.keywords !== this.configuration.defaultKeywords)
			{
				tmp_options.keywords = 'keywords' + separator + encodeURIComponent(this.options.keywords);
			}

			var tmp_options_keys = _.keys(tmp_options)
			,	tmp_options_vals = _.values(tmp_options);


			// If there are options that should not be indexed also return #
			if (facets_seo_limits.options && _.difference(tmp_options_keys, facets_seo_limits.options).length)
			{
				return '#';
			}

			url += (tmp_options_vals.length) ? this.configuration.facetDelimiters.betweenFacetsAndOptions + tmp_options_vals.join(this.configuration.facetDelimiters.betweenDifferentOptions) : '';

			return _(url).fixUrl();
		}

		// facetsTranslator.getApiParams:
		// Gets the api parameters representing the current status of the object
	,	getApiParams: function ()
		{
			var params = {};

			_.each(this.facets, function (facet)
			{
				switch (facet.config.behavior)
				{
				case 'range':
					var value = (typeof facet.value === 'object') ? facet.value : {from: 0, to: facet.value};
					params[facet.id + '.from'] = value.from;
					params[facet.id + '.to'] = value.to;
					break;
				case 'multi':
					params[facet.id] = facet.value.sort().join(',') ; // this coma is part of the api call so it should not be removed
					break;
				default:
					params[facet.id] =  facet.value ;
				}
			});

			params.sort = this.options.order;
			params.limit = this.options.show;
			params.offset = (this.options.show * this.options.page) - this.options.show;

			params.q = this.options.keywords;

			return params;
		}

		// facetsTranslator.cloneForFacetId:
		// retruns a deep copy of this object with a new value for one facet,
		// if in a name value that is the same as what's in, it will take it out
	,	cloneForFacetId: function (facet_id, facet_value)
		{
			// Using jQuery here because it offers deep cloning
			var facets	= _.toArray(jQuery.extend(true, {}, this.facets))
			,	options	= jQuery.extend(true, {}, this.options)
			,	current_facet = _.find(facets, function (facet)
				{
					return facet.id === facet_id;
				});

			if (current_facet)
			{
				if (current_facet.config.behavior === 'multi')
				{
					if (_.indexOf(current_facet.value, facet_value) === -1)
					{
						current_facet.value.push(facet_value);
					}
					else
					{
						current_facet.value = _.without(current_facet.value, facet_value);
					}

					if (current_facet.value.length === 0)
					{
						facets = _.without(facets, current_facet);
					}
				}
				else
				{
					if (!_.isEqual(current_facet.value, facet_value))
					{
						current_facet.value = facet_value;
					}
					else
					{
						facets = _.without(facets, current_facet);
					}
				}
			}

			options.page = 1;

			var translator = new FacetsTranslator(facets, options, this.configuration);

			if (!current_facet)
			{
				translator.parseFacet(facet_id, facet_value);
			}

			return translator;
		}

		// facetsTranslator.cloneWithoutFacetId:
		// retruns a deep copy of this object without a facet,
	,	cloneWithoutFacetId: function (facet_id)
		{
			var facets = _.toArray(jQuery.extend(true, {}, this.facets))
			,	options = jQuery.extend(true, {}, this.options);

			facets = _.without(facets, _.find(facets, function (facet)
			{
				return facet.id === facet_id;
			}));

			return new FacetsTranslator(facets, options, this.configuration);
		}

		// facetsTranslator.cloneForFacetUrl:
		// same as cloneForFacetId but passing the url component of the facet
	,	cloneForFacetUrl: function (facet_url, facet_value)
		{
			return this.cloneForFacetId(this.getFacetConfig(facet_url, 'url').id, facet_value);
		}


		// facetsTranslator.cloneWithoutFacetId:
		// same as cloneWithoutFacetId but passing the url component of the facet
	,	cloneWithoutFacetUrl: function (facet_url)
		{
			return this.cloneWithoutFacetId(this.getFacetConfig(facet_url, 'url').id);
		}

		// facetsTranslator.cloneWithoutFacets:
		// Clones the translator removeing all the facets, leaving only options
	,	cloneWithoutFacets: function ()
		{
			// Creates a new translator with the same params as this;
			var translator = new FacetsTranslator(this.facets, this.options, this.configuration);

			_.each(translator.getAllFacets(), function (facet)
			{
				// Categories are not facets, so lets not remove those
				if (facet.id !== 'category')
				{
					translator = translator.cloneWithoutFacetId(facet.id);
				}
			});

			return translator;
		}

	,	cloneForOption: function (option_id, option_value)
		{
			var facets  = _.toArray(jQuery.extend(true, {}, this.facets))
			,	options = jQuery.extend(true, {}, this.options);

			options[option_id] = option_value;
			return new FacetsTranslator(facets, options, this.configuration);
		}

		// facetsTranslator.cloneForOptions:
		// same as cloneForFacetId but for options instead of facets
	,	cloneForOptions: function (object)
		{
			var facets  = _.toArray(jQuery.extend(true, {}, this.facets))
			,	options = jQuery.extend(true, {}, this.options, object);

			return new FacetsTranslator(facets, options, this.configuration);
		}

		// facetsTranslator.cloneWithoutOption:
		// same as cloneWithoutFacetId but for options instead of facets
	,	cloneWithoutOption: function (option_id)
		{
			var facets  = _.toArray(jQuery.extend(true, {}, this.facets))
			,	options = jQuery.extend(true, {}, this.options);

			delete options[option_id];

			return new FacetsTranslator(facets, options, this.configuration);
		}

		// facetsTranslator.resetAll:
		// Returns a blank instance of itself
	,	resetAll: function ()
		{
			return new FacetsTranslator([], {}, this.configuration);
		}

		// facetsTranslator.getMergedCategoryTree:
		// Returns a Category tree based on the site's one
		// but merged with the values passed in
		// it expect the format that the search api returns
		// Be aware that this is a recursive function, and this same function will be used to compute sub categories
	,	getMergedCategoryTree: function (values, branch)
		{
			var self = this;
			// if branch is omited it will start from the top level
			branch = branch || Categories && Categories.getTree() || {};

			_.each(values, function (value)
			{
				var id = _.last(value.id.split('/'));
				if (branch[id])
				{
					branch[id].count = value.count;

					if (branch[id].sub && _.keys(branch[id].sub).length && value.values.length)
					{
						branch[id].sub = self.getMergedCategoryTree(value.values, branch[id].sub);
					}
				}
			});

			return branch;
		}

		// facetsTranslator.setLabelsFromFacets:
		// This let the translator known about labels the api proportions
		// Tho this make the translator a bit less API agnostic
		// this step is totaly optional and it should work regardless of this step
	,	setLabelsFromFacets: function (facets_labels)
		{
			this.facetsLabels = facets_labels;
		}

		// facetsTranslator.getLabelForValue:
		// If facets labels have been setted it will try to look for the label for the
		// [id, value] combination and return it's label, otherways it will return the value
	,	getLabelForValue: function (id, value)
		{
			var facet = _.where(this.facetsLabels || [], {id: id});

			if (facet.length)
			{
				var label = _.where(facet[0].values || [], {name: value});

				// if the value could not be found by name, look for url
				if (!label.length)
				{
					label = _.where(facet[0].values || [], {url: value});
				}

				if (label.length)
				{
					return label[0].label;
				}
			}

			return value;
		}
	});

	return FacetsTranslator;
});

// Facets.Views.js
// ---------------
// View that handles the item list
define('Facets.Views', ['Cart', 'Facets.Helper', 'Categories'], function (Cart, Helper, Categories)
{
	'use strict';

	var Views = {}
		// statuses stores the statuses of the collapsible facets
	,	statuses = window.statuses = {}
		// collapsable_elements stores the statuses of the collapsible elements. This store elements collapsable that are not facets
		/*
		each object should be of the form
		{
			selector: '' //id of the element that will collapsed/expanded
		,	collapsed: true/false
		}
		*/
	,	collapsable_elements = window.collapsable_elements = {};

	Views.Browse = Backbone.View.extend({

		template: 'facet_browse'
	,	page_header: _('<b class="total-items">$(0)</b> Products').translate('{itemscount}')
	,	description: _('This is a description').translate()

	,	attributes: {
			'id': 'facet-browse'
		,	'class': 'view facet-browse'
		}

	,	events: {
			'click [data-toggle="collapse"]': 'clickCollapsable'
		,	'click [data-toggle="facet-navigation"]': 'toggleFacetNavigation'
		,	'slide div[data-toggle="slider"]': 'updateRangeValues'
		,	'stop div[data-toggle="slider"]': 'updateRangeSelection'
		,	'change [data-toggle="add-to-cart"] input[name="quantity"]': 'changeQ'
		,	'submit [data-toggle="add-to-cart"]': 'addToCart'
		,	'click [data-action="toggle-filters"]': 'toggleFilters'
		}

	,	initialize: function (options)
		{
			this.statuses = statuses;
			this.collapsable_elements = collapsable_elements;
			this.translator = options.translator;
			this.application = options.application;
			this.category = Categories.getBranchLineFromPath(this.translator.getFacetValue('category'))[0];

			this.collapsable_elements['facet-header'] = this.collapsable_elements['facet-header'] || {
				selector: 'this.collapsable_elements["facet-header"]'
			,	collapsed: false
			};
		}

	,	toggleFilters: function (e)
		{
			e.preventDefault();

			var current_target = jQuery(e.currentTarget);

			this.collapsable_elements['facet-header'].collapsed = !this.collapsable_elements['facet-header'].collapsed;

			current_target.find('.filter-icon').toggleClass('icon-chevron-up');

			current_target.parents('[data-type="accordion"]')
				.toggleClass('well')
				.toggleClass('facet-header-white-well')
				.find('[data-type="accordion-body"]').stop().slideToggle();
		}

	,	getPath: function ()
		{
			var canonical = window.location.protocol + '//' + window.location.hostname + '/' + Backbone.history.fragment
			,	index_of_query = canonical.indexOf('?');

			// !~ means: indexOf == -1
			return !~index_of_query ? canonical : canonical.substring(0, index_of_query);
		}

	,	getCanonical: function ()
		{
			var canonical_url = this.getPath()
			,	current_page = this.translator.getOptionValue('page');

			if (current_page > 1)
			{
				canonical_url += '?page=' + current_page;
			}

			return canonical_url;
		}

	,	getRelPrev: function ()
		{
			var previous_page_url = this.getPath()
			,	current_page = this.translator.getOptionValue('page');

			if (current_page > 1)
			{
				if (current_page === 2)
				{
					return previous_page_url;
				}

				if (current_page > 2)
				{
					return previous_page_url += '?page=' + (current_page - 1);
				}
			}

			return null;
		}

	,	getRelNext: function ()
		{
			var next_page_url = this.getPath()
			,	current_page = this.translator.getOptionValue('page');

			if (current_page < this.totalPages)
			{
				return next_page_url += '?page='+ (current_page + 1);
			}

			return null;
		}

		// view.renderFacets:
		// Generates a new translator, grabs the facets of the model,
		// look for elements with data-type="facet" or data-type="all-facets"
		// and then execute all the macros and injects the results in the elements
	,	renderFacets: function (url)
		{
			var self = this
			,	translator = Helper.parseUrl(url, this.options.translatorConfig)
			,	facets = this.model.get('facets');

			this.$('div[data-type="facet"]').each(function (i, nav)
			{
				var $nav = jQuery(nav).empty()
				,	facet_id = $nav.data('facet-id')
				,	facet_config = translator.getFacetConfig( facet_id )
				,	facet_macro = $nav.data('facet-macro') || facet_config.macro || self.application.getConfig('macros.facet')
				,	facet = _.find(facets, function (facet) {
						return facet.id === facet_id;
					});

				$nav.append( SC.macros[ facet_macro ](translator, facet_config, facet) );
			});

			this.$('div[data-type="all-facets"]').each(function (i, nav)
			{
				var $nav = jQuery(nav).empty()
				,	exclude = _.map( ( $nav.data('exclude-facets') || '').split(','), function (result) {
						return jQuery.trim( result );
					})
				,	ordered_facets = facets && facets.sort(function (a, b) {
						// Default Prioriry is 0
						return (translator.getFacetConfig(b.id).priority || 0) - (translator.getFacetConfig(a.id).priority || 0);
					})
				,	content = '';

				_.each(ordered_facets, function (facet)
				{
					var facet_config = translator.getFacetConfig(facet.id);
					if ( !_.contains(exclude, facet.id) )
					{
						content += SC.macros[facet_config.macro || self.application.getConfig('macros.facet')](translator, facet_config, facet);
					}
				});

				$nav.append( content );
			});

			this.$('[data-toggle="collapse"]').each(function (index, collapser)
			{
				self.fixStatus(collapser);
			});

			this.$('[data-toggle="slider"]').slider();
		}

		// view.fixStatus:
		// Tries to keep the status of the collapeser based on what they were previously setted
	,	fixStatus: function (collapser)
		{
			var $collapser = jQuery(collapser)
			,	$facet = $collapser.closest('div[data-type="rendered-facet"]')
			,	$placeholder = $collapser.closest('div[data-type="all-facets"], div[data-type="facet"]')
			,	$target = jQuery( $collapser.data('target') );

			// Checks the path in the Status object is present
			this.statuses[$placeholder.attr('id')] = this.statuses[$placeholder.attr('id')] || {};
			this.statuses[$placeholder.attr('id')][$facet.data('facet-id')] = this.statuses[$placeholder.attr('id')][$facet.data('facet-id')] || {};

			if (_.isUndefined(this.statuses[$placeholder.attr('id')][$facet.data('facet-id')][$collapser.data('type')]))
			{
				if ($collapser.data('type') !== 'collapse' && !$target.hasClass('in'))
				{
					this.statuses[$placeholder.attr('id')][$facet.data('facet-id')][$collapser.data('type')] = false;
				}
				else
				{
					this.statuses[$placeholder.attr('id')][$facet.data('facet-id')][$collapser.data('type')] = !this.translator.getFacetConfig($facet.data('facet-id')).collapsed;
				}
			}

			if (this.statuses[$placeholder.attr('id')][$facet.data('facet-id')][$collapser.data('type')])
			{
				$target.addClass('in').removeClass('collapse');
			}
			else
			{
				$target.addClass('collapse').removeClass('in');
			}

			this.toggleCollapsableIndicator($collapser, !this.statuses[$placeholder.attr('id')][$facet.data('facet-id')][$collapser.data('type')]);
		}

		//view.formatFacetTitle: accepts a facet object and returns a string formatted to be displayed on the document's title according with user facet configuration property titleToken
	,	formatFacetTitle: function (facet)
		{
			var defaults = {
				range: '$(2): $(0) to $(1)'
			,	multi: '$(1): $(0)'
			,	single: '$(1): $(0)'
			};

			if (facet.id === 'category')
			{
				//we search for a category title starting from the last category of the branch
				var categories = Categories.getBranchLineFromPath(this.options.translator.getFacetValue('category'));
				if(categories && categories.length > 0)
				{
					for(var i = categories.length - 1; i >= 0; i--)
					{
						var category = categories[i];
						var category_title = category.pagetitle || category.itemid;
						if(category_title)
						{
							return category_title;
						}
					}
				}
				return null;
			}

			if (!facet.config.titleToken)
			{
				facet.config.titleToken = defaults[facet.config.behavior] || defaults.single;
			}
			if (_.isFunction(facet.config.titleToken))
			{
				return facet.config.titleToken(facet);
			}
			else if (facet.config.behavior === 'range')
			{
				return _(facet.config.titleToken).translate(facet.value.to, facet.value.from, facet.config.name);
			}
			else if (facet.config.behavior === 'multi')
			{
				var buffer = [];
				_.each(facet.value, function (val)
				{
					buffer.push(val);
				});
				return _(facet.config.titleToken).translate(buffer.join(', '), facet.config.name);
			}
			else
			{
				return _(facet.config.titleToken).translate(facet.value, facet.config.name);
			}
		}

		// overrides Backbone.Views.getTitle
	,	getTitle: function ()
		{
			if (this.title)
			{
				return this.title;
			}

			var facets = this.options.translator.facets
			,	title = '';

			if (facets && facets.length)
			{
				var buffer = []
				,	facet = null;

				for (var i = 0; i < facets.length; i++)
				{
					facet = facets[i];
					buffer.push(this.formatFacetTitle(facet));

					if (i < facets.length - 1)
					{
						buffer.push(facet.config.titleSeparator || ', ');
					}
				}

				title = this.application.getConfig('searchTitlePrefix', '') +
						buffer.join('') +
						this.application.getConfig('searchTitleSufix', '');
			}
			else if (this.translator.getOptionValue('keywords'))
			{
				title = _('Search results for "$(0)"').translate(
					this.translator.getOptionValue('keywords')
				);
			}
			else
			{
				title = this.application.getConfig('defaultSearchTitle', '');
			}

			// Update the meta tag 'twitter:title'
			this.setMetaTwitterTitle(title);

			return title;
		}

	,	setMetaTwitterTitle: function (title) 
		{
			var seo_twitter_title = jQuery('meta[name="twitter:title"]');
			seo_twitter_title && seo_twitter_title.attr('content', title);
		}

		// view.showContent:
		// Works with the title to find the proper wording and calls the layout.showContent
	,	showContent: function ()
		{
			// If its a free text search it will work with the title
			var keywords = this.translator.getOptionValue('keywords')
			,	resultCount = this.model.get('total')
			,	self = this;

			if (keywords)
			{
				keywords = decodeURIComponent(keywords);

				if (resultCount > 0)
				{
					this.subtitle =  resultCount > 1 ? _('Results for "$(0)"').translate(keywords) : _('Result for "$(0)"').translate(keywords);
				}
				else
				{
					this.subtitle = _('We couldn\'t find any items that match "$(0)"').translate(keywords);
				}
			}

			this.totalPages = Math.ceil(resultCount / this.translator.getOptionValue('show'));
			// once the showContent is done the afterAppend is called
			this.application.getLayout().showContent(this).done(function ()
			{
				// Looks for placeholders and injects the facets
				self.renderFacets(self.translator.getUrl());
			});
		}

		// view.clickCollapsable
	,	clickCollapsable: function (e)
		{
			var $target = jQuery(e.target);

			if (!($target.is('a') || $target.parent().is('a')))
			{
				this.toggleCollapsableIndicator(e.target);
			}
		}

		// view.toggleCollapsableIndicator
		// Handles the collapsables and store the status
	,	toggleCollapsableIndicator: function (element, is_open)
		{
			var $element = jQuery(element).closest('*[data-toggle="collapse"]'),
				$facet_container = $element.closest('div[data-type="rendered-facet"]');

			is_open = _.isUndefined(is_open) ? jQuery($element.data('target')).hasClass('in') : is_open;

			$element
				.find('*[data-collapsed!=""]')
				.filter('[data-collapsed="true"]')[is_open ? 'hide' : 'show']().end()
				.filter('[data-collapsed="false"]')[is_open ? 'show' : 'hide']();

			var holder_html_id = $facet_container.parent().attr('id')
			,	facet_id = $facet_container.data('facet-id')
			,	type = $element.data('type');

			this.statuses[holder_html_id][facet_id][type] = !is_open;
		}

		// view.updateRangeValues
		// Talks to the Bootstrap.Slider.js
		// Displays the numbers under the slider while you are slider
	,	updateRangeValues: function (e, slider)
		{
			var $container = slider.$element.closest('div[data-type="rendered-facet"]')
			,	parser = this.translator.getFacetConfig( $container.data('facet-id') ).parser
			,	start = _.isFunction(parser) ? parser(slider.values.low, true) : slider.values.low
			,	end = _.isFunction(parser) ? parser(slider.values.high, false) : slider.values.high;

			$container
				.find('span[data-range-indicator="start"]').html(start).end()
				.find('span[data-range-indicator="end"]').html(end);
		}

		// view.updateRangeSelection
		// Talks to the Bootstrap.Slider.js
		// Once the user releases the Slider controller this takes care of
		// generating a new url and of navigating to it
	,	updateRangeSelection: function (e, slider)
		{
			var facet_id = slider.$element.data('facet-id')
			,	translator = this.translator
				// the currently selected slider values
			,	slider_values = slider.values
				// currently selected values for that facet
			,	facet_values = translator.getFacetValue(facet_id)
				// facet for the slider
			,	facet = _.find(this.model.get('facets'), function (item) {
					return item.id === facet_id;
				})
				// available values for that facet
			,	values = _.map(facet.values, function (item) {
					return parseFloat(item.url);
				});

			// if the low selected value equals the minimum available value
			// and the high selected value equals the maximum available value
			if (_.min(values) === slider_values.low && _.max(values) === slider_values.high)
			{
				// then we remove the facet from the selection
				Backbone.history.navigate(translator.cloneWithoutFacetId(facet_id).getUrl(), {trigger: true});
			}
			// else, if there are not values selected OR
			// the selected from value is different than the slider low value OR
			// the selected to value is different than the slider high value
			else if (!facet_values || parseFloat(facet_values.from) !== slider_values.low || parseFloat(facet_values.to) !== slider_values.high)
			{
				// then we navigate to that page
				Backbone.history.navigate(translator.cloneForFacetId(facet_id, {
					from: slider_values.low.toFixed(2)
				,	to: slider_values.high.toFixed(2)
				}).getUrl(), {trigger: true});
			}
		}

	,	changeQ: function(e)
		{
			e.preventDefault();
			var options = jQuery(e.target).closest('form').serializeObject()
			,	model = this.model.get('items').get(options.item_id);
			// Updates the quantity of the model
			model.setOption('quantity', options.quantity);
			jQuery(e.target).closest('.item-cell').find('[itemprop="price"]').html(model.getPrice().price_formatted);
		}

		// view.addToCart
		// Adds the item to the cart
	,	addToCart: function (e)
		{
			e.preventDefault();

			var options = jQuery(e.target).serializeObject()
			,	model = this.model.get('items').get(options.item_id);

			// Updates the quantity of the model
			model.setOption('quantity', options.quantity);

			if (model.isReadyForCart())
			{
				var self = this
				,	cart = this.application.getCart()
				,	layout = this.application.getLayout()
				,	cart_promise = jQuery.Deferred()
				,	error_message = _('Sorry, there is a problem with this Item and can not be purchased at this time. Please check back later.').translate();

				if (model.cartItemId)
				{
					cart_promise = cart.updateItem(model.cartItemId, model).done(function ()
					{
						if (cart.getLatestAddition())
						{
							if (self.$containerModal)
							{
								self.$containerModal.modal('hide');
							}

							if (layout.currentView instanceof require('Cart').Views.Detailed)
							{
								layout.currentView.showContent();
							}
						}
						else
						{
							self.showError(error_message);
						}
					});
				}
				else
				{
					cart_promise = cart.addItem(model).done(function ()
					{
						if (cart.getLatestAddition())
						{
							layout.showCartConfirmation();
						}
						else
						{
							self.showError(error_message);
						}
					});
				}

				// disalbes the btn while it's being saved then enables it back again
				if (e && e.currentTarget)
				{
					jQuery('input[type="submit"]', e.currentTarget).attr('disabled', true);
					cart_promise.always(function () {
						jQuery('input[type="submit"]', e.currentTarget).attr('disabled', false);
					});
				}
			}
		}
		// view.getBreadcrumb:
		// It will generate an array suitable to pass it to the breadcrumb macro
		// It looks in the category facet value
	,	getBreadcrumb: function ()
		{
			var category_string = this.translator.getFacetValue('category')
			,	breadcrumb = [{
					href: '/'
				,	text: _('Home').translate()
				}];

			if (category_string)
			{
				var category_path = '';
				_.each(Categories.getBranchLineFromPath(category_string), function (cat)
				{
					category_path += '/'+cat.urlcomponent;

					breadcrumb.push({
						href: category_path
					,	text: _(cat.itemid).translate()
					});
				});

			}
			else if (this.translator.getOptionValue('keywords'))
			{
				breadcrumb.push({
					href: '#'
				,	text: _('Search Results').translate()
				});
			}
			else
			{
				breadcrumb.push({
					href: '#'
				,	text: _('Shop').translate()
				});
			}

			return breadcrumb;
		}

		// view.toggleFacetNavigation
		// Hides/Shows the facet navigation area
	,	toggleFacetNavigation: function ()
		{
			this.$el.toggleClass('narrow-by');
			this.toggleNavigationListener(this.$el.hasClass('narrow-by'));
		}

		// view.toggleNavigationListener
		// adds/removes event listeners to the HTML to hide the facet navigation area
	,	toggleNavigationListener: function (isOn)
		{
			var self = this
			,	touch_started = null;

			// turn listeners on
			if (isOn)
			{
				jQuery('html')
					// we save the time when the touchstart happened
					.on('touchstart.narrow-by', function ()
					{
						touch_started = new Date().getTime();
					})
					// code for touchend and mousdown is the same
					.on('touchend.narrow-by mousedown.narrow-by', function (e)
					{
						// if there wasn't a touch event, or the time difference between
						// touch start and touch end is less that 200 miliseconds
						// (this is to allow scrolling without closing the facet navigation area)
						if (!touch_started || new Date().getTime() - touch_started < 200)
						{
							var $target = jQuery(e.target);

							// if we are not touching the narrow by button or the facet navigation area
							if (!$target.closest('[data-toggle="facet-navigation"]').length && !$target.closest('#faceted-navigation').length)
							{
								// we hide the navigation
								self.toggleFacetNavigation();
							}
						}
					});
			}
			else
			{
				jQuery('html')
					// if the navigation area is hidden, we remove the event listeners from the HTML
					.off('mousedown.narrow-by touchstart.narrow-by touchend.narrow-by');
			}
		}

	});


	Views.BrowseCategories = Backbone.View.extend({

		template: 'category_browse'

	,	initialize: function ()
		{
			var self = this;
			this.category = Categories.getBranchLineFromPath(this.options.translator.getFacetValue('category'))[0];
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

	,	getBreadcrumb: Views.Browse.prototype.getBreadcrumb

	,	getTitle: function ()
		{
			var title = this.category.pagetitle || this.category.itemid;

			// Update the meta tag 'twitter:title'
			this.setMetaTwitterTitle(title);

			return title;
		}

	,	setMetaTwitterTitle: function (title) 
		{
			var seo_twitter_title = jQuery('meta[name="twitter:title"]');
			seo_twitter_title && seo_twitter_title.attr('content', title);
		}
	});

	return Views;
});

(function (win, name)
{
	'use strict';
	// [Google Analytics](https://developers.google.com/analytics/devguides/collection/gajs/)
	// This variable has to be already defined when our module loads
	win[name] = win[name] || [];

	// GoogleAnalytics.js
	// ------------------
	// Loads google analytics script and extends application with methods:
	// * trackPageview
	// * trackEvent
	// * trackTransaction
	// Also wraps layout's showInModal
	define('GoogleAnalytics', function ()
	{
		var GoogleAnalytics = {

			trackPageview: function (url)
			{
				if (_.isString(url))
				{
					// [_trackPageview()](https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiBasicConfiguration#_gat.GA_Tracker_._trackPageview)
					win[name].push(['_trackPageview', url]);
				}

				return this;
			}

		,	trackEvent: function (event)
			{
				if (event && event.category && event.action)
				{
					// [_trackEvent()](https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide)
					win[name].push(['_trackEvent'
					,	event.category
					,	event.action
					,	event.label
					,	event.value
					]);
				}

				return this;
			}

		,	addItem: function (item)
			{
				if (item && item.id && item.name)
				{
					// [_addItem()](https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._addItem)
					win[name].push(['_addItem'
					,	item.id
					,	item.sku
					,	item.name
					,	item.category
					,	item.price
					,	item.quantity
					]);
				}

				return this;
			}

		,	addTrans: function (transaction)
			{
				if (transaction && transaction.id)
				{
					// [_addTrans()](https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._addTrans)
					win[name].push(['_addTrans'
					,	transaction.id
					,	transaction.affiliation
					,	transaction.revenue
					,	transaction.tax
					,	transaction.shipping
					,	transaction.city
					,	transaction.state
					,	transaction.country
					]);
				}

				return this;
			}

		,	trackTrans: function ()
			{
				// [_trackTrans()](https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEcommerce#_gat.GA_Tracker_._trackTrans)
				win[name].push(['_trackTrans']);
				return this;
			}

			// Based on the created SalesOrder we trigger each of the analytics
			// ecommerce methods passing the required information
			// [Ecommerce Tracking](https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingEcommerce?hl=en)
		,	trackTransaction: function (order)
			{
				if (order && order.get('confirmation'))
				{
					var shipping_address = order.get('addresses').get(order.get('shipaddress'))
					,	transaction_id = order.get('confirmation').confirmationnumber
					,	order_summary = order.get('summary')
					,	item = null;

					GoogleAnalytics.addTrans({
						id: transaction_id
					,	affiliation: SC.ENVIRONMENT.siteSettings.displayname
					,	revenue: order_summary.subtotal
					,	tax: order_summary.taxtotal
					,	shipping: order_summary.shippingcost + order_summary.handlingcost
					,	city: shipping_address.get('city')
					,	state: shipping_address.get('state')
					,	country: shipping_address.get('country')
					});

					order.get('lines').each(function (line)
					{
						item = line.get('item');

						GoogleAnalytics.addItem({
							id: transaction_id
						,	sku: item.get('_sku')
						,	name: item.get('_name')
						,	category: item.get('_category')
						,	price: line.get('rate')
						,	quantity: line.get('quantity')
						});
					});

					return GoogleAnalytics.trackTrans();
				}
			}

		,	setAccount: function (config)
			{
				if (config && _.isString(config.propertyID) && _.isString(config.domainName))
				{
					// [Tracking Across a Domain and Its Subdomains](https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingSite#domainSubDomains)
					win[name].push(
						['_setAccount', config.propertyID]
					,	['_setDomainName', config.domainName]
					,	['_setAllowLinker', true]
					);

					this.propertyID = config.propertyID;
					this.domainName = config.domainName;
				}

				return this;
			}

			// [Tracking Between a Domain and a Sub-Directory on Another Domain](https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingSite#domainAndSubDirectory)
		,	addCrossDomainParameters: function (url)
			{
				// We only need to add the parameters if the url we are trying to go
				// is not a sub domain of the tracking domain
				if (_.isString(url) && !~url.indexOf(this.domainName))
				{
					win[name].push(function ()
					{
						var track_url = _gat._getTrackerByName()._getLinkerUrl(url);
						// This validation is due to Tracking Blockers overriding the default anlaytics methods
						if (typeof track_url === 'string')
						{
							url = track_url;
						}
					});
				}

				return url;
			}

		,	loadScript: function ()
			{
				return SC.ENVIRONMENT.jsEnvironment === 'browser' && jQuery.getScript(('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js');
			}

		,	mountToApp: function (application)
			{
				var tracking = application.getConfig('tracking.google');

				// if track page view needs to be tracked
				if (tracking && tracking.propertyID)
				{
					// we get the account and domain name from the configuration file
					GoogleAnalytics.setAccount(tracking);

					application.trackers && application.trackers.push(GoogleAnalytics);

					// the analytics script is only loaded if we are on a browser
					application.getLayout().once('afterAppendView', jQuery.proxy(GoogleAnalytics, 'loadScript'));
				}	
			}
		};
		
		return GoogleAnalytics;
	});
})(window, '_gaq');
(function (win, name)
{
	'use strict';
	// [Google Universal Analytics](https://developers.google.com/analytics/devguides/collection/analyticsjs/)
	// We customized the tracking default start script so it doesn't loads analytics.js
	// (Tracking Start)[https://developers.google.com/analytics/devguides/collection/analyticsjs/#quickstart]
	win.GoogleAnalyticsObject = name;
	win[name] = win[name] || function ()
	{
		(win[name].q = win[name].q || []).push(arguments);
	};
	win[name].l = 1 * new Date();

	// GoogleUniversalAnalytics.js
	// ------------------
	// Loads google analytics script and extends application with methods:
	// * trackPageview
	// * trackEvent
	// * trackTransaction
	// Also wraps layout's showInModal
	define('GoogleUniversalAnalytics', function ()
	{
		var GoogleUniversalAnalytics = {

			trackPageview: function (url)
			{
				if (_.isString(url))
				{
					// [Page Tracking](https://developers.google.com/analytics/devguides/collection/analyticsjs/pages#overriding)
					win[name]('send', 'pageview', url);
				}

				return this;
			}

		,	trackEvent: function (event)
			{
				if (event && event.category && event.action)
				{
					// [Event Tracking](https://developers.google.com/analytics/devguides/collection/analyticsjs/events#implementation)
					win[name]('send', 'event', event.category, event.action, event.label, parseFloat(event.value) || 0, {
						'hitCallback': event.callback
					});
				}

				return this;
			}

		,	addItem: function (item)
			{
				if (item && item.id && item.name)
				{
					// [Adding Items](https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce#addItem)
					win[name]('ecommerce:addItem', item);
				}

				return this;
			}

		,	addTrans: function (transaction)
			{
				if (transaction && transaction.id)
				{
					// [Adding a Transaction](https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce#addTrans)
					win[name]('ecommerce:addTransaction', transaction);
				}

				return this;
			}

		,	trackTrans: function ()
			{
				// [Sending Data](https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce#sendingData)
				win[name]('ecommerce:send');
				return this;
			}

			// Based on the created SalesOrder we trigger each of the analytics
			// ecommerce methods passing the required information
			// [Ecommerce Tracking](https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce)
		,	trackTransaction: function (order)
			{
				if (order && order.get('confirmation'))
				{
					var transaction_id = order.get('confirmation').confirmationnumber
					,	order_summary = order.get('summary')
					,	item = null;

					GoogleUniversalAnalytics.addTrans({
						id: transaction_id
					,	revenue: order_summary.subtotal
					,	shipping: order_summary.shippingcost + order_summary.handlingcost
					,	tax: order_summary.taxtotal
					,	currency: SC.getSessionInfo('currency') ? SC.getSessionInfo('currency').code : ''
					});

					order.get('lines').each(function (line)
					{
						item = line.get('item');

						GoogleUniversalAnalytics.addItem({
							id: transaction_id
						,	affiliation: SC.ENVIRONMENT.siteSettings.displayname
						,	sku: item.get('_sku')
						,	name: item.get('_name')
						,	category: item.get('_category')
						,	price: line.get('rate')
						,	quantity: line.get('quantity')
						});
					});

					return GoogleUniversalAnalytics.trackTrans();
				}
			}

		,	setAccount: function (config)
			{
				if (config && _.isString(config.propertyID) && _.isString(config.domainName))
				{
					// [Multiple Trackers on The Same Domain](https://developers.google.com/analytics/devguides/collection/analyticsjs/domains#multitrackers)
					win[name]('create', config.propertyID, {
						'cookieDomain': config.domainName
					,	'allowLinker': true
					});

					this.propertyID = config.propertyID;
					this.domainName = config.domainName;
				}

				return this;
			}

			// [Decorating HTML Links](https://developers.google.com/analytics/devguides/collection/analyticsjs/cross-domain#decoratelinks)
		,	addCrossDomainParameters: function (url)
			{
				// We only need to add the parameters if the url we are trying to go
				// is not a sub domain of the tracking domain
				if (_.isString(url) && !~url.indexOf(this.domainName))
				{
					win[name](function (tracker)
					{
						win.linker = win.linker || new win.gaplugins.Linker(tracker);

						var track_url = win.linker.decorate(url);

						// This validation is due to Tracking Blockers overriding the default anlaytics methods
						if (typeof track_url === 'string')
						{
							url = track_url;
						}
					});
				}

				return url;
			}

		,	loadScript: function ()
			{
				// [Load the Ecommerce Plugin](https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce#loadit)
				win[name]('require', 'ecommerce', 'ecommerce.js');
				return SC.ENVIRONMENT.jsEnvironment === 'browser' && jQuery.getScript('//www.google-analytics.com/analytics.js');
			}

		,	mountToApp: function (application)
			{
				var tracking = application.getConfig('tracking.googleUniversalAnalytics');

				// if track page view needs to be tracked
				if (tracking && tracking.propertyID)
				{
					// we get the account and domain name from the configuration file
					GoogleUniversalAnalytics.setAccount(tracking);

					application.trackers && application.trackers.push(GoogleUniversalAnalytics);

					// the analytics script is only loaded if we are on a browser
					application.getLayout().once('afterAppendView', jQuery.proxy(GoogleUniversalAnalytics, 'loadScript'));
				}
			}
		};

		return GoogleUniversalAnalytics;
	});
})(window, 'ga');

define('Home', function ()
{
	'use strict';

	var View = Backbone.View.extend({

		template: 'home'

	,	title: _('Welcome to the store').translate()

	,	page_header: _('Welcome to the store').translate()

	,	attributes: {
			'id': 'home-page'
		,	'class': 'home-page'
		}

	,	events:
		{
			'click .carousel .carousel-control': 'carouselSlide'
		}

	,	initialize: function (options)
		{
			var application = options.application;
			this.config = application.getConfig('homePage');
		}

	,	carouselSlide: function (e)
		{
			var direction = this.$(e.target).data('slide');
			this.$('.carousel').carousel(direction);
		}

	});

	var Router = Backbone.Router.extend({

		routes: {
			'': 'homePage'
		,	'?*params': 'homePage'
		}

	,	initialize: function (Application)
		{
			this.application = Application;
		}

	,	homePage: function ()
		{
			var view = new View({
				application: this.application
			});

			view.showContent();
		}
	});

	return {
		View: View
	,	Router: Router
	,	mountToApp: function (Application)
		{
			return new Router(Application);
		}
	};
});

// ImageLoader.js
// ------------------
// This module is responsible of of the lazy loading of images - this is loading only those images that are in the current browser's viewport and start loading
// the other images when the user scrolls into them. In general this module has two parts - first it exposes the function _.printImage() so images with this
// behavior can be easily printed in templates&macros and then it contains the logic of loading the images when the user scrolls the window.
// This module won't affect the Page Generator output code - only browser's

// Module fixes for the 1.06
// Please see the code comments below to know the changes and fixes

define('ImageLoader', ['Merchandising.Zone'], function (MerchandisingZone) {

    'use strict';

    var default_height = 200;

    var image_urls = {};

    if (SC.ENVIRONMENT.jsEnvironment === 'browser') {

        jQuery.fn.originalSlider = jQuery.fn.bxSlider;

        jQuery.fn.bxSlider = function (options) { // 1.06 FIX: Override the bxSlider function in order to load the images before the slider start to avoid height errors.
            resolvePendingImages(true);
            return this.originalSlider(options);
        }

    }

    var fixImagesForLoader = function (s) {
        if (typeof s === 'object' && s.innerHTML) {
            s = s.innerHTML;
        }// 1.06 FIX: On the PDP the product_list_contro_new_pl_tml cames as object

        return s && s.replace && s.replace(/<img([^>]*)src="([^"]+)"([^>]*)/gi, function (all, textBefore, url, textAfter) {
                if (image_urls[url]) {
                    return all;
                }
                textBefore = textBefore || '';
                textAfter = textAfter || '';
                // do nothing if image contains data-loader="false" attribute
                if ((textBefore && textBefore.indexOf('data-loader="false"') !== -1) || (textAfter && textAfter.indexOf('data-loader="false"') !== -1)) {
                    return all;
                }

                var params = _.parseUrlOptions(url),
                    height = params.resizeh || default_height,
                    style_attrs = all.match(/style=\"([^\"]+)\"/gi);

                // 1.06 FIX: We need to maintain the style tag if the image already has it
                if (style_attrs) {
                    style_attrs = _.first(style_attrs).replace('style="', 'style="height:auto;min-width:100%;"')

                } else {
                    style_attrs = 'style="height:auto;min-width:100%"';
                }

                return '<img data-image-status="pending" data-src="' + url + '" ' + style_attrs + textBefore + ' ' + textAfter;
            });
    };

    var isElementInViewport = function ($el) {
        if (!$el.is(':visible')) {
            return false;
        }
        var el_rect = {
            left: $el.offset().left
            , top: $el.offset().top
            , bottom: $el.offset().top + $el.height()
            , right: $el.offset().left + $el.width()
        };
        var window_rect = {
            left: jQuery(window).scrollLeft()
            , top: jQuery(window).scrollTop()
            , bottom: jQuery(window).scrollTop() + jQuery(window).height()
            , right: jQuery(window).scrollLeft() + jQuery(window).width()
        };

        return rectangleIntercept(el_rect, window_rect);
    };

    var rectangleIntercept = function (r1, r2) {
        return !(
        r1.left > r2.right ||
        r1.right < r2.left ||
        r1.top > r2.bottom ||
        r1.bottom < r2.top
        );
    };

    // the main imageloader function resolvePendingImages. It will iterate all images marked with data-image-status="pending" and start loading them.
    // If passed parameter onlyIfVisible is true it will load ony those images that are currently visible.
    var resolvePendingImages = function (onlyIfVisible) {
        jQuery('[data-image-status="pending"]').each(function () {
            var $image = jQuery(this);
            if (!onlyIfVisible || isElementInViewport($image)) {
                var src = $image.attr('data-src');
                $image.attr({src: $image.attr('data-src')})
                    .attr('data-image-status', 'done')
                    .css('opacity', 0)
                    .on('load error', function () // 1.06 FIX: Changed the .data('image-status', 'done') to .attr('data-image-status', 'done') because was not working well
                    {
                        $image.animate({'opacity': 1}, 500);
                        $image.css('minHeight', '').css('minWidth', '');  // 1.06 FIX: Now we only remove the min-height and min-width styles;
                        image_urls[src] = true;
                    });
            }
        });
    };

    // 1.06: Removed the afterRender trigger
    _.extend(MerchandisingZone.prototype, {
        appendItems: function () {
            var items = this.items;

            if (items.length) {
                // we try to get the 'template' from either
                // the merchandising rule or the default configuration
                var model = this.model
                    , application = this.application
                    , template = SC.macros[model.get('template')] || SC.macros[application.getConfig('macros.merchandisingZone')];

                // then we append the parsed template to the element
                this.$element.append(
                    template({
                        application: application
                        , title: model.get('title')
                        , description: model.get('description')
                        , items: _.first(items.models, model.get('show'))
                    })
                );
            }

            jQuery(window).trigger('scroll');

            items.trigger('appended');

            return this;
        }
    });


    return {
        mountToApp: function (application) {
            window.fixImagesForLoader = fixImagesForLoader;


            if (!SC.isPageGenerator()) {
                var showInterval;
                // we listen when the full document is scrolled and check if there is any pending image and load them if they are visible
                jQuery(window).on('resize scroll', _.throttle(function () {
                    resolvePendingImages(true);
                    clearInterval(showInterval);
                }, 200));

                var Layout = application.getLayout();

                // 1.06 FIX: We need to trigger the resolve images after a content is rendered.
                Layout.on('renderEnhancedPageContent', function (view, content_zone) {
                    resolvePendingImages(true);
                });

                // 1.06 FIX: I removed the afterRender listener because is triggered before the after append view of the main content
                // so you only will have the header and footer and for that reason the footer is visible on the actual viewport and it will load the images
                Layout.on('afterAppendView', function () {
                    resolvePendingImages(true);
                    showInterval = setInterval(function () {
                        resolvePendingImages(true);
                    }, 1000);
                    // Creates an interval to resolve pending images, this fix the recently view and slider miniatures error.
                });

                //There may be image markup that are there but in hidden parents that may be shown when user clicks or touch something.
                jQuery('body').on('click touchend', function () {
                    clearInterval(showInterval);
                    resolvePendingImages(false);
                });
            }

        }


        //exposing utility methods so we can test them.

        , resolvePendingImages: resolvePendingImages

        , rectangleIntercept: rectangleIntercept

        , isElementInViewport: isElementInViewport

        , fixImagesForLoader: fixImagesForLoader

        , default_height: default_height

    };

});

// ImageNotAvailable.js
// --------------------
// Simple Module that will make sure that
// if an image files to load it will load an alternative image in it
define('ImageNotAvailable', function ()
{
	'use strict';
	
	return {
		mountToApp: function (application)
		{
			// Every time a new view is rendered
			application.getLayout().on('afterAppendView', function (view)
			{
				// it will look at the img and bind the error event to it
				view.$('img').on('error', function ()
				{
					// and haven't tried to changed it before, so we don't enter an infinite loop
					if (!this.errorCounter)
					{
						// it will set the src of the img to the default image not available.
						// you can set logic based on size or a class for displaying different urls if you need
						this.src = application.resizeImage(application.getConfig('imageNotAvailable', ''), SC.ENVIRONMENT.screenWidth < 768 ? 'thumbnail' : 'zoom');
						jQuery(this).parent('[data-zoom]').length && jQuery(this).parent('[data-zoom]').zoom();
						this.errorCounter = true;
					}
				});
			});
		}
	};
});
// ItemDetails.Collection.js
// -------------------------
// Returns an extended version of the CachedCollection constructor
// (file: Backbone.cachedSync.js)
define('ItemDetails.Collection', ['ItemDetails.Model', 'Session'], function (Model, Session)
{
	'use strict';

	return Backbone.CachedCollection.extend({
		
		url: function()
		{
			var url = _.addParamsToUrl(
				'/api/items'
			,	_.extend(
					{}
				,	this.searchApiMasterOptions
				,	Session.getSearchApiParams()
				)
			);

			return url;
		}

	,	model: Model
		
		// http://backbonejs.org/#Model-parse
	,	parse: function (response)
		{
			// NOTE: Compact is used to filter null values from response
			return _.compact(response.items) || null;
		}
	});
});
// ItemDetails.js
// --------------
// Groups the different components of the Module
define('ItemDetails'
,	['ItemDetails.Model', 'ItemDetails.Collection', 'ItemDetails.View', 'ItemDetails.Router']
,	function (Model, Collection, View, Router)
{
	'use strict';

	return {
		View: View
	,	Model: Model
	,	Router: Router
	,	Collection: Collection
	,	mountToApp: function (application, options)
		{
			// Wires the config options to the url of the model 
			Model.prototype.searchApiMasterOptions = application.getConfig('searchApiMasterOptions.itemDetails', {});
			// and the keymapping
			Model.prototype.keyMapping = application.getConfig('itemKeyMapping', {});

			Model.prototype.itemOptionsConfig = application.getConfig('itemOptions', []);

			Model.prototype.itemOptionsDefaultMacros = application.getConfig('macros.itemOptions', {});
			
			if (options && options.startRouter)
			{
				return new Router({application: application, model: Model, view: View});
			}
		}
	};
});
// ItemDetails.Model.js
// --------------------
// Represents 1 single product of the web store
define('ItemDetails.Model', ['ItemOptionsHelper', 'Session'], function (ItemOptionsHelper, Session)
{
	'use strict';

	var Collection = null;

	var Model = Backbone.CachedModel.extend({

		url: function()
		{
			var url = _.addParamsToUrl(
				'/api/items'
			,	_.extend(
					{}
				,	this.searchApiMasterOptions
				,	Session.getSearchApiParams()
				)
			);

			return url;
		}

	,	validation: 
		{
			quantity: { fn: function() 
				{
					var self = this;

					if (self.cartItemId)
					{
						if (self.get('quantity') < self.get('_minimumQuantity', true))
						{
							return _('The minimum quantity for this item is $(0).').translate(self.get('_minimumQuantity', true));
						}
					}
					else
					{
						if (self.get('quantity') < self.get('_minimumQuantity', true)) 
						{
							if (self.application.loadCart().state() === 'resolved')
							{
								var itemCart = SC.Utils.findItemInCart(self, self.application.getCart())
								,	total = itemCart && itemCart.get('quantity') || 0;

								if ((total + self.get('quantity')) < self.get('_minimumQuantity', true))
								{
									return _('The minimum quantity for this item is $(0).').translate(self.get('_minimumQuantity', true));
								}
							}
							else
							{
								return _('Cart not loaded yet, please wait and try again.').translate();
							}
						}
					}
				}
			}
		}

		// The api returns the items as an array allways this takes care of returning the object
	,	parse: function (response)
		{
			// if we are performing a direct API call the item is response.items[0]
			// but if you are using the ItemDetails.Collection to fetch this guys
			// The item is the response
			var single_item = response.items && response.items[0];

			if (single_item)
			{
				single_item.facets = response.facets;
			}

			return single_item || response;
		}

	,	initialize: function ()
		{
			this.itemOptions = {};

			if (_.isArray(this.get('options')))
			{
				this.setOptionsArray(this.get('options'), true);
			}
		}

	,	getOption: function (option_name)
		{
			return this.itemOptions[option_name];
		}

	,	setOptionsArray: function (options, dont_validate)
		{
			var self = this;
			_.each(options, function (option)
			{
				self.setOption(option.id, {
					internalid: option.value
				,	label: option.displayvalue ? option.displayvalue : option.value
				}, dont_validate);
			});
		}

	,	setOption: function (option_name, value, dont_validate)
		{
			// Setting it to null means you dont wan a value for it
			if (option_name === 'quantity')
			{
				this.set('quantity', parseInt(value, 10) || 1);
			}
			else if (_.isNull(value))
			{
				delete this.itemOptions[option_name];
			}
			else
			{
				// Sometimes the name comes in all uppercase
				var option = this.getPosibleOptionByCartOptionId(option_name) || this.getPosibleOptionByCartOptionId(option_name.toLowerCase());

				// You can pass in the internalid on the instead of the full item
				if (option && option.values)
				{
					value = _.isObject(value) ? value : _.where(option.values, {internalid: value.toString()})[0];
				}
				else if (!_.isObject(value))
				{
					value = {
						internalid: value
					,	label: value
					};
				}

				// if it's a matrix option this will make sure it's compatible to what its already set!
				if (!dont_validate && option.isMatrixDimension && !_.contains(this.getValidOptionsFor(option.itemOptionId), value.label))
				{
					throw new RangeError('The combination you selected is invalid');
				}
				if (option && option.cartOptionId)
				{
					this.itemOptions[option.cartOptionId] = value;
				}

			}
			return value;

		}

	,	getItemOptionsForCart: function ()
		{
			var result = {};

			_.each(this.itemOptions, function (value, name)
			{
				result[name] = value.internalid;
			});

			return result;
		}

		// model.get:
		// We have override the get function for this model in order to honor the itemsKeyMapping
		// It also makes sure that _matrixChilds and _relatedItems are ItemDetails.Collection and
		// _matrixParent is an ItemDetails.Model
	,	get: function (attr, dont_cache)
		{
			var keyMapping = this.keyMapping || (this.collection && this.collection.keyMapping);

			if (dont_cache || (keyMapping && !this.attributes[attr] && keyMapping[attr]))
			{
				var mapped_key = keyMapping[attr];

				if (_.isFunction(mapped_key))
				{
					this.attributes[attr] = mapped_key(this);
				}
				else if (_.isArray(mapped_key))
				{
					for (var i = 0; i < mapped_key.length; i++)
					{
						if (this.attributes[mapped_key[i]])
						{
							this.attributes[attr] = this.attributes[mapped_key[i]];
							break;
						}
					}
				}
				else
				{
					this.attributes[attr] = this.attributes[mapped_key];
				}

				if (attr === '_matrixChilds' || attr === '_relatedItems')
				{
					Collection = Collection || require('ItemDetails.Collection');
					this.attributes[attr] = new Collection(this.attributes[attr] || []);
				}
				else if (attr === '_matrixParent')
				{
					this.attributes[attr] = new Model(this.attributes[attr] || {});
				}
			}

			return this.attributes[attr];
		}

		// model.getPrice:
		// Gets the price based on the selection of the item and the quantity
	,	getPrice: function ()
		{
			var self = this
			,	details_object = this.get('_priceDetails') || {}
			,	matrix_children = this.getSelectedMatrixChilds()
			,	result =  {
					price: details_object.onlinecustomerprice
				,	price_formatted: details_object.onlinecustomerprice_formatted
				};

			// Computes Quantity pricing.
			if (details_object.priceschedule && details_object.priceschedule.length)
			{
				var quantity = this.get('quantity') || 1,
					price_schedule, min, max;

				for (var i = 0; i < details_object.priceschedule.length; i++)
				{
					price_schedule = details_object.priceschedule[i];
					min = parseInt(price_schedule.minimumquantity, 10);
					max = parseInt(price_schedule.maximumquantity, 10);

					if ((min <= quantity && quantity < max) || (min <= quantity && !max))
					{
						result  = {
							price: price_schedule.price
						,	price_formatted: price_schedule.price_formatted
						};
					}
				}
			}

			// if it's a matrix it will compute the matrix price
			if (matrix_children.length)
			{
				// Gets the price of each child
				var children_prices = [];

				_.each(matrix_children, function (child)
				{
					child.setOption('quantity', self.get('quantity'));
					children_prices.push(child.getPrice());
				});

				if (children_prices.length === 1)
				{
					// If there is only one it means there is only one price to show
					result = children_prices[0];
				}
				else
				{
					// otherways we should compute max and min to show a range in the gui
					var children_prices_values = _.pluck(children_prices, 'price')
					,	min_value = _.min(children_prices_values)
					,	max_value = _.max(children_prices_values);

					if (min_value !== max_value)
					{
						// We return them alongside the result of the parent
						result.min = _.where(children_prices, {price: min_value})[0];
						result.max = _.where(children_prices, {price: max_value})[0];
					}
					else
					{
						// they are all alike so we can show any of them
						result = children_prices[0];
					}
				}
			}

			// Adds the compare agains price if its not setted by one if the childs
			if (!result.compare_price && this.get('_comparePriceAgainst'))
			{
				result.compare_price = this.get('_comparePriceAgainst');
				result.compare_price_formatted = this.get('_comparePriceAgainstFormated');
			}

			return result;
		}


		// model.getStockInfo
		// Returns an standard formated object for the stock info taking in consideration current matrix option selection.
		// the loginc is the following: if there is an unique child selected use that. Else use the parent as default
		// values and open children properties if it has the same value for all selected childs.
	,	getStockInfo: function ()
		{
			// Standarize the result object
			var matrix_children = this.getSelectedMatrixChilds()

				// if we have one selected child we use that - else we use the parent as default
			,	model = matrix_children.length === 1 ? matrix_children[0] : this

			,	parent = this.get('_matrixParent')

			,	stock_info = {
					stock: model.get('_stock')
				,	isInStock: model.get('_isInStock')

				,	outOfStockMessage: model.get('_outOfStockMessage') || this.get('_outOfStockMessage') || (parent && parent.get('_outOfStockMessage')) || _('Out of Stock').translate()
				,	showOutOfStockMessage: model.get('_showOutOfStockMessage') || this.get('_showOutOfStockMessage')

				,	inStockMessage: model.get('_inStockMessage')
				,	showInStockMessage: model.get('_showInStockMessage')

				,	stockDescription: model.get('_stockDescription')
				,	showStockDescription: model.get('_showStockDescription')
				,	stockDescriptionClass: model.get('_stockDescriptionClass')
			}

			,	is_something_selected = _(this.getMatrixOptionsSelection()).keys().length;

			// if this is an open selection we compute them all
			if (is_something_selected && matrix_children.length > 1)
			{
				var matrix_children_stock_info = [];

				_.each(matrix_children, function (child)
				{
					matrix_children_stock_info.push(child.getStockInfo());
				});

				// If all matrix childs return the same value for a given attribute that becomes the output,
				// with the exeption of stock that is an adition of the stocks of the childs - but only if the parent has
				_.each(stock_info, function (value, key)
				{
					var children_values_for_attribute = _.pluck(matrix_children_stock_info, key);

					if (key === 'stock')
					{
						stock_info.stock = _.reduce(children_values_for_attribute, function (memo, num)
						{
							return memo + num;
						}, 0);
					}
					else if (key === 'isInStock')
					{
						// the parent is in stock if any of the child items is in stock
						// so, if in the array of the values of 'isInStock' for the childs
						// there is a 'true', then the parent item is in stock
						stock_info.isInStock = _.contains(children_values_for_attribute, true);
					}
					else
					{
						children_values_for_attribute = _.uniq(children_values_for_attribute);

						if (children_values_for_attribute.length === 1)
						{
							stock_info[key] = children_values_for_attribute[0];
						}
					}
				});
			}

			return stock_info;
		}

		// model.isReadyForCart:
		// if it has mandatory options, checks for all to be filled
		// also checks if the item is purchasable
	,	isReadyForCart: function ()
		{
			// if the item is a matrix, we check if the selection is completed
			// for non-matrix items isSelectionComplete always returns true
			if (this.isSelectionComplete())
			{
				var is_purchasable = this.get('_isPurchasable')
				,	child = this.getSelectedMatrixChilds();

				if (child.length)
				{
					is_purchasable = child[0].get('_isPurchasable');
				}

				return is_purchasable;
			}

			return false;
		}
	});

	Model.prototype = _.extend(Model.prototype, ItemOptionsHelper);

	return Model;
});

/* global nsglobal */
// ItemDetails.Router.js
// ---------------------
// Adds route listener to display Product Detailed Page
// Parses any options pased as parameters
define('ItemDetails.Router', function()
{
	'use strict';
	
	return Backbone.Router.extend({
		
		routes: {
			':url': 'productDetailsByUrl'
		}
		
	,	initialize: function (options)
		{
			this.application = options.application;
			// we will also add a new regexp route to this, that will cover any url with slashes in it so in the case
			// you want to handle urls like /cat1/cat2/urlcomponent, as this are the last routes to be evaluated,
			// it will only get here if there is no other more apropiate one
			this.route(/^(.*?)$/, 'productDetailsByUrl');
			this.Model = options.model;
			this.View = options.view;
			
			// This is the fallback url if a product does not have a url component.
			this.route('product/:id', 'productDetailsById');
			this.route('product/:id?:options', 'productDetailsById');
		}
		
	,	productDetailsByUrl: function (url)
		{
			if (!url) 
			{
				return;
			}

			// if there are any options in the URL
			var options = null;

			if (~url.indexOf('?'))
			{
				options = SC.Utils.parseUrlOptions(url);
				url = url.split('?')[0];
			}
			// Now go grab the data and show it
			if (options)
			{
				this.productDetails({url: url}, url, options);				
			}
			else
			{
				this.productDetails({url: url}, url);				
			} 
		}
		
	,	productDetailsById: function (id, options)
		{
			// Now go grab the data and show it
			this.productDetails({id: id}, '/product/'+id, SC.Utils.parseUrlOptions(options));
		}
		
	,	productDetails: function (api_query, base_url, options)
		{
			// Decodes url options 
			_.each(options, function (value, name)
			{
				options[name] = decodeURIComponent(value);
			});

			var application = this.application
			,	model = new this.Model()
				// we create a new instance of the ProductDetailed View
			,	view = new this.View({
					model: model
				,	baseUrl: base_url
				,	application: this.application
				});

			model.application = this.application;
			model.fetch({
				data: api_query
			,	killerId: this.application.killerId
			,	pageGeneratorPreload: true
			}).then(
				// Success function
				function (data)
				{
					if (!model.isNew())
					{
						// once the item is fully loaded we set its options
						model.parseQueryStringOptions(options);
						
						if (!(options && options.quantity))
						{
							model.set('quantity', model.get('_minimumQuantity'));
						}

						if (api_query.id && model.get('urlcomponent') && SC.ENVIRONMENT.jsEnvironment === 'server')
						{
							nsglobal.statusCode = 301;
							nsglobal.location = model.get('_url') + model.getQueryString();
						}						

						if (data.corrections && data.corrections.length > 0)
						{
							if (model.get('urlcomponent') && SC.ENVIRONMENT.jsEnvironment === 'server')
							{
								nsglobal.statusCode = 301;
								nsglobal.location = '/' + data.corrections[0].url + model.getQueryString();
							}
							else
							{
								Backbone.history.navigate('#' + data.corrections[0].url + model.getQueryString(), {trigger: true});
							}
						}
						
						// we first prepare the view
						view.prepView();
						
						// then we show the content
						view.showContent(options);
					}
					else
					{
						// We just show the 404 page
						application.getLayout().notFound();
					}
				}
				// Error function
			,	function (model, jqXhr)
				{	
					// this will stop the ErrorManagment module to process this error
					// as we are taking care of it
					try
					{
						jqXhr.preventDefault = true;
					}
					catch (e)
					{						
						// preventDefault could be readonly!
						console.log(e.message);
					}

					// We just show the 404 page
					application.getLayout().notFound();
				}
			);
		}
	});
});

// ItemDetails.View.js
// -------------------
// Handles the pdp and quick view
define('ItemDetails.View', ['Facets.Translator', 'ItemDetails.Collection'], function (FacetsTranslator)
{
	'use strict';

	var colapsibles_states = {};

	return Backbone.View.extend({

		title: ''
	,	page_header: ''
	,	template: 'product_details'
	,	attributes: {
			'id': 'product-detail'
		,	'class': 'view product-detail'
		}

	,	events: {
			'blur [data-toggle="text-option"]': 'setOption'
		,	'click [data-toggle="set-option"]': 'setOption'
		,	'change [data-toggle="select-option"]': 'setOption'

		,	'keydown [data-toggle="text-option"]': 'tabNavigationFix'
		,	'focus [data-toggle="text-option"]': 'tabNavigationFix'

		,	'change [name="quantity"]': 'updateQuantity'
		,	'keypress [name="quantity"]': 'submitOnEnter'

		,	'click [data-type="add-to-cart"]': 'addToCart'

		,	'shown .collapse': 'storeColapsiblesState'
		,	'hidden .collapse': 'storeColapsiblesState'

		,	'mouseup': 'contentMouseUp'
		,	'click': 'contentClick'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
			this.counted_clicks = {};

			if (!this.model)
			{
				throw new Error('A model is needed');
			}
		}

		// view.getBreadcrumb:
		// It will generate an array suitable to pass it to the breadcrumb macro
		// It looks in the productDetailsBreadcrumbFacets config object
		// This will be enhaced to use the categories once thats ready
	,	getBreadcrumb: function ()
		{
			var self = this
			,	breadcrumb = []
			,	translator = new FacetsTranslator(null, null, this.application.translatorConfig);

			_.each(this.application.getConfig('productDetailsBreadcrumbFacets'), function (product_details_breadcrumb_facet)
			{
				var value = self.model.get(product_details_breadcrumb_facet.facetId);

				if (value)
				{
					translator = translator.cloneForFacetId(product_details_breadcrumb_facet.facetId, value);
					breadcrumb.push({
						href: translator.getUrl()
					,	text: product_details_breadcrumb_facet.translator ? _(product_details_breadcrumb_facet.translator).translate(value) : value
					});
				}
			});

			return breadcrumb;
		}

		// view.storeColapsiblesState:
		// Since this view is re-rendered every time you make a selection
		// we need to keep the state of the collapsable for the next render
	,	storeColapsiblesState: function ()
		{
			this.storeColapsiblesStateCalled = true;

			this.$('.collapse').each(function (index, element)
			{
				colapsibles_states[SC.Utils.getFullPathForElement(element)] = jQuery(element).hasClass('in');
			});
		}

		// view.resetColapsiblesState:
		// as we keep track of the state, we need to reset the 1st time we show a new item
	,	resetColapsiblesState: function ()
		{
			var self = this;
			_.each(colapsibles_states, function (is_in, element_selector)
			{
				self.$(element_selector)[is_in ? 'addClass' : 'removeClass']('in').css('height', is_in ? 'auto' : '0');
			});
		}

		// view.updateQuantity:
		// Updates the quantity of the model
	,	updateQuantity: function (e)
		{
			var new_quantity = parseInt(jQuery(e.target).val(),10)
			,	current_quantity = this.model.get('quantity')
			,	isOptimistic = this.application.getConfig('addToCartBehavior') === 'showCartConfirmationModal';


			new_quantity = (new_quantity > 0) ? new_quantity : current_quantity;

			jQuery(e.target).val(new_quantity);

			if (new_quantity !== current_quantity)
			{
				this.model.setOption('quantity', new_quantity);

				if (!this.$containerModal || !isOptimistic)
				{
					this.refreshInterface(e);
				}
			}

			if (this.$containerModal)
			{
				// need to trigger an afterAppendView event here because, like in the PDP, we are really appending a new view for the new selected matrix child
				this.application.getLayout().trigger('afterAppendView', this);
			}
		}

		// submit the form when user presses enter in the quantity input text
	,	submitOnEnter: function (e)
		{
			if (e.keyCode === 13)
			{
				e.preventDefault();
				e.stopPropagation();
				this.addToCart(e);
			}
		}

		// view.contentClick:
		// Keeps track of the clicks you have made onto the view, so the contentMouseUp
		// knows if it needs to trigger the click event once again
	,	contentClick: function (e)
		{
			this.counted_clicks[e.pageX + '|' + e.pageY] = true;

			if (this.$containerModal)
			{
				e.stopPropagation();
			}
		}

		// view.contentMouseUp:
		// this is used just to register a delayed function to check if the click went through
		// if it didn't we fire the click once again on the top most element
	,	contentMouseUp: function (e)
		{
			if (e.which !== 2 && e.which !== 3)
			{
				var self = this;
				_.delay(function ()
				{
					if (!self.counted_clicks[e.pageX + '|' + e.pageY])
					{
						jQuery(document.elementFromPoint(e.clientX, e.clientY)).click();
					}

					delete self.counted_clicks[e.pageX + '|' + e.pageY];

				}, 100);
			}
		}

		// view.addToCart:
		// Updates the Cart to include the current model
		// also takes care of updateing the cart if the current model is a cart item
	,	addToCart: function (e)
		{
			e.preventDefault();

			// Updates the quantity of the model
			var quantity = this.$('[name="quantity"]').val();
			this.model.setOption('quantity', quantity);

			if (this.model.isValid(true) && this.model.isReadyForCart())
			{
				var self = this
				,	cart = this.application.getCart()
				,	layout = this.application.getLayout()
				,	cart_promise
				,	error_message = _('Sorry, there is a problem with this Item and can not be purchased at this time. Please check back later.').translate()
				,	isOptimistic = this.application.getConfig('addToCartBehavior') === 'showCartConfirmationModal';

				if (this.model.itemOptions && this.model.itemOptions.GIFTCERTRECIPIENTEMAIL)
				{
					if (!Backbone.Validation.patterns.email.test(this.model.itemOptions.GIFTCERTRECIPIENTEMAIL.label))
					{
						self.showError(_('Recipient email is invalid').translate());
						return;
					}
				}

				if (isOptimistic)
				{

					cart.optimistic = {
						item: this.model
					,	quantity: quantity
					};
				}

				if (this.model.cartItemId)
				{
					cart_promise = cart.updateItem(this.model.cartItemId, this.model).done(function ()
					{
						if (cart.getLatestAddition())
						{
							if (self.$containerModal)
							{
								self.$containerModal.modal('hide');
							}

							if (layout.currentView instanceof require('Cart').Views.Detailed)
							{
								layout.currentView.showContent();
							}
						}
						else
						{
							self.showError(error_message);
						}
					});
				}
				else
				{
					cart_promise = cart.addItem(this.model).done(function ()
					{
						if (cart.getLatestAddition())
						{
							if (!isOptimistic)
							{
								layout.showCartConfirmation();
							}
						}
						else
						{
							self.showError(error_message);
						}
					});
					
					if (isOptimistic)
					{
						cart.optimistic.promise = cart_promise;
						layout.showCartConfirmation();
					}
				}

				// Checks for rollback items.
				cart_promise.fail(function (jqXhr)
				{
					var error_details = null;
					try 
					{
						var response = JSON.parse(jqXhr.responseText);
						error_details = response.errorDetails;
					} 
					finally 
					{
						if (error_details && error_details.status === 'LINE_ROLLBACK')
						{
							var new_line_id = error_details.newLineId;
							self.model.cartItemId = new_line_id;
						}

						self.showError(_('We couldn\'t process your item').translate());

						if (isOptimistic)
						{
							self.showErrorInModal(_('We couldn\'t process your item').translate());
						}
					}
				});

				// disalbes the btn while it's being saved then enables it back again
				if (e && e.target)
				{
					var $target = jQuery(e.target).attr('disabled', true);

					cart_promise.always(function ()
					{
						$target.attr('disabled', false);
					});
				}
			}
		}

		// view.refreshInterface
		// Computes and store the current state of the item and refresh the whole view, re-rendering the view at the end
		// This also updates the url, but it does not generates a hisrory point
	,	refreshInterface: function ()
		{
			var focused_element = this.$(':focus').get(0);

			this.focusedElement = focused_element ? SC.Utils.getFullPathForElement(focused_element) : null;

			if (!this.inModal)
			{
				Backbone.history.navigate(this.options.baseUrl + this.model.getQueryString(), {replace: true});
			}

			// When there are dropdown options that overlapse with the "Add to cart" button
			// when those options are clicked, the "Add to cart" button is also clicked.
			setTimeout(jQuery.proxy(this, 'showContent', {dontScroll: true}), 1);
		}

		// view.computeDetailsArea
		// this process what you have configured in itemDetails
		// executes the macro or reads the properties of the item
	,	computeDetailsArea: function ()
		{
			var self = this
			,	details = [];

			_.each(this.application.getConfig('itemDetails', []), function (item_details)
			{
				var content = '';

				if (item_details.macro)
				{
					content = SC.macros[item_details.macro](self);
				}
				else if (item_details.contentFromKey)
				{
					content = self.model.get(item_details.contentFromKey);
				}

				if (jQuery.trim(content))
				{
					details.push({
						name: item_details.name
					,	opened: item_details.opened
					,	content: content
					,	itemprop: item_details.itemprop
					});
				}
			});

			this.details = details;
		}

		// view.showInModal:
		// Takes care of showing the pdp in a modal, and changes the template, doesn't trigger the
		// after events because those are triggered by showContent
	,	showInModal: function (options)
		{
			this.template = 'quick_view';

			return this.application.getLayout().showInModal(this, options);
		}

		// Prepears the model and other internal properties before view.showContent
	,	prepView: function ()
		{
			this.title = this.model.get('_pageTitle');
			this.page_header = this.model.get('_pageHeader');

			this.computeDetailsArea();
		}

	,	getMetaKeywords: function ()
		{
			// searchkeywords is for alternative search keywords that customers might use to find this item using your Web store’s internal search
			// they are not for the meta keywords
			// return this.model.get('_keywords');
			return this.getMetaTags().filter('[name="keywords"]').attr('content') || '';
		}

	,	getMetaTags: function ()
		{
			return jQuery('<head/>').html(
				jQuery.trim(
					this.model.get('_metaTags')
				)
			).children('meta');
		}

	,	getMetaDescription: function ()
		{
			return this.getMetaTags().filter('[name="description"]').attr('content') || '';
		}
		// view.renderOptions:
		// looks for options placeholders and inject the rendered options in them
	,	renderOptions: function ()
		{
			var model = this.model
			,	posible_options = model.getPosibleOptions();

			// this allow you to render 1 particular option in a diferent placeholder than the data-type=all-options
			this.$('div[data-type="option"]').each(function (index, container)
			{
				var $container = jQuery(container).empty()
				,	option_id = $container.data('cart-option-id')
				,	macro = $container.data('macro') || '';

				$container.append(model.renderOptionSelector(option_id, macro));
			});

			// Will render all options with the macros they were configured
			this.$('div[data-type="all-options"]').each(function (index, container)
			{
				var $container = jQuery(container).empty()
				,	exclude = ($container.data('exclude-options') || '').split(',')
				,	result_html = '';

				exclude = _.map(exclude, function (result)
				{
					return jQuery.trim(result);
				});

				_.each(posible_options, function (posible_option, index)
				{
					if (!_.contains(exclude, posible_option.cartOptionId))
					{
						result_html += model.renderOptionSelector(posible_option, null, index);
					}
				});

				$container.append(result_html);
			});
		}

		// view.tabNavigationFix:
		// When you blur on an input field the whole page gets rendered,
		// so the function of hitting tab to navigate to the next input stops working
		// This solves that problem by storing a a ref to the current input
	,	tabNavigationFix: function (e)
		{
			var self = this;
			this.hideError();

			// We need this timeout because sometimes a view is rendered several times and we don't want to loose the tabNavigation
			if (!this.tabNavigationTimeout)
			{
				// If the user is hitting tab we set tabNavigation to true, for any other event we turn ir off
				this.tabNavigation = e.type === 'keydown' && e.which === 9;
				this.tabNavigationUpsidedown = e.shiftKey;
				this.tabNavigationCurrent = SC.Utils.getFullPathForElement(e.target);
				if (this.tabNavigation)
				{
					this.tabNavigationTimeout = setTimeout(function ()
					{
						self.tabNavigationTimeout = null;
						this.tabNavigation = false;
					},5);
				}
			}
		}

	,	showContent: function (options)
		{
			var self = this;

			// Once the showContent has been called, this make sure that the state is preserved
			// REVIEW: the following code might change, showContent should recieve an options parameter
			this.application.getLayout().showContent(this, options && options.dontScroll).done(function (view)
			{
				self.afterAppend();

				// related items
				var related_items_placeholder = view.$('[data-type="related-items-placeholder"]');
				// check if there is a related items placeholders
				if(related_items_placeholder.size() > 0)
				{
					this.application.showRelatedItems && this.application.showRelatedItems(view.model.get('internalid'), related_items_placeholder);
				}

				// correlated items
				var correlated_items_placeholder = view.$('[data-type="correlated-items-placeholder"]');
				// check if there is a related items placeholders
				if(correlated_items_placeholder.size() > 0)
				{
					this.application.showCorrelatedItems && this.application.showCorrelatedItems(view.model.get('internalid'), correlated_items_placeholder);
				}

				// product list place holder.
				var product_lists_placeholder = view.$('[data-type="product-lists-control"]');

				if (product_lists_placeholder.size() > 0)
				{
					this.application.ProductListModule.renderProductLists(view);
				}
                
                // product reviews placeholder
                var product_reviews_placeholder = view.$('[data-type="review-list-placeholder"]');
                var reviews_enabled = SC.ENVIRONMENT.REVIEWS_CONFIG && SC.ENVIRONMENT.REVIEWS_CONFIG.enabled;
                
                if (reviews_enabled && product_reviews_placeholder.size() > 0)
                {
                    this.application.showProductReviews(view.model, options, product_reviews_placeholder);
                }
                
			});
		}

	,	afterAppend: function ()
		{
			this.renderOptions();
			this.focusedElement && this.$(this.focusedElement).focus();

			if (this.tabNavigation)
			{
				var current_index = this.$(':input').index(this.$(this.tabNavigationCurrent).get(0))
				,	next_index = this.tabNavigationUpsidedown ? current_index - 1 : current_index + 1;

				this.$(':input:eq('+ next_index +')').focus();
			}

			this.storeColapsiblesStateCalled ? this.resetColapsiblesState() : this.storeColapsiblesState();
			this.application.getUser().addHistoryItem && this.application.getUser().addHistoryItem(this.model);

			if (this.inModal)
			{
				var $link_to_fix = this.$el.find('[data-name="view-full-details"]');
				$link_to_fix.mousedown();
				$link_to_fix.attr('href', $link_to_fix.attr('href') + this.model.getQueryString());
			}
		}

		// view.setOption:
		// When a selection is change, this computes the state of the item to then refresh the interface.
	,	setOption: function (e)
		{
			var self = this
			,	$target = jQuery(e.target)
			,	value = $target.val() || $target.data('value') || null
			,	cart_option_id = $target.closest('[data-type="option"]').data('cart-option-id');

			// prevent from going away
			e.preventDefault();

			// if option is selected, remove the value
			if ($target.data('active'))
			{
				value = null;
			}

			// it will fail if the option is invalid
			try
			{
				this.model.setOption(cart_option_id, value);
			}
			catch (error)
			{
				// Clears all matrix options
				_.each(this.model.getPosibleOptions(), function (option)
				{
					option.isMatrixDimension && self.model.setOption(option.cartOptionId, null);
				});

				// Sets the value once again
				this.model.setOption(cart_option_id, value);
			}

			this.refreshInterface(e);

			// need to trigger an afterAppendView event here because, like in the PDP, we are really appending a new view for the new selected matrix child
			if (this.$containerModal)
			{
				this.application.getLayout().trigger('afterAppendView', this);
			}
		}
	});
});

define('ItemImageGallery', ['ItemDetails.View'], function (ItemDetailsView)
{
	'use strict';

	var ItemImageGallery = function ItemImageGallery (options)
	{
		this.options = options;
		this.images = options.images;
		this.$target = options.$target;

		this.intitialize();
	};

	_.extend(ItemImageGallery.prototype, {

		intitialize: function ()
		{
			if (!SC.ENVIRONMENT.isTouchEnabled)
			{
				this.initZoom();
			}

			this.$slider = this.initSlider();

			return this;
		}

	,	hasSameImages: function (images)
		{
			return this.images.length === images.length && _.difference(this.images, images).length === 0;
		}

	,	zoomImageCallback: function ()
		{
			var $this = jQuery(this);

			if ($this.width() <= $this.parent().width())
			{
				$this.remove();
			}

			return this;
		}

	,	initZoom: function ()
		{
			var self = this
			,	images = this.images;

			this.$target.find('[data-zoom]').each(function (slide_index)
			{
				jQuery(this).zoom({
					url: ImageGalleryModule.resizeZoom(images[slide_index].url)
				,	callback: self.zoomImageCallback
				});
			});

			return this;
		}

	,	buildSliderPager: function (slide_index)
		{
			var image = this.images[slide_index];
			return '<img src="' + ImageGalleryModule.resizeThumb(image.url) + '" alt="' + image.altimagetext + '">';
		}

	,	initSlider: function ()
		{
			return this.$target.find('[data-slider]').bxSlider({
				buildPager: jQuery.proxy(this.buildSliderPager, this)
			,	startSlide: this.options.startSlide || 0
			,	forceStart: this.options.forceStart
			,	adaptiveHeight: true
			});
		}
	});

	var ImageGalleryModule = {

		ItemImageGallery: ItemImageGallery

	,	resizeZoom: function (url)
		{
			return this.resizeImage(url, 'zoom');
		}

	,	resizeThumb: function (url)
		{
			return this.resizeImage(url, 'tinythumb');
		}

	,	getStartSlide: function (view_gallery, images)
		{
			// Slider may not be applicable to the view gallery.
			if (view_gallery && view_gallery.$slider.length && view_gallery instanceof ItemImageGallery && view_gallery.hasSameImages(images))
			{
				return view_gallery.$slider.getCurrentSlide();
			}
		}

	,	initialize: function (view)
		{
			if (view instanceof ItemDetailsView)
			{
				var images = view.model.get('_images')
				,	start_slide = ImageGalleryModule.getStartSlide(view.imageGallery, images);

				view.imageGallery = new ImageGalleryModule.ItemImageGallery({
					images: images
				,	$target: view.$('.item-image-gallery') || view.$el
				,	startSlide: start_slide
				,	forceStart: !_.isUndefined(start_slide)
				});
			}
		}

	,	mountToApp: function (application)
		{
			application.getConfig('macros').itemDetailsImage = 'itemImageGallery';

			if (SC.ENVIRONMENT.jsEnvironment === 'browser')
			{
				this.resizeImage = application.resizeImage;

				application.getLayout().on('afterAppendView', this.initialize);
			}
		}
	};

	return ImageGalleryModule;
});
// ItemOptionsHelper.js
// --------------------
// Defines function that will be extended into ItemDetails.Model
define('ItemOptionsHelper', function ()
{
	'use strict';

	var ItemOptionsHelper = {
		// itemOptionsHelper.renderOptionSelected:
		// Renders the option defaulting to the "selected" macro
		renderOptionSelected: function (option_name_or_option_config, macro) 
		{
			// Gets the configutarion, uses it if passed or looks for it if the name is passed
			var option = _.isObject(option_name_or_option_config) ? option_name_or_option_config : this.getPosibleOptionByCartOptionId(option_name_or_option_config)
			// gets the selected value from the macro
			,	selected_value = this.getOption(option.cartOptionId);
			// Uses the passed in macro or the default macro selector 
			macro = macro || option.macros.selected;

			// if no value is selected just return an empty string
			if (!selected_value)
			{
				return '';
			}
			
			return SC.macros[macro](option, selected_value, this);
		}

		// itemOptionsHelper.renderAllOptionSelected:
		// Renders all the options defaulting to the "selected" macro
	,	renderAllOptionSelected: function (options_to_render)
		{
			var self = this;

			options_to_render = options_to_render || this.getPosibleOptions();

			return _.reduce(
				options_to_render
			,	function (memo, option) 
				{
					return memo + self.renderOptionSelected(option);
				}
			,	''
			);
		}

		// itemOptionsHelper.renderOptionSelector:
		// Renders the option defaulting to the "selector" macro
	,	renderOptionSelector: function (option_name_or_option_config, macro, index)
		{
			// Gets the configutarion, uses it if passed or looks for it if the name is passed
			var option = _.isObject(option_name_or_option_config) ? option_name_or_option_config : this.getPosibleOptionByCartOptionId(option_name_or_option_config)
			// gets the selected value from the macro
			,	selected_value = this.getOption(option.cartOptionId);
			// Uses the passed in macro or the default macro selector 
			macro = macro || option.macros.selector;

			// If it's a matrix it checks for valid combinations 
			if (option.isMatrixDimension)
			{
				var available = this.getValidOptionsFor(option.itemOptionId);
				_.each(option.values, function (value)
				{
					value.isAvailable = _.contains(available, value.label);
				});
			}
			
			return SC.macros[macro](option, selected_value, this, index);
		}

		// itemOptionsHelper.renderOptionSelected:
		// Renders the option defaulting to the "selected" macro
	,	renderOptionsGridSelector: function (options, macro) 
		{
			// Gets the configutarion, uses it if passed or looks for it if the name is passed
			var option_h = options.horizontal
			,	option_v = options.vertical
			,	available = false;

			if (option_h.isMatrixDimension)
			{
				available = this.getValidOptionsFor(option_h.itemOptionId);

				_.each(option_h.values, function (value)
				{
					value.isAvailable = _.contains(available, value.label);
				});
			}

			if (option_v.isMatrixDimension)
			{
				available = this.getValidOptionsFor(option_v.itemOptionId);
				
				_.each(option_v.values, function (value)
				{
					value.isAvailable = _.contains(available, value.label);
				});
			}

			return SC.macros[macro](option_h, option_v, this);
		}

		// itemOptionsHelper.renderAllOptionSelector:
		// Renders all the options defaulting to the "selector" macro
	,	renderAllOptionSelector: function (options_to_render)
		{
			var self = this;

			options_to_render = options_to_render || this.getPosibleOptions();

			return _.reduce(
				options_to_render
			,	function (memo, option) 
				{
					return memo + self.renderOptionSelector(option);
				}
			,	''
			);
		}

		// itemOptionsHelper.getValidOptionsFor:
		// returns a list of all valid options for the option you passed in
	,	getValidOptionsFor: function (item_option_id)
		{
			var selection = this.getMatrixOptionsSelection();
			delete selection[item_option_id];
			
			return _.uniq(_.map(this.getSelectedMatrixChilds(selection), function (model)
			{
				return model.get(item_option_id);
			}));
		}

		// itemOptionsHelper.isSelectionComplete
		// returns true if all mandatory options are set,
		// if it's a mtrix it also checks that there is only one sku sleected
	,	isSelectionComplete: function ()
		{
			var posible_options = this.getPosibleOptions()
			,	is_matrix = false;
			
			// Checks all mandatory fields are set
			// in the mean time 
			for (var i = 0; i < posible_options.length; i++)
			{
				var posible_option = posible_options[i];
				
				is_matrix = is_matrix || posible_option.isMatrixDimension;
				
				if (posible_option.isMandatory && !this.getOption(posible_option.cartOptionId))
				{
					return false;
				}
			}
			
			// If its matrix its expected that only 1 item is selected, not more than one nor 0 
			if (is_matrix && this.getSelectedMatrixChilds().length !== 1)
			{
				return false;
			}

			return true;
		}

		// itemOptionsHelper.getPosibleOptionsFor:
		// gets the configuration for one option by its cart id.
	,	getPosibleOptionByCartOptionId: function (cart_option_id)
		{
			return _.where(this.getPosibleOptions(), {cartOptionId: cart_option_id})[0];
		}

		// itemOptionsHelper.getPosibleOptionsFor:
		// gets the configuration for one option by its url component.
	,	getPosibleOptionByUrl: function (url)
		{
			return _.where(this.getPosibleOptions(), {url: url})[0];
		}

		// itemOptionsHelper.getPosibleOptions
		// returns an array of all the posible options with values and information 
	,	getPosibleOptions: function () 
		{
			if (this.cachedPosibleOptions)
			{
				return this.cachedPosibleOptions;
			}

			var result = [];
			if (this.get('_optionsDetails') && this.get('_optionsDetails').fields)
			{
				var self = this
					// Prepeares a simple map of the configuration 
				,	options_config_map = {};

				_.each(this.itemOptionsConfig, function (option)
				{
					if (option.cartOptionId)
					{
						options_config_map[option.cartOptionId] = option;
					}
				});

				// if you are an child in the cart it then checks for the options of the parent
				var fields = this.get('_matrixParent').get('_id') ? this.get('_matrixParent').get('_optionsDetails').fields : this.get('_optionsDetails').fields;

				// Walks the _optionsDetails to generate a standar options responce.
				_.each(fields, function (option_details)
				{
					var option = {
						label: option_details.label
					,	values: option_details.values
					,	type: option_details.type
					,	cartOptionId: option_details.internalid
					,	itemOptionId: option_details.sourcefrom || ''
					,	isMatrixDimension: option_details.ismatrixdimension || false
					,	isMandatory: option_details.ismandatory || false
					,	macros: {}
					};

					// Makes sure all options are availabe by defualt
					_.each(option.values, function (value)
					{
						value.isAvailable = true;
					});

					// Merges this with the configuration object 
					if (options_config_map[option.cartOptionId])
					{
						option = _.extend(option, options_config_map[option.cartOptionId]);
					}

					if (option_details.ismatrixdimension)
					{
						var item_values = self.get('_matrixChilds').pluck(option.itemOptionId);

						option.values = _.filter(option.values, function (value)
						{
							if (value.internalid)
							{
								return _.contains(item_values, value.label);
							}
							else
							{
								return true;
							}
						});
					}

					if (self.itemOptionsDefaultMacros)
					{
						// Sets macros for this option
						if (!option.macros.selector)
						{
							option.macros.selector = self.itemOptionsDefaultMacros.selectorByType[option.type] ? self.itemOptionsDefaultMacros.selectorByType[option.type] : self.itemOptionsDefaultMacros.selectorByType['default']; // using .default breaks ie :(
						}

						if (!option.macros.selected)
						{
							option.macros.selected = self.itemOptionsDefaultMacros.selectedByType[option.type] ? self.itemOptionsDefaultMacros.selectedByType[option.type] : self.itemOptionsDefaultMacros.selectedByType['default']; // using .default breaks ie :(
						}
					}
					
					// Makes sure the url key of the object is set, 
					// otherways sets it to the cartOptionId (it should allways be there)
					if (!option.url)
					{
						option.url = option.cartOptionId;
					}

					result.push(option);
				});
				
				// Since this is not going to change in the life of the model we can cache it
				this.cachedPosibleOptions = result;
			}
			
			return result;
		}

	,	isCombinationAvailable: function (selection)
		{
			return _.findWhere(_.pluck(this.getSelectedMatrixChilds(), 'attributes'), selection);
		}

		// itemOptionsHelper.isProperlyConfigured
		// returns true if all matrix options are mapped to the cart options 
	,	isProperlyConfigured: function ()
		{
			var options = this.getPosibleOptions()
			,	option = null;

			if (options && options.length)
			{
				for (var i = 0; i < options.length; i++)
				{
					option = options[i];

					if (option.isMatrixDimension && !option.itemOptionId)
					{
						return false;
					}
				}	
			}
			// If you omit item options from the fieldset and use matrix, that an issue.
			else if (this.get('_matrixChilds') && this.get('_matrixChilds').length)
			{
				return false;
			}

			return true;
		}
		
		// itemOptionsHelper.getMatrixOptionsSelection
		// returns an object of all the matrix options with its setted values
	,	getMatrixOptionsSelection: function () 
		{
			var matrix_options = _.where(this.getPosibleOptions(), {isMatrixDimension: true})
			,	result = {}
			,	self = this;

			_.each(matrix_options, function (matrix_option)
			{
				var value = self.getOption(matrix_option.cartOptionId);
				if (value && value.label)
				{
					result[matrix_option.itemOptionId] = value.label;
				}
			});

			return result; 
		}

		// itemOptionsHelper.getSelectedMatrixChilds
		// Returns all the children of a matrix that complies with the current or passed in selection
	,	getSelectedMatrixChilds: function (selection) 
		{
			selection = selection || this.getMatrixOptionsSelection();
			var selection_key = JSON.stringify(selection);

			// Creates the Cache container
			if (!this.matrixSelectionCache)
			{
				this.matrixSelectionCache = {};
			}

			if (!this.get('_matrixChilds'))
			{
				return [];
			}

			// Caches the entry for the item
			if (!this.matrixSelectionCache[selection_key])
			{
				this.matrixSelectionCache[selection_key] = _.values(selection).length ? this.get('_matrixChilds').where(selection) : this.get('_matrixChilds').models;
			}
			
			return this.matrixSelectionCache[selection_key];
		}
		
		// itemOptionsHelper.getQueryString
		// Computes all the selected options and transforms them into a url query string
	,	getQueryString: function () 
		{
			return this.getQueryStringWithQuantity(this.get('quantity'));
		}

	,	getQueryStringButMatrixOptions: function () 
		{
			return this.getQueryStringWithQuantity(this.get('quantity'), true);
		}

		// itemOptionsHelper.getQueryStringWithQuantity
		// Computes all the selected options and transforms them into a url query string with a given quantity
	,	getQueryStringWithQuantity: function (quantity, exclude_matrix_options) 
		{
			var self = this
			,	result = [];

			if (quantity > 0 && quantity !== this.get('_minimumQuantity', true))
			{
				result.push('quantity=' + (quantity || 1));
			}

			_.each (this.getPosibleOptions(), function (option)
			{
				if (exclude_matrix_options && option.isMatrixDimension)
				{
					return;
				}

				var value = self.getOption(option.cartOptionId);
				
				if (value)
				{
					result.push(option.url + '=' + encodeURIComponent(value.internalid));
				}
			});

			result = result.join('&');

			return result.length ? '?' + result : '';
		}

		// itemOptionsHelper.parseQueryStringOptions
		// Given a url query string, it sets the options in the model
	,	parseQueryStringOptions: function (options) 
		{
			var self = this;
			_.each(options, function (value, name)
			{
				if (name === 'quantity')
				{
					self.setOption('quantity', value);
				}
				else if (name === 'cartitemid')
				{
					self.cartItemId = value;
				}
				else if (value && name)
				{
					value = decodeURIComponent(value);
					var option = self.getPosibleOptionByUrl(name);

					if (option)
					{
						if (option.values)
						{
							// We check for both Label and internal id because we detected that sometimes they return one or the other
							value = _.where(option.values, {label: value})[0] || _.where(option.values, {internalid: value})[0];
							self.setOption(option.cartOptionId, value);
						}
						else
						{
							self.setOption(option.cartOptionId, value);
						}
					}
				}
			});
		}
	};

	return ItemOptionsHelper;
});

// ItemRelations.Correlated.Model.js
// ---------------
define('ItemRelations.Correlated.Model', ['Session'], function (Session)
{
	'use strict';
	
	var original_fetch = Backbone.CachedModel.prototype.fetch;

	return Backbone.CachedModel.extend({
		
		url: function()
		{
			var url = _.addParamsToUrl(
				'/api/items'
			,	_.extend(
					{}
				,	this.searchApiMasterOptions
				,	Session.getSearchApiParams()
				)
			);
			
			return url;
		}

		// model.fetch
		// -----------
		// We need to make sure that the cache is set to true, so we wrap it
	,	fetch: function (options)
		{
			options = options || {};

			options.cache = true;

			return original_fetch.apply(this, arguments);
		}
	});
});
// ItemRelations.js
// --------------
// Handles the different relations between items
define('ItemRelations'
,	['ItemRelations.Related.Model', 'ItemRelations.Correlated.Model', 'ItemDetails.Model']
,	function (ItemsRelatedModel, ItemsCorrelatedModel, ItemDetailsModel)
{
	'use strict';

	var filter_related = function (original_items, related_model_items)
	{
		var related_items = related_model_items.items
		,	filtered_related_items = [];

		// check if items aren't repeated and items that aren't already in the original items list (parameter)
		_.each(related_items, function(item){
			var related_array = item.relateditems_detail;
			if(related_array)
			{
				_.each(related_array, function(related) {
					if(_.indexOf(original_items, related.internalid) < 0 && !_.find(filtered_related_items, function(filtered){ return filtered.get('internalid') === related.internalid; }))
					{
						filtered_related_items.push(new ItemDetailsModel(related));
					}
				});
			}
		});

		return filtered_related_items;
	};

	var ItemRelations = {
		filterRelated: filter_related
	};

	return {
		ItemRelations : ItemRelations
	,	ItemsRelatedModel : ItemsRelatedModel
	,	ItemsCorrelatedModel: ItemsCorrelatedModel
	,	mountToApp: function (application)
		{
			// Wires the config options to the url of the models 
			ItemsRelatedModel.prototype.searchApiMasterOptions = application.getConfig('searchApiMasterOptions.relatedItems', {});
			ItemsCorrelatedModel.prototype.searchApiMasterOptions = application.getConfig('searchApiMasterOptions.correlatedItems', {});

			application.showRelatedItems = function (items, $placeholder)
			{
				// check if items is a single value (for instance, item detail page)
				// if its an array, sort the ids in ascending order for better cache collision
				var item_ids = items instanceof Array ? _.sortBy(items, function (id){return id;}) : [items];

				var related_items_model = new ItemsRelatedModel()
				,	items_data = {data:{id: item_ids.join(',')}};

				related_items_model.fetch(items_data).done(function(model){
					
					var filtered_related_items = filter_related(item_ids, model);

					// render the related items macro if there are any
					if(filtered_related_items.length)
					{
						$placeholder.append(
							SC.macros.relatedItems(filtered_related_items, application) 
						);	
					}
				});
			};

			application.showCorrelatedItems = function (items, $placeholder)
			{
				// check if items is a single value (for instance, item detail page)
				var item_ids = items instanceof Array ? _.sortBy(items, function (id){return id;}) : [items];

				var correlated_items_model = new ItemsCorrelatedModel()
				,	items_data = {data:{id: item_ids.join(',')}};

				correlated_items_model.fetch(items_data).done(function(model){
					
					var filtered_related_items = filter_related(item_ids, model);

					// render the related items macro if there are any
					if(filtered_related_items.length)
					{
						$placeholder.append(
							SC.macros.correlatedItems(filtered_related_items, application) 
						);	
					}
				});
			};
		}
	};
});
// ItemRelations.Related.Model.js
// ---------------
define('ItemRelations.Related.Model', ['Session'], function (Session)
{
	'use strict';
	
	var original_fetch = Backbone.CachedModel.prototype.fetch;

	return Backbone.CachedModel.extend({
		
		url: function()
		{
			var url = _.addParamsToUrl(
				'/api/items'
			,	_.extend(
					{}
				,	this.searchApiMasterOptions
				,	Session.getSearchApiParams()
				)
			);
			
			return url;
		}

		// model.fetch
		// -----------
		// We need to make sure that the cache is set to true, so we wrap it
	,	fetch: function (options)
		{
			options = options || {};

			options.cache = true;

			return original_fetch.apply(this, arguments);
		}
	});
});
// Merchandising.Context.DefaultHandlers
// -------------------------------------
// Registers a set of 'default handlers', this handlers are called
// depending on the execution context (current view they are in when beeing called)
// The following handlers are required for correct funtionality of the Merchandising Zone module:
// * getFilterValues
//   returns an array with the values of a specific filter in the current view
// * getIdItemsToExclude
//   returns an array with the ids of the items in the current view
define('Merchandising.Context.DefaultHandlers'
,	['Merchandising.Context', 'Facets.Views', 'ItemDetails.View', 'Cart.Views']
,	function (MerchandisingContext, FacetsViews, ItemDetailsView, CartViews)
{
	'use strict';

	var DefaultContextHandlers = {

		mergeFilterValues: function (current_values, facet_values)
		{
			return _.union(

				_.reject(current_values, function (value)
				{
					return value === '$current';
				})

			,	facet_values || []
			);
		}

	,	parseValues: function (filters, callback)
		{
			_.each(filters, function (values, key)
			{
				values = DefaultContextHandlers.mergeFilterValues(values, callback(values, key));

				if (values.length)
				{
					_.each(values, function(value) 
                    {
						MerchandisingContext.appendFilterValue(filters, key, value);
					});
				}
				else
				{
					delete filters[key];
				}
			});

			return filters;
		}

	,	includeFacetsToFilters: function (facets, filters)
		{
			var facet_id = ''
			,	facet_values = [];

			_.each(facets, function (facet)
			{
				facet_id = facet.id;
				facet_values = facet.value;

				facet_values = _.isArray(facet_values) ? facet_values : [facet_values];

				if (filters.hasOwnProperty(facet_id))
				{
					facet_values = _.union(filters[facet_id], facet_values);
				}

				filters[facet_id] = facet_values;
			});

			return filters;
		}

	,	itemListHandlers: {

			getFilters: function (filters, isWithin)
			{
				var facets = this.view.translator.facets;

				if (isWithin)
				{
					filters = DefaultContextHandlers.includeFacetsToFilters(facets, filters);
				}				

				return DefaultContextHandlers.parseValues(filters, function (values, key)
				{
					var facet_values = [];

					if (_.contains(values, '$current'))
					{
						var current_facet = _.findWhere(facets, {id: key});

						facet_values = current_facet && current_facet.value || [];

						if (!_.isArray(facet_values))
						{
							facet_values = [facet_values];
						}
					}

					return facet_values;
				});
			}

			// [_.pluck](http://underscorejs.org/#pluck)
		,	getIdItemsToExclude: function ()
			{
				return this.view.model.get('items').pluck('internalid');
			}
		}

	,	getItemValues: function (facets, field_id)
		{
			return _.pluck(_.findWhere(facets, {
				id: field_id
			}).values, 'url');
		}

	,	itemDetailsHandlers: {
			// depending on the item's attributes
			getFilters: function (filters, isWithin)
			{
				var facets = this.view.model.get('facets');

				return DefaultContextHandlers.parseValues(filters, function (values, key)
				{
					if (isWithin || _.contains(values, '$current'))
					{
						return DefaultContextHandlers.getItemValues(facets, key);
					}
				});
			}

			// there is only one it, we return its id
			// notice: we are returning it inside of an array
		,	getIdItemsToExclude: function ()
			{
				return [this.view.model.get('internalid')];
			}
		}

	,	getCartLineItemValue: function (item, filter_id)
		{
			var value = item.get(filter_id);

			if (!value)
			{
				var selected = _.findWhere(
					item.getPosibleOptions(), {itemOptionId: filter_id}
				);

				value = selected ? item.getOption(selected.cartOptionId).label : null;
			}

			return value;
		}

		// returns an array with the values
		// [_.compact](http://underscorejs.org/#compact)
		// [_.map](http://underscorejs.org/#map)
	,	getCartItemValues: function (items, filter_id)
		{
			return _.compact(items.map(function (line)
			{
				return MerchandisingContext.escapeValue(
					DefaultContextHandlers.getCartLineItemValue(line.get('item'), filter_id)
				);
			}));
		}

	,	cartDetailedHandlers: {

			getFilters: function (filters, isWithin)
			{
				var items = this.view.model.get('lines');

				return DefaultContextHandlers.parseValues(filters, function (values, key)
				{
					if (isWithin || _.contains(values, '$current'))
					{
						return DefaultContextHandlers.getCartItemValues(items, key);
					}
				});
			}

			// for each if the lines in the cart, we return either:
			// * the id of the matrix parent, if its a matrix
			// * the id of the line.item, if its not
		,	getIdItemsToExclude: function ()
			{
				var item = null;

				// [_.map](http://underscorejs.org/#map)
				return _.map(this.view.model.get('lines'), function (line)
				{
					item = line.get('item');

					return item.get('_matrixParent').get('_id') || item.get('_id');
				});
			}
		}

	,	cartConfirmationHandlers: {

			// returns the value of the attribute in the view's line item
			getFilters: function (filters, isWithin)
			{
				var item = this.view.line.get('item');

				return DefaultContextHandlers.parseValues(filters, function (values, key)
				{
					if (isWithin || _.contains(values, '$current'))
					{
						return MerchandisingContext.escapeValue(
							DefaultContextHandlers.getCartLineItemValue(item, key)
						);
					}
				});
			}

			// returns either the matrix parent id or the item id
			// of the view's line item
		,	getIdItemsToExclude: function ()
			{
				var item = this.view.line.get('item');
				return [item.get('_matrixParent').get('_id') || item.get('_id')];
			}
		}

	,	mountToApp: function ()
		{
			MerchandisingContext
				.registerHandlers(FacetsViews.Browse, this.itemListHandlers)
				.registerHandlers(ItemDetailsView, this.itemDetailsHandlers)
				.registerHandlers(CartViews.Detailed, this.cartDetailedHandlers)
				.registerHandlers(CartViews.Confirmation, this.cartConfirmationHandlers);

			return this;
		}
	};

	return DefaultContextHandlers;
});

// Merchandising.Context
// ---------------------
define('Merchandising.Context', function ()
{
	'use strict';

	var MerchandisingContext = function MerchandisingContext (view)
	{
		if (view.MerchandisingContext)
		{
			return view.MerchandisingContext;
		}
		this.view = view;
		view.MerchandisingContext = this;
	};

	_.extend(MerchandisingContext, {

		// list of registered handlers
		handlers: []

		// registerHandlers
		// pushes a new handler for a specific view to the handler list
	,	registerHandlers: function (view_constructor, methods)
		{
			if (view_constructor)
			{
				// if there was already a handler for that view
				// we remove it from the list, and extend the new
				// handler with any events that the previous one had
				var new_handler = _.extend(
					MerchandisingContext.removeHandler(view_constructor)
				,	methods
				);

				new_handler.viewConstructor = view_constructor;
				// then we add it first on the list
				MerchandisingContext.handlers.unshift(new_handler);
			}

			return MerchandisingContext;
		}

		// based on the constructor passed as a parameter
		// it removes any handler that matches the constructor
		// from the handlers list.
		// returns the removed handler
	,	removeHandler: function (view_constructor)
		{
			var removed = {};

			MerchandisingContext.handlers = _.reject(MerchandisingContext.handlers, function (handler)
			{
				if (handler.viewConstructor === view_constructor)
				{
					removed = handler;
					return true;
				}
			});

			return removed;
		}

		// retuns a handler based on the view
	,	getHandlerForView: function (view)
		{
			return _.find(MerchandisingContext.handlers, function (handler)
			{
				return view instanceof handler.viewConstructor;
			});
		}

	,	escapeValue: function (value)
		{
			return value ? value.toString().replace(/\s/g, '-') : '';
		}

		// callHandler
		// calls 'callback_key' from the handler for that view passing all of the arguments
	,	callHandler: function (callback_key, context, parameters)
		{
			var handler = MerchandisingContext.getHandlerForView(context.view);
			return handler && _.isFunction(handler[callback_key]) && handler[callback_key].apply(context, parameters);
		}

	,	appendFilterValue: function (filters, key, value)
		{
			if (_.isObject(value) && ('to' in value) && ('from' in value)) 
			{
				delete filters[key];

				filters[key + '.to'] = value.to;
				filters[key + '.from'] = value.from;
			} 
			else 
			{
				if (_.isUndefined(filters[key]))
				{
					filters[key] = '';
				}
				
				var comma = '';

				if (filters[key])
				{
					comma = ',';
				}

				filters[key] += comma + value;
			}
		}
	});

	_.extend(MerchandisingContext.prototype, {

		callHandler: function (callback_key)
		{
			return MerchandisingContext.callHandler(callback_key, this, _.toArray(arguments).slice(1));
		}

	,	getFilters: function (filters, isWithin)
		{
			var parsed_filters = this.callHandler('getFilters', filters, isWithin);
			
			if (!parsed_filters)
			{
				parsed_filters = {};

				_.each(filters, function (values, key)
				{
					values = _.without(values, '$current');
					
					if (values.length)
					{
						_.each(values, function (value)
						{
							MerchandisingContext.appendFilterValue(parsed_filters, key, value);	
						});
					}
				});
			}

			return parsed_filters;
		}	

	,	getIdItemsToExclude: function ()
		{
			return this.callHandler('getIdItemsToExclude') || [];
		}
	});

	return MerchandisingContext;
});

// Merhcandising Item Collection
// -----------------------------
// Item collection used for the merchandising zone
define('Merchandising.ItemCollection', ['ItemDetails.Collection', 'Session'], function (ItemDetailsCollection, Session)
{
	'use strict';

	// we declare a new version of the ItemDetailsCollection
	// to make sure the urlRoot doesn't get overridden
	return ItemDetailsCollection.extend({

		url: function ()
		{
			return _.addParamsToUrl(
				'/api/items'
			,	_.extend(
					{}
				,	this.searchApiMasterOptions
				,	Session.getSearchApiParams()
				)
			);
		}
	});
});

// Merchandising.jQueryPlugin
// --------------------------
// Creates a jQuery plugin to handle the Merchandising Zone's intialization
// ex: jQuery('my-custom-selector').merchandisingZone(options)
// options MUST include the application its running
// id of the Zone to be rendered is optional IF it is on the element's data-id
define('Merchandising.jQueryPlugin', ['Merchandising.Zone'], function (MerchandisingZone)
{
	'use strict';
	// [jQuery.fn](http://learn.jquery.com/plugins/basic-plugin-creation/)
	jQuery.fn.merchandisingZone = function (options)
	{
		return this.each(function ()
		{
			new MerchandisingZone(this, options);	
		});
	};
});
// Merchandising.js
// ----------------
// Module to handle MerchandisingZones
// (ex: Featured Items section)
define('Merchandising'
,	['Merchandising.ItemCollection', 'Merchandising.Rule', 'Merchandising.Zone', 'Merchandising.Context', 'Merchandising.jQueryPlugin']
,	function (ItemCollection, Rule, Zone, Context)
{
	'use strict';

	return {
		ItemCollection: ItemCollection
	,	Context: Context
	,	Rule: Rule
	,	Zone: Zone
	,	mountToApp: function (application)
		{
			// we add the default options to be added when fetching the items
			// this includes language and shoper's currency
			ItemCollection.prototype.searchApiMasterOptions = application.getConfig('searchApiMasterOptions.merchandisingZone');

			// afterAppendView is triggered whenever a view or modal is appended
			application.getLayout()
				.on('afterAppendView', function ()
				{
					// we dont want to discover unwanted merch zones, specifically
					// those in a the main screen (layout) behind the current modal.
					// give preference to modalCurrentView if available
					// otherwise inspect layout since merch zones can live outside of the currentview.
					var currentView = this.modalCurrentView || this; // "this" is current layout!

					currentView.$('[data-type="merchandising-zone"]').merchandisingZone({
						application: application
					});
				})
				// content service triggers this event when rendering a new enhanced page
				.on('renderEnhancedPageContent', function (view, content_zone)
				{
					// if the type of the content zone is merchandising
					if (content_zone.contenttype === 'merchandising')
					{
						// target = selector
						// $view_target = jQuery.find(selector, view), view is the context
						var target = content_zone.target
						,	$view_target = view.$(target)
						,	merchandising_zone_options = {
								application: application
							,	id: content_zone.content
							};

						// if the target is in the current view
						// we add the merchandising zone there
						if ($view_target.length)
						{
							$view_target.merchandisingZone(merchandising_zone_options);
						}
						else
						{
							// else, we search for the target in the layout
							this.$(target)
								.filter(':empty')
								.merchandisingZone(merchandising_zone_options);
						}
					}
				});

			application.getMerchandisingRules = function getMerchandisingRules ()
			{
				return Rule.Collection.getInstance();
			};
		}
	};
});

// Merchandising.Rule
// ------------------
// Object that contains both model and collection of Merchandising Rules
// Each MerchandisingRule.Model is a Merchandising Rule record on the backend
define('Merchandising.Rule', function ()
{
	'use strict';

	var MerchandisingRule = {};	

	// Standard Backbone.Model, we call extend in case
	// we want to override some methods
	MerchandisingRule.Model = Backbone.Model.extend({});

	// Handles the merchandising rules, it is a Singleton as
	// there is only one set of the rules
	MerchandisingRule.Collection = Backbone.CachedCollection.extend({
		url: '/dls/services/merchandising.ss'
	,	model: MerchandisingRule.Model
	}, SC.Singleton);

	return MerchandisingRule;
});
// Merchandising.Zone
// ------------------
define('Merchandising.Zone'
,	['Merchandising.ItemCollection', 'Merchandising.Rule', 'Merchandising.Context']
,	function (MerchandisingItemCollection, MerchandisingRule, MerchandisingContext)
{
	'use strict';

	// we declare a new version of the ItemDetailsCollection
	// to make sure the urlRoot doesn't get overridden
	var MerchandisingZone = function MerchandisingZone (element, options)
	{
		var application = options && options.application
		,	layout = application && application.getLayout && application.getLayout();

		if (!element || !layout)
		{
			return;
		}

		this.$element = jQuery(element).empty();
		// we try to get the model based on option.id (if passed) or the elements data id
		this.model = MerchandisingRule.Collection.getInstance().get(
			options.id || this.$element.data('id')
		);

		if (this.model && this.$element.length && !this.$element.hasClass(this.loadingClassNames))
		{
			this.options = options;
			this.application = application;
			this.items = new MerchandisingItemCollection();
			this.context = new MerchandisingContext(layout.modalCurrentView || layout.currentView || layout);

			this.initialize();
		}
	};

	_.extend(MerchandisingZone.prototype, {

		initialize: function ()
		{
			this.addLoadingClass();
			// the listeners MUST be added before the fetch ocurrs
			this.addListeners();

			// fetch the items
			this.items.fetch({
				cache: true
			,	data: this.getApiParams()
			});
		}

	,	addListeners: function ()
		{
			// [jQuery.proxy](http://api.jquery.com/jQuery.proxy/)
			var proxy = jQuery.proxy;

			this.items.on({
				sync: proxy(this.excludeItems, this)
			,	excluded: proxy(this.appendItems, this)
			,	appended: proxy(this.removeLoadingClass, this)
			,	error: proxy(this.handleRequestError, this)
			});
		}

		// pre: this.model and this.options must be defined
	,	getApiParams: function ()
		{
			var filters = this.parseApiFilterOptions()
			,	sorting = this.parseApiSortingOptions();

			if (sorting.length)
			{
				filters.sort = sorting.join(',');
			}

			// # Response
			// parameters to be passed to the item's fetch query
			return _.extend({
				limit: this.getLimit()
			,	fieldset: this.model.get('fieldset')
			}, filters);
		}

	,	parseApiFilterOptions: function ()
		{
			var	filters = {};

			// parses the merchandising rule filters into the filters obj
			_.each(this.model.get('filter'), function (rule_filter)
			{
				filters[rule_filter.field_id] = rule_filter.field_value;
			});

			return this.context.getFilters(filters, this.model.get('within'));
		}

	,	parseApiSortingOptions: function ()
		{
			// turn sorting obj into a string for the query
			return _.map(this.model.get('sort'), function (value)
			{
				return value.field_id + ':' + value.dir;
			});
		}

		// if there are items to get excluded from the collection
		// we need to ask for more items from the api
		// because the filtering gets done after the request
	,	getLimit: function ()
		{
			var model = this.model
			,	limit = model.get('show')
			,	exclude = model.get('exclude');

			if (exclude.length)
			{
				if (_.contains(exclude, '$cart'))
				{
					limit += this.application.getCart().get('lines').length;
				}

				if (_.contains(exclude, '$current'))
				{
					limit += this.context.getIdItemsToExclude().length;
				}
			}

			return limit <= 100 ? limit : 100;
		}

	,	excludeItems: function ()
		{
			var self = this;

			_.each(this.model.get('exclude'), function (filter)
			{
				self.applyFilterToItems(filter);
			});

			this.items.trigger('excluded');

			return this;
		}

		// narrows down the collection if excludes set up on the merchandising rule
	,	applyFilterToItems: function (filter)
		{
			var items = this.items;

			switch (filter)
			{
				case '$cart':

					var item = null;

					this.application.getCart().get('lines').each(function (line)
					{
						item = line.get('item');

						items.remove(
							items.get(
								item.get('_matrixParent').get('_id') || item.get('_id')
							)
						);
					});
				break;

				case '$current':

					_.each(this.context.getIdItemsToExclude(), function (id)
					{
						items.remove(items.get(id));
					});
				break;
			}

			return this;
		}

		// pre: this.$element must be defined
	,	appendItems: function ()
		{
			var items = this.items;

			if (items.length)
			{
				// we try to get the 'template' from either
				// the merchandising rule or the default configuration
				var model = this.model
				,	application = this.application
				,	template = SC.macros[model.get('template')] || SC.macros[application.getConfig('macros.merchandisingZone')];

				// then we append the parsed template to the element
				this.$element.append(
					template({
						application: application
					,	title: model.get('title')
					,	description: model.get('description')
					,	items: _.first(items.models, model.get('show'))
					})
				);
			}

			items.trigger('appended');

			// notify the layout that the content might have changed
			this.options && this.options.application && this.options.application.getLayout().trigger('afterRender'); 

			return this;
		}

	,	loadingClassNames: 'loading loading-merchandising-zone'

	,	addLoadingClass: function ()
		{
			this.$element.addClass(this.loadingClassNames);
		}

	,	removeLoadingClass: function ()
		{
			this.$element.removeClass(this.loadingClassNames);
		}

	,	handleRequestError: function ()
		{
			this.removeLoadingClass();
			console.error('Merchandising Zone - Request Error', arguments);
		}
	});

	return MerchandisingZone;
});

// MultiCurrencySupport.js
// -----------------------
// Handles the change event of the currency selector combo
define('MultiCurrencySupport', function () 
{
	'use strict';
	
	return {
		mountToApp: function (application)
		{
			var layout = application.getLayout();
			
			// Adds the event listener
			_.extend(layout.events, {
				'change select[data-toggle="currency-selector"]' : 'setCurrency'
			});
			
			// Adds the handler function
			_.extend(layout,
			{
				setCurrency: function (e)
				{
					var currency_code = jQuery(e.target).val()
					,	selected_currency = _.find(SC.ENVIRONMENT.availableCurrencies, function (currency)
						{
							return currency.code === currency_code;
						});

					// We use the param **"cur"** to pass this to the ssp environment
					var current_search = SC.Utils.parseUrlOptions(window.location.search);
					
					// if we are in a facet result we will remove all facets and navigate to the default search 
					if (window.location.hash !== '' && layout.currentView.translator)
					{
						window.location.hash = application.getConfig('defaultSearchUrl', '');
					}
					
					current_search.cur = selected_currency.code;

					window.location.search = _.reduce(current_search, function (memo, val, name)
					{
						return val ? memo + name + '=' + val + '&' : memo;
					}, '?');
				}
			});
		}
	};
});

// MultiHostSupport.js
// -------------------
// Handles the change event of the currency selector combo
define('MultiHostSupport', function ()
{
	'use strict';

	return {
		// redirects to a specific location
		// note: needed for unit tests
		setHref: function (url)
		{
			window.location.href = location.protocol + '//' + url;
		}
	,	setSearch: function (search)
		{
			window.location.search = search;
		}
	,	getCurrentPath: function ()
		{
			return location.pathname;
		}
	,	mountToApp: function (application)
		{
			// Adds the event listener
			_.extend(application.getLayout().events, {'change select[data-toggle="host-selector"]' : 'setHost'});
			_.extend(application.getLayout().events, {'change select[data-toggle="language-selector"]' : 'setLang'});

			var self = this;
			// Adds the handler function
			_.extend(application.getLayout(),
			{
				setHost: function (e)
				{
					var host = jQuery(e.target).val()
					,	url;

					if (Backbone.history._hasPushState)
					{
						// Seo Engine is on, send him to the root
						url = host;
					}
					else
					{
						// send it to the current path, it's probably a test site
						url = host + self.getCurrentPath();
					}

					// add session parameters to target host
					url = SC.Utils.addParamsToUrl(url, SC.Utils.getSessionParams(application.getConfig('siteSettings.touchpoints.login')));

					// redirects to url
					self.setHref(url);
				}
			,	setLang: function (e)
				{
					var selected_host = jQuery(e.target).val()
					,	available_hosts = SC.ENVIRONMENT.availableHosts
					,	selected_language;

					for(var i = 0; i < available_hosts.length; i++)
					{
						var host = available_hosts[i]
						,	lang = _(host.languages).findWhere({host: selected_host});

						if (lang && lang.locale)
						{
							selected_language = lang;
							break;
						}
					}

					// use the param **"lang"** to pass this to the ssp environment
					if (selected_language && selected_language.locale)
					{
						var current_search = SC.Utils.parseUrlOptions(window.location.search);

						current_search.lang = selected_language.locale;

						var search =  _.reduce(current_search, function (memo, val, name)
						{
							return val ? memo + name + '=' + val + '&' : memo;
						}, '?');

						self.setSearch(search);

						return search;
					}
				}
			});
		}
	};
});

// NavigationHelper.js
// -------------------
// This file intersect all clicks on a elements and computes what to do, if navigate useing backbone or navigate away
// support data-touchpoint for indicating a target touchpoint by name and data-keep-options for keeping current url options in the link.
define('NavigationHelper', ['Session', 'UrlHelper'], function (Session)
{
	'use strict';

	var NavigationHelper = {

		mountToApp: function (application)
		{
			// there is a soft dependency with Content.EnhancedViews
			// we only want it to disable the function that sets the title of the page,
			// we don't want to do that pages that open in modals
			try
			{
				ContentEnhancedViews = require('Content.EnhancedViews');
			}
			catch (e)
			{
				//window.console && window.console.log && window.console.log('Couldn\'t load ContentEnhancedViews');
			}

			// Layout
			var Layout = application.getLayout()
			,	ContentEnhancedViews;

			// Touchpoints navigation
			_.extend(Layout, {

				oldIE: function ()
				{
					var	isExplorer = /msie [\w.]+/
					,	docMode = document.documentMode;

					return (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));
				}

			,	getUrl: function ($element)
				{

					if (this.oldIE())
					{
						return $element.data('href');
					}
					else
					{
						return $element.attr('href');
					}
				}

			,	setUrl: function ($element, url)
				{
					$element.attr('href', url);

					if (this.oldIE())
					{
						$element.data('href', url);
					}
				}

				// layout.showInternalLinkInModal
				// for links that has the data-toggle=show-in-modal we will open them in a modal,
				// we do this by overriding the showContent function of the layout
				// and by disabeling the overrideViewSettings of the Content.EnhancedViews package
				// Then we just navigate to that url to call the router and execute the logic as normal
			,	showInternalLinkInModal: function (e, href, target)
				{
					var self = this
					,	current_fragment = Backbone.history.fragment || '/'
					,	original_view;

					this.isRewrited = true;
					this.originalShowContent = this.showContent;

					if (ContentEnhancedViews)
					{
						this.originalOverrideViewSettings = ContentEnhancedViews.overrideViewSettings;
					}

					// Here we override the showContent function
					this.showContent = function (view)
					{
						var promise = jQuery.Deferred();
						/// If you ever try to set a view that is not the original one
						// this code will cathc it an do an undo
						if (!original_view)
						{
							original_view = view;
						}
						else if (original_view !== view)
						{
							promise = self.originalShowContent.apply(self.application.getLayout(), arguments);
							original_view.$containerModal.modal('hide');
							return promise;
						}

						if (view && _.isFunction(view.showInModal))
						{
							// Then we just call the show in modal of the same view that we were passed in.
							promise = view.showInModal({className: target.data('modal-class-name')});

							// once this model closes we undo the override of the function
							view.$containerModal.on('hide.bs.modal', function ()
							{
								self.undoNavigationHelperFunctionRewrite();
							});
						}
						else
						{
							self.undoNavigationHelperFunctionRewrite();
							Backbone.history.navigate(href, {trigger: false, replace: true});
						}

						return promise;
					};

					// Here we navigate to the url and we then change the url to what it was originaly set in page that opened the modal
					Backbone.history.navigate(href, {trigger: true, replace: true});
					Backbone.history.navigate(current_fragment, {trigger: false, replace: true});
				}

				// layout.undoNavigationHelperFunctionRewrite
				// helper method to undo the override performed by layout.showInternalLinkInModal
			,	undoNavigationHelperFunctionRewrite: function ()
				{
					if (this.isRewrited)
					{
						this.showContent = this.originalShowContent;

						if (ContentEnhancedViews)
						{
							ContentEnhancedViews.overrideViewSettings = this.originalOverrideViewSettings;
						}

						this.isRewrited = false;
					}
				}

				// layout.showExternalLinkInModal
				// Opens an external page in a modal, by rendering an iframe in it
			,	showExternalLinkInModal: function (e, href, target)
				{
					var view = new Backbone.View({
						application: this.application
					});

					view.src = href;
					view.template = 'iframe';
					view.page_header = target.data('page-header') || '';

					view.showInModal({
						className: (target.data('modal-class-name') || '') +' iframe-modal'
					});
				}

				// layout.clickEventListener
				// Handles the unatended link event
			,	clickEventListener: function (e)
				{
					e.preventDefault();

					// Grabs info from the event element
					var $this = jQuery(e.currentTarget)
					,	href = this.getUrl($this) || ''
					,	target_is_blank = e.button === 1 || e.ctrlKey || e.metaKey || $this.attr('target') === '_blank'
					,	target_is_modal = $this.data('toggle') === 'show-in-modal'
					,	is_disabled = $this.attr('disabled')
					,	is_dropdown = $this.data('toggle') === 'dropdown'

					// Workaround for internet explorer 7. href is overwritten with the absolute path so we save the original href
					// in data-href (only if we are in IE7)
					// IE7 detection courtesy of Backbone
					// More info: http://www.glennjones.net/2006/02/getattribute-href-bug/
					,	isExplorer = /msie [\w.]+/
					,	docMode = document.documentMode
					,	oldIE = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

					if (is_disabled)
					{
						e.stopPropagation();
						return;
					}

					if (oldIE)
					{
						href = $this.data('href');
					}

					if ($this.data('original-href') && !target_is_blank)
					{
						href = $this.data('original-href');
					}

					var is_external = ~href.indexOf('http:') || ~href.indexOf('https:') || ~href.indexOf('mailto:') || ~href.indexOf('tel:');

					// use href=# or href=""
					if (href === '#' || href === '' || is_dropdown)
					{
						return;
					}

					// The navigation is within the same browser window
					if (!target_is_blank)
					{
						// There is a modal open
						if (this.$containerModal)
						{
							this.$containerModal.modal('hide');
						}

						// Wants to open this link in a modal
						if (target_is_modal)
						{
							if (is_external)
							{
								this.showExternalLinkInModal(e, href, $this);
							}
							else
							{
								this.showInternalLinkInModal(e, href, $this);
							}
						}
						else
						{
							if (is_external)
							{
								document.location.href = href;
							}
							else
							{
								Backbone.history.navigate(href, {trigger: true});
							}
						}
					}
					else
					{
						window.open(href, _.uniqueId('window'));
					}
				}

				// intercepts mousedown events on all anchors with no data-touchpoint attribute and fix its href attribute to work when opening in a new tab
			,	fixNoPushStateLink: function (e)
				{
					var anchor = jQuery(e.target)
					,	href = this.getUrl(anchor) || '#';

					if (Backbone.history.options.pushState || href === '#' ||
						href.indexOf('http://') === 0 || href.indexOf('https://') === 0 || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0)
					{
						return;
					}
					else if (anchor.data('toggle') === 'show-in-modal')
					{
						anchor.data('original-href', href);
						this.setUrl(anchor, window.location.href);
						return;
					}

					var fixedHref;

					if (window.location.hash)
					{
						fixedHref = window.location.href.replace(/#.*$/, '#' + href);
					}
					else if (window.location.href.lastIndexOf('#')  ===  window.location.href.length - 1)
					{
						fixedHref = window.location.href +  href;
					}
					else
					{
						fixedHref = window.location.href + '#' + href;
					}

					this.setUrl(anchor, fixedHref);
				}

			,	getTargetTouchpoint: function ($target)
				{
					var application = this.application
					,	touchpoints = Session.get('touchpoints')
					,	target_data = $target.data()
					,	target_touchpoint = (touchpoints ? touchpoints[target_data.touchpoint] : '') || ''
					,	hashtag = target_data.hashtag
					,	new_url = ''
					,	clean_hashtag = hashtag && hashtag.replace('#', '');

					// If we already are in the target touchpoint then we return the hashtag or the original href.
					// We don't want to absolutize this url so we just return it.
					if (target_data.touchpoint === application.getConfig('currentTouchpoint'))
					{
						new_url = clean_hashtag ? ('#' + clean_hashtag) : this.getUrl($target);
						new_url = target_data.keepOptions ? this.getKeepOptionsUrl($target) : new_url;
					}
					else
					{
						// if we are heading to a secure domain (myAccount or checkout), keep setting the language by url
						if (target_touchpoint.indexOf('https:') >= 0)
						{
							var current_language = SC.ENVIRONMENT.currentLanguage;
							if (current_language)
							{
								target_data.parameters = target_data.parameters ?
										target_data.parameters + '&lang=' + current_language.locale :
										'lang=' + current_language.locale;
							}
						}

						if (target_data.parameters)
						{
							target_touchpoint += (~target_touchpoint.indexOf('?') ? '&' : '?') + target_data.parameters;
						}

						if (hashtag && hashtag !== '#' && hashtag !== '#/')
						{
							new_url = _.fixUrl(target_touchpoint + (~target_touchpoint.indexOf('?') ? '&' : '?') + 'fragment=' + clean_hashtag);
						}
						else
						{
							new_url = _.fixUrl(target_touchpoint);
						}

						// We need to make this url absolute in order for this to navigate
						// instead of being triggered as a hash
						if (new_url && !(~new_url.indexOf('http:') || ~new_url.indexOf('https:')))
						{
							new_url = location.protocol + '//' + location.host + new_url;
						}
					}

					// Cross Domain Cookie Tracking:
					// Trackers like Google Analytics require us to send special parameters in the url
					// to keep tracking the user as one entity even when moving to a different domain
					if (application.addCrossDomainParameters)
					{
						new_url = application.addCrossDomainParameters(new_url);
					}

					// check if we need to redirect to a diferent host based on the current language
					new_url = this.fixTargetHost(new_url);

					return new_url;
				}

				// layout.touchpointMousedown
				// On mousedown we will set the href of the the link, passing google analitics if needed
			,	touchpointMousedown: function (e)
				{
					this.isTouchMoveEvent = false;

					if (e.type === 'touchstart')
					{
						e.stopPropagation();
					}

					var $target = jQuery(e.currentTarget)
					,	new_url = this.getTargetTouchpoint($target);

					// 2 = middle click, 3 = right click
					if (e.which === 2 || e.which === 3)
					{
						e.preventDefault();
						e.stopPropagation();

						// set the url to the href, so the open on a new tab have the correct url
						this.setUrl($target, new_url);
					}
					else
					{
						if (!new_url.indexOf('https:') && $target.data('touchpoint') !== application.getConfig('currentTouchpoint'))
						{
							// Hide modal, do post after that
							Layout.$containerModal && Layout.$containerModal.length && Layout.$containerModal.modal('hide');

							_.doPost(new_url);
						}
						else
						{
							this.setUrl($target, new_url);
						}
					}
				}

				// layout.touchpointClick
				// This detects if you are tring to access a different hashtag within the same touchpoint
			,	touchpointMouseup: function (e)
				{
					var $target = jQuery(e.currentTarget)
					,	target_data = $target.data()
					,	target_is_blank = e.button !== 0 || e.ctrlKey || e.metaKey || $target.attr('target') === '_blank';

					if (!target_is_blank && this.application.getConfig('currentTouchpoint') && this.application.getConfig('currentTouchpoint') === target_data.touchpoint && target_data.hashtag)
					{
						var new_url = target_data.hashtag;
						// Removes the hastag if it's there remove it
						new_url = new_url[0] === '#' ? new_url.substring(1) : new_url;
						// if it doesnot has a slash add it
						new_url = new_url[0] === '/' ? new_url : '/' + new_url;
						// we just set the hastag as a relative href and the app should take care of itself

						this.setUrl($target, new_url);
					}

					if (e.type === 'touchend' && !this.isTouchMoveEvent)
					{
						e.stopPropagation();
						e.preventDefault();

						$target.trigger('click');
					}
				}

			,	touchpointTouchMove: function ()
				{
					this.isTouchMoveEvent = true;
				}

				// layout.getDomain()
				// helper to extract the domain of a url
			,	getDomain: function (url)
				{
					return url.split('/')[2] || null;
				}

				// layout.getProtocol()
				// helper to extract the protocol of a url
			,	getProtocol: function (url)
				{
					return url.split('/')[0] || null;
				}

				// getKeepOptionsUrl. Implement logic of HTML attribute 'data-keep-options'.
				// Return a new link poblating given anchor's href with options (http parameters) from window.location.href.
				// Value of data-keep-options can be '*' (all options from window.location are taken) or a comma separated (only given parameters are taken)
			,	getKeepOptionsUrl: function ($target)
				{
					if (_.getWindow().location.href.indexOf('?') > 0 && $target.data('keep-options'))
					{
						var current_options = _.parseUrlOptions(_.getWindow().location.href);
						//remove options not defined in the target's data-key-options attr
						if ($target.data('keep-options') !== '*')
						{
							var valid_option_names = $target.data('keep-options').split(',')
							,	keys = _(current_options).keys();

							_(keys).each(function (key)
							{
								if (!_(valid_option_names).contains(key))
								{
									delete current_options[key];
								}
							});
						}
						var anchor_options = (this.getUrl($target) && this.getUrl($target).indexOf('?') > 0) ? _.parseUrlOptions(this.getUrl($target)) : {}
						,	new_params = ''
						,	href_to_fix = this.getUrl($target) || '';

						//override with global
						anchor_options = _.extend(anchor_options, current_options);

						// remove query string from url
						href_to_fix = href_to_fix.indexOf('?') > 0 ? (href_to_fix.substring(0, href_to_fix.indexOf('?'))) : href_to_fix;

						var options = _(anchor_options).keys();

						for (var i = 0; i < options.length; i++)
						{
							var key = options[i];
							new_params += key + '=' + anchor_options[key] + (i < options.length - 1 ? '&' : '');
						}

						return href_to_fix + (new_params ? ('?' + new_params) : '');
					}
					else
					{
						return this.getUrl($target);
					}
				}

				// get the target host based on the current language
			,	getTargetHost: function ()
				{
					var available_hosts = SC.ENVIRONMENT.availableHosts
					,	target_host;

					if(available_hosts && available_hosts.length)
					{
						for(var i = 0; i < available_hosts.length; i++)
						{
							var host = available_hosts[i]
							,	lang = _(host.languages).findWhere({locale: SC.ENVIRONMENT.currentLanguage.locale});

							if (lang && lang.host)
							{
								target_host = lang.host;
								break;
							}
						}
					}

					return target_host;
				}

				// given a url, if not secure (not myaccount nor checkout), replace the host based on the current language
			,	fixTargetHost: function (url)
				{
					var fixed_url = url;
					// check if target is shopping (http) -> we might have to change this
					if(!~url.indexOf('https:'))
					{
						var target_host = this.getTargetHost();
						if(target_host)
						{
							fixed_url = fixed_url.replace(/(http:\/\/)([^/?#]*)([^>]*)/gi, function(all, protocol, host, rest){return protocol + target_host + rest;});
						}

						// add session parameters to target host
						fixed_url = SC.Utils.addParamsToUrl(fixed_url, SC.Utils.getSessionParams(application.getConfig('siteSettings.touchpoints.login')));
					}

					return fixed_url;
				}

			,	keepOptionsMousedown: function (e)
				{
					var $target = jQuery(e.currentTarget)
					,	new_url = this.getKeepOptionsUrl($target);

					this.setUrl($target, new_url);
				}
			});

			// Adds event listeners to the layout
			_.extend(Layout.events, {

				// touchpoints, this needs to be before the other click event, so they are computed early
				'touchstart a[data-touchpoint]:not([data-navigation="ignore-click"])': 'touchpointMousedown'
			,	'touchmove a[data-touchpoint]:not([data-navigation="ignore-click"])': 'touchpointTouchMove'
			,	'mousedown a[data-touchpoint]:not([data-navigation="ignore-click"])': 'touchpointMousedown'
			,	'touchend a[data-touchpoint]:not([data-navigation="ignore-click"])': 'touchpointMouseup'
			,	'mouseup a[data-touchpoint]:not([data-navigation="ignore-click"])': 'touchpointMouseup'

			,	'mousedown a[data-keep-options]:not([data-touchpoint]):not([data-navigation="ignore-click"])': 'keepOptionsMousedown'
				//intercept clicks on anchor without touchpoint for fixing its href when user try to open it on new tabs / windows.
			,	'mousedown a:not([data-touchpoint]):not([data-navigation="ignore-click"])': 'fixNoPushStateLink'
			,	'touchstart a:not([data-touchpoint]):not([data-navigation="ignore-click"])': 'fixNoPushStateLink'
				// Listen to the click event of all a elements of the layout
			,	'click a:not([data-navigation="ignore-click"])': 'clickEventListener'
			});
		}
	};

	return NavigationHelper;
});

// LiveOrder.Collection.js
// -----------------------
// Live Orders collection
define('LiveOrder.Collection', ['LiveOrder.Model'], function (Model)
{
	'use strict';

	return Backbone.Collection.extend({
		model: Model
	});
});
// LiveOrder.Model.js
// -----------------------
// Model for showing information about an open order
define('LiveOrder.Model', ['Order.Model', 'OrderLine.Model', 'OrderLine.Collection', 'ItemDetails.Model', 'Session'], function (OrderModel, OrderLineModel, OrderLineCollection, ItemDetailsModel, Session)
{
	'use strict';

	var LiveOrderLine = {};

	LiveOrderLine.Model = OrderLineModel.extend({
		urlRoot: _.getAbsoluteUrl('services/live-order-line.ss')
	});

	LiveOrderLine.Collection = OrderLineCollection.extend({
		model: LiveOrderLine.Model
	,	url: _.getAbsoluteUrl('services/live-order-line.ss')
	});

	return OrderModel.extend({

		urlRoot: _.getAbsoluteUrl('services/live-order.ss')

	,	linesCollection: LiveOrderLine.Collection

		// redefine url to avoid possible cache problems from browser
	,	url: function()
		{
			var base_url = OrderModel.prototype.url.apply(this, arguments);
			return base_url + '&t=' + new Date().getTime();
		}

	,	initialize: function ()
		{
			// call the initialize of the parent object, equivalent to super()
			OrderModel.prototype.initialize.apply(this, arguments);

			// Some actions in the live order may change the url of the checkout so to be sure we re send all the touchpoints
			this.on('change:touchpoints', function (model, touchpoints)
			{
				Session.set('touchpoints', touchpoints);
			});
		}

	,	getLatestAddition: function ()
		{
			var model = null;

			if (this.get('latest_addition'))
			{
				model = this.get('lines').get(this.get('latest_addition'));
			}

			if (!model && this.get('lines').length)
			{
				model = this.get('lines').at(0);
			}

			return model;
		}

	,	wrapOptionsSuccess: function (options)
		{
			var self = this
			,	application = this.application;
			// if passing a succes function we need to wrap it
			options = options || {};
			options.success = _.wrap(options.success || jQuery.noop, function (fn, item_model, result)
			{
				// This method is called in 2 ways by doing a sync and by doing a save
				// if its a save result will be the raw object
				var attributes = result;
				// If its a sync resilt will be a string
				if (_.isString(result))
				{
					attributes = item_model;
				}

				// Tho this should be a restfull api, the live-order-line returns the full live-order back (lines and summary are interconnected)
				self.set(attributes);

				// Calls the original success function
				fn.apply(self, _.toArray(arguments).slice(1));

				var line = self.get('lines').get(self.get('latest_addition'))
				,	item = line && line.get('item');

				item && application && application.trackEvent && application.trackEvent({
					category: 'add-to-cart'
				,	action: 'button'
				,	label: item.get('_url') + item.getQueryString()
				,	value: 1
				});
			});

			options.killerId = application && application.killerId;

			return options;
		}

	,	addItem: function (item, options)
		{
			// Calls the addItems funtion passing the item as an array of 1 item
			return this.addItems([item], options);
		}

	,	addItems: function (items, options)
		{
			// Obteins the Collection constructor
			var LinesCollection = this.linesCollection;

			// Prepares the input for the new collection
			var lines = _.map(items, function (item)
			{
				var line_options = item.getItemOptionsForCart();

				return {
					item: {
						internalid: item.get('internalid')
					}
				,	quantity: item.get('quantity')
				,	options: _.values(line_options).length ? line_options : null
				};
			});

			// Creates the Colection
			var self = this
			,	lines_collection = new LinesCollection(lines);

			// add the dummy line for optimistic add to cart - when the request come back with the real data the collection will be reseted.
			if (this.optimistic)
			{
				var price = this.optimistic.item.getPrice()
				,	dummy_line = new OrderLineModel({
						quantity: this.optimistic.quantity
					,	item: this.optimistic.item.attributes
					,	rate_formatted: price.price_formatted
					,	rate: price.price
					});

				dummy_line.get('item').itemOptions = this.optimistic.item.itemOptions;

				// search the item in the cart to merge the quantities
				if (self.application.loadCart().state() === 'resolved')
				{
					var itemCart = SC.Utils.findItemInCart(self.optimistic.item, self.application.getCart());

					if (itemCart) 
					{
						itemCart.set('quantity', itemCart.get('quantity') + parseInt(this.optimistic.quantity, 10));
						dummy_line = itemCart;
					}
					else
					{
						this.get('lines').add(dummy_line);
					}
				}
				else
				{
					dummy_line.set('quantity', 0);
				}

				this.optimisticLine = dummy_line;
				this.trigger('change');
			}

			// Saves it
			var promise = lines_collection.sync('create', lines_collection, this.wrapOptionsSuccess(options));
			if (promise)
			{
				promise.fail(function()
				{
					// if any error we must revert the optimistic changes.
					if (self.optimistic)
					{
						if (self.application.loadCart().state() === 'resolved')
						{
							var itemCart = SC.Utils.findItemInCart(self.optimistic.item, self.application.getCart());

							if (itemCart) 
							{
								itemCart.set('quantity', itemCart.get('quantity') - parseInt(self.optimistic.quantity, 10));

								if (!itemCart.get('quantity'))
								{
									self.get('lines').remove(itemCart);
								}
							}

							self.set('latest_addition', self.get('latest_addition_original'));
							self.trigger('change');
						}
					}
				});
			}

			return promise;
		}

	,	updateItem: function (line_id, item, options)
		{
			var line = this.get('lines').get(line_id)
			,	line_options = item.getItemOptionsForCart();

			line.set({
				quantity: item.get('quantity')
			,	options: _.values(line_options).length ? line_options : null
			});

			line.ongoingPromise = line.save({}, this.wrapOptionsSuccess(options));

			return line.ongoingPromise;
		}

	,	updateLine: function (line, options)
		{
			// Makes sure the quantity is a number
			line.set('quantity', parseInt(line.get('quantity'), 10));

			line.ongoingPromise = line.save({}, this.wrapOptionsSuccess(options));

			return line.ongoingPromise;
		}

	,	removeLine: function (line, options)
		{
			line.ongoingPromise = line.destroy(this.wrapOptionsSuccess(options));

			return line.ongoingPromise;
		}

		// submit invoked when the user place/submit the order
	,	submit: function ()
		{
			this.set('internalid', null);

			var self = this
			,	creditcard = this.get('paymentmethods').findWhere({type: 'creditcard'})
			,	paypal = this.get('paymentmethods').findWhere({type: 'paypal'});

			if (creditcard && !creditcard.get('creditcard'))
			{
				this.get('paymentmethods').remove(creditcard);
			}

			if (paypal && !paypal.get('complete'))
			{
				this.get('paymentmethods').remove(paypal);
			}
			return this.save().fail(function ()
			{
				self.set('internalid', 'cart');
			}).done(function ()
			{
				self.application.trackEvent && self.application.trackEvent({
					category: 'place-order'
				,	action: 'button'
				,	label: ''
				,	value: 1
			});
			});
		}

	,	save: function ()
		{
			if (this.get('confirmation'))
			{
				return jQuery.Deferred().resolve();
			}

			return OrderModel.prototype.save.apply(this, arguments);
		}

	,	getTotalItemCount: function ()
		{
			return _.reduce(this.get('lines').pluck('quantity'), function (memo, quantity)
			{
				return memo + (parseFloat(quantity) || 1);
			}, 0);
		}

	,	parse: function (response, options)
		{
			if (options && !options.parse)
			{
				return;
			}

			return response;
		}

		// Returns the order's lines that have not set its addresses to Multi Ship To yet
	,	getUnsetLines: function ()
		{
			return this.get('lines').filter(function (line) { return !line.get('shipaddress') && line.get('isshippable'); });
		}

		// Returns the order's line that are NON Shippable
	,	getNonShippableLines: function ()
		{
			return this.get('lines').filter(function (line) { return !line.get('isshippable'); });
		}

		// Returns the list of lines already set its shipping address
	,	getSetLines: function ()
		{
			return this.get('lines').filter(function (line) { return line.get('shipaddress') && line.get('isshippable'); });
		}

		// Returns the order's line that are shippable without taking into account if their have or not set a shipaddress
	,	getShippableLines: function ()
		{
			return this.get('lines').filter(function (line) { return line.get('isshippable'); });
		}
		// Returns an array containing the cart items ids
	,	getItemsIds: function ()
		{
			return this.get('lines').map(function(line){return line.get('item').get('internalid');});
		}
		//Determines if at least one item is shippable
	,	getIfThereAreDeliverableItems: function ()
		{
			return this.get('lines').length !== this.getNonShippableLines().length;
		}
	});
});

// Order.Model.js
// -----------------------
// Model for showing information about an order
define('Order.Model', ['OrderLine.Collection', 'OrderShipmethod.Collection', 'Address.Collection', 'CreditCard.Collection','OrderPaymentmethod.Collection'], function (OrderLinesCollection, ShipmethodsCollection, AddressesCollection, CreditCardsCollection, OrderPaymentmethodCollection)
{
	'use strict';

	return Backbone.Model.extend({

		linesCollection: OrderLinesCollection

	,	initialize: function (attributes)
		{
			this.on('change:lines', function (model, lines)
			{
				model.set('lines', new model.linesCollection(lines), {silent: true});
			});
			this.trigger('change:lines', this, attributes && attributes.lines || []);

			this.on('change:shipmethods', function (model, shipmethods)
			{
				model.set('shipmethods', new ShipmethodsCollection(shipmethods), {silent: true});
			});
			this.trigger('change:shipmethods', this, attributes && attributes.shipmethods || []);

			this.on('change:multishipmethods', function (model, multishipmethods)
			{
				if (multishipmethods)
				{
					_.each(_.keys(multishipmethods), function(address_id) {
						multishipmethods[address_id] = new ShipmethodsCollection(multishipmethods[address_id], {silent: true});
					});
				}

				model.set('multishipmethods', multishipmethods, {silent: true});
			});
			this.trigger('change:multishipmethods', this, attributes && attributes.multishipmethods || []);

			this.on('change:addresses', function (model, addresses)
			{
				model.set('addresses', new AddressesCollection(addresses), {silent: true});
			});
			this.trigger('change:addresses', this, attributes && attributes.addresses || []);

			this.on('change:paymentmethods', function (model, paymentmethods)
			{
				model.set('paymentmethods', new OrderPaymentmethodCollection(paymentmethods), {silent: true});
			});
			this.trigger('change:paymentmethods', this, attributes && attributes.paymentmethods || []);
		}
	});
});

// OrderLine.Collection.js
// -----------------------
// Order Line collection
define('OrderLine.Collection', ['OrderLine.Model'], function (Model)
{
	'use strict';

	return Backbone.Collection.extend({
		model: Model
	});
});
// OrderLine.Model.js
// -----------------------
// Model for showing information about a line in the order
define('OrderLine.Model', ['ItemDetails.Model'], function (ItemDetailsModel)
{
	'use strict';

	return Backbone.Model.extend({

		initialize: function (attributes)
		{
			this.on('change:item', function (model, item)
			{
				model.set('minimumquantity', item.minimumquantity);

				model.set('item', new ItemDetailsModel(_.extend(item, {
					line_id: model.get('internalid')
				,	options: model.get('options')
				,	quantity: model.get('quantity')
				,	minimumquantity: model.get('minimumquantity')
				})), {silent: true});
			});

			this.trigger('change:item', this, attributes && attributes.item || {});

			this.on('error', function (model, jqXhr)
			{
				var result = JSON.parse(jqXhr.responseText)
				,	error_details = result.errorDetails;

				if (error_details && error_details.status === 'LINE_ROLLBACK')
				{
					model.set('internalid', error_details.newLineId);
				}
			});

			// Extend the model with Backbone.Validation.mixin to validate it without a View
			_.extend(this, Backbone.Validation.mixin);
		}

	,	validation: 
		{
			quantity: { fn: function() 
				{
					if (this.get('quantity') < this.get('item').get('_minimumQuantity', true))
					{
						return _('The minimum quantity for this item is $(0).').translate(this.get('item').get('_minimumQuantity', true));
					}
				}
			}
		}

	,	toJSON: function ()
		{
			var options = this.attributes.options;

			// Custom attributes include the id and value as part of the array not the format expected in service
			if (options instanceof Array)
			{
				var newOptions = {};

				_.each(options, function (e)
				{
					newOptions[e.id.toLowerCase()] = e.value;
				});

				options = newOptions;
			}

			var matrix_parent_id = this.attributes.item.get('_matrixParent') && this.attributes.item.get('_matrixParent').get('_id');

			return {
				item: {
					internalid: matrix_parent_id ? matrix_parent_id : this.attributes.item.get('_id')
				}
			,	quantity: this.attributes.quantity
			,	internalid: this.attributes.internalid
			,	options: options
			,	splitquantity: parseInt(this.attributes.splitquantity, 10)
			,	shipaddress: this.attributes.shipaddress
			,	shipmethod: this.attributes.shipmethod
			};
		}

	,	getPrice: function ()
		{
			var item_price = this.attributes.item.getPrice();

			return {
				price: this.get('rate')
			,	price_formatted: this.get('rate_formatted')
			,	compare_price: item_price.compare_price
			,	compare_price_formatted: item_price.compare_price_formatted
			};
		}
	});
});
// OrderPaymentmethod.Collection.js
// --------------------------------
// Collection of posible payment method
define('OrderPaymentmethod.Collection', ['OrderPaymentmethod.Model'], function (Model)
{
	'use strict';

	return Backbone.Collection.extend({
		model: Model
	});
});

// OrderPaymentmethod.Model.js
// ---------------------------
// Payment method Model
define('OrderPaymentmethod.Model', function ()
{
	'use strict';

	return Backbone.Model.extend({
		getFormattedPaymentmethod: function ()
		{
			return this.get('type');
		}
	});
});

// OrderShipmethod.Collection.js
// -----------------------------
// Shipping methods collection
define('OrderShipmethod.Collection', ['OrderShipmethod.Model'], function (Model)
{
	'use strict';

	return Backbone.Collection.extend({
		model: Model
	,	comparator: 'name'
	});
});
// OrderShipmethod.Model.js
// ------------------------
// Single ship method
define('OrderShipmethod.Model', function ()
{
	'use strict';

	return Backbone.Model.extend({
		getFormattedShipmethod: function ()
		{
			return this.get('name');
		}
	});

	
});

// ProductReviews.Collection.js
// ----------------------------
// Returns an extended version of the CachedCollection constructor
// (file: Backbone.cachedSync.js)
define('ProductReviews.Collection', ['ProductReviews.Model'], function (Model)
{
	'use strict';
	
	return Backbone.CachedCollection.extend({
		
		url: 'services/product-reviews.ss'
		
	,	model: Model
		
		// pre-processes the data after fetching
		// http://backbonejs.org/#Model-parse
	,	parse: function (data)
		{
			// We set up some global attributes to the Collection
			this.page = data.page;
			this.recordsPerPage = data.recordsPerPage;
			this.totalRecordsFound = data.totalRecordsFound;
			this.totalPages = Math.ceil(this.totalRecordsFound / this.recordsPerPage);
			
			// and we return only the collection from the server
			return data.records;
		}
        
    ,   parseOptions: function (options)
        {
            if (options)
            {
                if (options.filter)
                {
                    options.filter = options.filter.id;
                }
                
                if (options.sort)
                {
                    options.sort = options.sort.id;
                }
                
                options.itemid = this.itemId;
            }
            
            return options;
        }
        
        // Collection.update:
		// custom method called by ListHeader view
		// it receives the currently applied filter,
		// currently applied sort and currently applied order
	,	update: function (options)
		{
            var data = this.getReviewParams(this.parseOptions(options), this.application);
            
            if (data.order)
            {
                // check for inverse results
                data.order = options.order && options.order < 0 ? data.order.replace('ASC', 'DESC') : data.order.replace('DESC', 'ASC');
            }
            
			this.fetch({
				data: data
            ,   reset: true
			,	killerId: options.killerId
			});
		}
	});
});
// ProductReviews.js
// -----------------
// Defines the ProductReviews module (Model, Collection, Views, Router)
// Mount to App also handles rendering of the reviews
// if the current view has any placeholder for them
define('ProductReviews'
,	['ProductReviews.Model', 'ProductReviews.Collection', 'ProductReviews.Views', 'ProductReviews.Router']
,	function (Model, Collection, Views, Router)
{
	'use strict';
    
    // @method Parse url options and return product reviews api params
    // @param {ApplicationSkeleton} application
    // @param {object} options url parameters
    // @return {object} reviews_params
    var getReviewParams = function(options, application)
    {
        var sort
        ,	filter
            // Cumputes Params for Reviews API
        ,	reviews_params = {};

        if (options)
        {
            // if there's a filter in the URL
            if (options.filter)
            {
                // we get it from the config file, based on its id
                filter = _.find(application.getConfig('productReviews.filterOptions'), function (i) {
                    return i.id === options.filter;
                }) || {};
            }
            else
            {
                // otherwise we just get the default one
                filter = _.find(application.getConfig('productReviews.filterOptions'), function (i) {
                    return i.isDefault;
                }) || {};
            }
            // and we add it to the reviews_params obj
            reviews_params = _.extend(reviews_params, filter.params);

            // same for sorting, if it comes as a parameter
            if (options.sort)
            {
                // we get it from the config file
                sort = _.find(application.getConfig('productReviews.sortOptions'), function (i) {
                    return i.id === options.sort;
                }) || {};
            }
            else
            {
                // otherwise we just get the default one
                sort = _.find(application.getConfig('productReviews.sortOptions'), function (i) {
                    return i.isDefault;
                }) || {};
            }
            // and we add it to the reviews_params obj
            reviews_params = _.extend(reviews_params, sort.params);
        }

        // If there's a specific page in the url, we pass that to
        // if there isn't, we just get the first oen
        reviews_params = _.extend(reviews_params, {page: options && options.page || 1});

        return reviews_params;
    };
    
    var ProductReviewsModule = {
		Views: Views
	,	Model: Model
	,	Router: Router
	,	Collection: Collection
	,	mountToApp: function (application)
		{
			Model.prototype.urlRoot = _.getAbsoluteUrl(Model.prototype.urlRoot);
			Collection.prototype.url = _.getAbsoluteUrl(Collection.prototype.url);
            
            Collection.prototype.getReviewParams = getReviewParams;
            Collection.prototype.application = application;
    
            // fetch and display product reviews
            application.showProductReviews = function (model, options, $placeholder)
            {
                // get the reviews api params
                var reviews_params = getReviewParams(options, application)
                ,   collection = new Collection()
                ,   self = this
                ,   view = new Views.ItemReviewCenter({
                        collection: collection
                    ,   baseUrl: 'product/' + model.get('internalid')
                    ,	queryOptions: options || {}
                    ,	item: model
                    ,	application: self
                    });

                // add the item internal id to the reviews api params
                reviews_params.itemid = model.get('internalid');

                // return the fetch 'promise'
                collection.fetch(
                { 
                    data: reviews_params
                ,	killerId: this.killerId
                }).done(function ()
                {
                    view.updateCannonicalLinks();
                    
                    // append and render the view
                    $placeholder.empty().append(view.$el);
                    view.render();
                    
                    collection.on('reset', function ()
                    {
                        view.render();
                    }, self);
                
                }); 
            };

			// default behaviour for mount to app
			return new Router(application);
		}
	};
    
    return ProductReviewsModule;
});

// ProductReviews.Model.js
// -----------------------
// It returns a new instance of a Backbone CachedModel
// (file: Backbone.cachedSync.js)
// initializes writer and rating per attribute if null or undefined
define('ProductReviews.Model', function ()
{
	'use strict';
	
	return Backbone.CachedModel.extend({
		
		urlRoot: 'services/product-reviews.ss'
		// conditions for each of the fields to be valid
		// [Backbone.Validation](https://github.com/thedersen/backbone.validation)
	,	validation: {
			rating: {
				required: true
			,	msg: _('Rating is required').translate()
			}
		,	title: {
				fn: function (value)
				{
					if (!value)
					{
						return _('Title is required').translate(); 
					} 
					else if (value.length >= 199)
					{
						return _('The field name cannot contain more than the maximum number (199) of characters allowed.').translate(); 
					}
				}
			}
		,	text: {
				fn: function (value)
				{
					if (value.length >= 1000)
					{
						return _('The review field cannot contain more than the maximum number (1000) of characters allowed.').translate(); 
					}
				}
			}
		,	'writer.name': {
				required: true
			,	msg: _('Writer is required').translate()
			}
		}

	,	initialize: function ()
		{
			// We need to set this attributes to the model
			// so they get validated
			this.get('rating_per_attribute') || this.set('rating_per_attribute', {});
			this.get('rating') || this.set('rating', null);
			this.get('writer') || this.set('writer', {});
			this.get('title') || this.set('title', '');
		}

	,	parse: function (response)
		{
			response.rated = JSON.parse(jQuery.cookie('votedReviewsId') || '{}')[response.internalid];
			return response;
		}
	});
});
// ProductReviews.Router.js
// ------------------------
// Handles the rendering of the different views depending on the URL route
define('ProductReviews.Router'
,	['ProductReviews.Model', 'ProductReviews.Collection', 'ProductReviews.Views', 'ItemDetails.Model']
,	function (Model, Collection, Views, ItemDetailsModel)
{
	'use strict';
	
	// http://backbonejs.org/#Router
	return Backbone.Router.extend({

		routes: { 
            'product/:id/newReview': 'createReviewById'
        ,	':url/newReview': 'createReviewByUrl'
		}
		
	,	initialize: function (Application)
		{
			this.application = Application;
		}

	,	createReviewByUrl: function (url)
		{
			// if there are any options in the URL
			if (~url.indexOf('?'))
			{
				url = url.split('?')[0];
			}
			
			// Now go grab the data and show it
			this.createReview({url: url});
		}
	
	,	createReviewById: function (id)
		{
			this.createReview({id: id});
		}
		
		// createReview:
		// renders the Product Reviews form
	,	createReview: function (api_params)
		{
			var item_details_model = new ItemDetailsModel()

			,	model = new Model()
				// creates a new instance of the Form View
			,	view = new Views.Form({
					item: item_details_model
				,	model: model
				,	application: this.application
				});
			
			// then we fetch for the data of the item
			item_details_model.fetch({
				data: api_params
			,	killerId: this.application.killerId
			}).done(function ()
			{
				// and we show the content on success
				view.showContent();
			});
		}
	});
});
// ProductReviews.Views.js
// -----------------------
// Returns an object with Backbone Views as attributes
// http://backbonejs.org/#View
// * Views.ItemReviewCenter: used when listing all of the reviews of an item
// * Views.Form: to create a new ProductReview
// * Views.FormPreview: to show the user how the review is going to look
define('ProductReviews.Views', ['ListHeader'], function (ListHeader)
{
	'use strict';
	
	var Views = {};

	// Based on the item's breadcrumb, we suffix '/reviews'
	function getReviewsBaseBreadcrumb (item)
	{
		var result = item.get('_breadcrumb').slice(0);
		
		// we add the new element to the breadcrumb array
		result.push({
			href: item.get('_url') +'/reviews'
		,	text: _('Reviews').translate()
		});
		
		return result;
	}
	
	// Views.ItemReviewCenter:
	// This view is shown when listing the reviews of an item
	// contains event handlers for voting helpfulness and flaging a review
	Views.ItemReviewCenter = Backbone.View.extend({
		
		template: 'reviews_center_for_item'
		
	,	attributes: {
			'id': 'item-product-reviews'
		,	'class': 'item-product-reviews item-detailed-reviews'
		}
	
	,	events: {
			'click [data-type="vote"]': 'markReview'
		,	'click [data-action="flag"]': 'markReview'
		}
		
	,	initialize: function (options)
		{
			this.item = options.item;
			this.baseUrl = options.baseUrl;
			this.application = options.application;
            this.queryOptions = options.queryOptions;
            
            options.collection.itemId = this.item.get('internalid');
            
            this.setupListHeader(options.collection);
		}
        
    ,	getRelPrev: function ()
		{
			var current_page = this.queryOptions && parseInt(this.queryOptions.page) || 1;

			if (current_page > 1)
			{
				if (current_page === 2)
				{
					return this.baseUrl;
				}

				if (current_page > 2)
				{
					return this.baseUrl + '?page=' + (current_page - 1);
				}
			}

			return null;
		}

	,	getRelNext: function ()
		{
			var current_page = this.queryOptions && this.queryOptions.page || 1;

			if (current_page < this.collection.totalPages)
			{
				return this.baseUrl += '?page='+ (current_page + 1);
			}

			return null;
		}
        
        // creates a new url based on a new filter or sorting options
	,	getUrlForOption: function (option)
		{
			var options = {}
			,	sort = option && option.sort || this.options.queryOptions.sort
			,	filter = option && option.filter || this.options.queryOptions.filter;
			
			if (filter)
			{
				options.filter = filter;
			}

			if (sort)
			{
				options.sort = sort;
			}
            
			return this.baseUrl +'?'+ jQuery.param(options);
		}
    ,   setupListHeader: function (collection)
        {   
            var sorts = _(this.application.getConfig('productReviews.sortOptions')).map(function(sort)
            {
                sort.value = sort.id;
                return sort;
            }); 
            var filters = _(this.application.getConfig('productReviews.filterOptions')).map(function(filter)
            {
                filter.value = filter.id;
                return filter;
            });
			this.listHeader = new ListHeader({
				view: this
			,	application: this.application
			,	collection: collection
			,	sorts: sorts
			,	filters: filters
            ,   avoidFirstFetch: true
            ,   totalCount: this.item.get('_ratingsCount')
			});
            
        }
		
	,	showContent: function ()
		{
			// we set up both title and page_header for the view
			this.title = this.page_header = _('$(0) reviews').translate(this.item.get('_name'));

			this.application.getLayout().showContent(this);
		}
        
    ,   updateCannonicalLinks: function ()
        {
            var $head = jQuery('head')
            ,   previous_page = this.getRelPrev()
            ,   next_page = this.getRelNext();
            
            $head.find('link[rel="next"], link[rel="prev"]').remove();
            
            if (previous_page)
			{
				jQuery('<link/>', {
					rel: 'prev'
				,	href: previous_page
				}).appendTo($head);
			}

			if (next_page)
			{
				jQuery('<link/>', {
					rel: 'next'
				,	href: next_page
				}).appendTo($head);
			}
        }

	,	handleMarkSuccess: function (review_id, action, review, $container)
		{
			var productReviews = this.application.getConfig('productReviews')
			,	currentReviewedItems = JSON.parse(jQuery.cookie('votedReviewsId') || '{}');

			// this should be always false because you cannot mark an already marked review
			if (!currentReviewedItems[review_id])
			{
				currentReviewedItems[review_id] = {};
				currentReviewedItems[review_id][action] = true;
				jQuery.cookie('votedReviewsId', JSON.stringify(currentReviewedItems));
				
				var rated = {};
				rated[action] = true;
				rated.voted = true;
				review.set('rated', rated);
			}

			$container
				// we re-render the macro with the new data
				.html(
					// we use the reviewMacro from the config file
					// we pass the review that was just edited
					// and the configuration options for Product Reviews
					SC.macros[productReviews.reviewMacro](review, _.extend({showActionButtons: true}, productReviews))
				)
				// and we let the user know it all went ok
				.find('[data-type="alert-placeholder"]').html(
					SC.macros.message(_('<b>Thank You!</b> We love your feedback.').translate(), 'success', true)
				);
		}

	,	handleMarkError: function ($container)
		{
			// otherwise we show an error message
			$container
				.find('[data-type="vote"]').removeClass('disabled').end()
				.find('[data-type="alert-placeholder"]').html(
					SC.macros.message(_('<b>We are sorry!</b> There has been an error, please try again later.').translate(), 'error', true )
				);
		}
		// handles the ajax call to vote or flag a review
	,	markReview: function (e)
		{
			var $element = jQuery(e.target);

			if (!$element.hasClass('disabled'))
			{
				var	rated = {}
				,	proxy = jQuery.proxy

				,	action = $element.data('action')
				,	$container = $element.closest('.review-container')

					// we get the review from the collection
				,	review_id = $element.data('review-id')
				,	review = this.collection.get(review_id);

				$element.addClass('disabled');
				
				rated[action] = true;

				// we set the action that we are going to call
				review.set({
					action: action
				,	rated: rated
				});

				// and then we do the save the review
				review.save().then(
					proxy(this.handleMarkSuccess, this, review_id, action, review, $container)
				,	proxy(this.handleMarkError, this, $container)
				);
			}
		}
		
	,	getBreadcrumb: function ()
		{
			return getReviewsBaseBreadcrumb(this.item);
		}
	});
	
	// Views.Form:
	// This view is used to render the Product Review form
	// It handles the rating and submission of the review
	Views.Form = Backbone.View.extend({
		
		template: 'review_form'
		
	,	attributes: {
			'id': 'product-review-form'
		,	'class': 'product-review-form'
		}
		
	,	title: _('Write your Review').translate()
		
	,	page_header: _('Write your Review').translate()
	
	,	events: {
			'rate [data-toggle="rater"]': 'rate'
		,	'submit form#new-product-review': 'preview'
		}
	
	,	initialize: function (options)
		{
			this.item = options.item;
			this.tmpRatingPerAtribute = {};
			this.application = options.application;
			// we let the view know if the customer is logged in
			// as this might be required to add a review
			this.isLoggedIn = options.application.getUser().get('isLoggedIn') === 'T';
			
            this.updateMetaTags();
			
			// if the user is logged in and this is the first time we're initializing the view we preload the nickname
			if (this.isLoggedIn && !(this.model.get('writer') && this.model.get('writer').name))
			{
				this.model.set('writer',{'name':  options.application.getUser().get('firstname') });
			}
		}

	,	showContent: function ()
		{
			if (this.model.get('text'))
			{
				// if the model contains text (if comming from a Preview View)
				// we need to parse all html line breaks into regular ones
				this.model.set('text', this.model.get('text').replace(/<br>/g, '\n'));
			}

			var self = this;

			this.application.getLayout().showContent(this).done(function ()
			{
				// we initialize our custom plugin for rating
				// (file: Bootstrap.Rate.js)
				self.$('[data-toggle="rater"]').rater();
			});
		}
		
		// sets the rating of an attribute in the model
	,	rate: function (e, rater)
		{

			var attributes_to_rate_on = this.item.get('_attributesToRateOn');
			
			// if the name is not in attributes_to_rate_on
			if (~_.indexOf(attributes_to_rate_on, rater.name))
			{
				this.tmpRatingPerAtribute[rater.name] = rater.value;
			}
			else if (rater.name === '__overall__')
			{
				this.tmpRating = rater.value;
				// rate touched is a flag to prevent auto computing the overall rating
				this.rateTouched = true;
			}
			
			if (!this.rateTouched && this.application.getConfig('productReviews.computeOverall'))
			{
				// auto compute the overall rating
				var average = Math.round(_.reduce(_.values(this.tmpRatingPerAtribute), function(memo, num){return memo+num; }, 0) / attributes_to_rate_on.length);
				this.$('[data-toggle="rater"][data-name="__overall__"]').data('rater').setValue(average, true);
				this.model.set('rating', average);
			}
		}

		// method to parse html tags into text
	,	sanitize: function (text)
		{
			return jQuery.trim(text).replace(/</g, '&lt;').replace(/\>/g, '&gt;');
		}
		
		// When the Preview button is clicked
	,	preview: function (e)
		{
			e && e.preventDefault();

			// it sets the Model's text, title and writer
			this.model.set({
				title: this.sanitize(this.$('#title').val())
			,	rating: this.tmpRating || this.model.get('rating')
			,	rating_per_attribute: this.tmpRatingPerAtribute ||  this.model.get('rating_per_attribute')
			,	writer: {name: this.sanitize(this.$('#writer').val())}
			,	text: this.sanitize(this.$('#text').val()).replace(/\n/g, '<br>')
			});

			// Then we show the FormPreview using the same Model
			// Notice: the Model contains the selected rate for the different attributes
			// plus the text, title and writer that were set up right above this comment						
			this.$savingForm = jQuery(e.target).closest('form');
			if (this.model.isValid(true)) {
				new Views.FormPreview(this.options).showContent();
			}
		}
		
	,	getBreadcrumb: function ()
		{
			var result = getReviewsBaseBreadcrumb(this.item);
			
			result.push({
				href: this.item.get('_url') + '/reviews/new'
			,	text: _('Write New').translate()
			});
			
			return result;
		}
    ,   updateMetaTags: function ()
        {
            var $head = jQuery('head');
            
            jQuery('<meta/>', {
					name: 'robots'
				,	content: 'noindex, nofollow'
				}).appendTo($head);
        }
	});
	
	// Views.FormPreview:
	// This view is shown prior to the form's submission
	// Handles both edit and save events
	// * edit renders the form view
	// * save submits the form and renders the confirmation view
	Views.FormPreview = Backbone.View.extend({
		
		template: 'review_form_preview'
		
	,	attributes: {
			'id': 'product-review-form-preview'
		,	'class': 'product-review-form-preview'
		}
		
	,	title: _('Submit your Review').translate()
		
	,	page_header: _('Submit your Review').translate()
	
	,	events: {
			'click [data-action="edit-review"]': 'edit'
		,	'submit form': 'save'
		}
		
	,	initialize: function (options)
		{
			this.item = options.item;
		}
		
		// when the edit button is clicked, we show the Form view
	,	edit: function ()
		{
			new Views.Form(this.options).showContent();
		}
		
	,	save: function (e)
		{
			e && e.preventDefault();
			
			var self = this;
			
			this.model.set('itemid', this.item.get('internalid')).save(null, {
				statusCode: {
					'401': function ()
					{
						// If login is required from the server side
						// we need to handle it here
					}
				}
			}).done(function ()
			{
				// Once the review is submited, we show the Confirmation View
				var preview_review = new Views.FormConfirmation(self.options);
				preview_review.showContent();
			});
		}
		
	,	getBreadcrumb: function ()
		{
			var result = getReviewsBaseBreadcrumb(this.item);
			
			result.push({
				href: this.item.get('_url') + '/reviews/new'
			,	text: _('Preview').translate()
			});
			
			return result;
		}
	});
	
	Views.FormConfirmation = Backbone.View.extend({ 
		
		template: 'review_form_confirmation'
		
	,	attributes: {
			'id': 'product-review-form-confirmation'
		,	'class': 'product-review-form-confirmation'
		}
		
	,	title: _('Thank You! Your review has been submitted.').translate()
		
	,	page_header: _('<b>Thank You!</b> Your review has been submitted.').translate()
	
	,	events: {}
		
	,	initialize: function (options)
		{
			this.item = options.item;
		}
		
	,	getBreadcrumb: function ()
		{
			var result = getReviewsBaseBreadcrumb(this.item);
			
			result.push({
				href: this.item.get('_url') + '/reviews/new'
			,	text: _('Thank you').translate()
			});
			
			return result;
		}
	});
	
	return Views;
});

// Profile.js
// ----------
// Stores all data related to the User
// Has methods to get and set the Recently Viewed Items
define('Profile', ['Facets.Model'], function (FacetsModel)
{
	'use strict';
	
	var Profile = {

		urlRoot: 'services/profile.ss'

	,	addHistoryItem: function(item)
		{
			if (item)
			{
				// If the item is already in the recently viewed, we remove it
				this.recentlyViewedItems.get('items').remove(item);
				
				// we add the item at the beginning of a collection
				this.recentlyViewedItems.get('items').unshift(item);

				if (this.useCookie)
				{
					var current_items = jQuery.cookie('recentlyViewedIds')
					,	news_items = _.union(this.recentlyViewedItems.get('items').pluck('internalid'), current_items);

					jQuery.cookie('recentlyViewedIds', _.first(news_items, this.numberOfItemsDisplayed));
				}
			}
		}

	,	loadItemsFromCookie: function ()
		{
			// create an array of ID items to get only the elements that are present in the cookie but are not present in memory
			var cookie_ids = jQuery.cookie('recentlyViewedIds') || [];
			
			cookie_ids = !_.isArray(cookie_ids) ? [cookie_ids] : cookie_ids;
			
			var	items_ids = _.difference(cookie_ids, this.recentlyViewedItems.get('items').pluck('internalid')).join(',')
			,	self = this;

			if (items_ids)
			{
				//return promise (http://api.jquery.com/promise/)
				return this.facetsModel.fetch({data:{id: items_ids}}, {silent: true}).done(function()
				{
					self.facetsModel.get('items').each(function (model)
					{
						// find the position of the item on the cookie
						var index = _(cookie_ids).indexOf(model.get('_id'));
						// add item to recentlyViewedItems at the position
						self.recentlyViewedItems.get('items').add(model, {at: index});
					});
				});
			}
			
			return jQuery.Deferred().resolve();
		}

	,	renderRecentlyViewedItems: function (view)
		{
			var self = this
			,	$container = view.$('[data-type="recently-viewed-placeholder"]')
			,	macro = SC.macros[$container.data('macro') || 'recentlyViewed'];

			return this.getRecentlyViewedItems().then(function ()
			{
				var items = self.recentlyViewedItems.get('items');
				
				items.remove(items.get(view.model.id));

				$container.html(macro(items.first(self.numberOfItemsDisplayed), view.options.application));

				view.application.getLayout().updateUI();
			});
		}
		
	,	getRecentlyViewedItems: function ()
		{
			return this.useCookie ? this.loadItemsFromCookie() : jQuery.Deferred().resolve();
		}
	};
		
	return {

		Profile: Profile

	,	mountToApp: function (application)
		{
			var handler = function()
			{
				// Sets the getUser function for the application
				_.extend(application.getUser(), Profile, {
					application: application
					// we get this values from the configuration file
				,	useCookie: application.getConfig('recentlyViewedItems.useCookie', false)
					// initialize new instance of Facets Model to use search API
				,	facetsModel: new FacetsModel()
					// initialize the collection of items (empty)
				,	recentlyViewedItems: new FacetsModel().set('items',[])
				,	numberOfItemsDisplayed: application.getConfig('recentlyViewedItems.numberOfItemsDisplayed')
				});
				
				application.getLayout().on('afterAppendView', function (view)
				{
					if (view.$('[data-type="recently-viewed-placeholder"]').length)
					{
						application.getUser().renderRecentlyViewedItems(view);
					}
				});	
			};
			if (application.getUserPromise)
			{
				application.getUserPromise().done(handler); 
			}
			else
			{
				handler();
			}

			
		}
	};
});
// PromoCodeSupport.js
// -------------------
// rewrite touchpoints when set promocode.
define('PromocodeSupport', ['UrlHelper'], function (UrlHelper)
{
	'use strict';

	return {
		mountToApp: function (application)
		{
			// Method defined in file UrlHelper.js
			UrlHelper.addTokenListener('promocode', function (value)
			{
				// Because this is passed from the URL and there might be spaces and special chars,
				// we need to fix this so it does not invalidate our promocode
				if(value)
				{
					value = unescape(value.replaceAll('+',' '));
				}

				// We get the instance of the ShoppingCart and apply the promocode
				// See method "update" of model Cart in file Models.js (ssp library file)
				application.getCart().save({promocode: {code: value}});

				return false;
			});
		}
	};

});

// SiteSearch.js
// -------------
// Defines listeners and methods for the Global Site Search (macro siteSearch.txt)
// Uses Bootstrap's Typeahead plugin
// http://twitter.github.com/bootstrap/javascript.html#typeahead
define('SiteSearch', ['Facets.Translator', 'TypeAhead.Model', 'Session'], function (Translator, Model, Session)
{
	'use strict';

	// SiteSearch.currentSearchOptions() - Returns current search options formatted as query params.
	var currentSearchOptions = function ()
	{
		var newOptions = []
		,	currentOptions = SC.Utils.parseUrlOptions(window.location.href);

		_.each(currentOptions, function (value, key)
		{
			var lowerCaseKey = key.toLowerCase();

			if (lowerCaseKey === 'order' || lowerCaseKey === 'show' ||  lowerCaseKey === 'display')
			{
				newOptions.push(lowerCaseKey + '=' + value);
			}
		});

		var newOptionsStr = newOptions.join('&');

		if (newOptionsStr.length > 0)
		{
			newOptionsStr = '&' + newOptionsStr;
		}

		return newOptionsStr;
	};

	// This object's methods are ment to be added to the layout
	var SiteSearch = {

		// method call on submit of the Search form
		searchEventHandler: function (e)
		{
			e.preventDefault();

			this.$search.find('input').data('typeahead').select();
		}

	,	seeAllEventHandler: function (e, typeahead)
		{
			this.search(typeahead.query);
		}

	,	focusEventHandler: function ()
		{
			this.$search.find('input').typeahead('lookup');
		}

		//SiteSearch.formatKeywords() - format a search query string according to configuration.js (searchPrefs)
	,	formatKeywords: function (app, keywords)
		{
			var keywordFormatter = app.getConfig('searchPrefs.keywordsFormatter');

			if (keywordFormatter && _.isFunction(keywordFormatter))
			{
				keywords = keywordFormatter(keywords);
				var maxLength = app.getConfig('searchPrefs.maxLength') || 99999;
				if (keywords.length > maxLength)
				{
					keywords = keywords.substring(0, maxLength);
				}
			}

			return keywords;
		}

	,	search: function (keywords)
		{
			var currentView = this.currentView;

			keywords = SiteSearch.formatKeywords(this.getApplication(), keywords);

			if (this.getApplication().getConfig('isSearchGlobal') || !(currentView && currentView.options.translator instanceof Translator))
			{
				var search_url = this.getApplication().getConfig('defaultSearchUrl')
				,	delimiters = this.typeaheadConfig.application.Configuration.facetDelimiters
				,	keywordsDelimited = delimiters.betweenFacetsAndOptions + 'keywords' + delimiters.betweenOptionNameAndValue;

				// If we are not in Shopping we have to redirect to it
				if (this.getApplication().getConfig('currentTouchpoint') !== 'home')
				{
					window.location.href = Session.get('touchpoints.home') + '#' + search_url + keywordsDelimited + keywords;
				}
				// Else we stay in the same app
				else
				{
					// We navigate to the default search url passing the keywords
					Backbone.history.navigate(search_url + keywordsDelimited + keywords + currentSearchOptions(), {trigger: true});
					// on any type of search, the search term is removed from the global input box
					this.$search.find('input').val('');
				}

			}
			// if search is not global and we are on the Browse Facet View
			// we might want to use the search to narrow the current list of items
			else
			{
				Backbone.history.navigate(currentView.options.translator.cloneForOption('keywords', keywords).getUrl(), {trigger: true});
			}
		}

	,	processAnchorTags: function (e, typeahead)
		{
			var $anchor, value, item, path, self = this
			,	search_url = this.getApplication().getConfig('defaultSearchUrl');

			typeahead.$menu.find('a').each(function (index, anchor)
			{
				$anchor = jQuery(anchor);
				value = $anchor.parent().data('value');
				item = typeahead.results[value];
				path = item ? item.get('_url') : search_url + '?keywords=' + value.replace('see-all-', '') + currentSearchOptions();

				$anchor
					.attr({'href': path})
					.data({
						touchpoint: 'home'
					,	hashtag: (path.indexOf('/') === 0)  ? path.replace('/', '') : path
					}).click(function ()
					{
						typeahead.$menu.hide();
					});

				// and manually fix the link because it is a touchpoint
				self.getApplication().getLayout().touchpointMousedown({currentTarget: $anchor});
			});

			typeahead.$menu.off('click');
		}

		// typeaheadConfig:
		// methods to customize the user experience of the typeahead
		// http://twitter.github.com/bootstrap/javascript.html#typeahead
		// (important to read the source code of the plugin to fully understand)
	,	typeaheadConfig: {
			// source:
			// trims de query
			// adds the 'see-all' label
			// fetches the data from the model
			// and pre-process it
			source: function (query, process)
			{
				var self = this;
				self.ajaxDone = false;

				this.model = this.model || this.options.model;
				this.labels = this.labels || this.options.labels;
				this.results = this.results || this.options.results;
				this.application = this.application || this.options.application;

				query = SiteSearch.formatKeywords(this.application, jQuery.trim(query));

				// if the character length from the query is over the min length
				if (query.length >= this.options.minLength)
				{
					this.labels = ['see-all-' + query];
					process(this.labels);
				}

				// silent = true makes it invisible to any listener that is waiting for the data to load
				// http://backbonejs.org/#Model-fetch
				// We can use jQuery's .done, as the fetch method returns a promise
				// http://api.jquery.com/deferred.done/
				this.model.fetch(
					{
						data: {
							q: query
						,	sort: this.options.sort
						,	limit: this.options.limit
						,	offset: 0
						}
					,	killerId: _.uniqueId('ajax_killer_')
					}
				,	{
						silent: true
					}
				).done(function ()
				{
					self.ajaxDone = true;
					self.results = {};
					self.labels = ['see-all-' + query];

					self.model.get('items').each(function (item)
					{
						// In some ocations the search term meay not be in the itemid
						self.results[item.get('_id') + query] = item;
						self.labels.push(item.get('_id') + query);
					});

					process(self.labels);
					self.$element.trigger('processed', self);
				});
			}

			// matcher:
			// Method used to match the query within a text
			// we lowercase and trim to be safe
			// returns 0 only if the text doesn't contains the query
		,	matcher: function (text)
			{
				return ~text.indexOf(SiteSearch.formatKeywords(this.application, jQuery.trim(this.query)));
			}

			// highlighter:
			// method to generate the html used in the dropdown box bellow the search input
		,	highlighter: function (itemid)
			{
				var template = ''
				,	macro = this.options.macro
				,	item = this.results[itemid];

				if (item)
				{
					// if we have macro, and the macro exists, we use that for the html
					// otherwise we just highlith the keyword in the item id
					// _.highlightKeyword is in file Utils.js
					template = macro && SC.macros[macro] ? SC.macros[macro](item, this.query, this.application) : _.highlightKeyword(itemid, this.query);
				}
				else
				{
					if (_.size(this.results))
					{
						// 'See All Results' label
						template = '<strong>' + this.options.seeAllLabel + '<span class="hide">' + _(this.query).escape() + '</span></strong>';
					}
					else if (this.ajaxDone)
					{
						template = '<strong>' + this.options.noResultsLabel + '<span class="hide">' + _(this.query).escape() + '</span></strong>';
					}
					else
					{
						template = '<strong>' + this.options.searchingLabel + '<span class="hide">' + _(this.query).escape() + '</span></strong>';
					}
				}

				return template;
			}

			// its supposed to return the selected item
		,	updater: function (itemid)
			{
				var a = this.$menu.find('li[data-value="' + itemid + '"] a')
				,	href = a.attr('href');

				if (href && href !== '#')
				{
					a.trigger('click');
				}
				return '';
			}

		,	labels: []
		,	results: {}
		,	model: new Model()
		,	seeAllLabel: _('See all results').translate()
		,	noResultsLabel: _('No results').translate()
		,	searchingLabel: _('Searching...').translate()
		}
	};

	return {

		SiteSearch: SiteSearch

	,	mountToApp: function (application)
		{
			var Layout = application.getLayout()
			,	config = application.getConfig('typeahead');

			// we add the methods to the layout
			_.extend(Layout, SiteSearch);

			// then we extend the key elements
			_.extend(Layout.key_elements, {search: '#site-search-container'});
			Layout.updateUI();

			// and then the event listeners
			_.extend(Layout.events, {
				'submit #site-search-container form': 'searchEventHandler'
			,	'focus #site-search-container input': 'focusEventHandler'
			,	'seeAll #site-search-container input': 'seeAllEventHandler'
			,	'processed #site-search-container input': 'processAnchorTags'
			});

			Model.mountToApp(application);
			// We extend the previously defined typeaheadConfig
			// with options from the configuration file
			SiteSearch.typeaheadConfig = _.extend(SiteSearch.typeaheadConfig, {
				application: application
			,	minLength: config.minLength
			,	items: config.maxResults + 1
			,	macro: config.macro
			,	limit: config.maxResults
			,	sort: config.sort
			});

			Layout.on('afterRender', function ()
			{
				// after the layout has be rendered, we initialize the plugin
				Layout.$search.find('input').typeahead(SiteSearch.typeaheadConfig);
			});
		}
	};
});

// TypeAhead.Model.js
// ---------------
// Connects to the search api to get the minimal information of the items to show on the typeahead of the search
// A Model Contains a Collection of items and the list of facet groups with its values
define('TypeAhead.Model', ['ItemDetails.Collection', 'Session'], function (ItemDetailsCollection, Session)
{
	'use strict';

	var original_fetch = Backbone.CachedModel.prototype.fetch;

	return Backbone.CachedModel.extend({
		
		url: function()
		{
			var url = _.addParamsToUrl(
				'/api/items'
			,	_.extend(
					{}
				,	this.searchApiMasterOptions
				,	Session.getSearchApiParams()
				)
			);
			
			return url;
		}

	,	initialize: function ()
		{
			// Listen to the change event of the items and converts it to an ItemDetailsCollection
			this.on('change:items', function (model, items)
			{
				if (!(items instanceof ItemDetailsCollection))
				{
					// NOTE: Compact is used to filter null values from response
					model.set('items', new ItemDetailsCollection(_.compact(items)));
				}
			});
		}

		// model.fetch
		// -----------
		// We need to make sure that the cache is set to true, so we wrap it
	,	fetch: function (options)
		{
			options = options || {};

			options.cache = true;

			return original_fetch.apply(this, arguments);
		}

	}, {
		mountToApp: function (application) 
		{
			// sets default options for the search api
			this.prototype.searchApiMasterOptions = application.getConfig('searchApiMasterOptions.typeAhead');
		}
	});
});
// SocialSharing.js
// ----------------
// Provides standalone social sharing icons
// Handles the integration with ShareThis

/*global FB:true*/

define('SocialSharing', ['ItemDetails.View', 'Facets.Views'], function (ItemDetailsView, FacetsViews)
{
	/*jshint validthis:true*/
	'use strict';

	var facebook_script_loaded = false
	,	addthis_script_loaded = false; 

	// getSocialAttributes:
	// get Social attributes from the dom
	function getSocialAttributes (dom_selectors)
	{
		var result = {url: document.location.href};
		
		// we extend dom_selectors with some default selectors
		// if already defined, they don't get overriden
		dom_selectors = _.extend({
			description: '[data-type="social-description"]'
		,	images: '[data-type="social-image"]'
		,	image: '[data-type="lead-social-image"]'
		}, dom_selectors);
		
		// Looks for the description in the dom
		if (this.$(dom_selectors.description).length)
		{
			result.description = jQuery.trim(this.$(dom_selectors.description).text());
		}
		
		// Some social media services support several images
		if (this.$(dom_selectors.images).length)
		{
			result.images = _.map(this.$(dom_selectors.images), function ()
			{
				return this.src;
			});
		}
		
		// You can allways set a lead image
		if (this.$(dom_selectors.image).length)
		{
			result.image = this.$(dom_selectors.image).get(0).src;
		}
		// if there is none, we try to get the first one from images
		else if (result.images && result.images.length)
		{
			result.image = result.images[0];
		}
		
		return result;
	}
	
	// getPopupOptionsStringFromObject:
	// {translates: "this", to: ""} to translates=this,to=
	function getPopupOptionsStringFromObject (popup_options)
	{
		var popup_options_string = '';
		
		_.each(popup_options, function (value, name)
		{
			popup_options_string += ','+ name +'='+ value;
		});

		// the substring is to get rid of the leading coma
		return popup_options_string.substring(1);
	}
	
	// shareInMouseoverPinItButtonEventListener
	function shareInMouseoverPinItButtonEventListener (e)
	{
		e.preventDefault();

		if (this.getApplication().getConfig('hover_pin_it_button.enable_pin_it_hover')) {
			jQuery('.pin-it-link').remove();

			// button hover pin-it-link
			// hidden-phone hidden-tablet because of the interaction on desktop with hover (phone and tablet always hidden)
			jQuery('[data-share-hover-pint-it-button="true"] img')
				.after('<a class="pin-it-link hidden-phone hidden-tablet" data-share-click-pint-it-button="true"></a>');
		}
	}
	
	// shareInClickPinItButton: 
	// opens a new window to share the page in Pintrest
	// based on some configuration options
	function shareInClickPinItButton (url, image, title)
	{
		var popup_options_string = getPopupOptionsStringFromObject(this.getConfig('hover_pin_it_button.popupOptions'))
		,	target_url = 'http://pinterest.com/pin/create/button/?url=' + encodeURIComponent(url) + '&media=' + encodeURIComponent(image) + '&description=' + encodeURIComponent(title);
		
		window.open(target_url, _.uniqueId('window'), popup_options_string );
	}
	
	// shareInClickPinItButtonEventListener:
	// calls shareInClickPinItButton method passing the configuration options
	function shareInClickPinItButtonEventListener (e)
	{
		e.preventDefault();
		if (!this.getApplication().getConfig('hover_pin_it_button.enable_pin_it_hover') && !this.getApplication().getConfig('hover_pin_it_button.enable_pin_it_button'))
		{
			return;
		}

		var self = this
		,	image_size = self.getApplication().getConfig('hover_pin_it_button').image_size
		,	metaTagMappingOg = self.getApplication().getConfig('metaTagMappingOg')
		,	url = metaTagMappingOg['og:url'](self, 'pinterest')
		,	image = jQuery('a.bx-pager-link.active').find('img').attr('src') // selected image
		,	title = metaTagMappingOg['og:title'](self, 'pinterest');

		if (!image){
			image = jQuery('.item-detailed-image').find('img').attr('src');
		}

		image = self.getApplication().resizeImage(image.split('?')[0], image_size);

		self.getApplication().shareInClickPinItButton(url, image, title);
	}
	
	// shareInPinterest:
	// opens a new window to share the page in Pinterest
	// based on some configuration options
	function shareInPinterest (url, image, description, popup_options)
	{
		var popup_options_string = getPopupOptionsStringFromObject(popup_options || this.getConfig('pinterest.popupOptions'))

		,	target_url = 'http://pinterest.com/pin/create/button/?url=' + encodeURIComponent(url) + '&media=' + encodeURIComponent(image) + '&description=' + encodeURIComponent(description);
		
		window.open(target_url, _.uniqueId('window'), popup_options_string );
	}
	
	// shareInPinterestEventListener:
	// calls shareInPinterest method passing the configuration options
	function shareInPinterestEventListener (e)
	{
		e.preventDefault();
		
		var metaTagMappingOg = this.getApplication().getConfig('metaTagMappingOg')
		,	url = metaTagMappingOg['og:url'](this, 'pinterest')
		,	image = metaTagMappingOg['og:image'](this, 'pinterest')
		,	description = metaTagMappingOg['og:description'](this, 'pinterest');
		
		this.Application.shareInPinterest(url, image, description);
	}
	
	// shareInTwitter:
	// opens a new window to share the page in Twitter
	// based on some configuration options
	function shareInTwitter (url, description, via, popup_options)
	{
		var popup_options_string = getPopupOptionsStringFromObject(popup_options || this.getConfig('twitter.popupOptions'))
		,	target_url = 'https://twitter.com/intent/tweet?original_referer='+ encodeURIComponent(url) +'&source=tweetbutton&text='+ encodeURIComponent(description) +'&url='+ encodeURIComponent(url) +'&via='+ encodeURIComponent(via);
		
		window.open(target_url, _.uniqueId('window'), popup_options_string);
	}
	
	// shareInTwitterEventListener: 
	// calls shareInTwitter method passing the configuration options
	function shareInTwitterEventListener (e)
	{
		e.preventDefault();

		var metaTagMappingOg = this.getApplication().getConfig('metaTagMappingOg')
		,	url = metaTagMappingOg['og:url'](this, 'twitter')
		,	title = metaTagMappingOg['og:title'](this, 'twitter')
		,	via = this.getApplication().getConfig('twitter.via').replace('@', '');
		
		this.Application.shareInTwitter(url, title, via);
	}
	
	// refreshFacebookElements:
	// re-writes the DOM of the facebook elements
	function refreshFacebookElements ()
	{
		var buttons = this.$('[data-toggle="like-in-facebook"]'); 

		// don't make any calculations if there are no placeholders or facebook is not enabled.
		if (!buttons.size() || typeof FB === 'undefined')
		{
			return;
		}
		var	metaTagMappingOg = this.getApplication().getConfig('metaTagMappingOg')
		,	pluginOptions = this.getApplication().getConfig('facebook.pluginOptions')
		,	url = metaTagMappingOg['og:url'](this, 'facebook');
		
		buttons.empty();
		
		var attr = {
			'href': url
		,	'data-href': url
		};
		
		_.each(pluginOptions, function (value, name)
		{
			attr['data-'+ name] = value;
		});
		
		buttons.attr(attr).addClass('fb-like');
		
		FB.XFBML.parse();
	}
	// shareInGooglePlus: 
	// opens a new window to share the page in Google+
	// based on some configuration options
	function shareInGooglePlus (url, popup_options)
	{
		var popup_options_string = getPopupOptionsStringFromObject(popup_options || this.getConfig('googlePlus.popupOptions'))
		,	target_url = 'https://plus.google.com/share?url=' + encodeURIComponent(url);
		
		window.open(target_url, _.uniqueId('window'), popup_options_string );
	}
	
	//  shareInGooglePlusEventListener: 
	// calls shareInGooglePlus method passing the configuration options
	function shareInGooglePlusEventListener (e)
	{
		e.preventDefault();
		var metaTagMappingOg = this.getApplication().getConfig('metaTagMappingOg')
		,	url = metaTagMappingOg['og:url'](this, 'google-plus');
		
		this.Application.shareInGooglePlus(url);
	}
	
	/**
	 * setMetaTags: Based on the meta tags config, 
	 */
	function setMetaTags ()
	{
		var self = this
		,	application = this.getApplication()
		,	current_view = application.getLayout().currentView
		,	meta_tag_mapping_og = application.getConfig('metaTagMappingOg')
		,	meta_tag_mapping_twitter_product_card = application.getConfig('metaTagMappingTwitterProductCard')
		,	meta_tag_mapping_twitter_gallery_card = application.getConfig('metaTagMappingTwitterGalleryCard')
		,	link_tag_google_plus_authorship = application.getConfig('linkTagGooglePlusAuthorship');

		// Clear meta tags if required
		clearMetaTagsByConfiguration(meta_tag_mapping_og);
		clearMetaTagsByConfiguration(meta_tag_mapping_twitter_product_card);
		clearMetaTagsByConfiguration(meta_tag_mapping_twitter_gallery_card);
		

		if (current_view instanceof ItemDetailsView)
		{
			// Set meta tags for ItemDetailsView
			setMetaTagsByConfiguration(self, meta_tag_mapping_og);
			setMetaTagsByConfiguration(self, meta_tag_mapping_twitter_product_card);
		}
		else if (current_view instanceof FacetsViews.Browse)
		{
			// Set meta tags for FacetsViews.Browse
			setMetaTagsByConfiguration(self, meta_tag_mapping_twitter_gallery_card);
		}

		// In all pages clear/set Google Plus authorship
		clearLinkTagsByConfiguration(self, link_tag_google_plus_authorship);
		setLinkTagsByConfiguration(self, link_tag_google_plus_authorship);
	}

	/**
	 * setMetaTagsByConfiguration:
	 */
	function setMetaTagsByConfiguration (self, meta_tag_configuration)
	{
		_.each(meta_tag_configuration, function (fn, name)
		{
			var content = fn(self);

			jQuery('<meta />', {
				name: name
			,	content: content || ''
			}).appendTo(jQuery('head'));
		});
	}

	/**
	 * setLinTagsByConfiguration:
	 */
	function setLinkTagsByConfiguration (self, link_tag_configuration)
	{
		_.each(link_tag_configuration, function (fn, rel)
		{
			var href = fn(self);

			if (href)
			{
				jQuery('<link />', {
					rel: rel
				,	href: href
				}).appendTo(jQuery('head'));
			}
		});
	}

	/**
	 * clearMetaTagsByConfiguration
	 */
	function clearMetaTagsByConfiguration (meta_tag_configuration)
	{
		var meta_tag;

		_.each(meta_tag_configuration, function (fn, name)
		{
			meta_tag = jQuery('meta[name="' + name + '"]');
			meta_tag && meta_tag.remove();
		});
	}

	/**
	 * clearLinkTagsByConfiguration
	 */
	function clearLinkTagsByConfiguration (self, link_tag_configuration)
	{
		var link_tag;

		_.each(link_tag_configuration, function (fn, rel)
		{
			if (fn(self))
			{
				link_tag = jQuery('link[rel="' + rel + '"]');
				link_tag && link_tag.remove();
			}
		});
	}
	
	// refreshAddThisElements
	// The plugin of "Add this" expects a very strict html and a function of their plugin
	//  needs to be called every time a new page is displayed, we do this here
	function refreshAddThisElements ()
	{	
		if (!window.addthis || !jQuery('[data-toggle="share-in-add-this"]').size())
		{
			return;
		}

		var Configuration = this.getApplication().getConfig()
		,	metaTagMappingOg = this.getApplication().getConfig('metaTagMappingOg')
		,	innerHTML = '';

		_.each(Configuration.addThis.servicesToShow, function (name, code)
		{
			innerHTML += '<a class="addthis_button_'+code+'">'+ name +'</a>';
		});
		
		var share_options = {
			url: metaTagMappingOg['og:url'](this, 'add-this')
		,	title: metaTagMappingOg['og:title'](this, 'add-this')
		,	description: metaTagMappingOg['og:description'](this, 'add-this')
		};
		
		jQuery('[data-toggle="share-in-add-this"]').each(function ()
		{
			if (this)
			{
				var $this = jQuery(this);
				$this.html(innerHTML).addClass(Configuration.addThis.toolboxClass);
				window.addthis.toolbox(this, Configuration.addThis.options, share_options);
			}
		});
	}
	
	var social_sharing = {
		setMetaTags: setMetaTags
	,	refreshAddThisElements: refreshAddThisElements
	,	shareInMouseoverPinItButtonEventListener: shareInMouseoverPinItButtonEventListener
	,	mountToApp: function (Application)
		{
			var Layout = Application.getLayout()
			,	Configuration = Application.getConfig();
						
			// This functions could be triggered by anyone, so we put them in the app level
			_.extend(Application, {
				shareInClickPinItButton: shareInClickPinItButton
			,	shareInPinterest: shareInPinterest
			,	shareInTwitter: shareInTwitter
			,	shareInGooglePlus: shareInGooglePlus
			});
			
			// This are mostly related to the dom, or to events, so we add them in the layout
			_.extend(Layout, {
				getSocialAttributes: getSocialAttributes
			,	shareInMouseoverPinItButtonEventListener: shareInMouseoverPinItButtonEventListener
			,	shareInClickPinItButtonEventListener: shareInClickPinItButtonEventListener
			,	shareInPinterestEventListener: shareInPinterestEventListener
			,	shareInTwitterEventListener: shareInTwitterEventListener
			,	refreshFacebookElements: refreshFacebookElements
			,	shareInGooglePlusEventListener: shareInGooglePlusEventListener
			,	setMetaTags: setMetaTags
			,	refreshAddThisElements: refreshAddThisElements
			});
			
			// add event listeners
			Layout.delegateEvents({
				'click [data-toggle=share-in-pinterest]': 'shareInPinterestEventListener'
			,	'click [data-toggle=share-in-twitter]': 'shareInTwitterEventListener'
			,	'click [data-toggle=share-in-google-plus]': 'shareInGooglePlusEventListener'
			});

			// extend Layout and add event listeners
			_.extend(Layout.events, {
				'mouseover [data-share-hover-pint-it-button="true"]': 'shareInMouseoverPinItButtonEventListener'
			,	'click [data-share-click-pint-it-button="true"]': 'shareInClickPinItButtonEventListener'
			});
			
			Layout.on('afterAppendView', function ()
			{
				// Everytime a new view is appended, if you have placed an element with 
				// data-toggle=social-share-icons attribute we will render the macro here
				this.$('[data-toggle="social-share-icons"]').each(function (index, element)
				{
					jQuery(element).html(SC.macros[Configuration.socialSharingIconsMacro](Configuration));
				});
				
				// check if facebook script isn't already loaded and if there is an actual placeholder on where to load it
				if (!facebook_script_loaded && Configuration.facebook.enable && jQuery('[data-toggle="like-in-facebook"]').size())
				{
					var facebook_script_url = ('https:' === document.location.protocol ? 'https://' : 'http://') + 'connect.facebook.net/en_US/all.js#xfbml=1&appId='+ Configuration.facebook.appId; 
					// avoid on SEO and start facebook library
					(SC.ENVIRONMENT.jsEnvironment === 'browser') && jQuery.getScript(facebook_script_url, function ()
					{
						if (typeof FB !== 'undefined')
						{
							facebook_script_loaded = true;
							FB.init();
							Layout.refreshFacebookElements();
						}
					});
				}

				// check if addthis script isn't already loaded and if there is an actual placeholder on where to load it
				if (!addthis_script_loaded && Configuration.addThis.enable && jQuery('[data-toggle="share-in-add-this"]').size())
				{
					var addthis_script_url = ('https:' === document.location.protocol ? 'https://' : 'http://') + 's7.addthis.com/js/300/addthis_widget.js#domready=1';
					// avoid on SEO and start addthis library
					(SC.ENVIRONMENT.jsEnvironment === 'browser') && jQuery.getScript(addthis_script_url, function ()
					{
						addthis_script_loaded = true;
						Layout.refreshAddThisElements();
					});
				}
				
				// Then Facebook and addthis plugins are called
				Layout.refreshFacebookElements();
				Layout.refreshAddThisElements();
				
				// Then we set the meta tags
				Layout.setMetaTags();
			});

		}
	};

	return social_sharing;
});

// Session.js
// -------------
// 
define('Session', function ()
{
	'use strict';

	return {

		get: function(path, default_value)
		{
			return _.getPathFromObject(SC.getSessionInfo(), path, default_value);
		}

	,	set: function(path, value)
		{
			SC.getSessionInfo()[path] = value;
		}

	,	getSearchApiParams: function()
		{
			var search_api_params = {};

			// Locale
			var locale = this.get('language.locale', '');
			if (~locale.indexOf('_'))
			{
				var locale_tokens = locale.split('_');
				search_api_params.language = locale_tokens[0];
				search_api_params.country = locale_tokens[1];
			}
			else
			{
				search_api_params.language = locale;
			}

			// Currency
			search_api_params.currency = this.get('currency.code', '');

			// Price Level
			search_api_params.pricelevel = this.get('priceLevel', '');

			// No cache
			if (_.parseUrlOptions(location.search).nocache === 'T')
			{
				search_api_params.nocache = 'T';
			}

			return search_api_params;
		}

	};

});

// UrlHelper.js
// ------------
// Keeps track of the URL, triggering custom events to specific parameters
// Provides moethods to add, get and remove parameters from the url
// Extends SC.Utils and add this methods to underscore
define('UrlHelper', function ()
{
	'use strict';
	
	var UrlHelper = {

		url : ''
	,	listeners : {}
	,	parameters : {}

	,	setUrl: function (url)
		{
			var self = this;

			this.url = url;
			this.parameters = {};

			// for each of the listeners
			_.each(this.listeners, function (fn, token)
			{
				var parameter_value = self.getParameterValue(token);

				// if the key (token) is in the url
				if (parameter_value)
				{
					// we trigger the function
					var value = _.isFunction(fn) ? fn(parameter_value) : fn;

					// if there is a value, we store it in our parameters object
					if (value)
					{
						if (_.isBoolean(value))
						{
							self.parameters[token] = parameter_value;
						}
						else
						{
							self.parameters[token] = value;
						}
					}
				}
			});
		}

	,	addTokenListener: function (token, fn)
		{
			this.listeners[token] = fn;
		}

	,	getParameters: function ()
		{
			return this.parameters;
		}

	,	getParameterValue: function (parameter)
		{
			var value = this.url.match(parameter +'{1}\\={1}(.*?[^&#]*)');
			
			if (value && value[1])
			{
				return value[1];
			}
			else
			{
				return '';
			}
		}

	,	clearValues: function ()
		{
			this.url = '';
			this.listeners = {};
			this.parameters = {};
		}
	};

	function fixUrl (url)
	{
		if (!new RegExp('^http').test(url))
		{
			var parameters = UrlHelper.getParameters()
			,	charValue = ''
			,	value = '';

			// for each of the parameters in the helper
			_.each(parameters, function (i, parameter)
			{
				value = url.match(new RegExp(parameter +'{1}\\={1}(.*?[^&]*)'));

				// if the parameter is not in the url
				if (!value)
				{
					charValue = ~url.indexOf('?') ? '&' : '?';
					// we append it
					url += charValue + parameter +'='+ parameters[parameter];
				}
			});
		}

		return url;
	}

	// changes the value of a parameter in the url
	function setUrlParameter(url, parameter, new_value)
	{
		var value = url.match(new RegExp(parameter + '{1}\\={1}(.*?[^(&|#)]*)'))
		,	charValue = '';

		if (value)
		{
			return url.replace(value[0], parameter +'='+ new_value);
		}
		else
		{
			charValue = ~url.indexOf('?') ? '&' : '?';

			return url + charValue + parameter +'='+  new_value;
		}
	}

	function removeUrlParameter(url, parameter)
	{
		var value = url.match(new RegExp('(\\?|&)' + parameter + '{1}\\={1}(.*?[^(&|#)]*)'));

		if (value)
		{
			if (~value[0].indexOf('?') && ~url.indexOf('&'))
			{
				return url.replace(value[0] +'&', '?');
			}
			else
			{
				return url.replace(value[0], '');
			}
		}
		else
		{
			return url;
		}
	}

	_.extend(SC.Utils, {
		fixUrl: fixUrl
	,	setUrlParameter: setUrlParameter
	,	removeUrlParameter: removeUrlParameter
	});

	// http://underscorejs.org/#mixin
	_.mixin(SC.Utils);
	
	return _.extend(UrlHelper, {

		mountToApp: function (Application)
		{
			var self = this;

			Application.getLayout().on('afterAppendView', function ()
			{
				// Every time afterAppendView is called, we set the url to the helper
				self.setUrl(window.location.href);
			});
		}
	});
});
// ListHeader:
// View used to manipulate a collection
// by adding sorting and filtering capabilities
// based on the sort and filter options from the collection
define('ListHeader',  function ()
{
	'use strict';

	//Class and instance methods definition
	var ListHeader = Backbone.View.extend({

		template: 'list_header'

	,	events: {
			'change [data-action="filter"]': 'filterHandler'
		,	'change [data-action="sort"]': 'sortHandler'
		,	'click [data-action="toggle-sort"]': 'toggleSortHandler'
		,	'change [data-action="select-all"]': 'selectAll'
		,	'change [data-action="unselect-all"]': 'unselectAll'
		,	'change [data-action="range-filter"]': 'rangeFilterHandler'
		,	'click [data-action="toggle-filters"]': 'toggleFilters'
		}

	,	initialize: function (options)
		{
			var view = options.view;

			_.extend(this, options);

            // true only if the module using list header is the one responsible of fetching the collection for the first time (optional)
            this.avoidFirstFetch = options.avoidFirstFetch;

            // the original count of items of the collection without filtering (optional)
            this.totalCount = options.totalCount;

			// store the range (date) filter options
			this.rangeFilterOptions = view.rangeFilterOptions || {};

			// Label for range filter (optional)
			this.rangeFilterLabel = options.rangeFilterLabel;

			// after the parent view is rendered
			view.on('afterViewRender', jQuery.proxy(this, 'appendToView'));

			// default value of filter collapse
			this.expandedStatePath = this.view.className ? this.view.className + '.expanded' : 'state.expanded';
			ListHeader.setPersistedState(this.expandedStatePath, ListHeader.getPersistedState(this.expandedStatePath, false));
		}

	,	toggleFilters: function (e)
		{
			e.preventDefault();
			var current_target = jQuery(e.currentTarget)
			,	filter_icon = current_target.find('.filter-icon')
			,	is_expanded = ListHeader.getPersistedState(this.expandedStatePath, false);

			is_expanded ? filter_icon.addClass('icon-chevron-down').removeClass('icon-chevron-up') : filter_icon.removeClass('icon-chevron-down').addClass('icon-chevron-up');
			ListHeader.setPersistedState(this.expandedStatePath, !is_expanded);

			current_target.parents('[data-type="accordion"]')
				.toggleClass('well')
				.toggleClass('facet-header-white-well')
				.find('[data-type="accordion-body"]').stop().slideToggle();
		}

	,	getExpanded: function ()
		{
			return ListHeader.getPersistedState(this.expandedStatePath, false);
		}

	,	appendToView: function (view)
		{
			var $place_holder = view.$el.find('[data-type="list-header-placeholder"]');

			// we render the ListHeader view
			this.render();

			// prepend it to the parent
			this.$el.prependTo($place_holder.length ? $place_holder : view.$el);
			// and add the event listeners
			this.delegateEvents();
		}

		//returns the initial date range to apply
	,	getInitialDateRange: function (url_range)
		{
			if (this.rangeFilter)
			{
				var date_range_fromUrl = this.getRangeFromUrl(url_range);

				if (date_range_fromUrl.from || date_range_fromUrl.to)
				{
					// By doing this, I can be sure I'm not entering out of range values in the filter input fields.
					// However, if invalid values are entered, they are not considered for filtering.
					this.validateDateRange(date_range_fromUrl);

					return date_range_fromUrl;
				}
				else
				{
					var quantityDays = this.notUseDefaultDateRange ?
										this.quantityDaysRange :
										this.application.getConfig('filterRangeQuantityDays');

					if (quantityDays) {
						var from = new Date()
						,	to =  new Date();

						from.setDate(from.getDate() - quantityDays);

						return {
							from: _.dateToString(from)
						,	to: _.dateToString(to)
						};
					}
				}
			}
		}

		//Returns the number of unselected items
	,	getUnselectedLength: function ()
		{
			return this.collection.filter(function (record)
			{
				return !record.get('checked');
			}).length;
		}

		//Returns the length of the current collection. This is a function so it can be overriden be any client of the list header
	,	getCollectionLength: function ()
		{
			return this.collection.length;
		}

	,	setSelecteds: function ()
		{
			var url_options = _.parseUrlOptions(Backbone.history.fragment);

			this.selectedFilter = this.getFilterFromUrl(url_options.filter);
			this.selectedRange = this.getInitialDateRange(url_options.range);
			this.selectedSort = this.getSortFromUrl(url_options.sort);
			this.order = this.getOrderFromUrl(url_options.order);
			this.page = this.getPageFromUrl(url_options.page);

			this.selectedDisplay = this.getDisplayFromUrl(url_options.display);
		}

		// when rendering we need to check
		// if there are options already set up in the url
	,	render: function ()
		{
            // if there are no items in the collection, avoid rendering the list header
            if(this.totalCount === 0)
            {
                return;
            }

			if (!this.selectedFilter && !this.selectedSort && !this.order && !this.selectedRange && !this.selectedDisplay)
			{
				this.setSelecteds();

                // after we set the current status
				// we update the collection
                if(!this.avoidFirstFetch)
                {
                    this.updateCollection();
                }
			}

			return this._render();
		}

		// updateCollection:
		// the collection used by the view MUST have an update method
		// this method is going to be called whenever a sort/filter value changes
	,	updateCollection: function ()
		{
			var range = null
			,	collection = this.collection;

			if (this.selectedRange) {
				range = {
					from: this.selectedRange.from
				,	to: this.selectedRange.to
				};
			}

			collection.update && collection.update({
				filter: this.selectedFilter
			,	range: range
			,	sort: this.selectedSort
			,	order: this.order
			,	page: this.page
			,	killerId: this.application.killerId
			}, this);

			return this;
		}

		// returns a specific filter
	,	getFilter: function (value)
		{
			return _(this.filters).find(function (filter)
			{
				return _.isFunction(filter.value) ?
					filter.value.apply(this.view) === value :
					filter.value === value;
			}, this);
		}

		// returns a specific sort
	,	getSort: function (value)
		{
			return _.findWhere(this.sorts, {
				value: value
			});
		}

		// returns a specific display
	,	getDisplay: function (value)
		{
			return _.findWhere(this.displays, {
				id: value
			});
		}

		// retuns the selected filter from the url
		// or the default filter if no value set up
	,	getFilterFromUrl: function (url_value)
		{
			return this.getFilter(url_value) || this.getDefaultFilter();
		}

	,	getRangeFromUrl: function (url_value)
		{
			var split = url_value ? url_value.split('to') : [];

			return {
				from: split[0]
			,	to: split[1]
			};
		}

		// returns the selected sort from the url
		// or the default sort if no value set up
	,	getSortFromUrl: function (url_value)
		{
			return this.getSort(url_value) || this.getDefaultSort();
		}

		// returns the selected order from the url
		// this could be inverse or nothing
	,	getOrderFromUrl: function (url_value)
		{
			return url_value === 'inverse' ? -1 : 1;
		}

		// Retrieve current selected display option or 'list' by default
	,	getDisplayFromUrl: function (url_value)
		{
			return this.getDisplay(url_value) || this.getDefaultDisplay();
		}

	,	getPageFromUrl: function (url_value)
		{
			var page_number = parseInt(url_value, 10);

			return !isNaN(page_number) && page_number > 0 ? page_number : 1;
		}

	,	pager: function (url_value)
		{
			var page_number = parseInt(url_value, 10)
			,	url = Backbone.history.fragment;

			return isNaN(page_number) || page_number === 1 ? _.removeUrlParameter(url, 'page') : _.setUrlParameter(url, 'page', page_number);
		}

	,	displayer: function (display_option)
		{
			var url = Backbone.history.fragment;

			return display_option === this.getDefaultDisplay().id ? _.removeUrlParameter(url, 'display') : _.setUrlParameter(url, 'display', display_option);
		}

		// if there's already a default filter, return that
		// otherwise find the one selected on the filter list
	,	getDefaultFilter: function ()
		{
			return this.defaultFilter || (this.defaultFilter = _.findWhere(this.filters, {selected: true}) || _.first(this.filters));
		}

		// if there's already a default sort, return that
		// otherwise find the one selected on the sort list
	,	getDefaultSort: function ()
		{
			return this.defaultSort || (this.defaultSort = _.findWhere(this.sorts, {selected: true}) || _.first(this.sorts));
		}

	,	getDefaultDisplay: function ()
		{
			return this.defaultDisplay || (this.defaultDisplay = _.findWhere(this.displays, {selected: true}) || _.first(this.displays));
		}

	,	isDefaultFilter: function (filter)
		{
			return this.getDefaultFilter() === filter;
		}

	,	isDefaultSort: function (sort)
		{
			return this.getDefaultSort() === sort;
		}

	,	isDefaultDisplay: function (display)
		{
			return this.getDefaultDisplay() === display;
		}

		// method called when dom dropdown change
	,	filterHandler: function (e)
		{
			// unselect all elements
			this.unselectAll({
				silent: true
			});
			// sets the selected filter
			this.selectedFilter = this.getFilter(e.target.value);
			// updates the url and the collection
			this.updateUrl();
		}

		// method called when dom dropdown change
	,	sortHandler: function (e)
		{
			// sets the selected sort
			this.selectedSort = this.getSort(e.target.value);
			// updates the url and the collection
			this.updateUrl();
		}

		// method called when dom button clicked
	,	toggleSortHandler: function ()
		{
			// toggles the selected order
			this.order *= -1;
			// updates the url and the collection
			this.updateUrl();
		}

		// selects all in collection
	,	selectAll: function ()
		{
			if ('selectAll' in this.view)
			{
				this.view.selectAll();
			}

			return this;
		}

		// unselects in collection
	,	unselectAll: function (options)
		{
			if ('unselectAll' in this.view)
			{
				this.view.unselectAll(options);
			}

			return this;
		}

	,	rangeFilterHandler: _.throttle(function ()
		{
			var selected_range = this.selectedRange
			,	$ranges = this.$('[data-action="range-filter"]');

			$ranges.each(function ()
			{
				if (this.value)
				{
					selected_range[this.name] = this.value;
				}
				else
				{
					delete selected_range[this.name];
				}
			});

			if (this.validateDateRange(selected_range))
			{
				// updates the url and the collection
				this.updateUrl();
			}
			else
			{
				this.showError(_('Invalid date format.').translate());
			}

			return this;
		}, 2500, {leading:false})

	,	validateDateRange: function (selected_range)
		{
			var options = this.rangeFilterOptions
			,	is_valid = true
			,	to = new Date(selected_range.to)
			,	from = new Date(selected_range.from)
			,	toMin = new Date(options.toMin)
			,	toMax = new Date(options.toMax)
			,	fromMin = new Date(options.fromMin)
			,	fromMax = new Date(options.fromMax);

			if (options.toMin && _.isDateValid(toMin) && _.isDateValid(to) && to.getTime() < toMin.getTime())
			{
				selected_range.to = options.toMin;
			}
			else if (!selected_range.to || (options.toMax && _.isDateValid(toMax) && _.isDateValid(to) && to.getTime() > toMax.getTime()))
			{
				selected_range.to = options.toMax;
			}

			if (!selected_range.from || (options.fromMin && _.isDateValid(fromMin) && _.isDateValid(from) && from.getTime() < fromMin.getTime()))
			{
				selected_range.from = options.fromMin;
			}
			else if (options.fromMax && _.isDateValid(fromMax) && _.isDateValid(from) && from.getTime() > fromMax.getTime())
			{
				selected_range.from = options.fromMax;
			}

			if (selected_range.to && !_.isDateValid(_.stringToDate(selected_range.to)))
			{
				is_valid = false;

				delete selected_range.to;
			}

			if (selected_range.from && !_.isDateValid(_.stringToDate(selected_range.from)))
			{
				is_valid = false;

				delete selected_range.from;
			}

			return is_valid;
		}

	,	updateUrl: function ()
		{
			var url = Backbone.history.fragment;
			// if the selected filter is the default one
			//   remove the filter parameter
			// else change it for the selected value
			url = this.isDefaultFilter(this.selectedFilter) ?
				_.removeUrlParameter(url, 'filter') :
				_.setUrlParameter(url, 'filter', _.isFunction(this.selectedFilter.value) ? this.selectedFilter.value.apply(this.view) : this.selectedFilter.value);
			// if the selected sort is the default one
			//   remove the sort parameter
			// else change it for the selected value
			url = this.isDefaultSort(this.selectedSort) ? _.removeUrlParameter(url, 'sort') : _.setUrlParameter(url, 'sort', this.selectedSort.value);
			// if the selected order is the default one
			//   remove the order parameter
			// else change it for the selected value
			url = this.order === 1 ? _.removeUrlParameter(url, 'order') : _.setUrlParameter(url, 'order', 'inverse');
			// if range from and range to are set up
			//   change them in the url
			// else remove the parameter
			if (this.selectedRange)
			{
				url = this.selectedRange.from && this.selectedRange.to ? _.setUrlParameter(url, 'range', this.selectedRange.from + 'to' + this.selectedRange.to) : _.removeUrlParameter(url, 'range');
			}

			url = _.removeUrlParameter(url, 'page');
			this.page = 1;

			// just go there already, but warn no one
			Backbone.history.navigate(url, {trigger: false});

			return this.updateCollection();
		}
	});

	//Class methods definition (statis methods)
	ListHeader = _.extend(ListHeader,
	{
		//Allow save STATICALY any value to be shared by all ListHeader instances
		setPersistedState: function (path, value)
		{
			return _.setPathFromObject(this.state = this.state || {}, path, value);
		}
		//Allow get STATICALY any value to be shared by all ListHeader instances
	,	getPersistedState: function (path, default_value)
		{
			return _.getPathFromObject(this.state = this.state || {}, path, default_value);
		}
	});

	return ListHeader;
});

// ProductList.Collection.js
// -----------------------
// Product List collection
define('ProductList.Collection', ['ProductList.Model'], function (Model)
{
	'use strict';

	return Backbone.Collection.extend({

		url: _.getAbsoluteUrl('services/product-list.ss')

	,	model: Model

		// Filter based on the iterator and return a collection of the same type
	,	filtered: function(iterator) {
			return new this.constructor(this.filter(iterator));
		}
	});
});
// ProductList.js
// -----------------
// Defines the ProductList module (Model, Views, Router). 
define('ProductList',
['ProductListControl.Views', 'ProductListDetails.View', 'ProductList.Collection','ProductList.Model','ProductListItem.Collection','ProductListItem.Model', 'ProductList.Router','ProductListDeletion.View', 'ProductListCreation.View', 'ProductListLists.View'],
function (ProductListControlViews, ProductListDetailsView, ProductListCollection, ProductListModel, ProductListItemCollection, ProductListItemModel, ProductListRouter, ProductListDeleteView, ProductListCreateView, ProductListListsView)
{
	'use strict';

	// ProductLists myaccount's menu items. This is a good example of dynamic-multilevel myaccount's menuitems definition.
	var productlists_dummy_menuitems = function(application) 
	{
		if (!application.ProductListModule.isProductListEnabled()) 
		{
			return undefined;
		}

		return {
			id: 'product_list_dummy'
		,	name: application.ProductListModule.isSingleList() ? _('Loading list...').translate() : _('Loading lists...').translate()
		,	url: ''
		,	index: 2
		};
	}; 

	// Call only when promise was resolved!
	var productlists_menuitems = function(application)
	{
		if (!application.ProductListModule.isProductListEnabled())
		{
			return undefined;
		}

		var product_lists = application.getProductLists()
		,	actual_object = {

			id: function (application)
			{
				// Returns the correct id of the list in the case of single list and 'productlists' otherwise.
				var is_single_list = application.ProductListModule.isSingleList();

				if (is_single_list) 
				{
					var the_single_list = product_lists.at(0);
					
					// Check if it's a predefined list before return
					return 'productlist_' + (the_single_list.get('internalid') ? the_single_list.get('internalid') : ('tmpl_' + the_single_list.get('templateid')));
				}
				else
				{
					return 'productlists';
				}
			}
		,	name: function (application)
			{
				// The name of the first list in the case of single list or generic 'Product Lists' otherwise
				return application.ProductListModule.isSingleList() ? 
					product_lists.at(0).get('name') :
					_('Product Lists').translate();
			}
		,	url: function (application)
			{				
				// Returns a link to the list in the case of single list and no link otherwise.
				var is_single_list = application.ProductListModule.isSingleList(); 
				if(is_single_list) 
				{
					var the_single_list = product_lists.at(0); 
					return 'productlist/' + (the_single_list.get('internalid') ? the_single_list.get('internalid') : ('tmpl_' + the_single_list.get('templateid'))); 
				}
				else 
				{
					return ''; 
				}
			}
			// Index of the menu item for menu order
		,	index: 2
			// Sub-menu items
		,	children: function (application) 
			{
				// If it's single list, there is no sub-menu
				if (application.ProductListModule.isSingleList())
				{
					return [];
				}
				// The first item (if not single list) has to be a link to the landing page
				var items = [
					{
						id: 'productlist_all'
					,	name: _('All my lists').translate()
					,	url: 'productlists/?'
					,	index: 1
					}
				];
				// Then add all the lists
				product_lists.each(function (productlist)
				{
					items.push({
						id: 'productlist_' + (productlist.get('internalid') || 'tmpl_' + productlist.get('templateid'))
					,	url: 'productlist/' + (productlist.get('internalid') || 'tmpl_' + productlist.get('templateid'))
					,	name: productlist.get('name') + '&nbsp;(' + productlist.get('items').length + ')'
					,	index: 2
					}); 
				});

				return items; 
			}
		}; 

		return actual_object;
	};

	// Encapsulate all product list elements into a single module to be mounted to the application
	// Update: Keep the application reference within the function once its mounted into the application
	var ProductListModule = function()
	{
		var app = {};
		// this application will render some of its views in existing DOM elements (placeholders)
		var placeholder = {
			control: '[data-type="product-lists-control"]'
		};

		var views = {
				Control: ProductListControlViews
			,	Details: ProductListDetailsView
			,	NewList: ProductListCreateView
			,	Lists: ProductListListsView
			,	Delete: ProductListDeleteView
			}
		,	models = {
				ProductList: ProductListModel
			,	ProductListItem: ProductListItemModel
			}
		,	collections = {
				ProductList: ProductListCollection
			,	ProductListItem: ProductListItemCollection
			};

		// is the Product-List functionality available for this application?
		var isProductListEnabled = function () 
		{
			var application = app;

			return application.getConfig('product_lists') !== undefined;
		};

		// are we in the single-list modality ? 
		var isSingleList = function ()
		{
			var application = app;

			return !application.getConfig('product_lists.additionEnabled') && 
				application.getConfig('product_lists.list_templates') && 
				_.filter(application.getConfig('product_lists.list_templates'), function (pl) { return !pl.type || pl.type.name !== 'later'; }).length === 1 ;
		};

		var mountToApp = function (application)
		{
			app = application;

			// Loads Product Lists collection model singleton
			application.getProductListsPromise = function ()
			{
				if (!application.productListsInstancePromise)
				{
					application.productListsInstancePromise = jQuery.Deferred();
					application.productListsInstance = new ProductListCollection();
					application.productListsInstance.application = application;
					application.productListsInstance.fetch().done(function(jsonCollection) 
					{
						application.productListsInstance.set(jsonCollection);						
						application.productListsInstancePromise.resolve(application.productListsInstance);
					});
				}

				return application.productListsInstancePromise;
			};

			application.getProductLists = function ()
			{
				if (!application.productListsInstance)
				{
					application.productListsInstance = new ProductListCollection();
					application.productListsInstance.application = application;
				}

				return application.productListsInstance;
			};

			// obtain a single ProductList with all its item's data
			application.getProductList = function (id)
			{
				var productList = new ProductListModel();

				productList.set('internalid', id);
				
				return productList.fetch();
			};

			// obtain a single Saved for Later ProductList with all its item's data
			application.getSavedForLaterProductList = function ()
			{
				var productList = new ProductListModel();

				productList.set('internalid', 'later');
				
				return productList.fetch();
			};

			// Application.ProductListModule - reference to this module
			application.ProductListModule = ProductListModule;

			application.getUserPromise().done(function () 
			{
				if (SC.ENVIRONMENT.PRODUCTLISTS_CONFIG)
				{
					application.Configuration.product_lists = SC.ENVIRONMENT.PRODUCTLISTS_CONFIG;
				}

				// if Product Lists are not enabled, return...
				if (application.ProductListModule.isProductListEnabled())
				{
					var layout = application.getLayout();

					// rendering product lists
					application.ProductListModule.renderProductLists();
					
					layout.on('afterAppendView', function (view)
					{
						application.ProductListModule.renderProductLists(view);	
					});

					layout.on('afterAppendToDom', function ()
					{
						application.ProductListModule.renderProductLists();
					});

					// Put this code block outside afterAppendView to avoid infinite loop!
					application.getProductListsPromise().done(function()
					{
						// Replace dummy menu item from My Account
						layout.replaceMenuItem && layout.replaceMenuItem(function (menuitem)
						{
							return menuitem && menuitem.id === 'product_list_dummy';
						}, productlists_menuitems);

						layout.updateMenuItemsUI && layout.updateMenuItemsUI();

						if (application.ProductListModule.isSingleList())
						{
							// Update header profile link for single product list...
							var the_single_list = application.getProductLists().at(0)
							,	product_list_menu_item = layout.$('.header-profile-single-productlist');

							if (the_single_list && product_list_menu_item)
							{
								var product_list_hashtag = '#productlist/' + (the_single_list.get('internalid') ? the_single_list.get('internalid') : ('tmpl_' + the_single_list.get('templateid')));							
								
								product_list_menu_item.text(the_single_list.get('name'));
								product_list_menu_item.attr('data-hashtag', product_list_hashtag);

								layout.updateUI();
							}
						}						
					});

					ProductListItemModel.prototype.keyMapping = application.getConfig('itemKeyMapping', {});
					ProductListItemModel.prototype.itemOptionsConfig = application.getConfig('itemOptions', []);
				}
			});

			// always start our router.
			return new ProductListRouter(application);
		};

		// renders the control used in shopping pdp and quickview
		var renderControl = function (view_)
		{	
			var application = app;

			jQuery(placeholder.control).each(function()
			{
				var view = view_ || application.getLayout().currentView
				,	is_single_list_mode = application.ProductListModule.isSingleList()
				,	$container = jQuery(this);

				application.getProductListsPromise().done(function()
				{
					// this control needs a reference to the StoreItem model !
					if (view && view.model && view.model.getPosibleOptions)
					{
						var control = null;

						if (is_single_list_mode)
						{
							control = new ProductListControlViews.ControlSingle({
								collection: application.getProductLists()
							,	product: view.model
							,	application: application
							});
						}
						else 
						{
							control = new ProductListControlViews.Control({
								collection: application.getProductLists()
							,	product: view.model
							,	application: application
							});
						}

						$container.empty().append(control.$el);
						control.render();
					}
				});

				if (application.getProductListsPromise().state() === 'pending')
				{
					$container.empty().append('<button class="btn">' + is_single_list_mode ? _('Loading List...').translate() : _('Loading Lists...').translate() + '</button>');
				}
			}); 
		};

		// render all product-lists related widgets
		var renderProductLists = function (view)
		{	
			var application = app;

			if (!application.ProductListModule.isProductListEnabled())
			{
				return;
			}

			//global variable with the customer internalid. 
			SC.ENVIRONMENT.customer_internalid = application.getUser().get('internalid'); 

			application.ProductListModule.renderControl(view);
		};

		// Gets the internal product id for a store item considering it could be a matrix child. 
		var internalGetProductId = function (product)
		{
			// If its matrix its expected that only 1 item is selected, not more than one nor 0 
			if (product.getPosibleOptions().length)
			{
				var selected_options = product.getSelectedMatrixChilds();

				if (selected_options.length === 1)
				{
					return selected_options[0].get('internalid') + '';
				}
			}

			return product.get('_id') + '';
		};

		return {
			Views : views
		,	Models: models
		,	Collections: collections
		,	Router: ProductListRouter
		,	isProductListEnabled: isProductListEnabled
		,	isSingleList: isSingleList
		,	mountToApp: mountToApp
		,	renderControl: renderControl
		,	renderProductLists: renderProductLists
		,	internalGetProductId: internalGetProductId
		,	placeholder: placeholder
		,	MenuItems: productlists_dummy_menuitems
		};

	}();

	return ProductListModule;
});

// ProductLists.Model.js 
// -----------------------
// Model for handling Product Lists (CRUD)
define('ProductList.Model',['ProductListItem.Collection'], function (ProductListItemCollection)
{
	'use strict';

	function validateLength (value, name)
	{
		var max_length = 300;

		if (value && value.length > max_length)
		{
			return _('$(0) must be at most $(1) characters').translate(name, max_length);
		}
	}

	function validateName (value, name)
	{
		if (!value)
		{
			return _('Name is required').translate();
		}

		return validateLength(value, name);
	}

	return Backbone.Model.extend(
	{
		urlRoot: _.getAbsoluteUrl('services/product-list.ss')

	,	defaults : {
			name: ''
		,	description: ''
		,	items : new ProductListItemCollection()
		,	scope : {id: '2', name: 'private'}
		,	type : {id: '1', name: 'default'}
		}

	,	validation:
		{
			name: { fn: validateName }

		,	description: { fn: validateLength }
		}

		// redefine url to avoid possible cache problems from browser
	,	url: function()
		{
			var base_url = Backbone.Model.prototype.url.apply(this, arguments);
			
			return base_url + '&t=' + new Date().getTime();
		}

	,	initialize: function (data)
		{
			var collection;

			if (data && data.items)
			{
				collection = new ProductListItemCollection(data.items);
			}
			else
			{
				collection = new ProductListItemCollection([]);
			}
			
			this.set('items', collection);			
		}

		// Returns true if an item with id: pli_to_add_id and options: pli_to_add_options is already in this product list. Options could be empty.
	,	checked: function (item_to_add_id, item_to_add_options)
		{
			return this.get('items').some(function (pli)
			{			
				if (pli.item.internalid === item_to_add_id)
				{
					var pli_options = pli.get('options');
					
					if (_.isEmpty(pli_options) && _.isEmpty(item_to_add_options))
					{
						return true;
					}
					else
					{
						return _.isEqual(pli_options, item_to_add_options);
					}					
				}

				return false;
			});
		}

		// Returns all the items which are out of stock.
	,	getOutOfStockItems: function(items_to_check)
		{
			var items = !_.isUndefined(items_to_check) ? items_to_check : this.get('items');

			return items.filter(function(product_list_item) 
			{
				return !product_list_item.get('item').ispurchasable; 
			});			
		}

		// Returns all the items which do not fulfill minimum quantity requirements.
	,	getNotPurchasableItemsDueToMinimumQuantity: function(items_to_check)
		{
			var items = !_.isUndefined(items_to_check) ? items_to_check : this.get('items');

			return items.filter(function(product_list_item) 
			{
				return !product_list_item.fulfillsMinimumQuantityRequirement();
			});
		}

		// Returns true if at least one item is checked.
	,	someCheckedItemsExist: function()
		{
			return this.get('items').some(function(product_list_item)
			{
				return product_list_item.get('checked');
			});
		}

		// Returns true if the the items in the product list can be added to the cart by the following conditions:
		// 1.- Items > 0
		// 2.- No out of stock items
		// 3.- No items which do not fulfill minimum quantity items
		// only_checked_items determines if we are considering only checked items.
	,	canBeAddedToCart: function(only_checked_items)
		{
			var items = !_.isUndefined(only_checked_items) ? this.get('items').filter(function (product_list_item) {
				return product_list_item.get('checked');
			}) : this.get('items');
			
			return items.length && this.getOutOfStockItems(items).length === 0 && this.getNotPurchasableItemsDueToMinimumQuantity(items).length === 0;
		}
	});
});
// CreditCard.Router.js
// -----------------------
// Router for handling Product lists 
define('ProductList.Router', ['ProductList.Model'], function (ProductListModel)
{
	'use strict';

	return Backbone.Router.extend({

		routes: 
		{
			'productlists': 'showProductListsList'
		,	'productlists/?*options': 'showProductListsList'
		,	'productlist/:id': 'showProductListDetails'
		,	'productlist/:id/?*options': 'showProductListDetails'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}

		// resolve the Product list details routes that can be of form /productlist/$(internalid) or 
		// /productlist/tmpl_$(templateid) in the case the record doesn't exist yet (predefined lists)
	,	showProductListDetails: function (id, options)
		{
			var prefix = 'tmpl_'
			,	self = this
			,	index_of_question = id.indexOf('?')
			,	internalid;

			if (index_of_question !== -1)
			{
				options = id.substring(index_of_question);
				internalid = parseInt(id, 10);

				if (!isNaN(internalid))
				{
					id = internalid + '';
				}
			}

			if (id.indexOf(prefix) === 0)
			{ 
				// then this is a predefined template that doesn't exist yet (without internalid)
				var template_id = id.substring(prefix.length, index_of_question !== -1 ? index_of_question : id.length)
				,	product_lists_promise = self.application.getProductLists().fetch();

				product_lists_promise.done(function() 
				{
					var template = self.application.getProductLists().findWhere({templateid: template_id});
					
					self.doShowProductListDetails(template, options);
				});
			}
			else
			{
				self.application.getProductList(id).done(function(model) 
				{
					self.doShowProductListDetails(new ProductListModel(model), options);
				});
			}
		}

		// Render the product list details view
	,	doShowProductListDetails: function(model, options)
		{
			var params_options = _.parseUrlOptions(options)
			,	view = new this.application.ProductListModule.Views.Details({
				application: this.application
			,	params: params_options
			,	model: model
			,	includeSortingFilteringHeader: true
			});

			view.showContent('productlist_' + (model.get('internalid') ? model.get('internalid') : 'tmpl_' + model.get('templateid')));
		}

		// Render the product lists landing page
	,	showProductListsList: function (options)
		{
			var self = this;

			this.application.getProductListsPromise().done(function ()
			{				
				var params_options = _.parseUrlOptions(options)
				,	view = new self.application.ProductListModule.Views.Lists({
						application: self.application
					,	params: params_options
					,	collection: self.application.getProductLists()
					});

				view.showContent('productlist_all');
			});
		}
	});
});

// ProductList.Views.js
// -----------------------
// Views for handling Product Lists (CRUD)
define('ProductListAddedToCart.View', function ()
{
	'use strict';

	return Backbone.View.extend({
		
		template: 'product_list_added_to_cart'
		
	,	attributes: {'class': 'product-list-added-to-cart' }
		
	,	title: _('Added to Cart').translate()

	,	initialize: function (options)
		{						
			this.options = options;
			this.application = options.application;
		}

		// Render the view and show warning message if any item is not available to be added to the cart
	,	render: function ()
		{
			Backbone.View.prototype.render.apply(this);

			var list = this.options.list
			,	not_purchasable_items_count = this.options.not_purchasable_items_count;

			if (list && not_purchasable_items_count > 0)
			{
				var warning_message = not_purchasable_items_count === 1 ? _('One item not available for purchase was not added to the cart.').translate() : _('$(0) items not available for purchase were not added to the cart.').translate(not_purchasable_items_count);

				this.showWarningMessage(warning_message);
			}			
		}

	,	showWarningMessage: function (message)
		{
			this.$('[data-warning-message]').empty().append(message);
		}

	});

});

// ProductListControl.Views.js
// -----------------------
// The Control view that let the user add an item to a list from the pdp or quickview. 
// It supports 1) the single list experience and 2) the move item functionality.
define('ProductListControl.Views',['ProductList.Model','ProductListItem.Collection', 'Session'], function (ProductListModel, ProductListItemCollection, Session)
{
	'use strict';

	var Views = {};

	// The main control view
	Views.Control = Backbone.View.extend({
		
		template: 'product_list_control'
		
	,	attributes: {'class': 'dropdown product-lists'}

	,	events:
		{
				'click [data-type="show-new-list"]': 'showNewProductList'
			,	'click [data-action="show-productlist-control"]' : 'toggleProductListControl'
		}

	,	initialize: function (options)
		{
			this.product = options.product;
			this.collection = options.collection;
			this.application = options.application;
			this.moveOptions = options.moveOptions;

			if (this.moveOptions)
			{
				this.mode = 'move';
			}
			
			// need to hide the menu (data-type="productlist-control") when clicked outside, so we register here a click handler on the document.: 
			jQuery(document).click(function(event)
			{
				if (jQuery(event.target).parents().index(jQuery(event.target).closest('[data-type^="productlist-control"]')) === -1 && jQuery(event.target).attr('class') && jQuery(event.target).attr('class').indexOf('productlist-control') === -1)
				{
					if(jQuery('[data-type="productlist-control"]').is(':visible'))
					{
						var $control = jQuery('[data-type="productlist-control"]');
						
						// return the control to its initial state
						$control.find('form[data-type="add-new-list-form"]').hide();
						$control.find('[data-type="show-add-new-list-form"]').show();

						$control.slideUp();
					}
				}
			});
		}

		// Render the control view, appending the items views and add new list form
	,	render: function ()
		{
			// if the control is currently visible then we remember that !
			this.is_visible =  this.$('[data-type="productlist-control"]').is(':visible');			
			
			Backbone.View.prototype.render.apply(this);
			
			var self = this;

			self.collection.each(function (model)
			{
				var view = new Views.ControlItem({
					model: model
				,	product: self.product
				,	application : self.application
				,	parentView: self
				});

				self.$('ul').prepend(view.render().el);
			});

			var new_product_list_model = this.getNewProductListModel()
			,	new_item_view = new Views.ControlNewItem({
					model: new_product_list_model
				,	application : self.application
				,	parentView: self
				});
			
			self.$('[data-type="new-item-container"]').html(new_item_view.render().el);

			// we don't want to disable the control button for guest users because we want to send them to login page on click
			if (this.application.getUser().get('isLoggedIn') === 'T' && !self.isReadyForList())
			{
				self.$('[data-action="show-productlist-control"]').attr('disabled', 'true');
			}
			
			// also we don't want to erase any previous confirmation messages
			self.confirm_message && self.saveAndShowConfirmationMessage(self.confirm_message);
		}

		// This method is overridden in POS.
	,	getNewProductListModel: function ()
		{
			return new ProductListModel();
		}

		// Show/Hide the control
	,	toggleProductListControl: function(e)
		{
			if (this.mode === 'move')
			{
				e && e.stopPropagation();
			}
			
			// Check if the user is logged in
			if (!this.validateLogin())
			{
				return;
			}

			var $control = this.$('[data-type="productlist-control"]');

			if ($control.is(':visible'))
			{				
				// return the control to its initial state
				$control.find('form[data-type="add-new-list-form"]').hide();
				$control.find('[data-type="show-add-new-list-form"]').show();

				$control.slideUp();
			}
			else
			{
				// When in move mode, hide any other instance of the product list control in the page before sliding down.
				if (this.mode === 'move')
				{
					jQuery('[data-type="productlist-control"]').hide();
				}				

				$control.slideDown();
			}
		}

		// if the user is not logged in we redirect it to login page and then back to the PDP. 
	,	validateLogin: function ()
		{
			if (this.application.getUser().get('isLoggedIn') === 'F')
			{
				var login = Session.get('touchpoints.login');
				
				login += '&origin=' + this.application.getConfig('currentTouchpoint');

				if (this.$el.closest('.modal-product-detail').size() > 0) //we are in the quick view
				{
					var hashtag = this.$el.closest('.modal-product-detail').find('[data-name="view-full-details"]').data('hashtag');
					login += '&origin_hash=' + hashtag.replace('#/', '');
				}
				else
				{
					login += '&origin_hash=' + Backbone.history.fragment;
				}
							
				window.location.href = login;
				
				return false;
			}

			return true;
		}

		// validates the passed gift cert item and return false and render an error message if invalid. 
	,	validateGiftCertificate: function (item) 
		{
			if (item.itemOptions && item.itemOptions.GIFTCERTRECIPIENTEMAIL)
			{
				if (!Backbone.Validation.patterns.email.test(item.itemOptions.GIFTCERTRECIPIENTEMAIL.label))
				{
					this.render(); //for unchecking the just checked checkbox
					this.showError(_('Recipient email is invalid').translate());
					
					return false;
				}
			}
			return true;
		}

	,	getItemOptions: function (itemOptions)
		{
			var result = {};

			_.each(itemOptions, function (value, name)
			{
				result[name] = { value: value.internalid, displayvalue: value.label };
			});

			return result;
		}

		// Adds the product to the newly created list, renders the control and shows a confirmation msg
	,	addNewProductToList: function (newList)
		{
			this.addItemToList(this.product, newList, true);
			this.saveAndShowConfirmationMessage(
				this.$('.ul-product-lists [type="checkbox"]:checked').size() > 1 ?
					_('Good! You added this item to your product lists').translate() :
					_('Good! You added this item to your product list').translate()
			);
		}

		// Add a new product list item into a product list
	,	addItemToList: function (product, productList, dontShowMessage)
		{
			if (!this.validateGiftCertificate(this.product))
			{
				return;
			}

			var self = this;

			if (!productList.get('internalid')) //this is a predefined list
			{
				productList.save().done(function(data)
				{
					var new_model = new ProductListModel(data); 

					self.application.getProductLists().add(new_model, {merge: true});
					self.doAddItemToList(product, new_model, dontShowMessage);
				});
			}
			else
			{
				self.doAddItemToList(product, productList, dontShowMessage);
			}
		}

		// This method is overridden in POS
	,	getNewItemData: function (product, productList)
		{
			return {
					description: ''
				,	options: this.getItemOptions(product.itemOptions)
				,	quantity: product.get('quantity')
				,	productList: {
						id: productList.get('internalid')
					,	owner: productList.get('owner').id
					}
				,	item: {
						internalid: this.getProductId(product)
					}
			};
		}

		// Adds the new item to the collection
	,	doAddItemToList: function (product, productList, dontShowMessage)
		{
			var self = this
			,	product_list_item = this.getNewItemData(product, productList);

			productList.get('items').create(product_list_item, {
				success: function ()
				{
					self.collection.trigger('changed');
					self.render();

					if (!dontShowMessage)
					{
						self.saveAndShowConfirmationMessage(
							self.$('.ul-product-lists [type="checkbox"]:checked').size() > 1 ?
								_('Good! You added this item to your product lists').translate() :
								_('Good! You added this item to your product list').translate()
						);
					}
				}
			});
		}

		// Check for predefined list before moving
	,	moveProductHandler: function (destination)
		{
			var self = this;

			if (!destination.get('internalid')) //this is a predefined list
			{
				destination.save().done(function(data)
				{
					var new_product_list = new ProductListModel(data);
				
					self.application.getProductLists().add(new_product_list, {merge: true});
					self.moveProduct(new_product_list);
				});
			}
			else
			{
				self.application.getProductLists().add(destination, {merge: true});
				self.moveProduct(destination);
			}
		}

		// Moves the item to the destination list
	,	moveProduct: function (destination)
		{
			var self = this
			,	original_item = this.moveOptions.productListItem
			,	original_item_clone = original_item.clone()
			,	details_view = this.moveOptions.parentView;

			original_item_clone.set('productList', {
				id: destination.get('internalid')
			});

			self.toggleProductListControl();

			destination.get('items').create(original_item_clone,
			{
				success: function (saved_model)
				{
					var app = details_view.application
					,	from_list = self.application.getProductLists().findWhere({internalid: self.moveOptions.parentView.model.get('internalid') })
					,	to_list = self.application.getProductLists().findWhere({internalid: destination.get('internalid')});

					self.doMoveProduct(from_list, to_list, original_item, saved_model);

					details_view.model.get('items').remove(original_item);
					details_view.render();
					
					app.getLayout().updateMenuItemsUI();
					app.getLayout().currentView.showConfirmationMessage(
						_('Good! You successfully moved the item from this to $(0)').
							translate('<a href="/productlist/' + destination.get('internalid') + '">' + destination.get('name') + '</a>')
					);					
				}
			});
		}

		// Adds the item clone to the destination list and removes the original from its list
	,	doMoveProduct: function (from, to, original_model, saved_model)
		{
			// if add not defined, create the collection
			if (to.get('items') instanceof Array)
			{
				to.set('items', new ProductListItemCollection());
			}
			
			// add the item to the application collection
			to.get('items').add(saved_model);
			
			from.get('items').remove(original_model);
			this.collection.trigger('changed');
		}

		// Gets the internal product id for a store item considering it could be a matrix child.
	,	getProductId: function (product)
		{
			if (this.application.ProductListModule)
			{
				return this.application.ProductListModule.internalGetProductId(product);
			}
			else
			{
				return product.get('_id') + '';
			}
		}

		// Determines if the control is visible
	,	isAvailable: function ()
		{
			//if you want to disable the product list experience you instead can return: this.application.getUser().get('isLoggedIn') === 'T';
			return true;
		}

		// Determines if the control should be enabled or not. This default behavior is that any item can be added
		// to a list no matter if it is purchasable. Also it will be enabled for guest users in which case it will 
		// redirect the user to the login page. The only condition is that matrix item has to have the options selected. 
	,	isReadyForList: function ()
		{
			return this.mode === 'move' || this.product.isSelectionComplete();
			// if you want to add only purchasable products to a product list then you can change the above with: 
			// return this.product.isReadyForCart();
		}

		// Shows the create new product list form
	,	showNewProductList: function (e)
		{
			var link = jQuery(e.target);

			link.siblings('[data-type="add-new-list-form"]').show();
			link.hide();
			this.$('[data-type="new-product-list-name"]').focus();
		}

		// Renders a confirmation message storing message parameter and also stores the message
	,	saveAndShowConfirmationMessage: function (message)
		{
			this.confirm_message = message;
			
			this.showConfirmationMessage(this.confirm_message);
		}

		// Hides the confirmation message
	,	hideConfirmationMessage: function()
		{
			this.confirm_message = null;
			this.$('[data-confirm-message]').hide();
		}
	});
	
	// ControlItem
	// Sub View that represents an item and a checkbox in the control
	Views.ControlItem = Backbone.View.extend({

		tagName: 'li'
		
	,	template: 'product_list_control_item'

	,	events: {
			'click [data-action="product-list-item"]' : 'pListItemHandler'
		}

	,	initialize: function (options)
		{
			this.model = options.model;
			this.product = options.product;
			this.application = options.application;
			this.parentView = options.parentView;
		}

		// Determines if an item is checked if the item belongs the list
		// Whilst on move mode, returns always false
	,	checked: function ()
		{
			return this.parentView.mode !== 'move' ? this.model.checked(this.parentView.getProductId(this.product), this.parentView.getItemOptions(this.product.itemOptions)) : false;
		}

		// if move mode enabled, move the item, if not, an item is added/removed from a list
	,	pListItemHandler: function (e)
		{
			var self = this
			,	checkbox = jQuery(e.target);

			if (self.parentView.mode === 'move')
			{
				self.moveProduct();
			}
			else
			{
				self.addRemoveProduct(checkbox);
			}
		}

		// Moves an item to another list
	,	moveProduct: function ()
		{
			this.parentView.moveProductHandler(this.model);
		}

		// Adds/removes an item from a list
	,	addRemoveProduct: function ($checkbox)
		{
			if ($checkbox.is(':checked'))
			{
				// add to list
				this.parentView.addItemToList(this.product, this.model);
			}
			else
			{
				// remove from list
				this.removeItemFromList(this.product);
			}
		}

		// Remove a product list item from the product list
	,	removeItemFromList: function (product)
		{
			var self = this
			,	product_id = this.parentView.getProductId(product)
			,	product_item = self.model.get('items').find(function (item)
				{
					return parseInt(item.get('item').internalid, 10) === parseInt(product_id, 10);
				});

			if (product_item)
			{
				product_item.set('productList', {
					id: self.model.get('internalid')
				,	owner: self.model.get('owner').id
				});
				this.model.get('items').remove(product_item);

				product_item.destroy().done(function ()
				{
					self.model.collection.trigger('changed');
					self.parentView.render();
					self.parentView.hideConfirmationMessage();
				}); 
			}
			else
			{
				self.parentView.render();
			}
		}
	});

	// ControlNewItem
	// Sub View that shows the create new list form
	Views.ControlNewItem = Backbone.View.extend({

		tagName: 'div'

	,	template: 'product_list_control_new_pl'

	,	events: {
			'click [data-action="create-and-move"]': 'saveForm'
		,	'click [data-type="show-add-new-list-form"]' : 'showNewListForm'
		}

	,	initialize : function (options)
		{
			this.application = options.application;
			this.model = options.model;
			this.parentView = options.parentView;
		}

		// Handle save new product list form postback 
	,	saveForm: function ()
		{
			if (!this.parentView.validateGiftCertificate(this.parentView.product))
			{
				return;
			}
			var self = this;

			Backbone.View.prototype.saveForm.apply(this, arguments).done(function ()
			{
				var new_product_list = self.model
				,	parent_view = self.parentView;

				new_product_list.set('items', new ProductListItemCollection(new_product_list.get('items')));
				
				// add the product list item
				if (parent_view.mode === 'move')
				{
					// create new list
					parent_view.moveProductHandler(new_product_list);
					parent_view.collection.add(self.model, {merge: true});
				}
				else
				{
					parent_view.collection.add(new_product_list);
					parent_view.addNewProductToList(new_product_list);
				}
			});
		}

		// Shows the create new list form
	,	showNewListForm: function (e)
		{
			e && e.stopPropagation();
			var $el = jQuery(this.el);
			var new_list_form = $el.find('form[data-type="add-new-list-form"]');
			
			if (new_list_form)
			{
				new_list_form.show();
				this.$('[data-type="new-product-list-name"]').focus();
				$el.find(e.target).hide();
			}
		}

	});

	// ControlSingle
	// Control view for single list mode. @extends Views.Control. 
	Views.ControlSingle = Backbone.View.extend({
		
		template: 'product_list_control_single'
		
	,	attributes: {'class': 'product-lists-single'}

	,	events: {
			'click [data-type="add-product-to-single-list"]': 'addItemToSingleList'
		}

	,	addItemToList: Views.Control.prototype.addItemToList

	,	doAddItemToList: Views.Control.prototype.doAddItemToList

	,	saveAndShowConfirmationMessage: Views.Control.prototype.saveAndShowConfirmationMessage

	,	isReadyForList: Views.Control.prototype.isReadyForList

	,	validateGiftCertificate: Views.Control.prototype.validateGiftCertificate

	,	getItemOptions: Views.Control.prototype.getItemOptions
	
	,	validateLogin: Views.Control.prototype.validateLogin

	,	getProductId: Views.Control.prototype.getProductId

	,	initialize: function (options)
		{
			this.product = options.product;
			this.collection = options.collection;
			this.application = options.application;

			// single list
			this.single_list = this.collection.at(0);
		}

	,	render: function ()
		{
			Backbone.View.prototype.render.apply(this);

			// for guest user we want to enable the button and send the user to the login page
			// for non guest users we want to disable the button if the product is not yet ready for list
			if (!this.isReadyForList())
			{
				this.$('[data-type="add-product-to-single-list"]').attr('disabled', 'true');
			}
		}

		// Get list internal ids
	,	getProductsInternalid: function()
		{
			return _(this.single_list.get('items').models).map(function (item)
			{
				return item.get('item').internalid;
			});
		}

		// Before adding item to the list, checks for not created predefined list
	,	addItemToSingleList: function(e)
		{			
			if (!this.validateLogin())
			{
				return;
			}

			var self = this;

			e.preventDefault();

			// Check if predefined list was not created yet
			if (!self.single_list.get('internalid'))
			{
				self.single_list.save().done(function () {
					self.single_list.set('items', new ProductListItemCollection([])); 
					self.renderAfterAdded(self);
				});
			}
			else
			{
				self.renderAfterAdded(self);
			}
		}

		// Adds the item to the list
	,	renderAfterAdded: function (self)
		{
			if (!this.validateGiftCertificate(self.product))
			{
				return; 
			}

			self.addItemToList(self.product, self.single_list);
			self.render();

			self.saveAndShowConfirmationMessage(
				_('Good! You added this item to your product list').translate()
			);

			this.$('[data-type="add-product-to-single-list"]').attr('disabled', 'true');
		}

	});
	
	return Views;
});
// ProductListCreation.Views.js
// -----------------------
// View to handle Product Lists creation
define('ProductListCreation.View', ['ProductList.Model', 'ProductListItem.Collection'], 
	function (ProductListModel, ProductListItemCollection)
{
	'use strict';

	return Backbone.View.extend({

		template: 'product_list_new'

	,	attributes: {'class': 'container product-list-new'}

	,	events: {
			'submit form': 'saveForm'
		,	'keypress [type="text"]': 'preventEnter'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
			this.parentView = options.parentView;
			this.model = options.model;
			this.isEdit = this.model.get('internalid'); 
			this.page_header = this.getTitle();
		}

		// Prevents not desired behaviour when hitting enter
	,	preventEnter: function(event)
		{
			if (event.keyCode === 13) 
			{
				event.preventDefault();
			}
		}

		// Sets focus on the name field and returns the correct title text
	,	getTitle: function ()
		{
			this.$('[name="name"]').focus();
			return this.isEdit ? _('Edit your list').translate() : _('Create a new list').translate(); 
		}

		// Handles the form submit on save
	,	saveForm: function()
		{
			var self = this
			,	save_promise = Backbone.View.prototype.saveForm.apply(self, arguments); 
			save_promise && save_promise.done(function ()
			{
				self.model.set('items', new ProductListItemCollection(self.model.get('items')));
				self.$containerModal && self.$containerModal.modal('hide');
				if (self.isEdit) 
				{
					self.application.getProductLists().add(self.model, {merge: true}); 
					self.application.getLayout().updateMenuItemsUI();
					self.parentView.render();
					if (self.parentView.$el.hasClass('ProductListDetailsView'))
					{
						self.parentView.showConfirmationMessage(
							_('Good! The list was successfully updated. ').translate()
						);
					}
					else
					{
						self.parentView.showConfirmationMessage(
							_('Good! Your $(0) list was successfully updated. ').translate('<a href="/productlist/' + self.model.get('internalid') + '">' + self.model.get('name') + '</a>')
						);
					}
				}
				else
				{					
					self.application.getProductLists().add(self.model);
					self.application.getLayout().updateMenuItemsUI();
					self.parentView.showConfirmationMessage(
						_('Good! Your $(0) list was successfully created. ').translate('<a href="/productlist/' + self.model.get('internalid') + '">' + self.model.get('name') + '</a>')
					);					
				}
				self.parentView.highlightList && self.parentView.highlightList(self.model.get('internalid')); 
			});		
		}

		// Get new list name
	,	getName: function ()
		{
			return this.$('.product-list-new-name-input input').val();
		}

		// Get new list notes
	,	getNotes: function ()
		{
			return this.$('.product-list-new-notes-input textarea').val();
		}

	});

});

// ProductListDeletion.Views.js
// -----------------------
// View to handle Product Lists (lists and items) deletion
define('ProductListDeletion.View', function ()
{
	'use strict';

	return Backbone.View.extend({

		template: 'product_list_delete_confirm'

	,	title: _('Delete item').translate()

	,	attributes: {
			'class': 'view product-list-delete-confirm'
		}

	,	page_header: _('Delete item').translate()

	,	events: {
			'click [data-action="delete"]' : 'confirmDelete'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
			this.parentView = options.parentView;
			this.target = options.target;
			this.title = options.title;
			this.page_header = options.title;
			this.body = options.body;
			this.confirm_delete_method = options.confirm_delete_method;
			this.confirmLabel = options.confirmLabel || _('Yes, Remove It').translate(); 
		}

		// Invokes parent view delete confirm callback function
	,	confirmDelete : function ()
		{
			this.parentView[this.confirm_delete_method](this.target);
		}

	,	render: function ()
		{
			Backbone.View.prototype.render.apply(this, arguments);
			var self = this;
			this.$containerModal.on('shown.bs.modal', function()
			{
				self.$('[data-action="delete"]').focus();
			});
		}

		// Sets focus con cancel button and returns the title text
	,	getTitle: function ()
		{			
			return _('Delete product list').translate();
		}
	});

});
// ProductList.Views.js
// -----------------------
// Views for handling Product Lists (CRUD)
define('ProductListDetails.View'
,	['ProductListItem.Collection','ProductListDeletion.View', 'ProductList.Model', 'ItemDetails.Model', 'ProductListLists.View', 'ProductListAddedToCart.View', 'ProductListItemEdit.View', 'ProductListItem.Model', 'ProductListControl.Views', 'ListHeader']
,	function (ProductListItemCollection, ProductListDeletionView, ProductListModel, ItemDetailsModel, ProductListListsView, ProductListAddedToCartView, ProductListItemEditView, ProductListItemModel, ProductListControlViews, ListHeader)
{
	'use strict';

	return Backbone.View.extend({

		template: 'product_list_details'
	,	className: 'ProductListDetailsView'

	,	attributes: {'class': 'ProductListDetailsView'}

	,	events: {
			// items events
			'click [data-action="add-to-cart"]' : 'addItemToCartHandler'
		,	'click [data-action="add-items-to-cart"]': 'addItemsToCartBulkHandler'

		,	'click [data-action="delete-item"]' : 'askDeleteListItem'
		,   'click [data-action="delete-items"]': 'deleteItemsHandler'

		,	'click [data-action="edit-item"]' : 'askEditListItem'
		,	'click [data-action="update-item-quantity"]': 'updateListItemQuantity'
		,	'click [data-ui-action="show-edit-notes"]' : 'showEditNotes'
		,	'click [data-ui-action="cancel-edit-notes-form"]' : 'showViewNotes'
		,	'click [data-ui-action="plus-one"]' : 'addPlusOne'
		,	'click [data-ui-action="minus-one"]' : 'addMinusOne'
		,	'click [data-action="add-list-to-cart"]': 'addListToCart_'

		,	'click [data-action="edit-list"]': 'editListHandler'
		,	'click [data-action="delete-list"]': 'deleteListHandler'

		,	'change [name="item_quantity"]': 'updateItemQuantity'
		,	'keyup [name="item_quantity"]': 'updateItemQuantity'
		,	'submit [data-action="update-quantity-item-list"]': 'updateItemQuantityFormSubmit'

		,	'click [data-type="product-list-item"]': 'toggleProductListItemHandler'
		}

	,	sortOptions: [
			{
				value: 'name'
			,	name: _('Sort by name').translate()
			,	selected: true
			}
		,	{
				value: 'price'
			,	name: _('Sort by price').translate()
			}
		,	{
				value: 'created'
			,	name: _('Sort by date Added').translate()
			}
		,	{
				value: 'priority'
			,	name: _('Sort by priority').translate()
			}
		]

	,	initialize: function (options)
		{
			this.options = options;
			this.model = options.model;
			this.application = options.application;
			this.cart = this.application.getCart();

			this.displayOptions = this.application.getConfig('product_lists.itemsDisplayOptions');

			this.sflMode = options.sflMode;
			this.addToCartCallback = options.addToCartCallback;
			this.includeSortingFilteringHeader = options.includeSortingFilteringHeader;
			this.title = this.model.get('name');

			this.collection = this.model.get('items');
			this.collection.productListId = this.model.get('internalid');

			this.setupListHeader(this.collection);

			// set css class for the current display option
			// this.$el.addClass('display-' + this.getCurrentDisplayOpt());
			this.collection.on('reset', jQuery.proxy(this, 'render'));
		}

	,	setupListHeader: function(collection)
		{
			if (!this.includeSortingFilteringHeader)
			{
				return;
			}
			var self = this;

			this.listHeader = new ListHeader({
				view: this
			,	application: this.application
			,	headerMarkup : function()
				{
					return SC.macros.productListBulkActions(self.model);
				}
			,	hideFilterExpandable : function()
				{
					return this.collection.length < 2;
				}
			,	selectable: true
			,	collection: collection
			,	sorts: this.sortOptions
			,	displays: this.displayOptions
			});
		}

		// add this list to cart handler
	,	addListToCart_: function ()
		{
			this.addListToCart(this.model);
		}

	,	addListToCart: ProductListListsView.prototype.addListToCart

		// Shows the delete confirmation modal view
	,	askDeleteListItem : function (e)
		{
			e.stopPropagation();

			this.deleteConfirmationView = new ProductListDeletionView({
				application: this.application
			,	parentView: this
			,	target: e.target
			,	title: _('Delete selected items').translate()
			,	body: _('Are you sure you want to remove selected items?').translate()
			,	confirmLabel: _('Yes').translate()
			,	confirm_delete_method: 'deleteListItemHandler'
			});

			this.application.getLayout().showInModal(this.deleteConfirmationView);
		}

		// Add a particular item into the cart
	,	addItemToCartHandler : function (e)
		{
			e.stopPropagation();
			e.preventDefault();

			var self = this
			,	selected_product_list_item_id = self.$(e.target).closest('article').data('id')
			,	selected_product_list_item = self.model.get('items').findWhere({
					internalid: selected_product_list_item_id.toString()
				})
			,	selected_item = selected_product_list_item.get('item')
			,	selected_item_internalid = selected_item.internalid
			,	item_detail = self.getItemForCart(selected_item_internalid, selected_product_list_item.get('quantity'));

			item_detail.set('_optionsDetails', selected_item.itemoptions_detail);
			item_detail.setOptionsArray(selected_product_list_item.getOptionsArray(), true);

			var add_to_cart_promise = this.addItemToCart(item_detail)
			,	whole_promise = null;

			if (this.sflMode)
			{
				whole_promise = jQuery.when(add_to_cart_promise, this.deleteListItem(selected_product_list_item)).then(jQuery.proxy(this, 'executeAddToCartCallback'));
			}
			else
			{
				whole_promise = jQuery.when(add_to_cart_promise).then(jQuery.proxy(this, 'showConfirmationHelper', selected_product_list_item));
			}

			if (whole_promise)
			{
				this.disableElementsOnPromise(whole_promise, 'article[data-item-id="' + selected_item_internalid + '"] a, article[data-item-id="' + selected_item_internalid + '"] button');
			}
		}

	,	_getSelection:function()
		{
			var self = this
			,	items = []
			,	items_for_cart = []
			,	button_selector = [];

			//Filter items for bulk operation
			_.each(this.collection.models, function(item_in_list)
			{
				//irrelevant items: no-op
				if (item_in_list.get('checked') !== true)
				{
					return;
				}

				items.push(item_in_list);
				var item_internal_id = item_in_list.get('item').internalid;
				var item_for_cart = self.getItemForCart(item_internal_id, item_in_list.get('quantity'), item_in_list.get('options'));

				items_for_cart.push(item_for_cart);
				button_selector.push('article[data-item-id="' + item_internal_id + '"] a, article[data-item-id="' + item_internal_id + '"] button');
			});

			//items: backbone models representing selected items
			//items_for_cart: selected models ready to be inserted into a cart
			//button_selector: all the buttons that should be disabled when performing a batch operation
			return {
					items: items
				,	items_for_cart: items_for_cart
				,	button_selector: button_selector

			};

		}


	,	addItemsToCartBulkHandler:function(ev)
		{
			ev.preventDefault();

			var self = this;
			var selected_models = this._getSelection();

			//no items selected: no opt
			if (selected_models.items.length < 1)
			{
				return;
			}

			var button_selector = selected_models.button_selector.join(',');

			//add items to cart
			var add_to_cart_promise = this.cart.addItems(selected_models.items_for_cart);
			add_to_cart_promise.then( function()
			{
				self.unselectAll();
				self.showConfirmationHelper();
			});

			if (add_to_cart_promise)
			{
				this.disableElementsOnPromise(add_to_cart_promise, button_selector);
			}
		}

	,	deleteItemsHandler:function(ev)
		{
			ev.preventDefault();

			var self = this
			,	selected_models = this._getSelection()
			,	delete_promises = [];


			if(selected_models.items.length < 1)
			{
				return;
			}

			//there are two collections with the same information this.model and the one on application
			//should remove the item on both
			var app_item_list = _.findWhere(self.application.getProductLists().models, {id: self.model.id});

			_.each(selected_models.items, function(item)
			{
				//fix already used in "deleteListItem"
				item.url = ProductListItemModel.prototype.url;

				app_item_list && app_item_list.get('items').remove(item);
				delete_promises.push(item.destroy().promise());
			});

			jQuery.when.apply(jQuery, delete_promises).then(function()
			{
				self.render();
				self.application.getLayout().updateMenuItemsUI();
				self.showConfirmationMessage(_('The selected items were removed from your product list').translate());
			});
		}

		//this is called from the ListHeader when you check select all.
	,	selectAll:function()
		{
			_.each(this.collection.models, function(item)
			{
				item.set('checked', true);
			});
			this.render();
		}

	,	unselectAll:function()
		{
			_.each(this.collection.models, function(item)
			{
				item.set('checked', false);
			});
			this.render();
		}


	,	executeAddToCartCallback: function()
		{
			if (!this.addToCartCallback)
			{
				return;
			}

			this.addToCartCallback();
		}

	,	showConfirmationHelper: function(selected_item)
		{
			this.showConfirmationMessage(_('Good! The items were successfully added to your cart. You can continue to <a href="#" data-touchpoint="viewcart">view cart and checkout</a>').translate());

			//selected item may be undefined
			if (_.isUndefined(selected_item) === true)
			{
				return;
			}

			this.addedToCartView = new ProductListAddedToCartView({
				application: this.application
			,	parentView: this
			,	item: selected_item
			});

			this.application.getLayout().showInModal(this.addedToCartView);
		}

		// Gets the ItemDetailsModel for the cart
	,	getItemForCart: function (id, qty, opts)
		{
			return new ItemDetailsModel({
				internalid: id
			,	quantity: qty
			,	options: opts
			});
		}

		// Adds the item to the cart
	,	addItemToCart: function (item)
		{
			return this.cart.addItem(item);
		}

		// Product list item deletion handler
	,	deleteListItemHandler: function (target)
		{
			var self = this
			,	itemid = jQuery(target).closest('article').data('id')
			,	product_list_item = this.model.get('items').findWhere({
					internalid: itemid + ''
				});

			var success = function ()
			{
				if (self.application.getLayout().updateMenuItemsUI)
				{
					self.application.getLayout().updateMenuItemsUI();
				}

				self.deleteConfirmationView.$containerModal.modal('hide');
				self.render();
				self.showConfirmationMessage(_('The item was removed from your product list').translate());

			};

			var productList = self.application.getProductLists().where({internalid: self.model.id });

			if (productList.length > 0)
			{
				productList[0].get('items').remove(product_list_item);
			}

			self.deleteListItem(product_list_item, success);
		}

		// Remove an product list item from the current list
	,	deleteListItem: function (product_list_item, successFunc)
		{
			this.model.get('items').remove(product_list_item);

			product_list_item.url = ProductListItemModel.prototype.url;
			var promise = product_list_item.destroy();
			promise && successFunc && promise.done(function()
			{
				successFunc();
			});
		}

		// Edit a product list item from the current list
	,	askEditListItem : function(e)
		{
			e.stopPropagation();

			var product_list_itemid = this.$(e.target).closest('article').data('id')
			,	selected_item = this.model.get('items').findWhere({
				internalid: product_list_itemid.toString()
			});

			this.editView = new ProductListItemEditView({
				application: this.application
			,	parentView: this
			,	target: e.target
			,	model: selected_item
			,	title: _('Edit Item').translate()
			,	confirm_edit_method: 'editListItemHandler'
			});

			this.editView.showInModal();
		}

		// Updates product list item quantity from the current list
	,	updateListItemQuantity : function(e)
		{
			e.preventDefault();

			var product_list_itemid = this.$(e.target).closest('article').data('id')
			,	selected_pli = this.model.get('items').findWhere({internalid: product_list_itemid.toString()})
			,	minimum_quantity = selected_pli.get('item').minimumquantity;

			this.updateItemQuantityHelper(selected_pli, minimum_quantity);
		}

		// Product list item edition handler
	,	editListItemHandler: function (product_list_item)
		{
			var self = this
			,	edit_result = product_list_item.save();

			if (!edit_result)
			{
				return;
			}

			edit_result.done(function (new_attributes)
			{
				var new_model = new ProductListItemModel(new_attributes);

				self.model.get('items').add(new_model, {merge: true});
				self.editView.$containerModal.modal('hide');
				self.editView.destroy();
				self.render();
			});
		}

		// Retrieve the current (if any) items display option
	,	getDisplayOption: function ()
		{
			var search = (this.options.params && this.options.params.display) || 'list';

			return _(this.displayOptions).findWhere({
				id: search
			});
		}

	,	render: function()
		{
			Backbone.View.prototype.render.apply(this, arguments);

			var self = this
			,	out_of_stock_items = []
			,	items = this.model.get('items')
			,	is_single_list = this.application.ProductListModule.isSingleList();

			items.each(function(item) {
				if (!item.get('item').ispurchasable)
				{
					out_of_stock_items.push(item);
				}

				self.renderOptions(item);

				if (!is_single_list)
				{
					self.renderMove(item);
				}

			});

			var warning_message = null;

			if (out_of_stock_items.length === 1)
			{
				warning_message =  _('$(0) of $(1) items in your list is currently not available for purchase. If you decide to add the list to your cart, only available products will be added.').translate(out_of_stock_items.length, items.length);
			}
			else if (out_of_stock_items.length > 1)
			{
				warning_message =  _('$(0) of $(1) items in your list are currently not available for purchase. If you decide to add the list to your cart, only available products will be added.').translate(out_of_stock_items.length, items.length);
			}

			if (warning_message)
			{
				self.showWarningMessage(warning_message);
			}

			return this;
		}

		// Render the item options (matrix and custom)
	,	renderOptions: function (pli_model)
		{
			var item_detail_model = pli_model.get('itemDetails');
			var posible_options = item_detail_model.getPosibleOptions();

			// Will render all options with the macros they were configured
			this.$('article[data-id="' + pli_model.id + '"]').find('div[data-type="all-options"]').each(function (index, container)
			{
				var $container = jQuery(container).empty()
				,	exclude = _.map(($container.data('exclude-options') || '').split(','), function (result)
					{
						return jQuery.trim(result);
					})
				,	result_html = '';

				_.each(posible_options, function (posible_option)
				{
					if (!_.contains(exclude, posible_option.cartOptionId))
					{
						result_html += item_detail_model.renderOptionSelected(posible_option);
					}
				});

				$container.append(result_html);

				if(result_html.length === 0)
				{
					$container.remove();
				}
			});
		}

		// Renders the move control for a product list
	,	renderMove: function (product_list_model)
		{
			var self = this;

			var container = this.$('article[data-id="' + product_list_model.id + '"]').find('div[data-type="productlist-control-move"]');
			var control = new ProductListControlViews.Control({
				collection: self.getMoveLists(self.application.getProductLists(), self.model, product_list_model)
			,	product: product_list_model.get('item')
			,	application: self.application
			,	moveOptions:
				{
					parentView: self
				,	productListItem: product_list_model
				}
			});

			jQuery(container).empty().append(control.$el);
			control.render();
		}

		// Filters all lists so it does not include the current list and the lists where the item is already present
	,	getMoveLists: function (all_lists, current_list, list_item)
		{
			return all_lists.filtered( function(model)
			{
				return model.get('internalid') !== current_list.get('internalid') &&
					!model.get('items').find(function (product_item)
					{
						return product_item.get('item').internalid+'' === list_item.get('item').internalid+'';
					});
			});
		}

		// Shows the edit modal view
	,	editListHandler: function(event)
		{
			event.preventDefault();
			ProductListListsView.prototype.editList.apply(this, [this.model]);
		}

		// Shows the delete modal view
	,	deleteListHandler: function(event)
		{
			event.preventDefault();
			this.deleteConfirmationView = new ProductListDeletionView({
				application: this.application
			,	parentView: this
			,	target: null
			,	title: _('Delete list').translate()
			,	body: _('Are you sure you want to remove this list?').translate()
			,	confirm_delete_method: 'deleteList'
			});
			this.application.getLayout().showInModal(this.deleteConfirmationView);
		}

		// Delete confirm callback
	,	deleteList: function()
		{
			var self = this
			,	list = this.model;
			this.application.getProductLists().remove(list);
			list.url = ProductListModel.prototype.url;

			list.destroy().done(function ()
			{
				self.deleteConfirmationView.$containerModal.modal('hide');
				Backbone.history.navigate('/productlists', {trigger: true});
				self.application.getLayout().updateMenuItemsUI();
				self.application.getLayout().currentView.showConfirmationMessage(
					_('Your $(0) list was removed').
						translate('<span class="product-list-name">' + list.get('name') + '</span>')
				);
			});
		}

		// Get the label for showContent()
	,	getViewLabel: function ()
		{
			return 'productlist_' + (this.model.get('internalid') ? this.model.get('internalid') : 'tmpl_' + this.model.get('templateid'));
		}

		// override showContent() for showing the breadcrumb
	,	showContent: function()
		{
			var breadcrumb = [
				{
					text: _('Product Lists').translate(),
					href: '/productlists'
				}
			,	{
					text: this.model.get('name'),
					href: '/productlist/' + (this.model.get('internalid') ? this.model.get('internalid') : 'tmpl_' + this.model.get('templateid'))
				}
			];
			if (this.application.ProductListModule.isSingleList())
			{
				breadcrumb.splice(0, 1); //remove first
			}
			this.application.getLayout().showContent(this, this.getViewLabel(), breadcrumb);
		}

		// Updates quantity on form submit.
	,	updateItemQuantityFormSubmit: function (e)
		{
			e.preventDefault();
			this.updateItemQuantity(e);
		}

		// Helper function. Used in updateItemQuantity and updateListItemQuantity functions.
	,	updateItemQuantityHelper: function(selected_item, new_quantity)
		{
			selected_item.set('quantity', new_quantity);

			var self = this
			,	edit_result = selected_item.save();

			if (edit_result)
			{
				edit_result.done(function (new_attributes)
				{
					var new_model = new ProductListItemModel(new_attributes);

					self.model.get('items').add(new_model, {merge: true});
					self.render();
				});
			}

			return edit_result;
		}

		// updateItemQuantity:
		// executes on blur of the quantity input
		// Finds the item in the product list, updates its quantity and saves the list model
	,	updateItemQuantity: _.debounce(function (e)
		{
			e.preventDefault();

			var product_list_itemid = this.$(e.target).closest('article').data('id')
			,	selected_item = this.model.get('items').findWhere({internalid: product_list_itemid.toString()})
			,	options = jQuery(e.target).closest('form').serializeObject()
			,	$input = jQuery(e.target).closest('form').find('[name="item_quantity"]')
			,	new_quantity = parseInt(options.item_quantity, 10)
			,	current_quantity = parseInt(selected_item.get('quantity'), 10);

			new_quantity = (new_quantity > 0) ? new_quantity : current_quantity;

			$input.val(new_quantity);

			if (new_quantity ===  current_quantity)
			{
				return;
			}

			$input.val(new_quantity).prop('disabled', true);

			var edit_promise = this.updateItemQuantityHelper(selected_item, new_quantity);

			if (!edit_promise)
			{
				return;
			}

			edit_promise.always(function ()
			{
				$input.prop('disabled', false);
			});

		}, 600)

	,	toggleProductListItemHandler: function (e)
		{
			this.toggleProductListItem(jQuery(e.target).closest('article').data('id'));
		}

	,	toggleProductListItem: function (pli)
		{
			pli = this.collection.get(pli);

			if (pli)
			{
				this[pli.get('checked') ? 'unselectProductListItem' : 'selectProductListItem'](pli);

				this.render();
			}
		}

	,	selectProductListItem: function (pli)
		{
			if (pli)
			{
				pli.set('checked', true);
			}
		}

	,	unselectProductListItem: function (pli)
		{
			if (pli)
			{
				pli.set('checked', false);
			}
		}
	});
});

// ProductListItem.Collection.js
// -----------------------
// Product List collection
define('ProductListItem.Collection', ['ProductListItem.Model'], function (Model)
{
	'use strict';

	return Backbone.Collection.extend({
		
		model: Model
		
	,	url: _.getAbsoluteUrl('services/product-list-item.ss')

	,	initialize: function(options) 
		{
			this.options = options; 
		}

		// Collection.update:
		// custom method called by ListHeader view
		// it receives the currently applied filter,
		// currently applied sort and currently applied order
	,	update: function (options)
		{
			this.fetch({
				data: {
					productlistid: this.productListId
				,	internalid: null
				,	sort: options.sort.value
				,	order: options.order
				,	page: options.page
				}
			,	reset: true
			,	killerId: options.killerId
			});
		}
	});
});
// ProductListItem.Model.js
// -----------------------
// Model for handling Product Lists (CRUD)
define('ProductListItem.Model',['ItemDetails.Model'], function (ItemDetailsModel)
{
	'use strict';

	return Backbone.Model.extend(
	{
		urlRoot: _.getAbsoluteUrl('services/product-list-item.ss')

	,	defaults : {
			priority : {id: '2', name: 'medium'}
		,	options: ''
		}
		
		// Name is required
	,	validation: {
			name: { required: true, msg: _('Name is required').translate() }
		}

		// redefine url to avoid possible cache problems from browser
	,	url: function()
		{
			var base_url = Backbone.Model.prototype.url.apply(this, arguments);

			var productList = this.get('productList');
			if (productList && productList.owner)
			{
				base_url += '&user=' + productList.owner;
			}
			
			return base_url + '&t=' + new Date().getTime();
		}

	,	initialize: function (data)
		{
			this.item = data.item;

			if (this.item && this.item.matrix_parent && this.item.itemoptions_detail)
			{
				this.item.itemoptions_detail.fields = this.item.matrix_parent.itemoptions_detail.fields;
				this.item.matrixchilditems_detail = this.item.matrix_parent.matrixchilditems_detail;
			}

			var itemDetailModel = new ItemDetailsModel(this.item);
			
			itemDetailModel.setOptionsArray(this.getOptionsArray(), true);
			itemDetailModel.set('quantity', this.get('quantity'));
			
			this.set('itemDetails', itemDetailModel);
		}

		// Returns options as an array. This is the way ItemDetailModel expects when initialized.
	,	getOptionsArray: function()
		{			
			// Iterate on the stored Product List Item options and create an id/value object compatible with the existing options renderer...
			var option_values = []
			,	selected_options = this.get('options');

			_.each(selected_options, function(value, key) {		
				option_values.push({id: key, value: value.value, displayvalue: value.displayvalue});
			});

			return option_values;
		}	

		// Copied from SC.Application('Shopping').Configuration.itemKeyMapping._name
	,	getProductName: function()
		{
			if (!this.get('item'))
			{
				return null;
			}
			var item = this.get('item');

			// If its a matrix child it will use the name of the parent
			if (item && item.matrix_parent && item.matrix_parent.internalid) 
			{
				return item.matrix_parent.storedisplayname2 || item.matrix_parent.displayname;
			}

			// Otherways return its own name
			return item.storedisplayname2 || item.displayname;
		}
	
		// We need to check if mandatory options are set. No matrix option checking is required for editing a Product List Item.
	,	isSelectionCompleteForEdit: function()
		{
			var item_details = this.get('itemDetails')
			,	posible_options = item_details.getPosibleOptions();
			
			for (var i = 0; i < posible_options.length; i++)
			{
				var posible_option = posible_options[i];
				
				if (posible_option.isMandatory && !item_details.getOption(posible_option.cartOptionId))
				{
					return false;
				}
			}

			return true;
		}

		// Returns true if a product can be purchased due to minimum quantity requirements.
	,	fulfillsMinimumQuantityRequirement: function()
		{
			var item_minimum_quantity = this.get('item').minimumquantity;

			if (!item_minimum_quantity)
			{
				return true;
			}

			return parseInt(item_minimum_quantity, 10) <= parseInt(this.get('quantity'), 10);
		}
	});
});

// ProductListItemEdit.View.js
// -----------------------
// View to handle Product Lists Item edition.
define('ProductListItemEdit.View', ['ProductListItem.Model'], function (ProductListItemModel)
{
	'use strict';

	function getItemOptions(itemOptions)
	{
		var result = {};

		_.each(itemOptions, function (value, name)
		{
			result[name] = { value: value.internalid, displayvalue: value.label };
		});

		return result;
	}

	return Backbone.View.extend({
		template: 'product_list_edit_item'

	,	title: _('Edit item').translate()

	,	page_header: _('Edit item').translate()

	,	events: {
			'click [data-action="edit"]' : 'edit'
		,	'blur [data-toggle="text-option"]': 'setOption'
		,	'click [data-toggle="set-option"]': 'setOption'
		,	'change [data-toggle="select-option"]': 'setOption'

		,	'change [name="quantity"]': 'updateQuantity'
		,	'keypress [name="quantity"]': 'ignoreEnter'

		,	'change [name="description"]': 'updateDescription'
		,	'keypress [name="description"]': 'ignoreEnter'

		,	'change [name="priority"]': 'updatePriority'

		,	'keydown [data-toggle="text-option"]': 'tabNavigationFix'
		,	'focus [data-toggle="text-option"]': 'tabNavigationFix'

		}

	,	initialize: function (options)
		{
			this.application = options.application;
			this.parentView = options.parentView;
			this.target = options.target;
			this.title = options.title;
			this.page_header = options.title;

			if (!options.model)
			{
				throw new Error('A model is needed');
			}

			var attrs = jQuery.extend(true, {}, options.model.attributes);

			this.model = new ProductListItemModel(attrs);
			this.confirm_edit_method = options.confirm_edit_method;
		}

		// Edit the current item
	,	edit: function()
		{
			if (this.model.isSelectionCompleteForEdit())
			{
				var item_detail_model = this.model.get('itemDetails');

				this.$('[data-action="edit"]').attr('disabled', 'true');
				this.$('[data-action="cancel"]').attr('disabled', 'true');

				this.model.set('options', getItemOptions(item_detail_model.itemOptions));
				this.model.set('item', { id: this.application.ProductListModule.internalGetProductId(item_detail_model) });

				this.parentView[this.confirm_edit_method](this.model);
			}
		}

		// Updates the quantity of the model
	,	updateQuantity: function (e)
		{
			var new_quantity = parseInt(jQuery(e.target).val(), 10)
			,	current_quantity = this.model.get('quantity');

			new_quantity = (new_quantity > 0) ? new_quantity : current_quantity;

			jQuery(e.target).val(new_quantity);

			if (new_quantity !== current_quantity)
			{
				this.model.set('quantity', new_quantity);
				this.storeFocus(e);
			}
		}

		// Updates the description of the model
	,	updateDescription: function (e)
		{
			var new_description = jQuery(e.target).val()
			,	current_description = this.model.get('description');

			if (new_description !== current_description)
			{
				this.model.set('description', new_description);
				this.storeFocus(e);
			}
		}

		// Updates the priority of the model
	,	updatePriority: function (e)
		{
			var new_priority = jQuery(e.target).val()
			,	current_priority = this.model.get('priority');

			if (new_priority !== current_priority)
			{
				this.model.set('priority', {id: new_priority } );
				this.storeFocus(e);
			}
		}

		// Sets an item option (matrix or custom)
	,	setOption: function (e)
		{
			var $target = jQuery(e.target)
			,	value = $target.val() || $target.data('value') || null
			,	cart_option_id = $target.closest('[data-type="option"]').data('cart-option-id');

			// Prevent from going away
			e.preventDefault();

			// if option is selected, remove the value
			if ($target.data('active'))
			{
				value = null;
			}

			var item_detail_model = this.model.get('itemDetails');

			// it will fail if the option is invalid
			try
			{
				item_detail_model.setOption(cart_option_id, value);
			}
			catch (error)
			{
				// Clears all matrix options
				_.each(item_detail_model.getPosibleOptions(), function (option)
				{
					option.isMatrixDimension && item_detail_model.setOption(option.cartOptionId, null);
				});

				// Sets the value once again
				item_detail_model.setOption(cart_option_id, value);
			}

			this.storeFocus(e);
			this.render();
		}

		// view.storeFocus
		// Computes and store the current state of the item and refresh the whole view, re-rendering the view at the end
		// This also updates the url, but it does not generates a history point
	,	storeFocus: function ()
		{
			var focused_element = this.$(':focus').get(0);

			this.focusedElement = focused_element ? SC.Utils.getFullPathForElement(focused_element) : null;
		}

		// view.tabNavigationFix:
		// When you blur on an input field the whole page gets rendered,
		// so the function of hitting tab to navigate to the next input stops working
		// This solves that problem by storing a a ref to the current input
	,	tabNavigationFix: function (e)
		{
			this.hideError();

			// If the user is hitting tab we set tabNavigation to true, for any other event we turn ir off
			this.tabNavigation = (e.type === 'keydown' && e.which === 9);
			this.tabNavigationUpsidedown = e.shiftKey;
			this.tabNavigationCurrent = SC.Utils.getFullPathForElement(e.target);
		}

	,	afterAppend: function ()
		{
			this.focusedElement && this.$(this.focusedElement).focus();

			if (this.tabNavigation)
			{
				var current_index = this.$(':input').index(this.$(this.tabNavigationCurrent).get(0))
				,	next_index = this.tabNavigationUpsidedown ? current_index - 1 : current_index + 1;

				this.$(':input:eq('+ next_index +')').focus();
			}
		}

		// view.showInModal:
		// Takes care of showing the pdp in a modal, and changes the template, doesn't trigger the
		// after events because those are triggered by showContent
	,	showInModal: function (options)
		{
			this.template = 'product_list_edit_item';

			return this.application.getLayout().showInModal(this, options);
		}

		// don't want to trigger form submit when user presses enter when in the quantity input text
	,	ignoreEnter: function (e)
		{
			if (e.keyCode === 13)
			{
				e.preventDefault();
				e.stopPropagation();
			}
		}
	});
});

// ProductList.Views.js
// -----------------------
// Views for handling Product Lists (CRUD)
define('ProductListLists.View'
,	['ProductListDetails.View', 'ProductList.Model', 'ProductListItem.Collection', 'ProductListCreation.View', 'ItemDetails.Model', 'ProductListAddedToCart.View', 'ProductListDeletion.View', 'ListHeader']
,	function (ProductListDetailsView, ProductListModel, ProductListItemCollection, ProductListCreationView, ItemDetailsModel, ProductListAddedToCartView, ProductListDeletionView, ListHeader)
{
	'use strict';

	return Backbone.View.extend({

		template: 'product_list_lists'

	,	title: _('Product Lists').translate()

	,	className: 'ProductListListsView'

	,	attributes: {'class': 'ProductListListsView'}

	,	events:
		{
			'change [data-action="sort-by"]': 'sortBy'
		,	'click [data-action="add-list"]': 'createProductList'
		,	'click [data-action="delete-list"]': 'askDeleteList'
		,	'click [data-action="edit-list"]': 'editListHandler'
		,	'click [data-action="share-list"]': 'shareList'
		,	'click [data-action="add-to-cart"]': 'addListToCartHandler'
		,	'click [data-action="select"]': 'toggleProductListHandler'
		,	'click [data-action="navigate"]': 'navigateToItems'
		}

	,	initialize: function (options)
		{
			this.options = options;
			this.application = options.application;

			//setup list header
			this.listHeader = new ListHeader({
					view: this
				,	displays : true
				,	hideFilterExpandable: true
				,	application: this.application
				,	collection : this.collection
				,	headerMarkup : '<button class="btn pull-right add-list" data-action="add-list">' + _('Create New List').translate() + '</button>'
			});
		}

	,	render: function()
		{
			Backbone.View.prototype.render.apply(this, arguments);
			//if there are no list we show the list creation form
			if (!this.collection.length)
			{
				this.newProductListView = new ProductListCreationView({
					application: this.application
				,	parentView: this
				,	model: new ProductListModel() //create!
				});
				this.newProductListView.render();
				this.$('[data-type="new-product-list"]').append(this.newProductListView.$el);
			}
		}

		// Show create new product list modal form
	,	createProductList: function ()
		{
			this.newProductListView = new ProductListCreationView({
				application: this.application
			,	parentView: this
			,	model: new ProductListModel() //create!
			});

			this.application.getLayout().showInModal(this.newProductListView);
		}

		// starts the 'delete a list' use case
	,	askDeleteList: function (e)
		{
			this.deleteConfirmationView = new ProductListDeletionView({
				application: this.application
			,	parentView: this
			,	target: e.target
			,	title: _('Delete list').translate()
			,	body: _('Are you sure you want to remove this list?').translate()
			,	confirm_delete_method: 'deleteListHandler'
			});
			this.application.getLayout().showInModal(this.deleteConfirmationView);
		}

		// called from the sub view when the user confirms he wants to delete the product list.
	,	deleteListHandler: function(target)
		{
			var self = this
			,	list = this.getListFromDom(jQuery(target));

			this.collection.remove(list);
			list.url = ProductListModel.prototype.url;

			list.destroy().done(function ()
			{
				self.application.getLayout().updateMenuItemsUI();
				self.showConfirmationMessage(
					_('Your $(0) list was removed').
						translate('<span class="product-list-name">' + list.get('name') + '</span>')
				);
				self.deleteConfirmationView.$containerModal.modal('hide');
			});
		}

		// temporarily highlights a list that has been recently added or edited
	,	highlightList: function (internalid)
		{
			var $list_dom = jQuery(this.el).find('article[data-product-list-id='+ internalid +']');
			if ($list_dom)
			{
				$list_dom.addClass('new-list');

				setTimeout( function ()
				{
					$list_dom.removeClass('new-list');
				},3000);
			}
		}

		// Add list to cart click handler
	,	addListToCartHandler: function (e)
		{
			e.preventDefault();

			var list = this.getCurrentList(e);

			this.addListToCart(list);
		}

		// Adds an entire list to the cart
	,	addListToCart: function (list)
		{
			// collect the items data to add to cart
			var add_items = []
			,	self = this
			,	not_purchasable_items_count = 0;

			list.get('items').each(function (item)
			{
				var store_item = item.get('item');

				if (store_item.ispurchasable)
				{
					var item_detail = new ItemDetailsModel({
							internalid: store_item.internalid
						,	quantity: item.get('quantity')
					});

					item_detail.set('_optionsDetails', store_item.itemoptions_detail);
					item_detail.setOptionsArray(item.getOptionsArray(), true);

					add_items.push(item_detail);
				}
				else
				{
					not_purchasable_items_count++;
				}
			});

			if (add_items.length === 0)
			{
				var errorMessage = _('All items in the list are not available for purchase.').translate();

				self.showWarningMessage(errorMessage);

				return;
			}

			// add the items to the cart and when its done show the confirmation view
			this.application.getCart().addItems(add_items).done(function ()
			{
				// before showing the confirmation view we need to fetch the items of the list with all the data.
				self.application.getProductList(list.get('internalid')).done(function(model)
				{
					self.addedToCartView = new ProductListAddedToCartView({
						application: self.application
					,	parentView: self
					,	list: new ProductListModel(model) //pass the model with all the data
					,	not_purchasable_items_count: not_purchasable_items_count
					});

					// also show a confirmation message
					var confirmMessage;

					if(list.get('items').length > 1)
					{
						confirmMessage =  _('Good! $(1) items from your $(0) list were successfully added to your cart. You can continue to <a href="">view your cart and checkout</a>').
						translate('<a class="product-list-name" href="/productlist/' + list.get('internalid') + '">'+list.get('name')+'</a>', list.get('items').length);
					}
					else
					{
						confirmMessage =  _('Good! $(1) item from your $(0) list was successfully added to your cart. You can continue to <a href="" data-touchpoint="viewcart">view your cart and checkout</a>').
						translate('<a class="product-list-name" href="/productlist/' + list.get('internalid') + '">'+list.get('name')+'</a>', list.get('items').length);
					}

					self.showConfirmationMessage(confirmMessage);
					self.application.getLayout().showInModal(self.addedToCartView);
				});
			});
		}

		// Edit list click handler
	,	editListHandler: function (e)
		{
			var list = this.getListFromDom(jQuery(e.target));
			this.editList(list);
		}

		// Get the list (collection) from dom
	,	getListFromDom: function ($target)
		{
			var list_id = $target.closest('[data-product-list-id]').data('product-list-id') + '';

			return this.options.collection.where({internalid: list_id})[0];
		}

		// Edit list click handler (displays edit list modal view)
	,	editList: function (list)
		{
			this.newProductListView = new ProductListCreationView({
				application: this.application
			,	parentView: this
			,	model: list
			});

			this.application.getLayout().showInModal(this.newProductListView);
		}

		// Get the label for showContent()
	,	getViewLabel: function ()
		{
			return 'productlist_all';
		}

		// override showContent() for showing the breadcrumb
	,	showContent: function()
		{
			this.application.getLayout().showContent(this, this.getViewLabel(), [{
				text: _('Product Lists').translate(),
				href: '/productlists'
			}]);
		}

			,	toggleProductListItemHandler: function (e)
		{
			this.toggleProductListItem(jQuery(e.target).closest('article').data('id'));
		}

	,	toggleProductListHandler: function (e)
		{
			this.toggleProductList(jQuery(e.target).closest('article').data('id'));
		}

	,	toggleProductList: function (pl_internalid)
		{
			var pl = this.collection.get(pl_internalid);

			if (pl)
			{
				this[pl.get('checked') ? 'unselectProductList' : 'selectProductList'](pl);
				this.render();
			}
		}

	,	selectProductList: function (pl)
		{
			if (pl)
			{
				pl.set('checked', true);
			}
		}

	,	unselectProductList: function (pl)
		{
			if (pl)
			{
				pl.set('checked', false);
			}
		}

	,	getCurrentList: function (e)
		{
			var list_id = jQuery(e.target).closest('[data-product-list-id]').data('product-list-id') + ''
			,	list = this.options.collection.findWhere({
					internalid: list_id
				});

			return list;
		}

	,	navigateToItems: function (e)
		{
			var list = this.getCurrentList(e)
			,	internalid = list.get('internalid')
			,	url = '/productlist/' + (internalid ? internalid : 'tmpl_' + list.get('templateid'));

			Backbone.history.navigate(url, {trigger: true});
		}
	});
});

// ProductList.Views.js
// -----------------------
// Views for handling Product Lists (CRUD)
define('ProductListMenu.View', function ()
{
	'use strict';

	return Backbone.View.extend({
		
		template: 'product_list_menu'
		
	,	attributes: {'class': 'ProductListMenuView'}

	,	initialize: function(options)
		{
			this.options = options;
			this.application = options.application;
			this.is_single_list = this.application.ProductListModule.isSingleList(this.application); 
			if (this.is_single_list)
			{
				this.model = this.collection.at(0); 
			}
		}
	
	});

});

(function (SC) {

    'use strict';

    _.each(SC._applications, function(application) {
        application.on('beforeStart', function(){
            application.trigger('beforeStartGlobal');
            application.trigger('beforeStartApp');
        });

        application.on('afterModulesLoaded', function(){
            application.trigger('afterModulesLoadedGlobal');
            application.trigger('afterModulesLoadedApp');
        });

        application.on('afterStart', function(){
            application.trigger('afterStartGlobal');
            application.trigger('afterStartApp');
        });
    });

}(SC));
(function (SC)
{
    'use strict';

    var ApplicationSkeleton = SC.ApplicationSkeleton;

    ApplicationSkeleton.prototype.Configuration = {
        modules : []
    };

    _.extend(ApplicationSkeleton.prototype, {

        configModule: function(name,config){
            var index = -1;
            _.each(this.Configuration.modules, function(module,key){
                if(_.isArray(module)){
                    if(module[0] === name){
                        index = key;
                    }
                } else {
                    if(module === name){
                        index = key;
                    }
                }
            });
            if(index !== -1){
                this.Configuration.modules[index] = [name,config];
            }
        },
        removeModule: function(name){
            var position = _.indexOf(this.Configuration.modules, name);
            if(position !== -1){
                this.Configuration.modules.splice(position, 1);
            }
        },
        addModule: function(module){
            this.Configuration.modules.push(module);
        }

    });

}(SC));
(function(SC) {

    'use strict';

    var ApplicationSkeleton = SC.ApplicationSkeleton;

    function Globals(Application, Data) {
        if (!(this instanceof Globals)) {
            return new Globals(Application, Data);
        }

        this.application = Application;
        this.data = Data || {}; // stores reference to SC.ENVIRONMENT.GLOBALS
        this.entries = {};
    }

    // add methods and variables
    _.extend(Globals.prototype, {

        getData: function(name, remove) {
            if(name) {
                var data = null;
                var found = (name in this.data);
                if(!found) {
                    name = name.toUpperCase();
                    found = (name in this.data);
                }
                if(found) {
                    data = this.data[name];
                    if(remove) {
                        delete this.data[name];
                    }
                }
                return data;
            }
            return null;
        },

        get: function(key) {
            return this.entries[key];
        },
        set: function(key, value) {
            this.entries[key] = value;
        }

    });

    // extend with Backbone Events
    _.extend(Globals.prototype, Backbone.Events);

    // add to Application
    _.extend(ApplicationSkeleton.prototype, {

        Globals: Globals,

        initGlobals: function(Data) {
            if(!this._globalsInstance) {
                this._globalsInstance =  new this.Globals(this, Data);
            }
            return this._globalsInstance;
        },

        getGlobals: function() {
            return this._globalsInstance;
        },

        getGlobal: function(key) {
            return this.getGlobals().get(key);
        }

    });

}(SC));
(function ()
{
    'use strict';

    var application_prototype = SC.ApplicationSkeleton.prototype;

    _.extend(application_prototype, {

        // do not track if user agent is Keynote
        track: _.wrap(application_prototype.track, function(fn, method) {
            // These are the strings that Keynote adds to the User Agent string:
            var gk_KEYNOTE_TXP_MONITOR = "KTXN"; // Transaction Perspective agents
            if (navigator.userAgent.indexOf(gk_KEYNOTE_TXP_MONITOR, 0) == -1) {
                fn.apply(this, Array.prototype.slice.call(arguments, 1));
            }
            return this;
        })

    });

})();
(function (SC) {

    'use strict';

    // application configuration
    // if needed, the second argument - omitted here - is the application name ('Shopping', 'MyAccount', 'Checkout')
    _.each(SC._applications, function(application) {

        application.on('beforeStartGlobal', function() {

            var configuration = application.Configuration;

            /* add modules */
            //application.addModule('Content.EnhancedViews.Extensions');
            application.addModule(['Categories',{ addToNavigationTabs:true, navigationAddMethod: 'prepend' }]);
            //application.addModule('Facets.Model.SortFix');
            application.addModule('Facets.Translator.Categories');
            //application.addModule('NavigationHelper.Extensions');

            // ----- ----- ----- ----- ----- ----- ----- ----- -----
            _.extend(configuration, {

                navigationTabs: []

            });

        });


    });

}(SC));

define('Facets.Translator.Categories', ['Facets.Translator', 'Categories'], function(Translator) {

    _.extend(Translator.prototype, {

        getApiParams: function ()
        {
            var params = {};

			_.each(this.facets, function (facet)
			{
                var defvalue = facet.value;
                if (facet.id === 'category') {
                    defvalue = 'Products/' + defvalue;
                }

                switch (facet.config.behavior)
				{
				case 'range':
					var value = (typeof facet.value === 'object') ? facet.value : {from: 0, to: facet.value};
					params[facet.id + '.from'] = value.from;
					params[facet.id + '.to'] = value.to;
					break;
				case 'multi':
					params[facet.id] = facet.value.sort().join(',') ; // this coma is part of the api call so it should not be removed
					break;
				default:
					params[facet.id] =  defvalue;
				}
			});

            params.sort = this.options.order;
            params.limit = this.options.show;
            params.offset = (this.options.show * this.options.page) - this.options.show;

            params.q = this.options.keywords;

            return params;
        },

        getUrl: function ()
        {
            var url = ''
                ,	self = this;

            // Prepears the seo limits
            var facets_seo_limits = {};
            if (SC.ENVIRONMENT.jsEnvironment === 'server')
            {
                facets_seo_limits = {
                    numberOfFacetsGroups: this.configuration.facetsSeoLimits && this.configuration.facetsSeoLimits.numberOfFacetsGroups || false
                    ,	numberOfFacetsValues: this.configuration.facetsSeoLimits && this.configuration.facetsSeoLimits.numberOfFacetsValues || false
                    ,	options: this.configuration.facetsSeoLimits && this.configuration.facetsSeoLimits.options || false
                };
            }

            // If there are too many facets selected
            if (facets_seo_limits.numberOfFacetsGroups && this.facets.length > facets_seo_limits.numberOfFacetsGroups)
            {
                return '#';
            }

            // Adds the category if it's prsent
            var category_string = this.getFacetValue('category');
            if (category_string)
            {
                url = self.configuration.facetDelimiters.betweenDifferentFacets + category_string;
            }

            // Encodes the other Facets
            var sorted_facets = _.sortBy(this.facets, 'url');
            for (var i = 0; i < sorted_facets.length; i++)
            {
                var facet = sorted_facets[i];
                // Category should be already added
                if (facet.id === 'category')
                {
                    //Change break to continue
                    break;
                }
                var name = facet.url || facet.id,
                    value = '';
                switch (facet.config.behavior)
                {
                    case 'range':
                        facet.value = (typeof facet.value === 'object') ? facet.value : {from: 0, to: facet.value};
                        value = facet.value.from + self.configuration.facetDelimiters.betweenRangeFacetsValues + facet.value.to;
                        break;
                    case 'multi':
                        value = facet.value.sort().join(self.configuration.facetDelimiters.betweenDifferentFacetsValues);

                        if (facets_seo_limits.numberOfFacetsValues && facet.value.length > facets_seo_limits.numberOfFacetsValues)
                        {
                            return '#';
                        }

                        break;
                    default:
                        value = facet.value;
                }

                url += self.configuration.facetDelimiters.betweenDifferentFacets + name + self.configuration.facetDelimiters.betweenFacetNameAndValue + value;
            }

            url = (url !== '') ? url : '/'+this.configuration.fallbackUrl;

            // Encodes the Options
            var tmp_options = {}
                ,	separator = this.configuration.facetDelimiters.betweenOptionNameAndValue;
            if (this.options.order && this.options.order !== this.configuration.defaultOrder)
            {
                tmp_options.order = 'order' + separator + this.options.order;
            }

            if (this.options.page && parseInt(this.options.page, 10) !== 1)
            {
                tmp_options.page = 'page' + separator + encodeURIComponent(this.options.page);
            }

            if (this.options.show && parseInt(this.options.show, 10) !== this.configuration.defaultShow)
            {
                tmp_options.show = 'show' + separator + encodeURIComponent(this.options.show);
            }

            if (this.options.display && this.options.display !== this.configuration.defaultDisplay)
            {
                tmp_options.display = 'display' + separator + encodeURIComponent(this.options.display);
            }

            if (this.options.keywords && this.options.keywords !== this.configuration.defaultKeywords)
            {
                tmp_options.keywords = 'keywords' + separator + encodeURIComponent(this.options.keywords);
            }

            var tmp_options_keys = _.keys(tmp_options)
                ,	tmp_options_vals = _.values(tmp_options);


            // If there are options that should not be indexed also return #
            if (facets_seo_limits.options && _.difference(tmp_options_keys, facets_seo_limits.options).length)
            {
                return '#';
            }

            url += (tmp_options_vals.length) ? this.configuration.facetDelimiters.betweenFacetsAndOptions + tmp_options_vals.join(this.configuration.facetDelimiters.betweenDifferentOptions) : '';

            return _(url).fixUrl();
        }


    });

});

(function (application) {

    'use strict';

    var Layout = application.getLayout();

    application.on('beforeStartApp', function() {

        var configuration = application.Configuration
        ,	Layout = application.getLayout();

		  // Fix for the URL on the Category list and Product list
		  application.addModule('Facets.Views.Extended');

    });
	
}(SC.Application('Shopping')));

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

