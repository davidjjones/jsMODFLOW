## jsMODFLOW

This project is to transpose portions of the groundwater modeling code [MODFLOW-2005](http://water.usgs.gov/ogw/modflow/MODFLOW.html) from FORTRAN to JavaScript, allowing simple models to be executed within a web browser. Moving the modeling environment to the web browser will allow a wider audience of users to interact with groundwater models in a controlled way. 

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

#### GHB (General-Head Boundary)
Parameters are not supported. The package is enabled if the model input object includes a 'GHB' attribute. This attribute should contain an array with an item for each stress period. Each stress period item is an array of objects describing each general-head boundary condition.

```
{ ...

"GHB":[
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
]

... }

```

### Examples:
- [Input and Output](https://davidjjones.github.io/jsMODFLOW/samples/01_InputOutput.htm)
- [Well Impact](https://davidjjones.github.io/jsMODFLOW/samples/02_WellImpact.htm)
