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
2. Input widget is a support widget for Browsermain and allows the user to modify the search by for example choosing the search method, timeperiod or dates for each search. 
3. Highcharts widget is the graph widget which visualizes the data which Browsermain has retrieved from server.

![wirecloud_pic](https://user-images.githubusercontent.com/14833656/58404833-bac8f200-806e-11e9-969b-f425a01a10d7.PNG)
