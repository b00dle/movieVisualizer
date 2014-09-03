var MV_View = (function() {
	var PUBLIC = {};
	var PRIVATE = {};
	
	PUBLIC.init = function init(padding) {
		initDia(padding);
		drawDia();
		
		initList();
		drawList();
		
		initPie();
		drawPie();
		
		initButtons();
		drawButtons(),
		
		initText();
	}
	
	function initDia(padding) {
		var leftbody = d3.select(".leftbody");
		
		PRIVATE.w = leftbody[0][0].clientWidth - padding;
		PRIVATE.h = Math.round(window.innerHeight*0.96);//480;//720;//
		PRIVATE.diaPadding = padding;//50;
		
		PUBLIC.svgCartesian = leftbody.append("svg")
						.attr("width", Math.round(PRIVATE.w * 0.85))
						.attr("height", PRIVATE.h);
		
		PUBLIC.posScaleX = d3.scale.linear()
					.domain([ d3.max(MV_Model.dataset, function(d,i) { return i; })+10 , 1 ])
					.range([PRIVATE.diaPadding, Math.round(PRIVATE.w * 0.85) - PRIVATE.diaPadding]);
		
		PUBLIC.rankScaleY = d3.scale.linear()
					.domain([ d3.min(MV_Model.dataset, function(d) { return d.Rank; })-0.1 , d3.max(MV_Model.dataset, function(d) { return d.Rank; }) ])
					.range([PRIVATE.h-PRIVATE.diaPadding,PRIVATE.diaPadding]);
					
		PUBLIC.yearScaleY = d3.scale.linear()
					.domain([ d3.min(MV_Model.dataset,function(d) { return d.Year; })-5 , d3.max(MV_Model.dataset,function(d) { return d.Year; }) ])
					.range([PRIVATE.h-PRIVATE.diaPadding,PRIVATE.diaPadding]);
					
		PUBLIC.yearScaleNorm = d3.scale.linear()
					.domain([ d3.min(MV_Model.dataset,function(d) { return d.Year; }) , d3.max(MV_Model.dataset,function(d) { return d.Year; }) ])
					.range([0,1]);
		
		PRIVATE.voteScaleRadius = d3.scale.linear()
					.domain([ d3.min(MV_Model.dataset,function(d) { return d.Votes; }) , d3.max(MV_Model.dataset,function(d) { return d.Votes; }) ])
					.range([5,20]);
					
		PUBLIC.posFisheyeScaleX = d3.fisheye
							.scale(d3.scale.linear)
							.domain([ d3.max(MV_Model.dataset, function(d,i) { return i; })+10 , 1 ])
							.range([PRIVATE.diaPadding, Math.round(PRIVATE.w * 0.85)-PRIVATE.diaPadding]);
		
		PUBLIC.xAxis = d3.svg.axis()
					.scale(PUBLIC.posScaleX)
					.orient("bottom");
		
		PUBLIC.yAxis = d3.svg.axis()
					.scale(PUBLIC.rankScaleY)//.scale(yearScaleY)
					.orient("left");
					
		PUBLIC.xAxisFisheye = d3.svg.axis()
						.scale(PUBLIC.posFisheyeScaleX)
						.orient("bottom");
						//.tickFormat(d3.format(",d"))
						//.tickSize(-h);
	}
	
	function drawDia() {
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
		
		PUBLIC.svgCartesian.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + (PRIVATE.h-PRIVATE.diaPadding) + ")")
				.call(PUBLIC.xAxis);
		
		PUBLIC.svgCartesian.append("g")
				.attr("class","y axis")
				.attr("transform", "translate(" + PRIVATE.diaPadding + ",0)")
				.call(PUBLIC.yAxis);
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
				.rangeRoundBands([20, PRIVATE.h-20], 0.02);
				
		PRIVATE.graphMovieScaleY = d3.scale.ordinal()
					.domain(MV_Model.movies)
					.rangeRoundBands([20, PRIVATE.h-20], 0.02);
		
		PRIVATE.countScaleRadius = d3.scale.linear()
					.domain([d3.min(MV_Model.countries,function(d) { return d.Count; }), d3.max(MV_Model.countries,function(d) { return d.Count; })])
					.range([3, 10]);
					
		PUBLIC.svgGraph = leftbody.append("svg")
						.attr("width", Math.round(PRIVATE.w * 0.15))
						.attr("height", PRIVATE.h);
	}
	
	function drawList() {
		PUBLIC.countryElement = PUBLIC.svgGraph.append("g")
										.attr("class", "elements")
										.selectAll("circle")
										.data(MV_Model.countries)
										.enter()
										.append("circle");
		
		PUBLIC.countryElement.attr("cx", PRIVATE.diaPadding)
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
			.attr("x",  PRIVATE.diaPadding)
			.attr("y", function(d) {
				return PRIVATE.graphCountryScaleY(d.Name);
			})
			.attr("transform", "translate(8,4)")
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
						
		PUBLIC.svgGenres = genreChart.append("svg")
									.attr("width", PRIVATE.wPie)
									.attr("height", PRIVATE.hPie);		
	}
	
	function drawPie() {
		PUBLIC.pieArcs = PUBLIC.svgGenres.selectAll("g.arc")
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
	
	function initText() {
		var rightbody = d3.select(".rightbody");
		rightbody.style("height", PRIVATE.h + "px");
		
		PUBLIC.rightbodyText = rightbody.append("div")
			.style("opacity", 0);
		
	}
	
	function initButtons() {
		var tools = d3.select(".shortcuts");
		
		PRIVATE.wButtons = tools[0][0].clientWidth;
		PRIVATE.hButtons = Math.round(PRIVATE.h / 12);
		
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