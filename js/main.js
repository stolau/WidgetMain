"use strict";


/* config.xml cant read this url for some reason. Everytime app is updated, this url needs to be
    manually placed to preferences*/
// http://pan0107.panoulu.net:8000/orion/v2/entities?limit=300&options=count&orderBy=id

var theUrl = "http://pan0107.panoulu.net:8000/orion/v2/entities?limit=300&options=count&orderBy=id";
var minutes = "30";
var initDate;
var dataCollection = [];
var aggrMethod, aggrPeriod, inputDates, inputNValue;

class Graphs {
	// Graphs is global class meant to store and remove graphs.
	// Useful if user wants to compare different data from different tabs
	constructor() {
		this.graphList = [];
	}
	get graphs() {
		return this.graphList;
	}
	delGraph(name) {
		// Finds Graph and removes it from writable list
		for(var i = 0; i < this.graphList.length; i++) {
			if(this.graphList[i][0] === name) {
				this.graphList.splice(i, 1);
			}
		}
	}

}

var graphContainer = new Graphs();

const graphColor = [
	// Pre defined colors to write graphs
    "#7CFC00", "#00FFFF", "#00008B", "#FFFF00", "#008000", "#800080", "#00FF00",
    "#0000FF", "#000000", "#000080", "#7CFC00", "#E0E0E0", "#D2D2D2" ];

function sendGraph(valueList, location) {
	// Function gets tempList and name outputs graph to Highcharts
	// Connect Graph to Highcharts Options in wiring mode.

	// valueList contains list of lists where [0] = data values,
	// [1] = xAxis label
	// [2] = name of the value

	var compValueList = [];
	var xAxisDict = [];

	console.log(valueList)

	for(var i = 0; i < valueList.length; i++)
	{
		compValueList.push({
		"name" : valueList[i][2],
		"data" : valueList[i][0],
		"color" : graphColor[i],
		});
	}

	if (location === "siptronix") {
		var graphData = {
			"title" : { "text" : "Siptronix", "x": -20 },
			"subtitle": { "text" : "Alert date: " + initDate, "x": -20},
			"xAxis": { "categories": valueList[0][1],
				"plotLines": [{
	                "color": "#FF0000",
	                "width": 2,
	                "value": compValueList[0].data.length / 2 - 0.5
            	}]
			},
			"yAxis": { "title" : { "text": "Bulbs" },
			"plotLines": [{ "value": 0, "width": 2, "color": "#808080" }] },
			"tooltip": { "valueSuffix": "" },
			"legend": { "layout": "vertical", "align": "right", "verticalAlign": "middle", "borderWidth": 0 },
			"series":
				compValueList,
		}
	} else if(location === "aqvaio") {
		var graphData = {
			"title" : { "text" : "Aqva.io", "x": -20 },
			"subtitle": { "text" : "Last "+ valueList[0][1].length + " measurements", "x": -20},
			"xAxis": { "categories": valueList[0][1] },
			"yAxis": { "title" : { "text": "Water reading and temperature" },
			"plotLines": [{ "value": 0, "width": 2, "color": "#808080" }] },
			"tooltip": { "valueSuffix": "" },
			"legend": { "layout": "vertical", "align": "right", "verticalAlign": "middle", "borderWidth": 0 },
			"series":
				compValueList,
		}
	} else {
		var graphData = {
			"title" : { "text" : "Siptronix", "x": -20 },
			"subtitle": { "text" : "Last "+ valueList[0][1].length + " measurements", "x": -20},
			"xAxis": { "categories": valueList[0][1] },
			"yAxis": { "title" : { "text": "Temperature (°C)" },
			"plotLines": [{ "value": 0, "width": 2, "color": "#808080" }] },
			"tooltip": { "valueSuffix": "" },
			"legend": { "layout": "vertical", "align": "right", "verticalAlign": "middle", "borderWidth": 0 },
			"series":
				compValueList,
		}
	}
	MashupPlatform.wiring.pushEvent("Graph", graphData);

}

