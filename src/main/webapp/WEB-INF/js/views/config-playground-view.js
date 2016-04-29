window.ConfigPlaygroundView = Backbone.View.extend({
	el : $('body'),

	events: {
		'click #help' :'userHelpPage',
		'click #logout' : 'userLogout',
    'click #analyzeBtn' : 'analysis',
    'click #validateBtn' : 'graphValidation'
	},
  userParseGraph: null,
	initialize: function () {
		this.delegateEvents();
	},	
  afterInitialize:function(){
    document.getElementById('analyzeBtn').disabled = true; 
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
	analysis : function(event){
		event.preventDefault();
    var pcapPath = sessionStorage.getItem('pcapPath');
    $.ajax({
      url:'/protocolanalyzer/session/analysis',
      type:'GET',
      contentType: 'application/json; charset=utf-8',
      dataType:'text',
      data: { pcapPath:pcapPath ,graph : userParseGraph},
      success:function (data) {
          var jsonData = JSON.parse(data);
          var sessionNumber = jsonData.sessionNumber;
          app.navigate("#/analysis",{trigger: true});
        },
        error:function(){
          alert("Error running experiment. Please try again later.");
        }
      });
	},

  graphValidation : function(){
    var f = document.getElementById("fileInput").files[0]; 
    _this = this;
    if (f) {
      var r = new FileReader();
      r.onload = function(e) { 
          var flag =0;
          //test graph is the main graph, user graph checked against this
          //ECMA 6 : replace with backticks , is cleaner
          var testGraph = 'graph start {'+
            'ethernet;'+
          '}'+
          'graph ethernet {'+
            'switch(ethertype) {'+
              'case 0800: ipv4;'+
            '}'+
          '}'+
          'graph ipv4 {'+
            'switch(protocol) {'+
              'case 06:  tcp;'+
            '}'+
          '}'+
          'graph tcp {'+
          '}'+
          'graph end {'+
          '}';
          var flag = 0;
          var testParsing = testGraph.split(/[\{\}]/);
          for (var i = 0; i < testParsing.length; i++) {
            testParsing[i] = testParsing[i].trim();
          }
          //user provided p4 graph
          var graphIndices =[]; //for keeping index of the graph elements
          var graphValues= []; //for keeping value of graph elements
          var indexOfGraphElements=0;
          var mainCounter =0; //for seeing if graph has appropriate number of layer matches

          var userParseGraph = e.target.result;
          var userParsing = userParseGraph.split(/[\{\};]/);
          for (var i = 0; i < userParsing.length; i++) {
            userParsing[i] = userParsing[i].trim();
            if(userParsing[i].search('graph')===0){
              graphIndices[indexOfGraphElements] = i;
              graphValues[indexOfGraphElements] = userParsing[i];
              indexOfGraphElements++;
            }  
            if(userParsing[i].search('switch')===0){    
              mainCounter++;
            }  
          }
          var layers = [];
          for (var k =0;k<indexOfGraphElements;k++){
            layers[k] =  graphValues[k].split(' ')[1];
            if(k===0 && layers[k] !=='start') {
              //start condition check
              flag++;
            }
            if(k===(indexOfGraphElements-1) && layers[k]!=='end' ) { 
              //end condition check
              flag++; 
            }
          }  
          //trim results
          for (var i = 0; i < layers.length; i++) {
            layers[i] = layers[i].trim();
          }
          //start node check
          if(userParsing[1] !== layers[1]){
            flag++;
          }
          //create map of next layers : key is current layer and values are all the possibilities for next layer
          var nextLayers={};
          var countCases =0;
          var countCases2=0;
          for(var i =0;i< userParsing.length;i++){
            if(userParsing[i].search('graph')===0){
              nextLayers[layers[countCases-1]] = nextLayerList;
              var nextLayerList=[];
              countCases++;
              countCases2=0;
            }
            if(userParsing[i].search('case')===0){ 
              var temp = userParsing[i].split(' ')[2].trim();
              nextLayerList.push(temp);
              countCases2++;
            }
          }
          // layers contains the list of layers possible for this experiment.
          //nextLayers is a 2D array containing the next possible layers for each layer.
          //checking valid next layers
          var matchOneLayerToNext =0;
          for(var i=0;i < layers.length-1;i++){ 
          //length-1 because the last layer will not have cases within it, even if it does, those are ignored
            for(key in nextLayers){
              if(key===layers[i]){
                var temp = i+1;
                if(_this.isInArray(nextLayers[key],layers[temp])){
                  matchOneLayerToNext++;
                }  
              }
            }  
          }
          if(matchOneLayerToNext!==mainCounter){
            flag++;
          }
          if(flag===0){
            alert("P4 Graph is valid");
            document.getElementById('analyzeBtn').disabled = false; 
          }
          else{
            alert("P4 Graph is not valid, please enter a valid configuration");
          }
      }
      r.readAsText(f);
     
    } else { 
      alert("Failed to load file");
    }
  },
  isInArray: function(array, search)
  {
    return array.indexOf(search) >= 0;
  },
  indices : function(source,find){
    var result = [];
    for (i = 0; i < source.length; ++i) {
      if (source.substring(i, i + find.length) == find) {
        result.push(i);
      }
    }
    return result;
  },
	render: function () {
		$(this.el).html(this.template());
    $(document).ready(this.afterInitialize);
		return this;
	}
});
