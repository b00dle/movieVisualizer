var MV_Controller = (function () {
	var PUBLIC = {};
	var PRIVATE = {};
		
	PUBLIC.init = function init() {
		PRIVATE.updateFisheye = false;
		PRIVATE.brushFisheye = false;
		PRIVATE.elmentsBrushed = false;
		PRIVATE.yAxisAge = false;
		
		registerKeyboard();
		initDiaInteraction();
		initListInteraction();
		initButtonInteraction();
		initBarInteraction();
	}
	
	function initDiaInteraction() {
		initBrush();
		
		MV_View.element.on("click", function(d) {
			removeHighlight(d.Title);
			if(PRIVATE.elmentsBrushed)
				resetBrush();
			if(!d.Active) {
				d.Active = true;
				var mouse = d3.mouse(this); 
				var xPos = parseFloat(d3.select(this).attr("cx"));
				var yPos = parseFloat(d3.select(this).attr("cy")) - 5;
				
				var selectedCountries 	= d.Countries;
				var selectedGenres 		= d.Genres;
				var selectedRank 		= MV_Model.ranking[d.Title];
				var selectedTitle 		= d.Title;
				var selectedYear 		= d.Year;
				var selectedRating 		= d.Rank;
				var selectedXPos 		= d3.select(this).attr("cx");
				var selectedYPos 		= d3.select(this).attr("cy");
				
				MV_View.elementAxisLabelXText
					.transition().duration(250)
					.attr("opacity", "0")
					.each("end", function() {
						d3.select(this)
							.attr("x", selectedXPos)
							.attr("y", MV_View.h - 0.5 * MV_View.diaPadding + 1.0)
							.text(selectedRank + "")
							.transition().duration(250)
							.attr("opacity", "1");
						
						var bbox = MV_View.elementAxisLabelXText.node().getBBox();
		
						MV_View.elementAxisLabelXBox
							.attr("x", bbox.x)
							.attr("y", bbox.y)
							.attr("width", bbox.width)
							.attr("height", bbox.height)
							.transition().duration(250)
							.attr("opacity", "1");
					});
					
				MV_View.elementAxisLabelYText
					.transition().duration(250)
					.attr("opacity", "0")
					.each("end", function() {
						d3.select(this).text(function() {
							if(PRIVATE.yAxisAge) {
								return selectedYear + "";
							}
							else {
								return selectedRating + "";
							}
						});
						
						var bbox = d3.select(this).node().getBBox();
						var y = parseInt(selectedYPos) + bbox.height/2 - 1.5;
												
						d3.select(this)
							.attr("x", function() {
								if(PRIVATE.yAxisAge) {
									return 0.5 * MV_View.diaPadding - 6.5;
								}
								else {
									return 0.5 * MV_View.diaPadding - 1.0;
								}
							})
							.attr("y", y)
							.text(function() {
								if(PRIVATE.yAxisAge) {
									return selectedYear + "";
								}
								else {
									return selectedRating + "";
								}
							})
							.transition().duration(250)
							.attr("opacity", "1");
						
						bbox = MV_View.elementAxisLabelYText.node().getBBox();
		
						MV_View.elementAxisLabelYBox
							.attr("x", bbox.x)
							.attr("y", bbox.y)
							.attr("width", bbox.width)
							.attr("height", bbox.height)
							.transition().duration(250)
							.attr("opacity", "1");
					});

				
					
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
								return "limegreen"
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
					
				MV_View.genreBars.attr("stroke", function(d) {
						var isActive = false;
							selectedGenres.forEach(function(genre) {
								if(d.Name == genre.Genre)
									isActive = true;
							});
							if(isActive)
								return "limegreen"
							else
								return "black";
					})
					.transition().duration(500)
					.attr("stroke-width", function(d) {
						var isActive = false;
							selectedGenres.forEach(function(genre) {
								if(d.Name == genre.Genre)
									isActive = true;
							});
							if(isActive)
								return "3.0";
							else
								return "0.0";
					});
				
				d3.select(this).transition()
								.duration(500)
								.attr("fill","limegreen")
			}
			else {
				d.Active = false;
				
				MV_View.countryElement.transition().duration(500).attr("stroke-width", "0.2")
					.attr("stroke", "black");
					
				MV_View.genreBars.transition().duration(500).attr("stroke-width", "0.0")
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
				
				if(!PRIVATE.brushFisheye)
					PRIVATE.brushFisheye = true;
				
				PRIVATE.diaBrush.x(MV_View.posFisheyeScaleX);
			}
		});
	}
	
	function initBrush() {
		PRIVATE.brushedData = [];
		PRIVATE.brushedGenres = [];
		PRIVATE.brushedCountries = [];
	
		PRIVATE.diaBrush = d3.svg.brush()
			.x(MV_View.posScaleX)
			.y(MV_View.rankScaleY)
			.on("brush", brushMove)
			.on("brushend", brushEnd);
			
		MV_View.brushArea
			.call(PRIVATE.diaBrush)
			.selectAll("rect")
			.attr("opacity", "0.6");
	}
	
	function brushMove() {
		var extent = PRIVATE.diaBrush.extent();
		var min = extent[0];
		var max = extent[1];
		
		var tempElementsBrushed = false;
		MV_View.element.classed("selected", function(d) {
			var minX = min[0];
			var maxX = max[0];
			var minY = min[1];
			var maxY = max[1];
			
			//evaluate brushing
			var x;
			var y;
			if(PRIVATE.yAxisAge)
				y = d.Year;
			else
				y = d.Rank;
				
			x = MV_Model.ranking[d.Title];
			if(PRIVATE.brushFisheye)
				x = MV_View.posFisheyeScaleX(x);
									
			var is_brushed = minX < x && minY < y && maxX > x && maxY > y;
			
			if(is_brushed) {
				d.Brushed = true;
				if(!tempElementsBrushed)
					tempElementsBrushed = true;
			}
			else
				d.Brushed = false;
			
			return is_brushed;
		});
		
		PRIVATE.elmentsBrushed = tempElementsBrushed;
	}
	
	function brushEnd() {
		MV_Model.activeGenres = [];
		MV_Model.activeCountries = [];
		MV_View.element
			.attr("stroke", "white")
			.transition().duration(500)
			.attr("stroke-width", function(d) {
				d.Transparent = false;
				return 0.2;
			})
			.each("end", function() {
				
			});
			
		MV_View.countryElement
			.attr("fill", "white");
		
		PRIVATE.diaBrush.clear();
		MV_View.brushArea.call(PRIVATE.diaBrush);
		
		PRIVATE.brushedData = [];
		PRIVATE.brushedGenres = [];
		PRIVATE.brushedCountries = [];
		
		var tempBrushedGenres = {};
		var tempBrushedCountries = {};
		MV_View.element.each(function(d) {
			//remove highlight from mouse selected elements
			if(d.Active) {
				d.Active = false;
				MV_View.countryElement.attr("stroke-width", "0.2")
					.attr("stroke", "black");
								
				MV_View.genreBars.transition().duration(500)
					.attr("stroke-width", "0.0")
					.attr("stroke", "black");
					
				d3.select(this).transition().duration(500)
						.attr("fill", function(d) {
							var factor = MV_View.yearScaleNorm(d.Year);
							return "rgb(" + Math.ceil(250*(1-factor)) + ", " + Math.ceil(170*factor) + ", " + Math.ceil(255*factor) + ")";
						});

				MV_View.rightbodyText.transition().duration(500)
					.style("opacity", 0);
					
				MV_View.elementAxisLabelXBox
					.attr("opacity", "0");
				
				MV_View.elementAxisLabelXText
					.attr("opacity", "0");
				
				MV_View.elementAxisLabelYBox
					.attr("opacity", "0");
				
				MV_View.elementAxisLabelYText
					.attr("opacity", "0");
								
				MV_View.rightbodyText.html();
			}
			
			if(d.Brushed) {
				PRIVATE.brushedData.push(d);
				d.Genres.forEach(function(genre) {
					if(MV_Model.hasOwnProperty(tempBrushedGenres, genre.Genre)) {
						tempBrushedGenres[genre.Genre].Count += 1;
					}
					else {
						tempBrushedGenres[genre.Genre] = {Name:genre.Genre, Count:1, Active: false};
					}
				});
				d.Countries.forEach(function(country) {
					if(MV_Model.hasOwnProperty(tempBrushedCountries, country.Country)) {
						tempBrushedCountries[country.Country].Count += 1;
					}
					else {
						tempBrushedCountries[country.Country] = {Name:country.Country, Count:1, Active: false};
					}
				});
			}
		});
		
		MV_View.element
			.attr("opacity", function(d) {
				if(d.Brushed || !PRIVATE.elmentsBrushed)
					return "1.0";
				else 
					return "0.3";
			});
		
		MV_View.element.sort(function(a, b) { 
					if(a.Brushed != b.Brushed) {
						if(a.Brushed)
							return 1;
						else
							return -1;
					}
					if(a.Transparent != b.Transparent) {
						if(a.Transparent)
							return -1;
						else
							return 1;
					}
					return MV_View.voteScaleRadius(b.Votes) - MV_View.voteScaleRadius(a.Votes);
				});
		
		for(var k in tempBrushedGenres)
			PRIVATE.brushedGenres.push(tempBrushedGenres[k]);
		
		for(var k in tempBrushedCountries)
			PRIVATE.brushedCountries.push(tempBrushedCountries[k]);
		
		PRIVATE.brushedGenres.sort(function(a,b) {
			return b.Count - a.Count;
		});
		
		PRIVATE.brushedCountries.sort(function(a,b) {
			return b.Count - a.Count;
		});
		
		if(PRIVATE.elmentsBrushed) {
			MV_View.redrawBar(PRIVATE.brushedGenres, false);
			MV_View.redrawList(PRIVATE.brushedCountries, false);
		}
		else {
			MV_View.redrawBar(MV_Model.genres, true);
			MV_View.redrawList(MV_Model.countries, true);
		}
		
		initBarInteraction();
		initListInteraction();
	}
	
	function resetBrush() {
		MV_View.countryElement.attr("stroke-width", "0.2")
					.attr("stroke", "black");
					
		MV_View.element
			.attr("fill", function(d) {
				if(d.Brushed)
					d.Brushed = false;
				if(d.Transparent)
					d.Transparent = false;
				var factor = MV_View.yearScaleNorm(d.Year);
				return "rgb(" + Math.ceil(250*(1-factor)) + ", " + Math.ceil(170*factor) + ", " + Math.ceil(255*factor) + ")";
			})
			.attr("opacity", "1")
			.attr("stroke", "white")
			.attr("stroke-width", 0.2)	
			.classed("selected", false);
		
		MV_View.element.sort(function(a, b) { 
			if(a.Brushed != b.Brushed) {
				if(a.Brushed)
					return 1;
				else
					return -1;
			}
			if(a.Transparent != b.Transparent) {
				if(a.Transparent)
					return -1;
				else
					return 1;
			}
			return MV_View.voteScaleRadius(b.Votes) - MV_View.voteScaleRadius(a.Votes);
		});
		
		MV_View.countryElement.attr("fill", function(d) {
			if(d.Active)
				d.Active = false;
			return "white";
		});
		
		MV_View.redrawBar(MV_Model.genres, true);
		PRIVATE.brushedGenres = [];
		PRIVATE.brushedCountries = [];
		PRIVATE.diaBrush.clear();
		PRIVATE.elmentsBrushed = false;
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
		
		MV_View.elementAxisLabelXText.transition().duration(500)
			.attr("opacity", "0");
			
		MV_View.elementAxisLabelXBox.transition().duration(500)
			.attr("opacity", "0");
			
		MV_View.elementAxisLabelYText.transition().duration(500)
			.attr("opacity", "0");
			
		MV_View.elementAxisLabelYBox.transition().duration(500)
			.attr("opacity", "0");
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
			solveOpacity();
		});			
	}
	
	function updateXpos(element) {
		var activeElement = false;
		var xPos = 0;
		
		element.attr("cx", function(d) {
			if(d.Active) {
				activeElement = true;
				xPos = MV_View.posFisheyeScaleX(MV_Model.ranking[d.Title]);
			}
			return MV_View.posFisheyeScaleX(MV_Model.ranking[d.Title]);//posScaleX(i);
		});
		
		if(activeElement) {
			MV_View.elementAxisLabelXText
				.attr("x", xPos);
			
			var bbox = MV_View.elementAxisLabelXText.node().getBBox();
			
			MV_View.elementAxisLabelXBox
				.attr("x", bbox.x);
		}
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
		PRIVATE.brushFisheye = false;
		PRIVATE.diaBrush.x(MV_View.posScaleX);
		
		var activeElement = false;
		var xPos = 0;
		MV_View.element.transition()
			.duration(1000)
			.attr("cx", function(d) {
				if(d.Active) {
					activeElement = true;
					xPos = MV_View.posScaleX(MV_Model.ranking[d.Title]);
				}
				return MV_View.posScaleX(MV_Model.ranking[d.Title]);
			});
			
		MV_View.svgCartesian.select(".x.axis")
			.transition()
			.duration(1000)
			.call(MV_View.xAxis);
			
		if(activeElement) {
			MV_View.elementAxisLabelXText
				.transition().duration(1000)
				.attr("x", xPos);
			
			var bbox = MV_View.elementAxisLabelXText.node().getBBox();
			
			MV_View.elementAxisLabelXBox
				.transition().duration(1000)
				.attr("x", xPos-(bbox.width/2));
		}
	}
	
	function setYScale() {
		var activeElement = false;
		var yPos = 0;
		var text = "";
		if(PRIVATE.yAxisAge) {
			PRIVATE.diaBrush.y(MV_View.yearScaleY)
			MV_View.brushArea.call(PRIVATE.diaBrush);
			
			MV_View.element.transition()
				.duration(1000)
				.attr("cy", function(d) {
					if(d.Active) {
						activeElement = true;
						yPos = MV_View.yearScaleY(d.Year);
						text = d.Year + "";
					}
					return MV_View.yearScaleY(d.Year);
				});
			
			MV_View.element.sort(function(a, b) { 
				if(a.Brushed != b.Brushed) {
					if(a.Brushed)
						return 1;
					else
						return -1;
				}
				if(a.Transparent != b.Transparent) {
					if(a.Transparent)
						return -1;
					else
						return 1;
				}
				return MV_View.voteScaleRadius(b.Votes) - MV_View.voteScaleRadius(a.Votes);
			});
			
			MV_View.yAxis.scale(MV_View.yearScaleY);
			
			MV_View.svgCartesian.select(".y.axis")
				.transition()
				.duration(500)
				.attr("opacity", "0")
				.each("end", function() {
					d3.select(this).call(MV_View.yAxis)
						.selectAll("text").attr("transform", "translate(-15,0)");
					d3.select(this).transition().duration(500)
						.attr("opacity", "1");
				});
			
			MV_View.yLabel.transition().duration(500)
				.attr("opacity", "0")
				.each("end", function() {
					MV_View.yLabel.text("Production Year")
						.transition().duration(500)
						.attr("opacity","1");
				});
			
			if(activeElement) {
				MV_View.elementAxisLabelYBox
					.transition().duration(500)
					.attr("opacity", "0");
					
				MV_View.elementAxisLabelYText
					.transition().duration(500)
					.attr("opacity", "0")
					.each("end", function() {
						d3.select(this)
							.text(text);
						
						var bbox = MV_View.elementAxisLabelYText.node().getBBox();
						
						var y = parseInt(yPos) + bbox.height/2 - 1.5;
						
						d3.select(this)
							.attr("x", function() {
								if(PRIVATE.yAxisAge) {
									return 0.5 * MV_View.diaPadding - 6.5;
								}
								else {
									return 0.5 * MV_View.diaPadding - 1.0;
								}
							})
							.attr("y", y)
							.transition().duration(500)
							.attr("opacity", "1");
						
						bbox = MV_View.elementAxisLabelYText.node().getBBox();
						
						MV_View.elementAxisLabelYBox
							.attr("x", bbox.x)
							.attr("y", bbox.y)
							.attr("width", bbox.width)
							.transition().duration(500)
							.attr("opacity", "1");
					});
			}
		}
		else {
			PRIVATE.diaBrush.y(MV_View.rankScaleY)
			MV_View.brushArea.call(PRIVATE.diaBrush);
			
			MV_View.element.transition()
					.duration(1000)
					.attr("cy", function(d) {
						if(d.Active) {
							activeElement = true;
							yPos = MV_View.rankScaleY(d.Rank);
							text = d.Rank + "";
						}
						return MV_View.rankScaleY(d.Rank);
					});
					
			MV_View.element.sort(function(a, b) { 
				if(a.Brushed != b.Brushed) {
					if(a.Brushed)
						return 1;
					else
						return -1;
				}
				if(a.Transparent != b.Transparent) {
					if(a.Transparent)
						return -1;
					else
						return 1;
				}
				return MV_View.voteScaleRadius(b.Votes) - MV_View.voteScaleRadius(a.Votes);
			});
			
			MV_View.yAxis.scale(MV_View.rankScaleY);
			
			MV_View.svgCartesian.select(".y.axis")
				.transition()
				.duration(500)
				.attr("opacity", "0")
				.each("end", function() {
					d3.select(this).call(MV_View.yAxis)
						.selectAll("text").attr("transform", "translate(-15,0)");
					d3.select(this).transition().duration(500)
						.attr("opacity", "1");
				});
				
			MV_View.yLabel.transition().duration(500)
				.attr("opacity", "0")
				.each("end", function() {
					MV_View.yLabel.text("IMDb Rating")
						.transition().duration(500)
						.attr("opacity","1");
				});
				
			if(activeElement) {
				MV_View.elementAxisLabelYBox
					.transition().duration(500)
					.attr("opacity", "0");
				
				MV_View.elementAxisLabelYText
					.transition().duration(500)
					.attr("opacity", "0")
					.each("end", function() {
						d3.select(this)
							.text(text);
							
						var bbox = MV_View.elementAxisLabelYText.node().getBBox();
						
						var y = parseInt(yPos) + bbox.height/2 - 1.5;
						
						d3.select(this)
							.attr("x", function() {
								if(PRIVATE.yAxisAge) {
									return 0.5 * MV_View.diaPadding - 6.5;
								}
								else {
									return 0.5 * MV_View.diaPadding - 1.0;
								}
							})
							.attr("y", y)
							.transition().duration(500)
							.attr("opacity", "1");
						
						bbox = MV_View.elementAxisLabelYText.node().getBBox();
						
						MV_View.elementAxisLabelYBox
							.attr("x", bbox.x)
							.attr("y", bbox.y)
							.attr("width", bbox.width)
							.transition().duration(500)
							.attr("opacity", "1");
					});
			}
		}
	}
	
	function flipElementStrokeStyle(name, isActive) {
		MV_View.element.transition()
			.duration(200)
			.attr("stroke-width",function(da) {
				var fromCountry = false;
				var hasGenre = false;
				var stillActive = false;
				da.Countries.forEach(function(c) {
					if(c["Country"] === name)
						fromCountry = true;
					else if(arrayContains(MV_Model.activeCountries, c["Country"])){
						stillActive = true;
					}
				});
				da.Genres.forEach(function(g) {
					if(g["Genre"] === name)
						hasGenre = true;
					else if(arrayContains(MV_Model.activeGenres, g["Genre"])){
						stillActive = true;
					}
				});
				if(fromCountry || hasGenre || stillActive) {
					if(isActive || stillActive) {
						if(PRIVATE.elmentsBrushed){
							if(da.Brushed) {
								da.Transparent = false;
								return 3.0;
							}
							else {
								da.Transparent = true;
								return 0.2;
							}						
						}
						else {
							da.Transparent = false;
							return 3.0;
						}
					}
					else {
						da.Transparent = true;
						return 0.2;
					}
				}
				else {
					var strokeWidth = d3.select(this).attr("stroke-width");
					if(parseFloat(strokeWidth) < 2.9)
						da.Transparent = true;
					else
						da.Transparent = false;
					return strokeWidth;
				}
			})
			.transition()
			.duration(200)
			.attr("stroke",function(da) {
				var fromCountry = false;
				var hasGenre = false;
				var stillActive = false;
				da.Countries.forEach(function(c) {
					if(c["Country"] === name)
						fromCountry = true;
					else if(arrayContains(MV_Model.activeCountries, c["Country"]))
						stillActive = true;
				});
				da.Genres.forEach(function(g) {
					if(g["Genre"] === name)
						hasGenre = true;
					else if(arrayContains(MV_Model.activeGenres, g["Genre"])){
						stillActive = true;
					}
				});
				if(fromCountry || hasGenre || stillActive) {
					if(isActive || stillActive) {
						if(PRIVATE.elmentsBrushed){
							if(da.Brushed) {
								return "orange";
							}
							else {
								return "white";
							}						
						}
						else {
							return "orange";
						}
					}
					else {
						return "white";
					}
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
	
	function initBarInteraction() {
		MV_View.genreBars.on("click", function(d) {
			d.Active = !d.Active;
			if(d.Active) {
				d3.select(this)
					.transition()
					.duration(500)
					.attr("fill", "orange");
				MV_Model.activeGenres.push(d.Name);
			}
			else {
				d3.select(this)
					.transition()
					.duration(500)
					.attr("fill", function(d) {
						var r = Math.round(50 + 120 * (1-MV_View.normScaleFactor(d.Count)));
						var g = 75;
						var b = Math.round(90 + 130 * MV_View.normScaleFactor(d.Count));
						return "rgb(" + r + "," + g + "," + b + ")"; 
					});
				arrayRemove(MV_Model.activeGenres, d.Name);
			}
			flipElementStrokeStyle(d.Name, d.Active);
			solveOpacity();
		});
	}
	
	function solveOpacity() {
		if(MV_Model.activeGenres.length > 0 || MV_Model.activeCountries.length > 0) {
			MV_View.element.attr("opacity", function(d) {
					if(d.Transparent)
						return "0.3";
					else {
						if(PRIVATE.elmentsBrushed){
							if(d.Brushed)
								return "1.0";
							else {
								d.Transparent = true;
								return "0.3";
							}
						}
						else {
							return "1.0";
						}
					}
				});
		}
		
		if(MV_Model.activeGenres.length == 0 && MV_Model.activeCountries.length == 0){
			MV_View.element.attr("opacity", function(d) {
				if(PRIVATE.elmentsBrushed) {
					if(d.Brushed) {
						return "1.0";
					}
					else {
						d.Transparent = true;
						return "0.3";
					}
				}
				return "1.0";
			});
		}
		
		MV_View.element.sort(function(a, b) { 
			if(a.Brushed != b.Brushed) {
				if(a.Brushed)
					return 1;
				else
					return -1;
			}
			if(a.Transparent != b.Transparent) {
				if(a.Transparent)
					return -1;
				else
					return 1;
			}
			return MV_View.voteScaleRadius(b.Votes) - MV_View.voteScaleRadius(a.Votes);
		});
	}
	
	return PUBLIC;	
})()