function browser(searchUrl, searchHeaders) {

	// Sends all the requests based on URL and headers, returns JSON
	return new Promise(resolve => {
		setTimeout(() => {
			var cList = [];
			MashupPlatform.http.makeRequest(searchUrl,{
			method: 'GET',
			contentType: 'application/json',
			requestHeaders: searchHeaders,
			onSuccess: async function (response) {

				var jsonData = JSON.parse(response.responseText);
				// takes keys of the site, these keys can be used to find correct data
				var keys = Object.keys(jsonData);

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
		}, 50);
	});

}

function getHeader(servicePath, service) {
	// Returns headers
	// Api Key is storied in app, and might be vulnerable if published
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
					for(var i = 0; i < theObject.length; i++) { // theObject.length
						result = searchObject(theObject[i]);
						completeList.push(result);
					}
					resolve(completeList);
				}
				else {
					if(typeof theObject === 'object') {
						var list = [];

						var keys = Object.keys(theObject);

						for(var i = 0; i < keys.length; i++) {
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
			}, 50);
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

	// Button function is key part of widget --> might be good idea to split operations to own functions
	var bulbsList = [];
	var onOffActivate = false;
	// var url = MashupPlatform.prefs.get('url');
	var url = theUrl;
	var btn = document.createElement("BUTTON");
	btn.innerHTML = nameBtn;

	/*
	graphsList:
		"data" : 		valueList[i][0],
		"timestamp": 	valuelist[i][1]
		"name" : 		valueList[i][2],
	});

	createButton(nameBtn, idBtn, classBtn, servicePath, service)

	*/

	if(classBtn === "buttonSearch") {
		// Search is meant to indicate that button will not draw graphs, but make searches further for specific data
		btn.onclick =  async function(){
			var headers = await getHeader(servicePath, service);
			var response = await browser(url, headers);
			var btnList = [];
			console.log(response);
			if (idBtn === "aqvaio") {
				var tempList = [[], [], []];
				var waterList = [[], [], []];

				// Collect the most recent measurements from Aqvaio's 3 temperature and water reading measurements
				for (var i=0; i < response.length; i++) {
					if (response[i].type === "AirQualityObserved") {
						if (tempList[2].length === 0) {
							tempList[2].push(response[i].type);
						}
						tempList[0].push(response[i].temperature.value);
						tempList[1].push(response[i].dateObserved.value);
					} else if (response[i].type === "Device") {
						if (waterList[2].length === 0) {
							waterList[2].push(response[i].type + " (water reading)");
						}
						waterList[0].push(response[i].value.value);
						waterList[1].push(response[i].value.metadata.timestamp.value + " - " + response[i].description.value);
					}
					if (response[i].type === "Device") {
						var newBtn = createButton(response[i].id, response[i].type, "buttonGraph_aqva", "/oulu", "aqvaio");
					} else {
						var newBtn = createButton(response[i].id, response[i].type, "buttonGraph_aqva", "/oulu", "aqvaio");
					}

					btnList.push(newBtn);
				}
				graphContainer.graphList = [];
				graphContainer.graphList.push(waterList, tempList);
				sendGraph(graphContainer.graphList, "aqvaio");
			} else {
				for(var i = 0; i < response.length; i ++)
				{
					if(response[i]["type"] === "Room") {
						var id = response[i]["id"];
						var sub_servicePath = "/f/" + id.charAt(1) + "/" + id.slice(1);
						var headers_Room = await getHeader(sub_servicePath , service);
						var sub_response = await browser(url, headers_Room);
						for(var c = 0; c < sub_response.length; c++)
						{
							// This part is meant for Talvikangas button creation. Does not work as intended
							var keys = Object.keys(sub_response[c]);
							for(var g = 0; g < keys.length; g++)
							{
								if(keys[g] !== ("TimeInstant" || "location" || "type"))
								{
									var newBtn = createButton(sub_response[c]["id"], sub_response[c]["type"], "buttonGraph", sub_servicePath, service);
									btnList.push(newBtn);
								}
							}
						}
					}

					// Creates Initial Graph Window for data from Siptronix
					else if(response[i]["type"] == "Alert") {
						var keys = Object.keys(response[i]["data"]["value"]);
						if(keys.length > bulbsList.length) {
							// Adds more empty lists
							while(keys.length != bulbsList.length) {
								bulbsList.unshift([[], []]);
							}
						}
						for(var d = 0; d < keys.length; d++) {
							bulbsList[d][0].push(response[i]["data"]["value"][keys[d]]);
							bulbsList[d][1].push(i);
						}
						// TO-DO: Create buttons for all individual Alerts
						initDate = response[i]["dateIssued"]["value"];
						var idsBtnList = ["/type/3PhaseACMeasurement", "/id/Ritaharju_POS39_lighting", "/attributes/"];

						var newBtn = createButton(response[i]["id"], idsBtnList, "buttonSearch_sip", "/oulu", "siptronix");
						btnList.push(newBtn);
					}
				}
			}

			if(bulbsList.length > 0) {
				for(var h = 0; h < bulbsList.length; h++) {
					bulbsList[h].push([keys[h]]);
				}
				// Removes 2 irrelevant lists from the graph
				bulbsList.splice(0, 1);
				bulbsList.splice(2, 1);

				sendGraph(bulbsList);
			}
			createNewPage(btnList);
		}
	}
	else if(classBtn === "buttonGraph_tal") {
		btn.onclick = async function(){
			if(!onOffActivate) {
				MashupPlatform.wiring.pushEvent("Graph", {"title": {"text": "LOADING...", "x": -20}});
				// Pushes graph to list of graphs
				// url = " https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities/type/" + "AirQualityObserved" + "/id/" + idBtn + "/attributes/tk11te22?lastN=50";
				var graphsList = [];
				for( var i = 0; i < idBtn.length; i++) {
					url = " https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities/type/" + idBtn[i][0] + "/id/" + idBtn[i][1] + "/attributes/" + idBtn[i][2] + "?lastN=50";
					console.log(url);
					var headers = await getHeader(servicePath, service);
					console.log(headers);
					var response = await browser(url, headers);
					console.log(response);
					var receivedDataList = [[], [], []];
					var receivedData = response["contextResponses"][0]["contextElement"]["attributes"][0]["values"];
					for(var j = 0; j < receivedData.length; j++) {
						receivedDataList[0].push(parseFloat(receivedData[j]["attrValue"]));
						receivedDataList[1].push(receivedData[j]["recvTime"].slice(0, 19));
					}
					receivedDataList[2].push(nameBtn + " " + idBtn[i][3]);
					graphsList.push(receivedDataList);

				}
				sendGraph(graphsList, false);

				// var headers = await getHeader(servicePath, service);
				// var response = await browser(url, headers);
				// console.log(response);
				// url = " https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities" + idBtn[0] + idBtn[1] + idBtn[2];
				// "aggrMethod=max&aggrPeriod=hour&dateFrom=2018-10-10T00:00:00.000Z&dateTo=2018-10-10T23:59:59.999Z"
				/*var headers = await getHeader(servicePath, service);
				var response = await browser(url, headers);
				var parsedData = response["contextResponses"][0]["contextElement"]["attributes"][0]["values"];
				var data = [];
				for(var i = 0; i < parsedData.length; i++)
				{
					data.push([nameBtn, parsedData[i]["attrValue"], parsedData[i]["recvTime"]]);
				}
				graphContainer.graphList.push(data);
				sendGraph(graphContainer.graphList);*/
			}
			else {
				// Removes graph from the list
				graphContainer.delGraph(nameBtn);
			}
			onOffActivate = !onOffActivate;
		}
	}
	// buttons for each Siptronix alerts
	else if(classBtn == "buttonSearch_sip") {
		// classBtn buttonGraph_sip handles siptronix data and draws graphs based on it
		btn.onclick = async function() {
			console.log("search")
			var alertDate = new Date(initDate)
			var dateFrom = alertDate.setMinutes(alertDate.getMinutes() - parseInt(minutes));
			var dateTo = alertDate.setMinutes(alertDate.getMinutes() + 2*parseInt(minutes));
			var btnList = [];
			if(!onOffActivate) {
				var graphsList = [];
				var sipSearchList = ["activePower", "apparentPower", "current", "frequency", "powerFactor", "reactivePower", "totalActiveEnergyImport", "totalActivePower", "totalApparentPower", "totalReactivePower", "voltage"];
				dataCollection = [];
				MashupPlatform.wiring.pushEvent("Graph", {"title": {"text": "LOADING...", "x": -20}});
				for(var c = 0; c < sipSearchList.length; c++) {
					url = "https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities" + idBtn[0] + idBtn[1] + idBtn[2] + sipSearchList[c] + "?lastN=100&dateFrom=" + dateFrom + "&dateTo=" + dateTo;
					var headers = await getHeader(servicePath, service);
					var response = await browser(url, headers);
					var receivedData = response["contextResponses"][0]["contextElement"]["attributes"][0]["values"];
					dataCollection.push([sipSearchList[c], receivedData])
					var receivedDataList = [[], [], []];
					// Checks if there is more than 1 value stored
					// Takes all the data points, stores and sends them to graph function
					// console.log(headers);
					// console.log(url);
					console.log(receivedData);

					// createButton(nameBtn, idBtn, classBtn, servicePath, service)
					var graphBtn = createButton(sipSearchList[c], "id: "+c, "buttonGraph_sip", "/oulu", "siptronix");
					btnList.push(graphBtn)

					if(Object.keys(receivedData[0]["attrValue"]).length == 0) {
						var maxValue = -Infinity;
						for(var b = 0; b < receivedData.length; b++) {
							receivedDataList[0].push(receivedData[b]["attrValue"]);
							if(receivedDataList[0][b] > maxValue) {
								maxValue = receivedDataList[0][b];
							}
							receivedDataList[1].push(receivedData[b]["recvTime"].slice(0,19));
						}
						// Normallizes data, so it can be compared to others
						for(var b = 0; b < receivedDataList[0].length; b++) {
							receivedDataList[0][b] = receivedDataList[0][b] / maxValue;
						}
						receivedDataList[2].push(sipSearchList[c]);
						graphsList.push(receivedDataList);
					}
					else {
						var keysSip = Object.keys(receivedData[0]["attrValue"]);
						for(var o = 0; o < keysSip.length; o++) {
							var maxValue = -Infinity;
							var receivedDataList = [[], [], []];
							for(var p = 0; p < receivedData.length; p++) {
								receivedDataList[0].push(receivedData[p]["attrValue"][keysSip[o]]);
								if(receivedDataList[0][p] > maxValue) {
									maxValue = receivedDataList[0][p];
								}
								receivedDataList[1].push(receivedData[p]["recvTime"].slice(0,19));
							}
							for(var p = 0; p < receivedDataList[0].length; p++) {
								receivedDataList[0][p] = receivedDataList[0][p] / maxValue;
							}
							receivedDataList[2].push(sipSearchList[c] + " " + keysSip[o]);
							graphsList.push(receivedDataList);
						}
					}
				}
			sendGraph(graphsList, "siptronix");
			}
			createNewPage(btnList);

		}
	} else if (classBtn === "buttonGraph_sip") {
		btn.onclick = async function() {
			var measData = [[ [], [], [] ]];
			var graphData = [];
			var dataCollection2 = [];
			// Loops through the collected data
			for (var i = 0; i < dataCollection.length; i++) {
				if (nameBtn === dataCollection[i][0]) {
					measData[0][2].push(nameBtn)

					let tempList1 = [ [], [], [] ];
					let tempList2 = [ [], [], [] ];
					let tempList3 = [ [], [], [] ];

					tempList1[2].push(nameBtn + " L1");
					tempList2[2].push(nameBtn + " L2");
					tempList3[2].push(nameBtn + " L3");
					var tempData = dataCollection[i][1];
					// Check the selected minutes and based on in, select the correct amount of data
					if (minutes === "10") {
						for (var k = 0; k < 24; k++ && dataCollection.length !== 22) {
							dataCollection2.push(tempData[tempData.length / 2 - 12 + k]);
						}
					} else if (minutes === "20" && dataCollection.length !== 44) {
						for (var k = 0; k < 44; k++) {
							dataCollection2.push(tempData[tempData.length / 2 - 22 + k]);
						}
					} else {
						dataCollection2 = dataCollection[i][1];
					}
					// Collect the timestamps and values and send to graphwidget
					for (var j = 0; j < dataCollection2.length; j++) {
						measData[0][0].push(dataCollection2[j].attrValue);
						measData[0][1].push(dataCollection2[j].recvTime);

						tempList1[0].push(dataCollection2[j].attrValue.L1);
						tempList1[1].push(dataCollection2[j].recvTime);
						tempList2[0].push(dataCollection2[j].attrValue.L2);
						tempList2[1].push(dataCollection2[j].recvTime);
						tempList3[0].push(dataCollection2[j].attrValue.L3);
						tempList3[1].push(dataCollection2[j].recvTime);
					}
					if (typeof measData[0][0][0] === 'object') {
						graphData.push(tempList1);
						graphData.push(tempList2);
						graphData.push(tempList3);
						sendGraph(graphData, "siptronix");
					} else {
						sendGraph(measData, "siptronix");
					}
				}

			}
		}
	} else if (classBtn === "buttonGraph_aqva") {
		btn.onclick = async function() {
			var dates = [];
			var data = [];
			var graphData = [[]];
			// Aqvaio's temperature measurements
			if (idBtn === "AirQualityObserved") {
				url = "https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities/type/"+idBtn+"/id/"+nameBtn+"/attributes/temperature?aggrMethod="+aggrMethod+"&aggrPeriod="+aggrPeriod+"&dateFrom="+inputDates[0]+"&dateTo="+inputDates[1];
				// search for the correct data based on button's attributes
				var headers = await getHeader(servicePath, service);
				var response = await browser(url, headers);
				var values = response.contextResponses[0].contextElement.attributes[0].values;
				console.log(values)

				// set the timestamps correct based on aggrPeriod and push timestamps & data to lists, ready to send to graphwidget
				for (var i = 0; i < values.length; i++) {
					var originDate = new Date(values[i]._id.origin);
					var newDate;
					dates.push(originDate.toISOString().substr(0,18));
					for (var j = 0; j < values[i].points.length; j++) {
						if (aggrPeriod === "second") {
							newDate = originDate.setSeconds(originDate.getSeconds() + 1);
						} else if (aggrPeriod === "minute") {
							newDate = originDate.setMinutes(originDate.getMinutes() + 1);
						} else if (aggrPeriod === "hour") {
							newDate = originDate.setHours(originDate.getHours() + 1);
						} else if (aggrPeriod === "day") {
							newDate = originDate.setDate(originDate.getDate() + 1);
						} else if (aggrPeriod === "month") {
							newDate = originDate.setMonth(originDate.geMonth() + 1);
						}
						var formatDate = new Date(newDate);
						dates.push(formatDate.toISOString().substr(0,19));
						data.push(parseInt(values[i].points[j][aggrMethod]));
					}
				}
				graphData[0].push(data);
				graphData[0].push(dates);
				if (nameBtn === "AirQualityObserved:0004815870800252") {
					graphData[0].push(["Temperature - Ritaharju sportcenter"]);
				} else if (nameBtn === "AirQualityObserved:0010588167080077") {
					graphData[0].push(["Temperature - Environment house"]);
				} else {
					graphData[0].push(["Temperature - Pikku-Iikka daycare center"]);
				}
				sendGraph(graphData, "aqvaio");
				console.log(dates)
				console.log(data)
				// Aqvaio's water reading measurements
			} else if (idBtn === "Device") {
				url = "https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities/type/"+idBtn+"/id/"+nameBtn+"/attributes/value?aggrMethod="+aggrMethod+"&aggrPeriod="+aggrPeriod+"&dateFrom="+inputDates[0]+"&dateTo="+inputDates[1];
				// search for the correct data based on button's attributes
				var headers = await getHeader(servicePath, service);
				var response = await browser(url, headers);
				var values = response.contextResponses[0].contextElement.attributes[0].values;
				console.log(values)

				// set the timestamps correct based on aggrPeriod and push timestamps & data to lists, ready to send to graphwidget
				for (var i = 0; i < values.length; i++) {
					var originDate = new Date(values[i]._id.origin);
					var newDate;
					dates.push(originDate.toISOString().substr(0,18));
					for (var j = 0; j < values[i].points.length; j++) {
						if (aggrPeriod === "second") {
							newDate = originDate.setSeconds(originDate.getSeconds() + 1);
						} else if (aggrPeriod === "minute") {
							newDate = originDate.setMinutes(originDate.getMinutes() + 1);
						} else if (aggrPeriod === "hour") {
							newDate = originDate.setHours(originDate.getHours() + 1);
						} else if (aggrPeriod === "day") {
							newDate = originDate.setDate(originDate.getDate() + 1);
						} else if (aggrPeriod === "month") {
							newDate = originDate.setMonth(originDate.geMonth() + 1);
						}
						var formatDate = new Date(newDate);
						dates.push(formatDate.toISOString().substr(0,19));
						data.push(parseInt(values[i].points[j][aggrMethod]));
					}
				}
				graphData[0].push(data);
				graphData[0].push(dates);
				// Sets the correct name for the graph
				if (nameBtn === "Device:0004815870800252") {
					graphData[0].push(["Water reading - Ritaharju sportcenter"]);
				} else if (nameBtn === "Device:0010588167080077") {
					graphData[0].push(["Water reading - Environment house"]);
				} else {
					graphData[0].push(["Water reading - Pikku-Iikka daycare center"]);
				}
				sendGraph(graphData, "aqvaio");
				console.log(dates)
				console.log(data)
			}
		}
	}
	return btn;
}

function init()
{
	// Predefined values
	var list = [["Talvikangas", "tal", "buttonSearch", "", "tal"], ["Siptronix", "siptronix", "buttonSearch", "", "siptronix"], ["Aqva.io", "aqvaio", "buttonSearch", "/oulu", "aqvaio"],
                ["JAS partners", "jas_oulu", "buttonSearch", "", "jas_oulu"], ["Ymparistotalo", "ymp", "buttonSearch", "", "ymp"]];
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
	MashupPlatform.wiring.registerCallback('AggrMethod', function(data) {aggrMethod=data; console.log(`aggrMethod: ${aggrMethod}`)});
	MashupPlatform.wiring.registerCallback('AggrPeriod', function(data) {aggrPeriod=data; console.log(`aggrPeriod: ${aggrPeriod}`)});
	MashupPlatform.wiring.registerCallback('Dates', function(data) {inputDates=data; console.log(`dates: ${inputDates}`)});
    MashupPlatform.wiring.registerCallback('nValue', function(data2) {inputNValue=data2; console.log(`nvalue: ${inputNValue}`)});
	MashupPlatform.wiring.registerCallback('Minutes', function(mins) {minutes=mins; console.log(`minutes: ${minutes}`)});
	}


init();
