window.AnalysisView = Backbone.View.extend({
		el : $('body'),

		events: {
			 'click #help' :'userHelpPage',
			 'click #logout': 'userLogout',
			 'click #populateTable': 'populateTable',
       'click #packetInfo tbody tr': 'rowClick',
       'slidechange #slider': 'setPrefetchValue'
		},
		initialize: function () {
			this.delegateEvents();
      this.globalData = [];
		},
    setPrefetchValue : function(){
      sessionStorage.setItem('sliderValue',$('#slider').slider("option", "value"));  
    },
    rowClick : function(event){
      //get index from table
      var ind = event.currentTarget.children[0].innerHTML;
      var layers = sessionStorage.getItem('layers').split(',');
      //loop through layers and write to footer
      for(var countForLayers=1;countForLayers< layers.length-1;countForLayers++){
        botInfo = this.globalData[ind]["docs"][countForLayers-1]["_source"];
        var packetDetails="";
        for(var key in botInfo){
          packetDetails += '<span class ="footerPacketDetails">\t'+key + " : " + JSON.stringify(botInfo[key]).replace(/\"/g, "") +' </span>';
        }
        document.getElementById("dataContainer"+countForLayers).innerHTML = packetDetails;
      }
    },
		populateTable :function(){
      _this = this;
      $('#lowerHalf').html('');
      var sessionName = sessionStorage.getItem('sessionName');
      var layers = sessionStorage.getItem('layers').split(',');

      var layerCount =0; //for knowing number of layers

      //loop for appending required number of summary tags in the footer for full display of each layer
      var lowerHalfAppend = document.getElementById('lowerHalf');
      for(var i =1;i<layers.length -1;i++){
        layerCount++;
        var newDivId = 'dataContainer'+i;
        var newDiv = document.createElement('section');
        newDiv.setAttribute('id',newDivId);
        lowerHalfAppend.appendChild(newDiv);
        newDiv.outerHTML = '<section>'+
          '<article>'+
            '<details>'+
              '<summary >'+layers[i].charAt(0).toUpperCase() + layers[i].slice(1)+'</summary>'+
                '<summary id = dataContainer'+ i+' ></summary>'+
            '</details>'+
          '</article>'+
          '</section>';
      }

      //loop for creating multi-get request and receiving and displaying data
      for(var id = 1;id<=sessionStorage.getItem('packetCount');id++){
        
        //creating the multi get request from ids and layers
        var multiGetRequest ='{ "docs" : [' ;
        for(var countForLayers = 1;countForLayers<=layerCount;countForLayers++){
          multiGetRequest = multiGetRequest.concat('{ "_type" : "'+layers[countForLayers]+'", "_id" : "'+id+'" },');
			  }
        multiGetRequest = multiGetRequest.substring(0,multiGetRequest.length-1);
        multiGetRequest = multiGetRequest.concat('] }');

        //AJAX call for getting data
        (function(id)
        {
          $.ajax({
			      url : 'http://localhost:9200/protocol_'+sessionName+'/_mget',
			      type : 'POST',
            data : multiGetRequest,
            async: false,
			      contentType : 'application/json; charset=utf-8',
			      success : function(data) {
              _this.globalData[id] = data;
              row = data["docs"][0];
              var td, tr;
              var tdata = $("#packetInfo tbody")
    			    var rowSource = row["_source"];
    			    tr = $("<tr>");
    			    //packetId
    			    td = $("<td>").text(rowSource["packetId"]);
    			    tr.append(td);
    			    //Source MAC
    			    td = $("<td>").text(rowSource["src_addr"]);
    			    tr.append(td);
    			    //Dest MAC
    			    td = $("<td>").text(rowSource["dst_addr"]);
    			    tr.append(td);
				      tdata.append(tr);
			      },
			      error : function() {
				      alert("Error connecting to elasticsearch!!")
			      }
		      });
        })(id);
      }
		},
		userHelpPage : function(){
			window.open("https://github.com/prasadtalasila/packetanalyzer",'_blank');
		},
		userLogout  : function(){
      sessionStorage.clear();
			Cookies.remove('userName');
			Cookies.remove('userAuth');		
			app.navigate("#",{trigger: true});
			alert("You have been logged out. Please login to continue");
        	return false;
		},
		render: function () {
        	$(this.el).html(this.template());

          //slider initialization  
          $(function() {
            $("#slider").slider({
              range: "max",
              min: 10,
              max: 1000,
              step:10,
              value: 50,
              slide: function( event, ui ) {
                $("#prefetch-amount").val(ui.value);
              }
            });
            $("#prefetch-amount").val($("#slider").slider("value"));
          });

          //collapsible sidebar intialization
          (function() {
            $(function() {
              var collapseMyMenu, expandMyMenu, hideMenuTexts, showMenuTexts,expandMainMenu,collapseMainMenu;
              expandMyMenu = function() {
                return $("nav.sidebar").removeClass("sidebar-menu-collapsed").addClass("sidebar-menu-expanded");
              };
              expandMainMenu = function() {
                return $(".main").removeClass("normal-width").addClass("max-width");
              };
              collapseMyMenu = function() {
                return $("nav.sidebar").removeClass("sidebar-menu-expanded").addClass("sidebar-menu-collapsed");
              };
              collapseMainMenu = function() {
                return $(".main").removeClass("max-width").addClass("normal-width");
              };
              showMenuTexts = function() {
                return $("nav.sidebar ul a span.expanded-element").show();
              };
              hideMenuTexts = function() {
                return $("nav.sidebar ul a span.expanded-element").hide();
              };
              return $("#justify-icon").click(function(e) {
              if ($(this).parent("nav.sidebar").hasClass("sidebar-menu-collapsed")) {
                expandMyMenu();
                showMenuTexts();
                collapseMainMenu();
                $(this).css({
                color: "#00ACE1"
              });
              } else if ($(this).parent("nav.sidebar").hasClass("sidebar-menu-expanded")) {
                collapseMyMenu();
                expandMainMenu();
                hideMenuTexts();
                $(this).css({
                color: "#FFF"
              });
            }
            return false;
          });
        });
      }).call(this);
    	return this;
		}
});
