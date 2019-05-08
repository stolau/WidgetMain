"use strict";

// http://pan0107.panoulu.net:8000/orion/v2/entities?limit=300&options=count&orderBy=id


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
    "#7CFC00", "#00FFFF", "#00008B", "#FFFF00", "#008000", "#800080", "#00FF00",
    "#0000FF", "#000000", "#000080", "#7CFC00", "#E0E0E0", "#D2D2D2" ];

function sendGraph(valueList) {
	// Function gets tempList and name outputs graph to Highcharts 
	// Connect Graph to Highcharts Options in wiring mode.
	
	// valueList contains list of lists where [0] = data values,
	// [1] = xAxis label
	// [2] = name of the value
		
		
	var compValueList = [];
	var xAxisDict = [];
	
	// console.log(valueList);
	for(var i = 0; i < valueList.length; i++)
	{		
		compValueList.push({
		"name" : valueList[i][2],
		"data" : valueList[i][0],
		"color" : graphColor[i],
		});
	}
	//console.log(compValueList);

	var tempData = {
		"title" : { "text" : "Siptronix", "x": -20 },
		"subtitle": { "text" : "Last 30 results", "x": -20},
		"xAxis": { "categories": valueList[0][1] },
		"yAxis": { "title" : { "text": "Temperature (°C)" },
		"plotLines": [{ "value": 0, "width": 2, "color": "#808080" }] },
		"tooltip": { "valueSuffix": "" },
		"legend": { "layout": "vertical", "align": "right", "verticalAlign": "middle", "borderWidth": 0 },
		"series": 
			compValueList,	
		
	}
		MashupPlatform.wiring.pushEvent("Graph", tempData);
		
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
	// idBtn is list with type, id, attribute
	var bulbsList = [];
	var onOffActivate = false;
	var url = MashupPlatform.prefs.get('url');
	var btn = document.createElement("BUTTON");
	btn.innerHTML = nameBtn;
	if(classBtn === "buttonSearch") {
		btn.onclick =  async function(){
			var headers = await getHeader(servicePath, service);
			var dd = await browser(url, headers);
			var btnList = [];
			for(var i = 0; i < dd.length; i ++)
			{
				if(dd[i]["type"] === "Room") {
					var id = dd[i]["id"];
					var sub_servicePath = "/f/" + id.charAt(1) + "/" + id.slice(1);
					var headers_Room = await getHeader(sub_servicePath , service);
					var sub_dd = await browser(url, headers_Room);
					console.log(sub_dd);
					for(var c = 0; c < sub_dd.length; c++)
					{
						console.log(sub_dd[c]);
						var keys = Object.keys(sub_dd[c]);
						for(var g = 0; g < keys.length; g++)
						{
							if(keys[g] !== ("TimeInstant" || "location" || "type"))
							{
								var newBtn = createButton(sub_dd[c]["id"], sub_dd[c]["type"], "buttonGraph", sub_servicePath, service);
								btnList.push(newBtn);
							}
						}
					}
				}
				
				// Creates Initial Graph Window for data from Siptronix
				else if(dd[i]["type"] == "Alert") {
					console.log(dd[i]);
					var keys = Object.keys(dd[i]["data"]["value"]);
					if(keys.length > bulbsList.length) {
						// Adds more empty lists
						while(keys.length != bulbsList.length) {
							bulbsList.unshift([[], []]);
						}
					}
					for(var d = 0; d < keys.length; d++) {
						bulbsList[d][0].push(dd[i]["data"]["value"][keys[d]]);
						bulbsList[d][1].push(i);
					}
					// TO-DO: Create buttons for all individual Alerts
					var dateFrom = dd[i]["dateIssued"]["value"];
					var dateTo = dd[i]["dateIssued"]["value"];
					console.log(dateFrom);
					var idsBtnList = ["/type/3PhaseACMeasurement", "/id/Ritaharju_POS39_lighting", "/attributes/totalActiveEnergyImport", "?dateFrom=" + dateFrom + "&" + dateTo + "&aggrMethod=max&aggrPeriod=hour"];
					var newBtn = createButton(dd[i]["id"], idsBtnList, "buttonGraph_sip", "/oulu", "siptronix");
					btnList.push(newBtn);
				}
			}
			if(bulbsList.length > 0) {
				for(var h = 0; h < bulbsList.length; h++) {
					bulbsList[h].push([keys[h]]);
				}
				// Removes 2 irrelevant lists from the graph
				// console.log(bulbsList);
				bulbsList.splice(0, 1);
				bulbsList.splice(2, 1);
				
				// console.log(bulbsList);
				sendGraph(bulbsList);
			}
			createNewPage(btnList);
		}
	}
	else if(classBtn === "buttonGraph") {
		btn.onclick = async function(){
			if(!onOffActivate) {
				// Pushes graph to list of graphs
				// url = " https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities/type/" + "AirQualityObserved" + "/id/" + idBtn + "/attributes/tk11te22?lastN=50";
				url = " https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities" + idBtn[0] + idBtn[1] + idBtn[2] + "?dateFrom=2019-02-27T00:00:00Z&dateTo=2019-02-27T23:59Z&aggrMethod=max&aggrPeriod=hour";
				
				
				// "aggrMethod=max&aggrPeriod=hour&dateFrom=2018-10-10T00:00:00.000Z&dateTo=2018-10-10T23:59:59.999Z"
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
	else if(classBtn == "buttonGraph_sip") {
		btn.onclick = async function() {
			if(!onOffActivate) {
				url = "https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities" + idBtn[0] + idBtn[1] + idBtn[2] + idBtn[3];
				var headers = await getHeader(servicePath, service);
				var dd = await browser(url, headers);
				console.log(dd);
				
			}
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
	}
	

init();
