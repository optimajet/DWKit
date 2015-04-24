/*----------------------------------------------------------------------*/
/* wl_Store v 2.0 by revaxarts.com
/* description: Uses LocalStorage to save information within the Browser
/*				enviroment
/* dependency:  jStorage
/*----------------------------------------------------------------------*/


$.wl_Store = function (namespace) {
	
    if(typeof $.jStorage != 'object') $.error('wl_Store requires the jStorage library');
	
		var namespace = namespace || 'wl_store',

	
		save = function (key, value) {
			return $.jStorage.set(namespace+'_'+key, value);
		},

		get = function (key) {
			return $.jStorage.get(namespace+'_'+key);
		};
		
		remove = function (key) {
			return $.jStorage.deleteKey(namespace+'_'+key);
		},

		flush = function () {
			return $.jStorage.flush();
		},
		
		index = function () {
			return $.jStorage.index();
		};


	//public methods
	return {
		save: function (key, value) {
			return save(key, value);
		},
		get: function (key) {
			return get(key);
		},
		remove: function (key) {
			return remove(key);
		},
		flush: function () {
			return flush();
		},
		index: function () {
			return index();
		}

	}


};