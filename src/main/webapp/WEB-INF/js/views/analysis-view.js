window.AnalysisView = Backbone.View.extend({
		el : $('body'),

		events: {
			 'click #help' :'userHelpPage',
			 'click #logout': 'userLogout',
			 'click #populateTable': 'populate'
		},
		initialize: function () {

		},
		populateTable: function(){ 
			//var numberOfColumns = document.getElementById("packetInfo").rows[0].cells.length;
			/*var table = document.getElementById("packetInfo").getElementsByTagName('tbody')[0];
			var row = table.insertRow(table.rows.length);
			//run check here to see if length of data exceeds no. of columns in table
			for(i=0;i<10;i++){
			var cell = row.insertCell(i);
			cell.innerHTML = "Test Data"+i;
			}
			$('.show_hide').showHide({			 
				speed: 1400,  // speed you want the toggle to happen	
				easing: '',  // the animation effect you want. Remove this line if you dont want an effect and if you haven't included jQuery UI
				changeText: 1, // if you dont want the button text to change, set this to 0
				showText: 'View',// the button text to show when a div is closed
				hideText: 'Hide' // the button text to show when a div is open
			});*/
			populateTable();
		},
		userHelpPage : function(){
			window.open("https://github.com/prasadtalasila/packetanalyzer",'_blank');
		},
		userLogout  : function(){
			Cookies.remove('userName');
			Cookies.remove('userAuth');		
			app.navigate("#",{trigger: true});
			alert("You have been logged out. Please login to continue");
        	return false;
		},
		render: function () {
        	$(this.el).html(this.template());
        	return this;
		}
	});
