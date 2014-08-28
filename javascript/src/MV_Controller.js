var MV_Controller = (function () {
	var PUBLIC = {};
	var PRIVATE = {};
		
	PUBLIC.init = function init() {
		PRIVATE.updateFisheye = false;
		PRIVATE.yAxisAge = false;
		
		registerKeyboard();
		initDiaInteraction();
		initListInteraction();
	}
	
	function initDiaInteraction() {
		MV_View.element.on("mouseover", function(d) {
			var mouse = d3.mouse(this); 
			var xPos = parseFloat(d3.select(this).attr("cx"));
			var yPos = parseFloat(d3.select(this).attr("cy")) - 5;
			
			//doPie(d);
			
			d3.select(this).transition()
							.duration(500)
							.attr("fill", "orange");
		});
		
		MV_View.element.on("mouseout", function() {
			//d3.select("#pie").remove();
			d3.select(this).transition().duration(500)
					.attr("fill", function(d) {
						var factor = MV_View.yearScaleNorm(d.Year);
						return "rgb(" + Math.ceil(250*(1-factor)) + ", " + Math.ceil(170*factor) + ", " + Math.ceil(255*factor) + ")";
					});
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
					PRIVATE.updateFisheye = !PRIVATE.updateFisheye;
					break;
				case 113:
					resetXpos();
					break;
				case 115:
					PRIVATE.yAxisAge = !PRIVATE.yAxisAge;
					setYScale();
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
	
	return PUBLIC;	
})()