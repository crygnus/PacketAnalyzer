window.ConfigPlaygroundView = Backbone.View.extend({
		el : $('body'),

		events: {
			 'click #help' :'userHelpPage',
			 'click #logout' : 'userLogout',
			 'click #analyzeBtn' : 'analysis'
		},
		initialize: function () {
			dragula([document.getElementById('menu'), document.getElementById('config-playground')]);
		},

		userHelpPage : function(){
			window.location.href = "https://github.com/prasadtalasila/packetanalyzer";
		},
		userLogout  : function(){
			Cookies.remove('userName');
			Cookies.remove('userAuth');		
			app.navigate("#",{trigger: true});
			alert("You have been logged out. Please login to continue");
		},
		analysis : function(event){
			event.preventDefault();
			app.navigate("#/analysis",{trigger: true});
		},
		render: function () {
			$(this.el).html(this.template());
        	return this;
		}
	});
