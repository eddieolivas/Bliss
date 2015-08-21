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
