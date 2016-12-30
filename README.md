## jsMODFLOW

This project is to transpose portions of the groundwater modeling code [MODFLOW-2005](http://water.usgs.gov/ogw/modflow/MODFLOW.html) from FORTRAN to JavaScript, allowing simple models to be executed within a web browser. Moving the modeling environment to the web browser will allow a wider audience of users to interact with groundwater models in a controlled way. 

### Examples:
- [Input and Output](https://davidjjones.github.io/jsMODFLOW/samples/01_InputOutput.htm)
- [Well Impact](https://davidjjones.github.io/jsMODFLOW/samples/02_WellImpact.htm)

### Supported Modules
This version partially supports the following MODFLOW modules. Parameterization is not supported.

- BAS
- BCF
- SIP
- WEL
- DRN
- RCH 
- RIV
- EVT
- GHB 





#### RIV (River)
Parameters are not supported. The package is enabled if the model input object includes a 'RIV' attribute. This attribute should contain an array with an item for each stress period. Each stress period item is an array of objects describing each river boundary condition.

```
{
  "BAS": {...},
  "BCF": {...},
  
  ...
  
  "RIV": {data: [
    // Stress Period #1:
    [ 'layer Row Column Stage  Cond Rbot
      {"layer":1, "row":30, "column":20, "stage":200, "cond":0.01, "rbot":190 }, 
      {"layer":1, "row":30, "column":21, "stage":200, "cond":0.01, "rbot":190 }
    ], 
    
    // Stress Period #2:
    [
      {"layer":1, "row":30, "column":20, "stage":200, "cond":0.01, "rbot":190 }, 
      {"layer":1, "row":30, "column":21, "stage":200, "cond":0.01, "rbot":190 }
    ]
  ] }

  ... 
  
}

```


#### EVT (Evapotranspiration)
Parameters are not supported. The package is enabled if the model input object includes a 'EVT' attribute. This attribute should contain an object that specifies data regarding the ET surface elevation, max rate, and extinction depth.

```
{
  "BAS": {...},
  "BCF": {...},
  
  ...
  
  "EVT": {
  
    "nevtop": 2,      /*  Must be 1 (calculated for top layer) 
                               or 2 (layer specified by EVT.ievt) 
                               or 3 (top active layer)             */
    "surf": [ 
      /* For each period, provide nested arrays specifying the elevation of the ET surface for each cell */
      [ [100,100,100,100],
        [100,100,100,100],
        [100,100,100,100]
      ]
    ],
    "evtr":[
      /* For each period, provide nested arrays specifying the maximum ET flux (volumetric rate per unit area) for each cell */
      [ [0.5,0.5,0.5,0.5],
        [0.5,0.5,0.5,0.5],
        [0.5,0.5,0.5,0.5]
      ]
    ],
    "exdp":[
      /* For each period, provide nested arrays specifying the ET extinction depth for each cell */
      [ [20,20,20,20],
        [20,20,20,20],
        [20,20,20,20]
      ]
    ],
    "ievt":[ /* Only specified if EVT.nevtop = 2 */
      /* For each period, provide nested arrays specifying the layer from which ET occurs for each cell */
      [ [1,1,1,1],
        [1,1,1,1],
        [1,1,1,1]
      ]
    ]
  
  }

  ... 
  
}

```


#### GHB (General-Head Boundary)
Parameters are not supported. The package is enabled if the model input object includes a 'GHB' attribute. This attribute should contain an array with an item for each stress period. Each stress period item is an array of objects describing each general-head boundary condition.

```
{
  "BAS": {...},
  "BCF": {...},
  
  ...
  
  "GHB": {data: [
    // Stress Period #1:
    [
      {"layer":1, "row":30, "column":20, "bhead":200, "cond":0.01 }, 
      {"layer":1, "row":30, "column":21, "bhead":200, "cond":0.01 }
    ], 
    
    // Stress Period #2:
    [
      {"layer":1, "row":30, "column":20, "bhead":200, "cond":0.01 }, 
      {"layer":1, "row":30, "column":21, "bhead":200, "cond":0.01 }
    ]
  ] }

  ... 
  
}

```


