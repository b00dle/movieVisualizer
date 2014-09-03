var MV_Controller = (function () {
	var PUBLIC = {};
	var PRIVATE = {};
		
	PUBLIC.init = function init() {
		PRIVATE.updateFisheye = false;
		PRIVATE.yAxisAge = false;
		
		registerKeyboard();
		initDiaInteraction();
		initListInteraction();
		initButtonInteraction();
	}
	
	function initDiaInteraction() {
		MV_View.element.on("click", function(d) {
			removeHighlight(d.Title);
			if(!d.Active) {
				d.Active = true;
				var mouse = d3.mouse(this); 
				var xPos = parseFloat(d3.select(this).attr("cx"));
				var yPos = parseFloat(d3.select(this).attr("cy")) - 5;
				
				//doPie(d);
				
				var selectedCountries = d.Countries;
				var selectedGenres = d.Genres;
				
				MV_View.rightbodyText.transition().duration(250)
					.style("opacity", 0.0)
					.each("end", function() {
						d3.select(this).html(function() {
							var html = "<h2 class='headline'>" + d.Title  + "</h2>";
							
							html += "(IMDb rating: " + d.Rank + ", IMDb ranking: " + (MV_Model.ranking[d.Title] + 1) + ", IMDb votes: " + d.Votes + ")";
							
							html += "<br><br><div class='bigger'>Production country:</div>";
							
							selectedCountries.forEach(function(country, i) {
								if(i > 0)
									html += ",";
								html += " " + country.Country
								
							});
							
							html += "<br><br><div class='bigger'>Year:</div> " + d.Year;
							
							html += "<br><br><div class='bigger'>Genre:</div>";
							
							selectedGenres.forEach(function(genre, i) {
								if(i > 0)
									html += ",";
								html += " " + genre.Genre
								
							});
							
							return html;
						});
						
						d3.select("#wikisearch")[0][0].value = d.Title;
						d3.select("#imdbsearch")[0][0].value = d.Title;
				
						d3.select(this).transition().duration(500)
							.style("opacity", 1.0);
					});
				
				
							
				MV_View.countryElement.attr("stroke", function(d) {
						var isActive = false;
							selectedCountries.forEach(function(country) {
								if(d.Name == country.Country)
									isActive = true;
							});
							if(isActive)
								return "lightgreen";
							else
								return "black";
					})
					.transition().duration(500)
					.attr("stroke-width", function(d) {
						var isActive = false;
							selectedCountries.forEach(function(country) {
								if(d.Name == country.Country)
									isActive = true;
							});
							if(isActive)
								return "3.0";
							else
								return "0.2";
					});
				
				d3.select(this).transition()
								.duration(500)
								.attr("fill", "lightgreen");
			}
			else {
				d.Active = false;
				
				//d3.select("#pie").remove();
				MV_View.countryElement.transition().duration(500).attr("stroke-width", "0.2")
					.attr("stroke", "black");
					
				d3.select(this).transition().duration(500)
						.attr("fill", function(d) {
							var factor = MV_View.yearScaleNorm(d.Year);
							return "rgb(" + Math.ceil(250*(1-factor)) + ", " + Math.ceil(170*factor) + ", " + Math.ceil(255*factor) + ")";
						});

				MV_View.rightbodyText.transition().duration(500)
					.style("opacity", 0);
					
				MV_View.rightbodyText.html();
			}
		});
		
		MV_View.svgCartesian.on("mousemove", function() {
			if(PRIVATE.updateFisheye) {
				var mouse = d3.mouse(this);
				MV_View.posFisheyeScaleX.distortion(5).focus(mouse[0]);
								
				MV_View.element.call(updateXpos);
				
				MV_View.svgCartesian.select(".x.axis")
					.call(MV_View.xAxisFisheye);
			}
		});
	}
	
	function removeHighlight(butName) {
		MV_View.element.transition().duration(500)
			.attr("fill", function(d) {
				if(d.Title != butName && d.Active) {
					d.Active = false;
					var factor = MV_View.yearScaleNorm(d.Year);
					return "rgb(" + Math.ceil(250*(1-factor)) + ", " + Math.ceil(170*factor) + ", " + Math.ceil(255*factor) + ")";
				}
				else {
					return d3.select(this).attr("fill");
				}
			});
		
		MV_View.countryElement.transition().duration(500).attr("stroke-width", "0.2")
					.attr("stroke", "black");
	}
	
	function initListInteraction() {
		MV_View.countryElement.on("click", function(d) {
			d.Active = !d.Active;
			if(d.Active) {
				d3.select(this)
					.transition()
					.duration(500)
					.attr("fill", "orange");
				MV_Model.activeCountries.push(d.Name);
			}
			else {
				d3.select(this)
					.transition()
					.duration(500)
					.attr("fill", "rgb(245,245,245)");
				arrayRemove(MV_Model.activeCountries, d.Name);
			}
			
			flipElementStrokeStyle(d.Name, d.Active);
		});			
	}
	
	function updateXpos(element) {
		element.attr("cx", function(d) {
			return MV_View.posFisheyeScaleX(MV_Model.ranking[d.Title]);//posScaleX(i);
		});
	}
	
	function registerKeyboard() {
		var body = d3.select("body");
		
		body.on("keypress", function() {
			switch(d3.event.keyCode) {
				case 112: 	
					var name = "fisheye (F1)"; 	
					PRIVATE.updateFisheye = !PRIVATE.updateFisheye;
					svgButtonPressed(name);
					break;
				case 113:
					var name = "reset (F2)";
					resetXpos();
					svgButtonPressed(name);
					break;
				case 115:
					var name = "yScale (F4)";
					PRIVATE.yAxisAge = !PRIVATE.yAxisAge;
					setYScale();
					svgButtonPressed(name);
					break;
			}
		});
	}
	
	function resetXpos() {
		MV_View.element.transition()
			.duration(1000)
			.attr("cx", function(d) {
					return MV_View.posScaleX(MV_Model.ranking[d.Title]);
			});
			
		MV_View.svgCartesian.select(".x.axis")
			.transition()
			.duration(1000)
			.call(MV_View.xAxis);
	}
	
	function setYScale() {
		if(PRIVATE.yAxisAge) {
			MV_View.element.transition()
				.duration(1000)
				.attr("cy", function(d) {
					return MV_View.yearScaleY(d.Year);
				});
			
			MV_View.yAxis.scale(MV_View.yearScaleY);
			
			MV_View.svgCartesian.select(".y.axis")
				.transition()
				.duration(500)
				.call(MV_View.yAxis);								
		}
		else {
			MV_View.element.transition()
					.duration(1000)
					.attr("cy", function(d) {
						return MV_View.rankScaleY(d.Rank);
					});
			
			MV_View.yAxis.scale(MV_View.rankScaleY);
			
			MV_View.svgCartesian.select(".y.axis")
				.transition()
				.duration(500)
				.call(MV_View.yAxis);
		}
	}
	
	function flipElementStrokeStyle(name, isActive) {
		MV_View.element.transition()
			.duration(200)
			.attr("stroke-width",function(da) {
				var fromCountry = false;
				var stillActive = false;
				da.Countries.forEach(function(c) {
					if(c["Country"] === name)
						fromCountry = true;
					else if(arrayContains(MV_Model.activeCountries, c["Country"])){
						stillActive = true;
					}
				});
				if(fromCountry || stillActive) {
					if(isActive || stillActive)
						return 3.0;
					else
						return 0.2;
				}
				else
					return d3.select(this).attr("stroke-width");
			})
			.transition()
			.duration(200)
			.attr("stroke",function(da) {
				var fromCountry = false;
				var stillActive = false;
				da.Countries.forEach(function(c) {
					if(c["Country"] === name)
						fromCountry = true;
					else if(arrayContains(MV_Model.activeCountries, c["Country"])){
						stillActive = true;
					}
				});
				if(fromCountry || stillActive) {
					if(isActive || stillActive)
						return "orange";
					else
						return "white";
				}
				else
					return d3.select(this).attr("stroke");
			});
	}
	
	function arrayRemove(a, obj) {
		var index = a.indexOf(obj);
		if (index > -1) {
			a.splice(index, 1);
		}
	}
	
	function arrayContains(a, obj) {
		for (var i = 0; i < a.length; i++) {
			if (a[i] === obj) {
				return true;
			}
		}
		return false;
	}
	
	function initButtonInteraction() {
		MV_View.buttons.on("click", function(d) {
			d3.select(this).selectAll("rect")
				.transition().duration(250)
				.attr("fill", function(d) {
					if(d.Active) {
						d.Active = false;
						return "darkslategrey";
					}
					else {
						d.Active = true;
						return "darkseagreen";
					}
				})
				.each("end", function(d) {
					if(d.Name != "fisheye (F1)") {
						d3.select(this).transition().duration(250)
							.attr("fill", function(d) {
								if(d.Active) {
									d.Active = false;
									return "darkslategrey";
								}
								else {
									d.Active = true;
									return "darkseagreen";
								}
							});
					}
				});
			
			switch(d.Name) {
				case "fisheye (F1)": 	
					PRIVATE.updateFisheye = !PRIVATE.updateFisheye;
					break;
				case "reset (F2)":
					resetXpos();
					break;
				case "yScale (F4)":
					PRIVATE.yAxisAge = !PRIVATE.yAxisAge;
					setYScale();
					break;
			}
			
		});
		
		MV_View.buttons.on("mouseover", function() {
			d3.select(this).transition().duration(200)
				.attr("fill", "#446161");
		});
		
		MV_View.buttons.on("mouseout", function() {
			d3.select(this).transition().duration(200).attr("fill", "darkslategrey");
		});
	}
	
	function svgButtonPressed(name) {
		MV_View.buttons.each(function(d) {
			if(d.Name == name) {
				d3.select(this).selectAll("rect")
					.transition()
					.duration(250)
					.attr("fill", function(d) {
						if(d.Active) {
							d.Active = false;
							return "darkslategrey";
						}
						else {
							d.Active = true;
							return "darkseagreen";
						}
					})
					.each("end", function(d) {
						if(d.Name != "fisheye (F1)") {
							d3.select(this).transition().duration(250)
								.attr("fill", function(d) {
									if(d.Active) {
										d.Active = false;
										return "darkslategrey";
									}
									else {
										d.Active = true;
										return "darkseagreen";
									}
								});
						}
					});
			}
		});
	}
	
	return PUBLIC;	
})()