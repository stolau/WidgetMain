"use strict";



	var tempList = [];
	let temperatureData = [];
	let carbonDioxideData = [];
	let godList = [];
	
	let wwList = [];
	
	var jejee = "http://pan0107.panoulu.net:8000/comet/STH/v1/contextEntities/type/AirQualityObserved/id/11122/attributes/tk11te22?lastN=${textInput}"
	var nenee = "http://pan0107.panoulu.net:8000/orion/v2/entities?limit=300&options=count&orderBy=id";
	var neineiejee = "http://pan0107.panoulu.net:8000/comet/STH/v1/contextEntities"
	
	const talRooms = [["Room 114", "114", "buttonGraph", "/f/1/114" ,"tal"],
						["Room 116", "116", "buttonGraph", "/f/1/116" ,"tal"],
						["Room 118", "118", "buttonGraph", "/f/1/118" ,"tal"],
						["Room 143", "143", "buttonGraph", "/f/1/143" ,"tal"],
						["Room 161", "161", "buttonGraph", "/f/1/161" ,"tal"],
						["Room 190", "190", "buttonGraph", "/f/1/190" ,"tal"],
						["Room 202", "202", "buttonGraph", "/f/2/202" ,"tal"],
						["Room 205", "205", "buttonGraph", "/f/2/205" ,"tal"],
						["Room 225", "225", "buttonGraph", "/f/2/225" ,"tal"],
						["Room 226", "226", "buttonGraph", "/f/2/226" ,"tal"]];
						
			

	function createGraph()
	{
		
	}
	class Graphs {
		constructor() {
			this.graphList = [];
		}
		get graphs() {
			return this.graphList;
		}
		
	}
	
	let graphContainer = new Graphs();
	
	// let graphContainer = new Graphs();
	
	function sendGraph(valueList, name)
	{
		// Function gets tempList and name outputs graph to Highcharts 
		// Connect Graph to Highcharts Options in wiring mode.
		
		// valueList contains list of lists where [0] = data values,
		// [1] = xAxis label
		// [2] = name of the value
		
		console.log("Kaydaaks?");
		
		var compValueList = [];
		var xAxisDict = [];
		
		// console.log(valueList[0][0]);

		for(var i = 0; i < valueList.length; i++)
		{
			var xAxisDict = [];
			var seriesDict = [];
			// console.log(valueList[i]);
			for(var d = 0; d < valueList[i].length; d++)
			{
				// console.log(valueList[i][0]);
				seriesDict.push(valueList[i][d][1]);
				xAxisDict.push(valueList[i][d][0]);
			}
			compValueList.push({
				"name" : i,
				"data" : seriesDict
			});
			console.log(compValueList);
		}
		// console.log(compValueList);
		console.log(xAxisDict);
		
		// console.log(valueList);
		var tempData = {
			"title" : { "text" : name, "x": -20 },
			"subtitle": { "text" : "Last 30 results", "x": -20},
			"xAxis": { "categories": xAxisDict },
			"yAxis": { "title" : { "text": "Temperature (°C)" },
			"plotLines": [{ "value": 0, "width": 2, "color": "#808080" }] },
			"tooltip": { "valueSuffix": "°C" },
			"legend": { "layout": "vertical", "align": "right", "verticalAlign": "middle", "borderWidth": 0 },
			"plotOptions": {
				"series": {
					"color": "#B8860B"
			}
		},
			"series": [
				compValueList,
			]
		}
		
		console.log(tempData);
		
		MashupPlatform.wiring.pushEvent("Graph", tempData);
		
	}
	
	
	function getHeader(servicePath, service)
	{
		// Returns headers
		var header = {};
		var header = {
			"Platform-ApiKey": MashupPlatform.prefs.get('apiKey'),
			"Accept": "application/json",
			"Fiware-Service": service,
			"Fiware-ServicePath": servicePath,
		};
		return header;
	}
	
	function loopArray()
	{
		// ["Talvikangas", "tal", "buttonSearch", "", "tal"]
		
		
		var roomList = [];
		for(var i = 0; i < godList.length; i++)
		{
			if(godList[i][1] == "Room")
			{
				
				// console.log(godList[i]);
				roomList.push([godList[i][0], godList[i][0].slice(1), "buttonGraph", "/f/" + godList[i][0].charAt(1) + 
								"/" + godList[i][0].slice(1), "tal"]);
								
			}
		}
		for(var i = 0; i < roomList.length; i++)
		{
			console.log(roomList[i]);
		}
		createNewPage(roomList);
	}

	function createButton(nameBtn, idBtn, classBtn, servicePath, service) {
	  
		// nameButton, name of the button
		// id, if of the button
		// typeButton, String buttonSearch or buttonGraph
		
		// var list = [];
		var url = MashupPlatform.prefs.get('url');
		//Change this in future
		// var list = [];
		var btn = document.createElement("BUTTON");
		btn.innerHTML = nameBtn;
		btn.setAttribute("id", idBtn);
		btn.setAttribute("class", classBtn); 
		btn.setAttribute("ServicePath", servicePath);
		btn.setAttribute("Service", service);
		if (classBtn == "buttonSearch")
		{
			url = MashupPlatform.prefs.get('url');
		}
		if (classBtn == "buttonGraph")
		{
			url = "http://pan0107.panoulu.net:8000/comet/STH/v1/contextEntities/type/AirQualityObserved/id/" + "10822" + "/attributes/tk11te22?lastN=20"
			url = " https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities/type/AirQualityObserved/id/11122/attributes/tk11te22?lastN=50"
		}
		btn.onclick =  async function(){
			// var list = [];
			// console.log(typeof list);
			// console.log(list.length);
			if(classBtn == "buttonGraph") {
				var list = [];
				var headers = await getHeader(servicePath, service);
				list = await browser(url, headers);
				console.log(list);
				
				graphContainer.graphList.push(list)
				// sendGraph(graphContainer.graphList, nameBtn);
			}
			if(classBtn == "buttonSearch")
			{
				var list = [];
				var headers = await getHeader(servicePath, service);
				var list_jr = await browser(url, headers);
				/*while(list.length === 0 || list === undefined)
				{
					try 
					{
						list = list_jr;
					}
					catch(TypeError)
					{
						console.log("you mamama");
					}
					if(list === undefined)
					{
						list = []
					}
					console.log(list);
				}*/
				
				// console.log(list);
				// createNewPage(list);
			}
		};
		return btn;
		// document.body.appendChild(btn);	  
	}
	
	function createBtnList(list)
	{
		var btnList = [];
		// Gets predefined list, creates button for each objective.
		// When called all the buttons are stored together
		for(var i = 0; i < list.length; i++)
		{
			btnList.push(createButton(list[i][0], list[i][1], list[i][2], list[i][3], list[i][4]));
			// createButton()
		}
		return btnList;
	}
	
	
	
	function browser(searchUrl, searchHeaders) {
		
		console.log(searchHeaders);
		console.log(searchUrl);
		
		var cList = [];
		MashupPlatform.http.makeRequest(searchUrl,{
		method: 'GET',
		contentType: 'application/json',
		requestHeaders: searchHeaders,
		onSuccess: async function (response) {
			
			let jsonData = JSON.parse(response.responseText);
			// takes keys of the site, these keys can be used to find correct data
			let keys = Object.keys(jsonData);
			console.log(jsonData);
			
			var dd = await searchObject(jsonData);
			console.log(dd);
			godList = dd;
			console.log(godList);
			
			MashupPlatform.wiring.pushEvent("Selection", dd);
			
			return dd;

		},
		on404: function (response) {
			MashupPlatform.widget.log("Error 404: Not Found");
			return cList;
		},
		on401: function (response) {
			MashupPlatform.widget.log("Error 401: Authentication failed");
			return cList;
		},
		on403: function (response) {
			MashupPlatform.widget.log("Error 403: Authorization failed");
			return cList;
		},
		onFailure: function (response) {
			MashupPlatform.widget.log("Unexpected response from the server");
			return cList;
		}
		});
		// console.log(godList);
	}
	
	function searchObject(theObject) {
		
		// TO-DO: SearchObject gets searched variable
		// We use loop through everything in the object and find all values for searched variable
		
		var completeList = [];
		var result = null;
		// Loop through whole array of objects
		// This happens only first
		if(theObject instanceof Array) {
			
			// Goes through each object of Array
			for(let i = 0; i < theObject.length; i++) { // theObject.length
				// console.log("taal pitas kaya vaa kerran");
				// console.log(theObject[i]);
				result = searchObject(theObject[i]);
				completeList.push(result);
				}
			// console.log(completeList);
			return completeList;
		}
		else {
			if(typeof theObject === 'object')
			{
				var list = [];
				
				var keys = Object.keys(theObject);
				
				for(let i = 0; i < keys.length; i++)
				{
					if(typeof theObject[keys[i]] === 'object')
					{
						var result_d = searchObject(theObject[keys[i]]);
						list.push(result_d);
					}
					else
					{
						// console.log(theObject[keys[i]]);
						list.push(theObject[keys[i]]);
					}
					// Here all the conditions to find history data etc
					if(theObject[keys[i]] === "tk11te22")
					{
						// console.log(Object.keys(theObject[keys]));
						var vs = theObject["values"];
						var temporaryList = [];
						for(var g = 0; g < vs.length; g++)
						{
							// console.log(vs[g]);
							temporaryList.push([vs[g]["recvTime"], vs[g]["attrValue"]]);
						}
						wwList.push(temporaryList);
						console.log(wwList);
					}
				}
				// console.log(list);
				// return list;			
				
			}
		return list;
		}
	}
	
	function menuManager()
	{
		// Handles the pages of menu and works as main coordinaator for buttons
	}
	function createNewPage(list)
	{
		var btnList = [];
		
		document.body.innerHTML = '';
		var btn = document.createElement("BUTTON");
		btn.innerHTML = "BACK";
		btn.onclick = function(){
				// var headers = getHeader(servicePath, service);
				init();
		};
		document.body.appendChild(btn);
		
		// Uses talRoom for test purposes
		// TO-DO: Add list to function which creates all the buttons in list
		btnList = createBtnList(list);
		for(var i = 0; i < btnList.length;  i++)
		{
			document.body.appendChild(btnList[i]);
		}
		var submitBtn = document.createElement("BUTTON");
		submitBtn.innerHTML = "SUBMIT";
		submitBtn.onclick = function(){
				// var headers = getHeader(servicePath, service);
				sendGraph(wwList, "Dadaa");
		};
		document.body.appendChild(submitBtn);
	}
	
	function init()
	{
		
		var mainMenuBtnList = [];
		var list = [["Talvikangas", "tal", "buttonSearch", "", "tal"], ["Tal R114", "tal", "buttonSearch", "/f/1/114", "siptronix"]]
		// Clears HTML and sets up "main page"
		document.body.innerHTML = '';
		// Initializes the widget
		//Creates Button for all pre defined paths
		for(var i = 0; i < list.length; i++)
		{
			 var btn  = createButton(list[i][0], list[i][1], list[i][2], list[i][3], list[i][4]);
			 //btn.style.height = "50px";
			 // btn.style.width = "50px";
			 mainMenuBtnList.push(btn);
			 document.body.appendChild(btn);
		}
		var btn_z = document.createElement("BUTTON");
		btn_z.innerHTML = "Test";
		btn_z.onclick = function(){
			loopArray();
		};
		document.body.appendChild(btn_z);
		
		// document.body.appendChild(btn);
	}
	

init();