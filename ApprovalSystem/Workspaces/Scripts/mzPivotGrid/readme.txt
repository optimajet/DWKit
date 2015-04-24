Copy the folders "mzPivotGrid" and "mzPivotMatrix" to your MVC app packages folder.
Adjust your app.json file to require the package "mzPivotGrid". It should look like this one:

{
    "name": "YourApp",

    "requires": [
        "mzPivotGrid"
    ],

    "id": "391a5ff6-2fd8-4e10-84d3-9114e1980e2d"
}

PivotGrid.aux is the Sencha Architect package for mzPivotGrid. 