var MovieVisualizer = (function() {
	var init = function init() {
		d3.csv("resources/top250moviesG.csv", function(data) {
			MV_Model.init(data);
			MV_View.init(50); //720,480,50
			//MV_View.init(1280,720,50);
			MV_Controller.init();
		});
	};
	
	return {
		init: init
	};
})()