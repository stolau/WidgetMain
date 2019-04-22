"use strict";



class Graphs {
	constructor() {
		this.graphList = [];
	}
	get graphs() {
		return this.graphList;
	}
	delGraph(name) {
		// Finds Graph and removes it from writable list
		for(var i = 0; i < this.graphList.length; i++) {
			console.log(name + this.graphList[i][0]);
			if(this.graphList[i][0] === name) {
				this.graphList.splice(i, 1);
			}
		}
	}
		
}
	
let graphContainer = new Graphs();



 const graphColor = [
	// Pre defined colors to write graphs
    "#800000", "#FF0000", "#FFA500", "#FFFF00", "#008000", "#800080", "#00FF00",
    "#0000FF", "#000000", "#000080", "#7CFC00", "#E0E0E0", "#D2D2D2" ];

function sendGraph(valueList) {
	// Function gets tempList and name outputs graph to Highcharts 
	// Connect Graph to Highcharts Options in wiring mode.
	
	// valueList contains list of lists where [0] = data values,
	// [1] = xAxis label
	// [2] = name of the value
		
		
	var compValueList = [];
	var xAxisDict = [];
	
	console.log(valueList);
	for(var i = 0; i < valueList.length; i++)
	{
		var xAxisDict = [];
		var seriesDict = [];
		for(var d = 0; d < valueList[i].length; d++)
		{
			console.log(parseFloat(valueList[i][d][1]).toFixed(2));
			seriesDict.push(parseFloat(parseFloat(valueList[i][d][1]).toFixed(2)));
			xAxisDict.push(valueList[i][d][2]);
		}
		compValueList.push({
		"name" : valueList[i][0][0],
		"data" : seriesDict,
		"color" : graphColor[i],
		});
	}
	console.log(compValueList);
	/*compValueList.push({
		"name" : valueList[0][0],
		"data" : seriesDict
	});*/

	var tempData = {
		"title" : { "text" : valueList[0][0], "x": -20 },
		"subtitle": { "text" : "Last 30 results", "x": -20},
		"xAxis": { "categories": xAxisDict },
		"yAxis": { "title" : { "text": "Temperature (°C)" },
		"plotLines": [{ "value": 0, "width": 2, "color": "#808080" }] },
		"tooltip": { "valueSuffix": "°C" },
		"legend": { "layout": "vertical", "align": "right", "verticalAlign": "middle", "borderWidth": 0 },
		"series": {
			compValueList,	
		}
	}
		MashupPlatform.wiring.pushEvent("Graph", tempData);
		
		/*"plotOptions": {
			"series": {
				"color": "#B8860B", "#800000"
		}*/
		
}

function browser(searchUrl, searchHeaders) {
	return new Promise(resolve => {
		setTimeout(() => {
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
			
				// var rawData = await searchObject(jsonData);
			
				// resolve(await searchObject(jsonData));
				resolve(jsonData);

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
		}, 100);
	});
	
}

function getHeader(servicePath, service) {
	// Returns headers
	return new Promise(resolve => {
		setTimeout(() => {
			var header = {
			"Platform-ApiKey": MashupPlatform.prefs.get('apiKey'),
			"Accept": "application/json",
			"Fiware-Service": service,
			"Fiware-ServicePath": servicePath,
			};
			resolve(header);
		}, 50);
	});
}

function searchObject(theObject) {
		// TO-DO: SearchObject gets searched variable
		// We use loop through everything in the object and find all values for searched variable
		return new Promise(resolve => {
			setTimeout(() => {
				var completeList = [];
				var result = null;
				// Loop through whole array of objects
				// This happens only first
				if(theObject instanceof Array) {
					// Goes through each object of Array
					for(let i = 0; i < theObject.length; i++) { // theObject.length
						result = searchObject(theObject[i]);
						completeList.push(result);
					}
					resolve(completeList);
				}
				else {
					if(typeof theObject === 'object') {
						var list = [];
				
						var keys = Object.keys(theObject);
				
						for(let i = 0; i < keys.length; i++) {
							if(typeof theObject[keys[i]] === 'object') {
								var result_d = searchObject(theObject[keys[i]]);
								list.push(result_d);
							}
							else {
								list.push(theObject[keys[i]]);
							}
						}	
					}
					resolve(list);
				}
			}, 5);
		});
}

function createNewPage(btnList) {
	// var btnList = [];
	
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
	for(var i = 0; i < btnList.length;  i++) {
		document.body.appendChild(btnList[i]);
	}
}
	
function createButton(nameBtn, idBtn, classBtn, servicePath, service)
{
	// /f/1/116
	// Creates new button which contains all the information required to make requestHeaders
	// for new search
	var onOffActivate = false;
	var url = MashupPlatform.prefs.get('url');
	var btn = document.createElement("BUTTON");
	btn.innerHTML = nameBtn;
	if(classBtn === "buttonSearch") {
		btn.onclick =  async function(){
			var headers = await getHeader(servicePath, service);
			var dd = await browser(url, headers);
			console.log(dd);
			console.log(dd.length);
			var btnList = [];
			for(var i = 0; i < dd.length; i ++)
			{
				if(dd[i]["type"] === "Room") {
					var id = dd[i]["id"];
					var sub_servicePath = "/f/" + id.charAt(1) + "/" + id.slice(1);
					var headers_Room = await getHeader(sub_servicePath , service);
					var sub_dd = await browser(url, headers_Room);
					console.log(sub_dd);
					
					var newBtn = createButton(dd[i]["id"], sub_dd[0]["id"], "buttonGraph", sub_servicePath, service);
					btnList.push(newBtn);
				}
				else if(dd[i]["type"] == "Alert") {
					console.log(dd[i]);
					var id = dd[i]["id"];
					var sub_servicePath = "/oulu";
					var headers_Alert = await getHeader(sub_servicePath, service);
					var sub_dd = await browser(url, headers_Alert);
					console.log(sub_dd);
				}
				
			}
			createNewPage(btnList);
		}
	}
	else if(classBtn === "buttonGraph") {
		btn.onclick = async function(){
			if(!onOffActivate) {
				// Pushes graph to list of graphs
				url = " https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities/type/" + "AirQualityObserved" + "/id/" + idBtn + "/attributes/tk11te22?lastN=50";
				var headers = await getHeader(servicePath, service);
				var dd = await browser(url, headers);
				var parsedData = dd["contextResponses"][0]["contextElement"]["attributes"][0]["values"];
				var data = [];
				for(var i = 0; i < parsedData.length; i++)
				{
					data.push([nameBtn, parsedData[i]["attrValue"], parsedData[i]["recvTime"]]);
				}
				graphContainer.graphList.push(data);
				sendGraph(graphContainer.graphList);
			}
			else {
				// Removes graph from the list
				graphContainer.delGraph(nameBtn);
			}
			onOffActivate = !onOffActivate;
		}
	}
	return btn;
}

function init()
{	
	// Predefined values
	var list = [["Talvikangas", "tal", "buttonSearch", "", "tal"], ["Siptronix", "", "buttonSearch", "", "siptronix"]];
	// Clears HTML and sets up "main page"
	document.body.innerHTML = '';
	// Initializes the widget
	//Creates Button for all pre defined paths
	for(var i = 0; i < list.length; i++)
	{
		var btn  = createButton(list[i][0], list[i][1], list[i][2], list[i][3], list[i][4]);
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
