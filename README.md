# CityIoT Fiware lab widget mashup
This readme describes the structure and functionality of Wirecloud widgets which fetch, handle and present data from CityIoT project sources.

## Getting Started
These instructions will tell how to view the widget mashup in Wirecloud and show how to modify widgets or create new ones.

### Viewing the widgets
Currently the widgets are private on Fiware lab Wirecloud platform. In order to see them yourself you need to create an account at https://account.lab.fiware.org/.
After creating the account you need to ask permission to view the mashup from mashup owner (currently contributors of this repo).

### Modifying / Creating a widget
A tutorial for widget development can bee seen here: https://github.com/pokkonen/wirecloud-widget-tutorial

## Wirecloud mashup structure
The Wirecloud mashup consists of three widgets. 
1. Browsermain(or WidgetMain) is the main widget which is the main operator in this application.
2. Input widget (https://github.com/pokkonen/InputWidget) is a support widget for Browsermain and allows the user to modify the search by for example choosing the search method, timeperiod or dates for each search. 
3. Highcharts widget is the graph widget which visualizes the data which Browsermain has retrieved from server.

![wirecloud_pic](https://user-images.githubusercontent.com/14833656/58404833-bac8f200-806e-11e9-969b-f425a01a10d7.PNG)

## Browsermain functionality
Browsermain widget operates by creating buttons for each dataset (seen in the picture above) and assigning different functionalities for the buttons. Buttons are either "search" or "graph" buttons. Search buttons are meant for pulling data from server and in some cases also draw graphs on Highcharts widget. Graph buttons are strictly meant for drawing graphs. Buttons can be influenced by the input widget with selecting different search attributes and then searching data with Browsermain.

### Browsermain step-by-step
1. Clicking the buttons on main page (ie. Talvikangas) retrieves the most recent measurement values from orion as well as required attributes to make requests from comet. Also draws a graph from recent measurements to show what kind of data is stored in orion. Input widget is not used for these searches.

**Main window**
![mainwindow](https://user-images.githubusercontent.com/14833656/58412616-801b8580-807f-11e9-8b29-97d9583f97d6.PNG)

2. Next opens up a new page consisting of buttons which are unique for each dataset. Buttons allow the user to search history data for each specific item in dataset (in talvikangas for each room, in siptronix for each alert and so on). Buttons fetch the data from orion and present it in the Highcharts widget.
    - Talvikangas can use Timeperiod search and Lastn search
    - Siptronix can use Minutes around alert
    - Aqvaio can use Timeperiod search
    
**Siptronix first button set**
![secondwindow](https://user-images.githubusercontent.com/14833656/58412624-83167600-807f-11e9-974b-19040f381856.PNG)

3. There can be two or more button layers as described above. When there are more than two layers of buttons, the widget first retrieves the whole dataset from orion, secondly retrieves a part of the dataset and finally presents buttons for individual set of data. (Siptronix is an example of three layers of buttons)

**Siptronix second button set**
![thirdwindow](https://user-images.githubusercontent.com/14833656/58412626-84e03980-807f-11e9-86b7-0a38e84fee7b.PNG)
**Siptronix individual data set**
![fourthwindow](https://user-images.githubusercontent.com/14833656/58412629-86116680-807f-11e9-9064-6d18cf3ebfd8.PNG)
