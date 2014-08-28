var MovieVisualizer = (function() {
	var init = function init() {
		d3.csv("resources/top250movies.csv", function(data) {
			MV_Model.init(data);
			MV_View.init(720,480,50);
			MV_Controller.init();
		});
	};
	
	return {
		init: init
	};
})()