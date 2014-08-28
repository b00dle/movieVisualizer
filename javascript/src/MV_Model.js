var MV_Model = (function() {
	var PUBLIC = {
			dataset: 			[],
			countries: 			[],
			activeCountries: 	[],
			movies:	 			[],
			countryColors:		{},
			ranking:			{}
	};
	
	// private variables
	var color = d3.scale.category20();
	
	// public member functions
	PUBLIC.init = function init(data) {
		
		// copy data into member
		data.forEach(function(d) {
			PUBLIC.dataset.push(d);
		});
		
		// exclude blue from being chosen as color
		PUBLIC.countryColors["Blue"] = color(0);
		
		// fill specific data containers
		var index = 1;
		var tempCountries = {};
		PUBLIC.dataset.forEach(function(d, i){
			PUBLIC.movies.push(d.Title);
			var s = d.Country.toString();
			d["Countries"] = [];
			s.split("-").forEach(function(c) {
				d["Countries"].push({Country:c, Count:1});
				if(!hasOwnProperty(PUBLIC.countryColors, c)) {
					PUBLIC.countryColors[c] = color(index);
					index += 1;
				}
				if(!hasOwnProperty(tempCountries, c)) {
					tempCountries[c] = {Name:c, Count:1, Active:false};
				}
				else {
					tempCountries[c].Count += 1;
				}
			});
			PUBLIC.ranking[d.Title] = i;
		});

		for(var k in tempCountries)
			PUBLIC.countries.push(tempCountries[k]);
		
		// sort production countries descending by movies made
		PUBLIC.countries.sort(function(a,b) {
			return b.Count - a.Count;
		});
	};
	
	// private functions
	function hasOwnProperty(obj, prop) {
		var proto = obj.__proto__ || obj.constructor.prototype;
		return (prop in obj) &&
			(!(prop in proto) || proto[prop] !== obj[prop]);
	}
	
	return PUBLIC;
	
})()