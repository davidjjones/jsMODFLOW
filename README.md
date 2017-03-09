## jsMODFLOW

This project is to transpose portions of the groundwater modeling code [MODFLOW-2005](http://water.usgs.gov/ogw/modflow/MODFLOW.html) from FORTRAN to JavaScript, allowing simple models to be executed within a web browser. Moving the modeling environment to the web browser will allow a wider audience of users to interact with groundwater models in a controlled way. 

### Examples:
- [Input and Output](https://davidjjones.github.io/jsMODFLOW/samples/01_InputOutput.htm)
- [Well Impact](https://davidjjones.github.io/jsMODFLOW/samples/02_WellImpact.htm)
- [Drawdown Cone Animation](https://davidjjones.github.io/jsMODFLOW/samples/DrawdownCone.htm)





### Supported Packages
This version partially supports the following MODFLOW packages. Parameterization is not supported.

- BAS
- BCF
- SIP
- WEL
- DRN
- RCH 
- RIV
- EVT
- GHB 


#### BAS 

```
"BAS": {
  "hnoflo": 999.99,
  "ibound":[  /* value for each cell:
                   <0 - constant head
                   =0 - innactive cell
                   >0 - active cell
    [[1,1,1,1],
     [1,1,1,1],
     [1,1,1,1]]
  ],
  "strt": [  /* starting head for every cell */
    [[100,100,100,100],
     [100,100,100,100],
     [100,100,100,100]]
  ],
}

```

#### BCF


```
	"BCF": {
		"hdry": 1e+30,      /* the number to assign cells that become dry */
		"iwdflg": false,    /* whether or not wetting is turned on (true or false) */
		"wetfct": 0,        /* the wetting factor */
		"iwetit": 0,        /* the iteration interval for attempting to wet cells */
		"ihdwet": 0,
		"layers": [
      {
			  "layavg": 0,
			  "laycon": 3,         /* the layer type:
                                  0=confined
                                  1=unconfined
                                  2=confined/unconfined—Transmissivity of the layer is constant
                                  3=confined/unconfined—Transmissivity of the layer varies.     */
			  "hy": [ [1,1,1,1],     /* Required if laycon is 1 or 3 */
                [1,1,1,1],
                [1,1,1,1] ],
        "sc1": [ [1,1,1,1],    /* Required if there is at least one transient stress period. */
                [1,1,1,1],
                [1,1,1,1] ],
        "sc2": [ [1,1,1,1],    /* Required if there is at least one transient stress period and laycon is 2 or 3. */
                [1,1,1,1],
                [1,1,1,1] ],
        "trpy": 1              /* horizontal anisotropy factor */
        
        
        /*
        ... If not the bottom layer:
			  "vcont": [ [1,1,1,1],
                [1,1,1,1],
                [1,1,1,1] ],
                
        ... If laycon is 0 or 2:
        "tran": [ [1,1,1,1],
                [1,1,1,1],
                [1,1,1,1] ],
        */
        
        
      }
    ]
  }
```


#### SIP (Solver: Strongly Implicit Procedure)


Why am I using SIP.err rather than SIP.hclose?


```
	"SIP": {
		"mxiter": 50,     /* max number of iterations */
		"nparm": 5,       /* number of iteration variables */
		"accl": 1,        /* acceleration variable. It must be greater than zero and is generally equal to one. */
		"err": 0.001,     /* head change criterion for convergence. When the maximum absolute value of head change from all nodes during an iteration is less than or equal to HCLOSE, iteration stops. */
		"ipcalc": 0,      /*  */
		"wseed": 0.001    /*  */
	}
```


#### WEL (Well)

Parameters are not supported. The package is enabled if the model input object includes a 'WEL' attribute. This attribute should contain an array with an item for each stress period. Each stress period item is an array of objects describing each well boundary condition.

```
  "WEL": {data: [
    // Stress Period #1:
    [
      {"layer":1, "row":30, "column":20, "q":-10 }, 
      {"layer":1, "row":30, "column":21, "q":-10 }
    ], 
    
    // Stress Period #2:
    [
      {"layer":1, "row":30, "column":20, "q":-10 }, 
      {"layer":1, "row":30, "column":21, "q":-10 }
    ]
  ] }

```


#### DRN (Drain)

Parameters are not supported. The package is enabled if the model input object includes a 'DRN' attribute. This attribute should contain an array with an item for each stress period. Each stress period item is an array of objects describing each drain boundary condition.

```
  "DRN": {data: [
    // Stress Period #1:
    [
      {"layer":1, "row":30, "column":20, "elevation":190, "condfact":0.1 }, 
      {"layer":1, "row":30, "column":21, "elevation":190, "condfact":0.1 }
    ], 
    
    // Stress Period #2:
    [
      {"layer":1, "row":30, "column":20, "elevation":190, "condfact":0.1 }, 
      {"layer":1, "row":30, "column":21, "elevation":190, "condfact":0.1 }
    ]
  ] }

```

#### RCH (Recharge)

Parameters are not supported. The package is enabled if the model input object includes a 'RCH' attribute. This attribute should contain an object that specifies data regarding the ET surface elevation, max rate, and extinction depth.

```
  "RCH": {
    "nrchop": 2,    /* The recharge option code:
                       (1)-Layer 1 is recharged, 
                       (2)-use IRCH to determine, 
                       (3)-application of the recharge to the uppermost variable-head cell in the vertical column, 
                           provided no constant-head cell is above the variable-head cell in the column
    "irch": [ /* the layer number variable that defines the layer in each vertical column where recharge is applied. 
                 Read only if NRCHOP is two */
      [ [1,1,1,1],
        [1,1,1,1],
        [1,1,1,1] ]
    ],
    "rech": [
      [ [1,1,1,1],
        [1,1,1,1],
        [1,1,1,1] ]
    ]
    "calc"
  }

```

RCH.calc is a 2D array created after the model is initialized and is the recharge for a particular stress period multiplied by cell area.


#### RIV (River)
Parameters are not supported. The package is enabled if the model input object includes a 'RIV' attribute. This attribute should contain an array with an item for each stress period. Each stress period item is an array of objects describing each river boundary condition.

```
  "RIV": {data: [
    // Stress Period #1:
    [ // layer Row Column Stage  Cond Rbot
      {"layer":1, "row":30, "column":20, "stage":200, "conductance":0.01, "riverbottom":190 }, 
      {"layer":1, "row":30, "column":21, "stage":200, "conductance":0.01, "riverbottom":190 }
    ], 
    
    // Stress Period #2:
    [
      {"layer":1, "row":30, "column":20, "stage":200, "conductance":0.01, "riverbottom":190 }, 
      {"layer":1, "row":30, "column":21, "stage":200, "conductance":0.01, "riverbottom":190 }
    ]
  ] }

```


#### EVT (Evapotranspiration)
Parameters are not supported. The package is enabled if the model input object includes a 'EVT' attribute. This attribute should contain an object that specifies data regarding the ET surface elevation, max rate, and extinction depth.

```
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

```


#### GHB (General-Head Boundary)
Parameters are not supported. The package is enabled if the model input object includes a 'GHB' attribute. This attribute should contain an array with an item for each stress period. Each stress period item is an array of objects describing each general-head boundary condition.

```  
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

```


