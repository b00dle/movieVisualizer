var MV_View = (function() {
	var PUBLIC = {};
	var PRIVATE = {};
	
	PUBLIC.init = function init(padding) {
		initDia(padding);
		drawDia();
		
		initList();
		drawList();
		
		//initPie();
		//drawPie();
		
		initBar();
		drawBar();
		
		initButtons();
		drawButtons(),
		
		initText();
	}
	
	function initDia(padding) {
		var leftbody = d3.select(".leftbody");
		
		PUBLIC.w = leftbody[0][0].clientWidth - padding;
		PUBLIC.h = Math.round(window.innerHeight*0.96);//480;//720;//
		PUBLIC.diaPadding = padding;//50;
		
		PUBLIC.svgCartesian = leftbody.append("svg")
						.attr("width", Math.round(PUBLIC.w * 0.86))
						.attr("height", PUBLIC.h);
		
		PUBLIC.posScaleX = d3.scale.linear()
					.domain([ d3.max(MV_Model.dataset, function(d,i) { return i; })+10 , -10 ])
					.range([Math.round(PUBLIC.w * 0.85), PUBLIC.diaPadding]);
		
		PUBLIC.rankScaleY = d3.scale.linear()
					.domain([7.8 , 9.4])
					//.domain([ d3.min(MV_Model.dataset, function(d) { return d.Rank; })-0.1 , d3.max(MV_Model.dataset, function(d) { return d.Rank; }) ])
					.range([PUBLIC.h-PUBLIC.diaPadding,0.5*PUBLIC.diaPadding]);
					
		PUBLIC.yearScaleY = d3.scale.linear()
					//.domain([ d3.min(MV_Model.dataset,function(d) { return d.Year; })-5 , d3.max(MV_Model.dataset,function(d) { return d.Year; }) ])
					.domain([1920 , 2020])
					.range([PUBLIC.h-PUBLIC.diaPadding,0.5*PUBLIC.diaPadding]);
					
		PUBLIC.yearScaleNorm = d3.scale.linear()
					.domain([ d3.min(MV_Model.dataset,function(d) { return d.Year; }) , d3.max(MV_Model.dataset,function(d) { return d.Year; }) ])
					.range([0,1]);
		
		PRIVATE.voteScaleRadius = d3.scale.linear()
					.domain([ d3.min(MV_Model.dataset,function(d) { return d.Votes; }) , d3.max(MV_Model.dataset,function(d) { return d.Votes; }) ])
					.range([5,20]);
					
		PUBLIC.posFisheyeScaleX = d3.fisheye
							.scale(d3.scale.linear)
							.domain([ d3.max(MV_Model.dataset, function(d,i) { return i; })+10 , -10 ])
							.range([Math.round(PUBLIC.w * 0.85),PUBLIC.diaPadding]);
		
		PUBLIC.xAxis = d3.svg.axis()
					.scale(PUBLIC.posScaleX)
					.orient("bottom")
					.tickSize(-(PUBLIC.h-1.5*PUBLIC.diaPadding));
		
		PUBLIC.yAxis = d3.svg.axis()
					.scale(PUBLIC.rankScaleY)
					.orient("left")
					.tickSize(-(Math.round(PUBLIC.w * 0.85) - PUBLIC.diaPadding));
					
		PUBLIC.xAxisFisheye = d3.svg.axis()
						.scale(PUBLIC.posFisheyeScaleX)
						.orient("bottom")
						.tickSize(-(PUBLIC.h-1.5*PUBLIC.diaPadding));
	}
	
	function drawDia() {
		
		PUBLIC.svgCartesian.append("rect")
			.attr("class","background")
			.attr("width", Math.round(PUBLIC.w * 0.85) - PUBLIC.diaPadding)
			.attr("height", PUBLIC.h-1.5*PUBLIC.diaPadding)
			.attr("transform", "translate(" + PUBLIC.diaPadding + "," + 0.5*PUBLIC.diaPadding +")");
		
		PRIVATE.xAxisG = PUBLIC.svgCartesian.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (PUBLIC.h-PUBLIC.diaPadding) + ")")
			.call(PUBLIC.xAxis)
			.selectAll("text").attr("transform", "translate(0,15)");
		
		PRIVATE.yAxisG = PUBLIC.svgCartesian.append("g")
			.attr("class","y axis")
			.attr("transform", "translate(" + PUBLIC.diaPadding + ",0)")
			.call(PUBLIC.yAxis)
			.selectAll("text").attr("transform", "translate(-15,0)");
		
		PUBLIC.svgCartesian.append("text")
			.attr("x", 0)
			.attr("y", 0)
			.attr("transform", function() {
				var x = Math.round(PUBLIC.w * 0.85) - PUBLIC.diaPadding - 25;
				var y = PUBLIC.h - PUBLIC.diaPadding + 11 ;
				return "translate(" + x + "," + y + ")";
			})
			.attr("font-family", "sans-serif")
			.attr("font-size", "10px")
			.style("text-anchor", "middle")
			.text("IMDb Top 250 Movies Ranking");
		
		PUBLIC.yLabel = PUBLIC.svgCartesian.append("text")
			.attr("x", 0)
			.attr("y", 0)
			.attr("transform", function() {
				var x = PUBLIC.diaPadding - 4;
				var y = PUBLIC.diaPadding + 15;
				return "translate(" + x + "," + y + ") rotate(-90)";
			})
			.attr("font-family", "sans-serif")
			.attr("font-size", "10px")
			.attr("opacity", "1")
			.style("text-anchor", "middle")
			.text("IMDb Rating");
		
		PUBLIC.element = PUBLIC.svgCartesian.append("g")
				.attr("class", "elements")
				.selectAll("circle")
				.data(MV_Model.dataset)
				.enter()
				.append("circle")
				.call(computeAttributes)
				.sort(function(a, b) { 
					return PRIVATE.voteScaleRadius(b.Votes) - PRIVATE.voteScaleRadius(a.Votes);
				});
		
		PUBLIC.elementAxisLabelX = PUBLIC.svgCartesian.append("g")
			.attr("class", "highlighted");
		
		PUBLIC.elementAxisLabelXText = PUBLIC.elementAxisLabelX.append("text")
			.attr("x", 0)
			.attr("y", 0)
			.attr("font-family", "sans-serif")
			.attr("font-size", "10px")
			.attr("fill", "limegreen")
			.attr("stroke-size", "0.1")
			.attr("font-weight", "bold")
			.attr("opacity", "0")
			.style("text-anchor", "middle");
	}
	
	function computeAttributes(element) {
		element.attr("cx", function(d) {
					return PUBLIC.posScaleX(MV_Model.ranking[d.Title]);
				})
				.attr("cy", function(d) {
					return PUBLIC.rankScaleY(d.Rank);//yearScaleY(d.Year);//
				})
				.attr("r", function(d) {
					return PRIVATE.voteScaleRadius(d.Votes);
				})
				.attr("fill", function(d) {
					var factor = PUBLIC.yearScaleNorm(d.Year);
					return "rgb(" + Math.ceil(250*(1-factor)) + ", " + Math.ceil(170*factor) + ", " + Math.ceil(255*factor) + ")";
				})
				.attr("stroke", "white")
				.attr("stroke-width", 0.2);				
	}
	
	function initList() {
		var leftbody = d3.select(".leftbody");
		var countryNames = [];
		
		MV_Model.countries.forEach(function(c) {
			countryNames.push(c.Name);
		});
		
		PRIVATE.graphCountryScaleY = d3.scale.ordinal()
				.domain(countryNames)
				.rangeRoundBands([20, PUBLIC.h-20], 0.02);
				
		PRIVATE.graphMovieScaleY = d3.scale.ordinal()
					.domain(MV_Model.movies)
					.rangeRoundBands([20, PUBLIC.h-20], 0.02);
		
		PRIVATE.countScaleRadius = d3.scale.linear()
					.domain([d3.min(MV_Model.countries,function(d) { return d.Count; }), d3.max(MV_Model.countries,function(d) { return d.Count; })])
					.range([3, 10]);
					
		PUBLIC.svgGraph = leftbody.append("svg")
						.attr("width", Math.round(PUBLIC.w * 0.14))
						.attr("height", PUBLIC.h);
	}
	
	function drawList() {
		PUBLIC.countryElement = PUBLIC.svgGraph.append("g")
										.attr("class", "elements")
										.selectAll("circle")
										.data(MV_Model.countries)
										.enter()
										.append("circle");
		
		PUBLIC.countryElement.attr("cx", 0.5*PUBLIC.diaPadding)
			.attr("cy", function(d) {
				return PRIVATE.graphCountryScaleY(d.Name);
			})
			.attr("r", function(d) {
				return 5;//return countScaleRadius(d.Count);
			})
			.attr("fill", "rgb(245,245,245)")
			.attr("stroke", "black")
			.attr("stroke-width", 0.4);
			
		PUBLIC.svgGraph.selectAll("text")
			.data(MV_Model.countries)
			.enter()
			.append("text")
			.attr("x", 0.5*PUBLIC.diaPadding)
			.attr("y", function(d) {
				return PRIVATE.graphCountryScaleY(d.Name);
			})
			.attr("transform", "translate(10,4)")
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.text(function(d) {
				return d.Name;// + " (" + d.Count + " Movies)";
			});
	}
	
	function initPie() {
		var genreChart = d3.select(".genreChart");
		
		PRIVATE.pieLayout = d3.layout.pie()
			.value(function(d) {
				return d.Count;
			});
		
		PRIVATE.wPie = Math.round(genreChart[0][0].clientWidth * 0.9);
		PRIVATE.hPie = PRIVATE.wPie;
		
		PRIVATE.pieOuterRadius = PRIVATE.wPie / 2;
		PRIVATE.pieInnerRadius = 0;
		PRIVATE.pieArc = d3.svg.arc()
						.innerRadius(PRIVATE.pieInnerRadius)
						.outerRadius(PRIVATE.pieOuterRadius);
						
		PUBLIC.svgGenresPie = genreChart.append("svg")
									.attr("width", PRIVATE.wPie)
									.attr("height", PRIVATE.hPie);		
	}
	
	function drawPie() {
		PUBLIC.pieArcs = PUBLIC.svgGenresPie.selectAll("g.arc")
			.data(PRIVATE.pieLayout(MV_Model.genres))
			.enter()
			.append("g")
			.attr("class", "arc")
			.attr("transform", "translate(" + PRIVATE.pieOuterRadius + ", " + PRIVATE.pieOuterRadius + ")");

		var color = d3.scale.category20();
		
		PUBLIC.pieArcs.append("path")
			.attr("fill", function(d, i) {
				return color(i);
			})
			.attr("d", PRIVATE.pieArc);
	}
	
	function initBar() {
		var genreChart = d3.select(".genreChart");
		
		PRIVATE.wBar = Math.round(genreChart[0][0].clientWidth);
		PRIVATE.hBar = Math.round(PRIVATE.wBar*9/16);
		
		PUBLIC.svgGenresBar = genreChart.append("svg")
			.attr("width", PRIVATE.wBar)
			.attr("height", PRIVATE.hBar+50);
		
		PRIVATE.xScaleBar = d3.scale.ordinal()
			.domain(d3.range(MV_Model.genres.length))
			.rangeRoundBands([0, PRIVATE.wBar-40], 0.15);
		
		PRIVATE.yScaleBar = d3.scale.linear()
			.domain([d3.min(MV_Model.genres,function(d) { return d.Count; })-1, d3.max(MV_Model.genres,function(d) { return d.Count; })])
			.range([PRIVATE.hBar,5]);
		
		PRIVATE.normScaleFactor = d3.scale.log()
			.domain([d3.min(MV_Model.genres,function(d) { return d.Count; }), d3.max(MV_Model.genres,function(d) { return d.Count; })])
			.range([0,1]);
			
		PUBLIC.yAxisBar = d3.svg.axis()
			.scale(PRIVATE.yScaleBar)
			.orient("right");
	}
	
	function drawBar() {
		PUBLIC.genreBars = PUBLIC.svgGenresBar.append("g")
			.selectAll("rect")
			.data(MV_Model.genres)
			.enter()
			.append("rect")
			.attr("x", function(d, i) {
				return PRIVATE.xScaleBar(i);
			})
			.attr("y", function(d) {
				return PRIVATE.yScaleBar(d.Count);
			})
			.attr("width", PRIVATE.xScaleBar.rangeBand())
			.attr("height", function(d) {
				return PRIVATE.hBar - PRIVATE.yScaleBar(d.Count);
			})
			.attr("fill", function(d) {		
				return "rgb(" + Math.round(50 + 120 * (1-PRIVATE.normScaleFactor(d.Count))) + ",75," + Math.round(90 + 130 * PRIVATE.normScaleFactor(d.Count)) + ")"; 
			});
			
		PUBLIC.svgGenresBar.selectAll("text")
			.data(MV_Model.genres)
			.enter()
			.append("text")
			.attr("x", 0)
			.attr("y", 0)
			.attr("transform", function(d, i) {
				var x = PRIVATE.xScaleBar(i);
				var y = PRIVATE.hBar+5;
				return "translate(" + x + "," + y + ") rotate(40)";
			})
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.style("text-anchor", "right")
			.text(function(d) {
				return d.Name;
			});
			
		PRIVATE.yAxisBarG = PUBLIC.svgGenresBar.append("g")
			.attr("class", "blackaxis")
			.attr("transform", "translate(" + (PRIVATE.wBar-50) + ",0)")
			.call(PUBLIC.yAxisBar);
			
		PRIVATE.yAxisBarG.append("text")
			.attr("x", 0)
			.attr("y", 0)
			.attr("transform", function() {
				var x = 40;
				var y = Math.round(PRIVATE.hBar / 2);
				return "translate(" + x + "," + y + ") rotate(-90)";
			})
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.style("text-anchor", "middle")
			.text("count in top 250 movies");
	}
	
	function initText() {
		var rightbody = d3.select(".rightbody");
		rightbody.style("height", PUBLIC.h + "px");
		
		PUBLIC.rightbodyText = rightbody.append("div")
			.style("opacity", 0);
		
	}
	
	function initButtons() {
		var tools = d3.select(".shortcuts");
		
		PRIVATE.wButtons = tools[0][0].clientWidth;
		PRIVATE.hButtons = Math.round(PUBLIC.h / 12);
		
		PUBLIC.svgShortcuts = tools.append("svg")
						.attr("width", PRIVATE.wButtons)
						.attr("height", PRIVATE.hButtons);
						
		PRIVATE.buttonList = [{Name:"fisheye (F1)", Active:false}, {Name:"reset (F2)", Active:false}, {Name:"yScale (F4)", Active:false}];		
	}
	
	function drawButtons() {
		PUBLIC.buttons = PUBLIC.svgShortcuts.selectAll("g")
				.data(PRIVATE.buttonList)
				.enter()
				.append("g")
				
		PUBLIC.buttonRects = PUBLIC.buttons.append("rect")
				.attr("class", "svgButtons")
				.attr("x", function(d,i) {
					return Math.round(i*(PRIVATE.wButtons/3 + 5));
				})
				.attr("y",0)
				.attr("width", Math.round(PRIVATE.wButtons/3 - 5))
				.attr("height", PRIVATE.hButtons-5)
				.attr("fill", "darkslategrey");
				
		PUBLIC.buttonTexts = PUBLIC.buttons.append("text")
				.attr("class", "svgButtons")
				.attr("x", function(d,i) {
					return Math.round(i*(PRIVATE.wButtons/3 + 5)) + Math.round(0.5*(PRIVATE.wButtons/3 - 5));
				})
				.attr("y", Math.round(PRIVATE.hButtons)/2)
				.attr("fill", "white")
				.style("text-anchor", "middle")
				.text(function(d) {
					return d.Name;
				});
	}
	
	return PUBLIC;
	
})()