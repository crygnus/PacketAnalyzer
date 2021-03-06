window.ExperimentView = Backbone.View.extend({
		el : $('body'),

		events: {
			 'click #newExperiment' : 'newExperiment',
			 'click #loadExperiment' : 'loadExperiment',
             'click #attachBtn' : 'readSingleFile',
             'click #help' :'userHelpPage',
             'click #logout' : 'userLogout',
             'slidechange #slider': 'setPrefetchValue'
		},

		newExperiment : function(event) {
            event.preventDefault();
        	var formValues = {
        		experimentName : $('#experimentName').val(),
        		description : $('#description').val(),
        		experimenter : $('#experimenter').val(),
        		pcapPath : $('#pcapPath').val()
        	};
            //for passing to backend
            sessionStorage.setItem('pcapPath', $('#pcapPath').val());
            //set dafult slider value
            sessionStorage.setItem('sliderValue',50); 
            $.ajax({
            url:'/protocolanalyzer/sessioninfo',
             type:'POST',
             contentType: 'application/json; charset=utf-8',
             dataType:'text',
             data: JSON.stringify(formValues),
             success:function (data) {
                 var jsonData = JSON.parse(data);
                 var status = jsonData.status;
                 if(status === "success") {
                    app.navigate("#/config");
                 }
                 else if(status ==="failure"){
                    alert(jsonData.remark);
                 }
             },
             error:function(){
                console.log("Error connecting to the server!");
             }
             });

    	},
        setPrefetchValue : function(){
            sessionStorage.setItem('sliderValue',$('#slider').slider("option", "value"));  
        },
    	loadExperiment : function() {
        	
    	},
		initialize: function () {
			this.delegateEvents();
		},
        readSingleFile : function(evt) {
            var f = document.getElementById("fileInput").files[0]; 
            if (f) {
                var r = new FileReader();
                r.onload = function(e) { 
                var userParseGraph = e.target.result;
                var temp = userParseGraph;
            }
            r.readAsText(f);
            } else { 
                alert("Failed to load file");
            }
        },
        userHelpPage : function(){
            window.open("https://github.com/prasadtalasila/packetanalyzer",'_blank');
        },
        userLogout  : function(){
            sessionStorage.clear();
            Cookies.remove('userName');
            Cookies.remove('userAuth');
            alert("You have been logged out. Please login to continue");
            app.navigate("#",{trigger: true});
            return false;
        },
		render: function () { 
			$(this.el).html(this.template());
            
            //slider initialization  
            $(function() {
                $("#slider").slider({
                    range: "max",
                    min: 20,
                    max: 1000,
                    step:10,
                    value: sessionStorage.getItem('sliderValue'),
                    slide: function( event, ui ) {
                        $("#prefetch-amount").val(ui.value);
                    }
                });
                $("#prefetch-amount").val($("#slider").slider("value"));
            });
            return this;
		}
	});
