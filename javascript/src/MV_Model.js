var MV_Model = (function() {
	var PUBLIC = {
			dataset: 			[],
			countries: 			[],
			genres:				[],
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
		
		//console.log(PUBLIC.dataset);
		
		// exclude blue from being chosen as color
		PUBLIC.countryColors["Blue"] = color(0);
		
		// fill specific data containers
		var index = 1;
		var tempCountries = {};
		var tempGenres = {};
		PUBLIC.dataset.forEach(function(d, i){
			PUBLIC.movies.push(d.Title);
			
			var sCountry = d.Country.toString();
			d["Countries"] = [];
			d["Active"] = false;
			sCountry.split("-").forEach(function(c) {
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
			
			var sGenre = d.Genre.toString();
			d["Genres"] = [];			
			sGenre.split("-").forEach(function(g) {
				if(g == "SciFi")
					g = "Sci-Fi";
				else if(g == "FilmNoir")
					g = "Film-Noir";
				
				d["Genres"].push({Genre:g, Count:1});
				if(!hasOwnProperty(tempGenres, g)) {
					tempGenres[g] = {Name:g, Count:1, Active:false};
				}
				else {
					tempGenres[g].Count += 1;
				}
			});
			
			PUBLIC.ranking[d.Title] = i+1;
		});

		for(var k in tempCountries)
			PUBLIC.countries.push(tempCountries[k]);
			
		for(var k in tempGenres)
			PUBLIC.genres.push(tempGenres[k]);
		
		// sort production countries descending by movies made
		PUBLIC.countries.sort(function(a,b) {
			return b.Count - a.Count;
		});
		
		// sort movie genres descending
		PUBLIC.genres.sort(function(a,b) {
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