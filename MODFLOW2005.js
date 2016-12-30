

var MODFLOW2005 = function( input ){
  "use strict";
  
  
  var badinput = function(msg){
    throw ("Error - Problem with model input - " + msg);
  }
  
  var inputNumber = function(o){
    var v = o.value;
    var err = o.iferror
    if (typeof v == "undefined"){
      badinput(err + " No value found.");
    }
    else if (typeof v != "number"){
      badinput(err +" Entered value `"+v+"` is a "+typeof v+", not a number.");
    }
    else if (isNaN(v)){
      badinput(err +" Entered value is NaN.");
    }
    else if (o.isGTZero && v <= 0){
      badinput(err +" Entered value `"+v+"` is less than or equal to zero.");
    }
    else if (o.isInt && Math.round(v) !== v){
      badinput(err +" Entered value `"+v+"` is not an integer.");
    }
    else{
      return v;
    }
  }
  
  var inputBoolean = function(o){
    if (o.value === true || o.value === false){
      return o.value;
    }
    else{
      if (typeof o.value == "undefined"){
        badinput(o.iferror + " No value found.");
      }else{
        badinput(o.iferror + " Value is not either true or false.")
      }
    }
  }
  
  var inputArray = function(o){
  //*  ({ value:input.DIS.delc, size:[BAS.nrow], isInt:true, isGTZero:true, iferror: "DIS.delc array is misformed."});
  //*  
  //*  var a = o.value;
  //*  var err = o.iferror
  //*  var isInt = o.isInt || false;
  //*  var isGTZero = o.isGTZero || false;
  //*  var dim = o.size.length;
  //*  
  //*  if (!o.returnArray){
  //*    if (isInt){
  //*      o.returnArray = new 
  //*    }
  //*    else{
  //*      
  //*    }
  //*  }
  //*  
  //*  if ( typeof a == "undefined"){
  //*    badinput(err + " No array found.");
  //*  }
  //*  else if (v.constructor === Array){
  //*    badinput(err +" Entered value is not an array object.");
  //*  }
  //*  else if (dim == 1 && v.length != o.size[0]){
  //*    badinput(err +" The 1-dimensional array needs "+o.size[0]+" values, only "+v.length+" found.");
  //*  }
  //*  else{
  //*    // now look at each value
  //*    var vv = v;
  //*    for (var d=0; d<dim; d++){
  //*      
  //*      if (d !== dim-1 && v.length != o.size[0]){ // items should be other arrays
  //*      
  //*      }
  //*      else{ // root level - check the values
  //*        badinput(err +" The 1-dimensional array needs "+o.size[0]+" values, only "+v.length+" found.");
  //*      }
  //*      vv = v[d];
  //*    }
  //*  }
  }
  
  var checkIfArray = function(o, size){
    // Returns "ok" if o is an array with length of "size"
    // If there is a problem, returns a message.
    if ( typeof o == "undefined"){
      return "No array found.";
    }
    else if (o.constructor.name !== "Array"){
      return "Value is not an array object (found "+o.constructor.name+").";
    }
    else if (typeof size != "undefined" && o.length != size){
      if (o.length > size) return "Array too large (expected "+size+" sub-items, found "+o.length+").";
      if (o.length < size) return "Array too small (expected "+size+" sub-items, found "+o.length+").";
    }
    return "ok";
    
  }
  
  var checkIfInt = function(o){
    // Returns "ok" if o is an integer. If there is a problem, returns a message.
    var v = checkIfNumber(o);
    if (v!="ok") return v;
    
    if ( Math.round(o) !== o){
      return "Entered value `"+o+"` is not an integer.";
    }
    return "ok";
    
  }
  
  var checkIfNumber = function(o){
    // Returns "ok" if o is a number. If there is a problem, returns a message.
    
    if (typeof o == "undefined"){
      return "No value found.";
    }
    else if (typeof o != "number"){
      return "Found value `"+o+"` is entered as a "+(typeof o)+"; it is not a number.";
    }
    else if (isNaN(o)){
      return "Found value is NaN.";
    }
    else{
      return "ok";
    }
    
  }
  
  // Variables for package objects
	//var BAS, BCF, SIP, DRN, RCH, WEL;
  
	var BAS = (function(){
    
    var BAS = {};
    
    // Global data, accesable to other packages
    //
    BAS.ibound = [];  //some packages might alter this ibound array
    BAS.hold = [];    //head at start of iteration
    BAS.hnew = [];    //head at end of an iteration
    BAS.nrow = 0;     //number of rows 
    BAS.ncol = 0;     //number of columns 
    BAS.nlay = 0;     //number of layers
    BAS.nper = 0;     //number of time periods
    BAS.delc = [];    //cell size in the X direction
    BAS.delr = [];    //cell size in the Y direction
    //BAS.botm = [];    // not going to use this
    BAS.cbdelev = []; //confining bed elevations, if specified
    BAS.elev = [];// cell elevations including top of layer 1
    BAS.itmuni = "";  //indicates time units, not used in calculations 
    BAS.lenuni = "";  //indicates length units, not used in calculations
    BAS.periods = []; // perlen,nstp,tsmult,issflg for each stress period
    // BAS.perlen  -- see BAS.periods
    // BAS.nstp  -- see BAS.periods
    // BAS.tsmult -- see BAS.periods
    // BAS.issflg -- see BAS.periods
    // BAS.nbotm   -- not using this pointer
    // BAS.ncnfbd  -- not using this pointer
    BAS.lbotm = [];  //
    // BAS.laycbd = []; // not going to use this. Using ConfElev instead
    BAS.layhdt = [];// head dependent thickness flag for layers. This is set by BCF
    BAS.layhds = [];// head dependent thickness flag for layers. This is set by BCF
    BAS.cr = [];    // the conductance accross rows
    BAS.cc = [];    // the conductance accross columns
    BAS.cv = [];    // the conductance accross layers
    BAS.hcof = [];  // a component in the main equation for each cell
    BAS.rhs = [];   // a component in the main equation for each cell
    BAS.buff = [];  // saturated thickness and other stuff?
    BAS.strt = [];  // used, but ?
    BAS.ddref = []; // ??
    BAS.hnf = 0;    // head at no-flow nodes
    // do I need the following pointers?
    BAS.ixsec = 0;  // not supported // if 1 indicates the input is a cross section
    BAS.itrss = 0;  // indicates if the simulation is (1)-transient, (0)-steady state, (-1) both
    BAS.inbas = 0;
    BAS.ifrefm = 0; // not supported // if 1 indicated free format has been selected
    BAS.nodes = 0;
    BAS.iout = 0;
    BAS.mxiter = 0; 
    BAS.iunit = 0;
    
    // following from GWFBASMODULE
    BAS.msum = 0;
    BAS.ihedfm = 0;
    BAS.ihedun = 0;
    BAS.iddnfm = 0;
    BAS.iddnun = 0;
    BAS.ibouun = 0;
    BAS.lbhdsv = 0;
    BAS.lbddsv = 0;
    BAS.lbbosv = 0;
    BAS.ibudfl = 0;
    BAS.icbcfl = 0;
    BAS.ihddfl = 0;
    BAS.iauxsv = 0;
    BAS.ibdopt = 0;
    BAS.iprtim = 0; // not supported // flag, when 1 indicates the PRINTTIME OPTION HAS BEEN SELECTED
    BAS.iperoc = 0;
    BAS.itsoc = 0;
    BAS.ichflg = 1; //flag, when 1 indicates that flow between adjacent constant-head cells should be calculated
    BAS.iddref = 0;
    BAS.iddrefnew = 0;
    BAS.delt = 0;    // LENGTH OF THE TIME STEP
    BAS.pertim = 0;  // ELAPSED TIME WITHIN STRESS PERIOD
    BAS.totim = 0;   // TOTAL ELAPSED TIME IN SIMULATION
    BAS.hnoflo = -999.9;
    BAS.hdry   = -888.8;
    BAS.stoper = 0;
    BAS.chedfm = "";
    BAS.cddnfm = "";
    BAS.cboufm = "";
    BAS.ioflg = [];
    BAS.vbvl = [[],[],[],[]]; // this is used for the volumetric budget
    BAS.vbnm = [];
    
    
    BAS.AllocateRead = function(input){
      
      // what are these?
      BAS.mxiter = 1;
      BAS.hdry = 1e30;
      BAS.stoper = 0.0;
      
      // Allocate and read discretization data.
      //
      (function SGWF2BAS7ARDIS (){
        
        if (!input.DIS){
          badInput ("DIS input is required.");
        }
        
        
        // Get the number of layers, rows, columns, stress periods.
        BAS.nlay = inputNumber({ value: input.DIS.nlay, isInt:true, isGTZero:true, iferror: "DIS.nlay (the number of layers in the model) must be a positive integer." });
        BAS.nrow = inputNumber({ value: input.DIS.nrow, isInt:true, isGTZero:true, iferror: "DIS.nrow (the number of rows in the model) must be a positive integer."});
        BAS.ncol = inputNumber({ value: input.DIS.ncol, isInt:true, isGTZero:true, iferror: "DIS.ncol (the number of columns in the model) must be a positive integer."});
        BAS.nper = inputNumber({ value: input.DIS.nper, isInt:true, isGTZero:true, iferror: "DIS.nper (the number of stress periods in the model) must be a positive integer."});
        
        // Get the problem units. These values do not impact the calculations.
        BAS.itmuni = input.DIS.itmuni;
        BAS.lenuni = input.DIS.lenuni;
        
        // Get discretization arrays.
        //** BAS.delr = inputArray({ value:input.DIS.delr, size:[BAS.nrow], isInt:true, isGTZero:true, iferror: "DIS.delr array is misformed."});
        //** BAS.delr = inputArray({ value:input.DIS.delc, size:[BAS.nrow], isInt:true, isGTZero:true, iferror: "DIS.delc array is misformed."});
        BAS.delr = input.DIS.delr;
        BAS.delc = input.DIS.delc;
        
        // Get elevation arrays
        BAS.cbdelev = input.DIS.cbdelev || [];
        BAS.elev = input.DIS.elev;
        
        // Get stress period inputs.  Check stress period inputs.
        BAS.periods = [];
        var iss = 0; // count the steady state periods
        var itr = 0; // count the transient periods
        for (var i=0; i<BAS.nper; i++){
          BAS.periods[i] = {};
          BAS.periods[i].issflg = input.DIS.periods[i].issflg; // must be true or false
          BAS.periods[i].nstp = input.DIS.periods[i].nstp;
          BAS.periods[i].perlen = input.DIS.periods[i].perlen;
          BAS.periods[i].tsmult = input.DIS.periods[i].tsmult;
          
          if (typeof BAS.periods[i].issflg != "boolean"){
            throw "Problem with DIS input. Missing input for stress period "+(i+1)+". issflg must be true or false.";
          }
          if (BAS.periods[i].nstp < 0){
            throw "Problem with DIS input. Bad input for stress period "+(i+1)+". nstp must not be less than zero.";
          }
          if (BAS.periods[i].perlen == 0 && BAS.periods[i].issflg==false){
            throw "Problem with DIS input. Bad input for stress period "+(i+1)+". perlen must not equal zero for transient stress periods.";
          }
          if (BAS.periods[i].tsmult <= 0){
            throw "Problem with DIS input. Bad input for stress period "+(i+1)+". tsmult must be greater than zero.";
          }
          if (BAS.periods[i].perlen < 0){
            throw "Problem with DIS input. Bad input for stress period "+(i+1)+". perlen must not be less than zero.";
          }
          
          if (BAS.periods[i].issflg){
            iss++;
          }else{
            itr++;
          }
        }
        if (iss==0 && itr!=0){BAS.itrss=1;}
        if (iss!=0 && itr==0){BAS.itrss=0;}
        if (iss!=0 && itr!=0){BAS.itrss=-1;}
        
      })();
      BAS.nodes = BAS.ncol * BAS.nrow * BAS.nlay;
      
      
      
      // Allocate space for global arrays except discretization data.
      //
      for (var k=0; k<BAS.nlay; k++){
        BAS.hnew[k] = [];
        BAS.hold[k] = [];
        BAS.ibound[k] = [];
        BAS.cr[k] = [];
        BAS.cc[k] = [];
        BAS.cv[k] = [];
        BAS.hcof[k] = [];
        BAS.rhs[k] = [];
        BAS.buff[k] = [];
        BAS.strt[k] = [];
        for (var i=0; i<BAS.nrow; i++){
          BAS.hnew[k][i] = [];
          BAS.hold[k][i] = [];
          BAS.ibound[k][i] = [];
          BAS.cr[k][i] = [];
          BAS.cc[k][i] = [];
          BAS.cv[k][i] = [];
          BAS.hcof[k][i] = [];
          BAS.rhs[k][i] = [];
          BAS.buff[k][i] = [];
          BAS.strt[k][i] = [];
          for (var j=0; j<BAS.ncol; j++){
            BAS.hnew[k][i][j] = input.BAS.strt[k][i][j] || 0;
            BAS.hold[k][i][j] = 0;
            BAS.ibound[k][i][j] = 0;
            BAS.cr[k][i][j] = 0;
            BAS.cc[k][i][j] = 0;
            BAS.cv[k][i][j] = 0;
            BAS.hcof[k][i][j] = 0;
            BAS.rhs[k][i][j] = 0;
            BAS.buff[k][i][j] = 0;
            BAS.strt[k][i][j] = input.BAS.strt[k][i][j] || 0;
          }
        }
      }
      
      for (var i=0; i<BAS.nlay; i++){
        BAS.layhdt[i] = 0;
        BAS.layhds[i] = 0;
      }
      
      //ddref=>strt // What is this meant to do?
      
      
      // Initialize head-dependent thickness indicator to code that
      // indicates layer is undefined.
      //
      for (var i=0; i<BAS.nlay; i++){
        BAS.layhdt[i] = -1;
        BAS.layhds[i] = -1;
      }
      
      
      // Read BAS Package file.
      //
      BAS.stoper=0;
      BAS.lloc=1; //?
      
      // Initialize total elapsed time counter storage array counter.
      BAS.totim=0
      
      // Read boundary array(ibound).
      BAS.ibound =  input.BAS.ibound;  
      
      
      // Get the no-flow node head value.
      BAS.hnf = input.BAS.hnoflo;
      BAS.hnoflo = input.BAS.hnoflo;
      
      
      //
      for (var k=0; k<BAS.nlay; k++){
        for (var i=0; i<BAS.nrow; i++){
          for (var j=0; j<BAS.ncol; j++){
            if (BAS.ibound[k][i][j] === 0 ){
              BAS.hnew[k][i][j] = BAS.hnf;
            }
          }
        }
      }
      
      
      
    }
    
    BAS.Stress = function( kper ){
      // ******************************************************************
      // SETUP TIME VARIABLES FOR NEW TIME PERIOD
      // ******************************************************************
      
      var sp = BAS.periods[kper];
      
      // WRITE STRESS PERIOD INFORMATION.
      OUT.Write("STRESS PERIOD NO. " + (kper+1) + " LENGTH =" + sp.perlen + "\n"
           +"NUMBER OF TIME STEPS =" + sp.nstp + "\n"
           +"MULTIPLIER FOR DELT =" + sp.tsmult );
      
      // C2 - CALCULATE THE LENGTH OF THE FIRST TIME STEP.
      //
      
      // C2A - ASSUME TIME STEP MULTIPLIER IS EQUAL TO ONE.
      BAS.delt = sp.perlen / sp.nstp;
      
      // C2B - IF TIME STEP MULTIPLIER IS NOT ONE THEN CALCULATE FIRST
      // C2B - TERM OF GEOMETRIC PROGRESSION.
      if (sp.tsmult != 1){
        BAS.delt = sp.perlen*(1-sp.tsmult)/(1-Math.pow(sp.tsmult, sp.nstp));
      }
      
      // C3 - PRINT THE LENGTH OF THE FIRST TIME STEP.
      OUT.Write("INITIAL TIME STEP SIZE =" + BAS.delt );
      
      // C4 - INITIALIZE PERTIM (ELAPSED TIME WITHIN STRESS PERIOD).
      BAS.pertim = 0;
      
      
    }
    
    BAS.ReadPrepare = null;
    
    BAS.AdvanceTime = function(kper, kstp){
      
      // ******************************************************************
      // ADVANCE TO NEXT TIME STEP
      // ******************************************************************
      
      var sp = BAS.periods[kper];
      
      //C1 - IF NOT FIRST TIME STEP THEN CALCULATE TIME STEP LENGTH.
      if( kstp != 0) BAS.delt *= sp.tsmult;
      
      
      // C2 - ACCUMULATE ELAPSED TIME IN SIMULATION(TOTIM) AND IN THIS
      // C2 - STRESS PERIOD(PERTIM).
      BAS.totim += BAS.delt;
      BAS.pertim += BAS.delt;
      
      // C3 - COPY HNEW TO HOLD.
      for (var k=0; k<BAS.nlay; k++){
        for (var i=0; i<BAS.nrow; i++){
          for (var j=0; j<BAS.ncol; j++){
            BAS.hold[k][i][j] = BAS.hnew[k][i][j];
          }
        }
      }
      
    }
    
    BAS.Formulate = function(){
      //  ******************************************************************
      //  SET HCOF=RHS=0.
      //  ******************************************************************
      
      // C1 - FOR EACH CELL INITIALIZE HCOF AND RHS ACCUMULATORS. ??
      for (var k=0; k<BAS.nlay; k++){
        for (var i=0; i<BAS.nrow; i++){
          for (var j=0; j<BAS.ncol; j++){
            BAS.hcof[k][i][j]=0;
            BAS.rhs[k][i][j]=0;
          }
        }
      }
    }
    
    BAS.Approximate = null;
    
    BAS.OutputControl = function(kstp){ }
    
    BAS.WaterBudget = null;
    
    BAS.Output = function(kstp, kper){
    
      // this stuff was moved from the OutputControl section because this implementation requires 
      // the water budgets to be calculated first
      
      var t = BAS.tstp;
      
      var totrin=0;
      var totrot=0;
      OUT.rateIn[t] = {};
      OUT.rateOut[t] = {};
      for (var key in OUT.vbSumIn[t]){
        totrin += OUT.vbSumIn[t][key];
        OUT.rateIn[t][key] = OUT.vbSumIn[t][key] / BAS.delt;
      }
      for (var key in OUT.vbSumOut[t]){
        totrot += OUT.vbSumOut[t][key];
        OUT.rateOut[t][key] = OUT.vbSumOut[t][key] / BAS.delt;
      }
      
      OUT.rateIn [t]["_TOTAL"] = totrin / BAS.delt;
      OUT.rateOut[t]["_TOTAL"] = totrot / BAS.delt;
      
      var diffr=totrin-totrot;
      var avgrat=(totrin+totrot)/2;
      
      OUT.budperc = 100*diffr/avgrat;
    
    }
    
    BAS.DeallocateMemory = function(){
    
    }
    
    
    return BAS;
  }());
	
	var BCF = (function(){
    var BCF = {};
    
    // BCF.ibcfcb not used 
    BCF.iwdflg = false;  // Wetting flag: false -> Wetting is inactive. true > Wetting is active in layers where LAYCON is 1 or 3.
    BCF.hdry = 0;    // When a cell converts to dry, HNEW is set equal to hdry.
    BCF.iwetit = 0;  // The iteration interval for attempting to wet cells. Wetting is attempted every iwetit iterations.
    BCF.ihdwet = 0;  // Flag indicating which equation to use for defining the head at a cell that has just converted from dry to wet
    BCF.wetfct = 0;  // Factor included in the calculation of head at a cell that has just converted from dry to wet.
    BCF.layers = []  // contains data for each layer, (including laycon, layavg, hy, sc1, sc2, wetdry, trpy)
                     //   BCF.layers[k].laycon = []; // 1d, size=BAS.nlay, Layer-type code: 0  Confined, 1  Unconfined, 2  Partially convertible, 3  Fully convertible
                     //   BCF.layers[k].layavg = []; // 1d, size=BAS.nlay, Interblock transmissivity flag. 0  Harmonic mean, 1  Arithmetic mean, 2  Logarithmic mean, 3  Arithmetic-mean saturated thickness and logarithmic-mean hydraulic conductivity.
                     //   BCF.layers[k].hy = [];     // 3d, Hydraulic conductivity.
                     //   BCF.layers[k].sc1 = [];    // 3d, Primary storage capacity. Only needed when simulation is transient.
                     //   BCF.layers[k].sc2 = [];    // 3d, Secondary storage capacity. Only needed when simulation is transient.
                     //   BCF.layers[k].wetdry = []; // 3d, Wetting threshold combined with wetting direction indicator. Absolute value is the
                     //                                     wetting threshold. Negative indicates wetting only from below. Zero indicates no
                     //                                     wetting. Positive indicates wetting from sides and below.
                     //   BCF.layers[k].trpy = [];   // 1d, size=BAS.nlay, Ratio of transmissivity (or hydraulic conductivity) in the column direction to transmissivity (or hydraulic conductivity) in the row direction.
    BCF.cvwd = [];   // 3d, Vertical conductance between cells. This is used only if wetting is active.
    
    BCF.AllocateRead = function(input){
      // C2 - IDENTIFY PACKAGE
      OUT.Write("BCF -- BLOCK-CENTERED FLOW PACKAGE, VERSION 7");
      
      // READ hdry AND WETTING PARAMETERS.
      BCF.hdry   = inputNumber({ value:input.BCF.hdry, iferror:"BCF.hdry (the number to assign cells that become dry) must be a number."});
      BCF.iwdflg = inputBoolean({ value:input.BCF.iwdflg, iferror:"BCF.iwdflg (whether or not wetting is turned on) must be true or false."});
      BCF.wetfct = inputNumber({ value:input.BCF.wetfct, iferror:"BCF.wetfct (the wetting factor) must be a number."});
      if (BCF.iwdflg==true){
        BCF.iwetit = inputNumber({ value:input.BCF.iwetit, isInt:true, isGTZero:true, iferror:"BCF.iwetit (the iteration interval for attempting to wet cells) must be an integer greater than zero."});
      }
      BCF.ihdwet = inputNumber({ value:input.BCF.ihdwet, iferror:"BCF.ihdwet must be a number."});
      BCF.layers = input.BCF.layers;
      
      // Initialize cvwd array
      for (var k=0; k<BAS.nlay-1; k++){
        BCF.cvwd[k] = [];
        for (var i=0; i<BAS.nrow; i++){
          BCF.cvwd[k][i] = [];
          for (var j=0; j<BAS.ncol; j++){
            BCF.cvwd[k][i][j] = 0;
          }
        }
      }
      
      
      // C3A - DETERMINE ISS FROM ITRSS
      // (not going to do it like the fortran source)
      
      // C3B - PRINT VALUES
      if (BAS.itrss !== 0) OUT.Write("TRANSIENT SIMULATION");
      if (BAS.itrss === 0) OUT.Write("STEADY-STATE SIMULATION");
      OUT.Write("HEAD AT CELLS THAT CONVERT TO DRY="+BCF.hdry);
      if (BCF.iwdflg === false){
        OUT.Write("WETTING CAPABILITY IS NOT ACTIVE");
      }
      else if (BCF.iwdflg === true){
        OUT.Write("WETTING CAPABILITY IS ACTIVE");
        OUT.Write("WETTING FACTOR="+BCF.wetfct+"   WETTING ITERATION INTERVAL="+(BCF.iwetit<0 ? 1 : BCF.iwetit));
        OUT.Write("FLAG THAT SPECIFIES THE EQUATION TO USE FOR HEAD AT WETTED CELLS="+BCF.ihdwet);
      }
      
      
      // C5 - LOOP THROUGH LAYERS CALCULATING LAYAVG, PRINTING THE LAYER-TYPE
      // C5 - CODE, AND COUNTING LAYERS THAT NEED TOP & BOT ARRAYS.
      for (var k=0; k<BAS.nlay; k++){
        
        
        // C5A - SET GLOBAL HEAD-DEPENDENT THICKNESS FLAGS.
        if (BCF.layers[k].laycon === 0){
          BAS.layhdt[k] = 0;
          BAS.layhds[k] = 0;
        }
        else if (BCF.layers[k].laycon === 1){
          BAS.layhdt[k] = 1;
          BAS.layhds[k] = 0;
        }
        else if (BCF.layers[k].laycon === 2){
          BAS.layhdt[k] = 0;
          BAS.layhds[k] = 1;
        }
        else{
          BAS.layhdt[k] = 1;
          BAS.layhds[k] = 1;
        }
        
        // C5B - ONLY THE TOP LAYER CAN BE UNCONFINED(LAYCON=1).
        if(BCF.layers[k].laycon==1 && k>0){
          badinput("Only the top layer can be unconfined(laycon=1)");
        }
        
      }
      
      for (var k=0; k<BAS.nlay; k++){
      
        // C8C-----READ TRANSMISSIVITY INTO ARRAY CC IF LAYER TYPE IS 0 OR 2.
        if(BCF.layers[k].laycon!==3 && BCF.layers[k].laycon!==1){
          for (var i=0; i<BAS.nrow; i++){
            for (var j=0; j<BAS.ncol; j++){
              BAS.cc[k][i][j] = BCF.layers[k].tran[i][j];
            }
          }
        }
        
      }
      
      
      (function SGWF2BCF7N (){ // INITIALIZE AND CHECK BCF DATA.
        
        
        if (BAS.nlay > 1){
        
          // MULTIPLY VERTICAL LEAKANCE BY AREA TO MAKE CONDUCTANCE.
          for (var k=0; k<BAS.nlay-1; k++){
            for (var i=0; i<BAS.nrow; i++){
              for (var j=0; j<BAS.ncol; j++){
                BAS.cv[k][i][j] = BCF.layers[k].vcont[i][j] * BAS.delr[j] * BAS.delc[i];
              }
            }
          }
          
          // IF WETTING CAPABILITY IS ACTIVATED, SAVE CV IN CVWD FOR USE WHEN
          // WETTING CELLS.
          for (var k=0; k<BAS.nlay-1; k++){
            for (var i=0; i<BAS.nrow; i++){
              for (var j=0; j<BAS.ncol; j++){
                BCF.cvwd[k][i][j] = BAS.cv[k][i][j];
              }
            }
          }
          
        }
        
        
        // C3 - IF IBOUND=0, SET CV=0 AND CC=0.
        for (var k=0; k<BAS.nlay; k++){
          for (var i=0; i<BAS.nrow; i++){
            for (var j=0; j<BAS.ncol; j++){
              if ( BAS.ibound[k][i][j] === 0 ){
                if ( k+1 !== BAS.nlay ){ // not bottom layer
                  BAS.cv[k][i][j] = 0;
                }
                if ( k+1 !== 1 ){ // not top layer
                  BAS.cv[k-1][i][j] = 0;
                }
                BAS.cc[k][i][j] = 0;
              }
            }
          }
        }
        
        
        // INSURE THAT EACH ACTIVE CELL HAS AT LEAST ONE NON-ZERO
        // TRANSMISSIVE PROPERTY.
        var kb = 0;
        for (var k=0; k<BAS.nlay; k++){
          if ( BCF.layers[k].laycon !== 1 && BCF.layers[k].laycon !== 3 ){
          
            // WHEN LAYER TYPE IS 0 OR 2, TRANSMISSIVITY OR CV MUST BE NONZERO.
            for (var i=0; i<BAS.nrow; i++){
              for (var j=0; j<BAS.ncol; j++){
                if (BAS.ibound[k][i][j] === 0) continue;
                if (BAS.cc[k][i][j] !== 0) continue;
                if (k+1 != BAS.nlay){
                  if (BAS.cv[k][i][j] !== 0) continue;
                }
                if (k+1 != 1){
                  if (BAS.cv[k-1][i][j] !== 0) continue;
                }
                BAS.ibound[k][i][j] = 0;
                BAS.hnew[k][i][j] = BAS.hnoflo;
                OUT.Write("NODE (LAYER,ROW,COL) "+ [k,i,j].join(",") +" ELIMINATED BECAUSE ALL CONDUCTANCES TO NODE ARE 0");
              }
            }
          
          }
          else{
            // WHEN LAYER TYPE IS 1 OR 3, HY OR CV MUST BE NONZERO.
            for (var i=0; i<BAS.nrow; i++){
              for (var j=0; j<BAS.ncol; j++){
                if (BCF.iwdflg === true && BCF.layers[k].wetdry[i][j] !== 0 ){
                  // IF WETTING CAPABILITY IS ACTIVE, CHECK CVWD.
                  if (k+1 !== BAS.nlay && BCF.cvwd[k][i][j]   !== 0) continue;
                  if (k   !== 0        && BCF.cvwd[k-1][i][j] !== 0) continue;
                }
                else{
                  // WETTING CAPABILITY IS INACTIVE, SO CHECK CV AT ACTIVE CELLS.
                  if (BAS.ibound[k][i][j] == 0) continue;
                  if (k+1 !== BAS.nlay && BAS.cv[k][i][j]   !== 0) continue;
                  if (k   !== 0        && BAS.cv[k-1][i][j] !== 0) continue;
                }
                // CHECK HYDRAULIC CONDUCTIVITY.
                if (BCF.layers[k].hy[i][j] != 0 ) continue;
                
                // HY AND CV ARE ALL 0, SO CONVERT CELL TO NO FLOW.
                BAS.ibound[k][i][j] = 0;
                BAS.hnew[k][i][j] = BAS.hnoflo;
                if (BCF.iwdflg === true){
                  BCF.layers[k].wetdry[i][j] = 0;
                }
                OUT.Write("NODE (LAYER,ROW,COL) "+ [k,i,j].join(",") +" ELIMINATED BECAUSE ALL CONDUCTANCES TO NODE ARE 0");
                
              }
            }
          }
          
        }
        
        // CALCULATE HOR. CONDUCTANCE(CR AND CC) FOR CONSTANT T LAYERS.
        for (var k=0; k<BAS.nlay; k++){
          
          if (BCF.layers[k].laycon !== 3 && BCF.layers[k].laycon !== 1){
            if (BCF.layers[k].layavg === 0){
              // SUBROUTINE SGWF2BCF7C:
              // COMPUTE BRANCH CONDUCTANCE USING HARMONIC MEAN OF BLOCK
              // CONDUCTANCES -- BLOCK TRANSMISSIVITY IS IN CC UPON ENTRY
              
              var yx = BCF.layers[k].trpy * 2;
              for (var i=0; i<BAS.nrow; i++){
                for (var j=0; j<BAS.ncol; j++){
                  
                  var t1 = BAS.cc[k][i][j];
                  var t2;
                  
                  if (t1 == 0){
                    // IF T=0 THEN SET CONDUCTANCE EQUAL TO 0. GO ON TO NEXT CELL.
                    BAS.cr[k][i][j] = 0;
                  }
                  else{
                    if (j+1 != BAS.ncol){
                      // IF THIS IS NOT THE LAST COLUMN(RIGHTMOST) THEN CALCULATE
                      // BRANCH CONDUCTANCE IN THE ROW DIRECTION (CR) TO THE RIGHT.
                      t2 = BAS.cc[k][i][j+1];
                      BAS.cr[k][i][j] = 2 * t2 * t1 * BAS.delc[i] / ( t1 * BAS.delr[j+1] + t2 * BAS.delr[j] );
                    }
                    if(i+1 != BAS.nrow){
                      // IF THIS IS NOT THE LAST ROW(FRONTMOST) THEN CALCULATE
                      // BRANCH CONDUCTANCE IN THE COLUMN DIRECTION (CC) TO THE FRONT.
                      t2 = BAS.cc[k][i+1][j];
                      BAS.cc[k][i][j] = yx * t2 * t1 * BAS.delr[j] / ( t1 * BAS.delc[i+1] + t2 * BAS.delc[i] );
                    }
                  }
                  
                }
              }
              
            }
            else if (BCF.layers[k].layavg === 1){
              // SUBROUTINE SGWF2BCF7A:
              // COMPUTE CONDUCTANCE USING ARITHMETIC MEAN TRANSMISSIVITY
              // ACTIVATED BY LAYAVG=1
              
              var yx = BCF.layers[k].trpy * 2;
              for (var i=0; i<BAS.nrow; i++){
                for (var j=0; j<BAS.ncol; j++){
                
                  var t1 = BAS.cc[k][i][j];
                  var t2;
                  
                  if (t1 == 0){
                    // IF T=0 THEN SET CONDUCTANCE EQUAL TO 0. GO ON TO NEXT CELL.
                    BAS.cr[k][i][j] = 0;
                  }
                  else{
                    if (j+1 != BAS.ncol){
                      // IF THIS IS NOT THE LAST COLUMN(RIGHTMOST) THEN CALCULATE
                      // BRANCH CONDUCTANCE IN THE ROW DIRECTION (CR) TO THE RIGHT.
                      t2 = BAS.cc[k][i][j+1];
                      // ARITHMETIC MEAN INTERBLOCK TRANSMISSIVITY
                      if (t2 === 0){
                         BAS.cr[k][i][j] = 0;
                      }
                      else{
                        BAS.cr[k][i][j] = BAS.delc[i] * (t1+t2) / ( BAS.delr[j+1]+BAS.delr[j]);
                      }
                    }
                    if(i+1 != BAS.nrow){
                      // IF THIS IS NOT THE LAST ROW(FRONTMOST) THEN CALCULATE
                      // BRANCH CONDUCTANCE IN THE COLUMN DIRECTION (CC) TO THE FRONT.
                      t2 = BAS.cc[k][i+1][j];
                      if (t2 === 0){
                         BAS.cc[k][i][j] = 0;
                      }
                      else{
                        BAS.cc[k][i][j] = yx * BAS.delr[j] * (t1+t2) / ( BAS.delc[i+1] + BAS.delc[i] ); 
                      }
                    }
                  }
                  
                }
              }
              
            }
            else{
              // SUBROUTINE SGWF2BCF7L:
              // COMPUTE CONDUCTANCE USING LOGARITHMIC MEAN TRANSMISSIVITY
              // ACTIVATED BY LAYAVG=2
              
              var frac1 = 1.005;
              var frac2 = 0.995;
              var yx = BCF.layers[k].trpy * 2;
              
              // FOR EACH CELL CALCULATE BRANCH CONDUCTANCES FROM THAT CELL
              // TO THE ONE ON THE RIGHT AND THE ONE IN FRONT.
              for (var i=0; i<BAS.nrow; i++){
                for (var j=0; j<BAS.ncol; j++){
                  
                  var t1 = BAS.cc[k][i][j];
                  var t2;
                  
                  if (t1 == 0){
                    // IF T=0 THEN SET CONDUCTANCE EQUAL TO 0. GO ON TO NEXT CELL.
                    BAS.cr[k][i][j] = 0;
                  }
                  else{
                    if (j+1 != BAS.ncol){
                      // IF THIS IS NOT THE LAST COLUMN(RIGHTMOST) THEN CALCULATE
                      // BRANCH CONDUCTANCE IN THE ROW DIRECTION (CR) TO THE RIGHT.
                      t2 = BAS.cc[k][i][j+1];
                      if (t2 === 0){
                        // SET TO ZERO IF T2 IS ZERO
                        BAS.cr[k][i][j] = 0;
                      }
                      else{
                        // LOGARITHMIC MEAN INTERBLOCK TRANSMISSIVITY
                        var ratio = t2/t1;
                        var t;
                        if (ratio > frac1 || ratio < frac2){
                          t = (t2-t1) / Math.log(ratio);
                        }
                        else{
                          t = 0.5 * (t1+t2);
                        }
                        BAS.cr[k][i][j] = 2*BAS.delc[i]*t/(BAS.delr[j+1]+BAS.delr[j]);
                      }
                    }
                    
                    // IF THIS IS NOT THE LAST ROW(FRONTMOST) THEN CALCULATE
                    // BRANCH CONDUCTANCE IN THE COLUMN DIRECTION (CC) TO THE FRONT.
                    if (i+1 !== BAS.nrow){
                      t2 = BAS.cc[k][i+1][j];
                      if (t2 === 0){
                        BAS.cc[k][i][j] = 0;
                      }
                      else{
                        var ratio = t2/t1;
                        if(ratio > frac1 || ratio < frac2){
                          t = (t2-t1) / Math.log(ratio);
                        }
                        else{
                          t = 0.5 * (t1+t2);
                        }
                        BAS.cc[k][i][j] = yx*BAS.delr[j]*t/(BAS.delc[i+1]+BAS.delc[i]);
                      }
                    }
                  }
                }
                
              }
            }
          }
          
        }
        
        // IF TRANSIENT, LOOP THROUGH LAYERS AND CALCULATE STORAGE CAPACITY.
        if (BAS.itrss !== 0){
          for (var k=0; k<BAS.nlay; k++){
          
            // MULTIPLY PRIMARY STORAGE COEFFICIENT BY delr & delc TO GET PRIMARY STORAGE CAPACITY.
            for (var i=0; i<BAS.nrow; i++){
              for (var j=0; j<BAS.ncol; j++){
                BCF.layers[k].sc1[i][j] = BCF.layers[k].sc1[i][j] * BAS.delr[j] * BAS.delc[i];
              }
            }
            
            // IF LAYER IS CONF/UNCONF MULTIPLY SECONDARY STORAGE COEFFICIENT
            // BY delr AND delc TO GET SECONDARY STORAGE CAPACITY(SC2).
            if (BCF.layers[k].laycon == 3 || BCF.layers[k].laycon == 2){
              for (var i=0; i<BAS.nrow; i++){
                for (var j=0; j<BAS.ncol; j++){
                  BCF.layers[k].sc2[i][j] = BCF.layers[k].sc2[i][j] * BAS.delr[j] * BAS.delc[i];
                }
              }
            }
            
          }
        }
        
      })();
      
      
      
    }
    BCF.AdvanceTime = function(kper){
      // ******************************************************************
      // SET HOLD TO BOT WHENEVER A WETTABLE CELL IS DRY
      // ******************************************************************
      
      // C1 - RETURN IF STEADY STATE OR IF NOT USING WETTING CAPABILITY
      if (BCF.iwdflg === false || BAS.periods[kper].issflg !== true) return;
      
      // C2 - LOOP THROUGH ALL LAYERS TO SET HOLD=BOT IF A WETTABLE CELL IS DRY
      var kb=0;
      for (var k=0; k<BAS.nlay; k++){
        // C2A - SKIP LAYERS THAT CANNOT CONVERT BETWEEN WET AND DRY
        if( (BCF.layers[k].laycon == 3 || BCF.layers[k].laycon==1 )
          && (BAS.elev[k+1] && BAS.elev[k+1].length>0)
        ){
          for (var i=0; i<BAS.nrow; i++){
            for (var j=0; j<BAS.ncol; j++){
              // C2B - SKIP CELLS THAT ARE CURRENTLY WET OR ARE NOT WETTABLE
              if (BAS.ibound[k][i][j] === 0 && BCF.layers[k].wetdry !== 0){
                BAS.hold[k][i][j] = BAS.elev[k+1][i][j];
              }
            }
          }
        }
      }
    }
    BCF.Formulate = function(kiter, kstp, kper){
      // ******************************************************************
      // ADD LEAKAGE CORRECTION AND STORAGE TO HCOF AND RHS, AND CALCULATE
      // CONDUCTANCE AS REQUIRED
      // ******************************************************************
      
      var issflg= BAS.periods[kper].issflg
      var kb=0;
      var kt=0;
      var tled;
      if(issflg == false) {tled=1/BAS.delt;}
      
      // C1 - FOR EACH LAYER: IF T VARIES CALCULATE HORIZONTAL CONDUCTANCES
      for (var k=0; k<BAS.nlay; k++){
        // C1A - IF LAYER TYPE IS NOT 1 OR 3 THEN SKIP THIS LAYER.
        if (BCF.layers[k].laycon == 3 || BCF.layers[k].laycon == 1){
          
          // C1B - FOR LAYER TYPES 1 & 3 CALL SGWF2BCF7H TO CALCULATE
          // C1B - HORIZONTAL CONDUCTANCES.
          // SGWF2BCF7H ROUTINE
          
          // COMPUTE CONDUCTANCE FOR ONE LAYER FROM SATURATED THICKNESS AND
          // HYDRAULIC CONDUCTIVITY
          var ihdcnv=0;
          var itflg=1;
          
          // ?
          var turnon, htmp;
          
          // C1 - LOOP THROUGH EACH CELL IN LAYER AND CALCULATE TRANSMISSIVITY AT
          // C1 - EACH ACTIVE CELL.
          if (BCF.iwdflg === true){
            itflg = (kiter+1) % BCF.iwetit;
          }
          for (var i=0; i<BAS.nrow; i++){
            for (var j=0; j<BAS.ncol; j++){
              // C2 - IF CELL IS ACTIVE, THEN SKIP TO CODE THAT CALCULATES SATURATED
              // C2 - THICKNESS.
              
              if (BAS.ibound[k][i][j] === 0){
                
                var wetOrDry = (function decideWetOrDry(){
                
                  // C3 - DETERMINE IF THE CELL CAN CONVERT BETWEEN CONFINED AND
                  // C3 - UNCONFINED.  IF NOT, SKIP TO CODE THAT SETS TRANSMISSIVITY TO 0.
                  if(itflg!==0) return "dry";
                  if(BCF.layers[k].wetdry[i][j]===0) return "dry";
                  var wd = BCF.layers[k].wetdry[i][j];
                  if (wd<0) { wd=-wd;}
                  turnon = BAS.elev[k+1][i][j]+wd;
                  
                  
                  // C3A - CHECK HEAD IN CELL BELOW TO SEE IF WETTING THRESHOLD HAS BEEN
                  // C3A - REACHED.
                  if(k+1 !== BAS.nlay){
                    htmp=BAS.hnew[k+1][i][j];
                    if (BAS.ibound[k+1][i][j] > 0 && htmp>=turnon) return "wet";
                  }
                  
                  // C3B - CHECK HEAD IN ADJACENT HORIZONTAL CELLS TO SEE IF WETTING
                  // C3B - THRESHOLD HAS BEEN REACHED.
                  if( BCF.layers[k].wetdry[i][j] < 0) return "dry";
                  
                  if(j !== 0){
                    htmp=BAS.hnew[k][i][j-1];
                    if(BAS.ibound[k][i][j-1] > 0 && BAS.ibound[k][i][j-1] !== 30000 && htmp >= turnon) return "wet";
                  }
                  if(j+1 !== BAS.ncol){
                    htmp=BAS.hnew[k][i][j+1]
                    if(BAS.ibound[k][i][j+1] > 0 && htmp >= turnon) return "wet";
                  }
                  if(i !== 0){
                    htmp=BAS.hnew[k][i-1][j]
                    if(BAS.ibound[k][i-1][j] > 0 && BAS.ibound[k][i-1][j] != 30000 && htmp >= turnon) return "wet";
                  }
                  if(i+1 !== BAS.nrow){
                    htmp=BAS.hnew[k][i+1][j]
                    if(BAS.ibound[k][i+1][j] > 0 && htmp >= turnon) return "wet";
                  }
                  
                  return "dry";
                  
                })();
                
                
                if (wetOrDry == "dry"){
                
                  // C3C - CELL IS DRY AND STAYS DRY.  SET TRANSMISSIVITY TO 0, SET
                  // C3C - SATURATED THICKNESS (BUFF) TO 0, AND SKIP TO THE NEXT CELL.
                  BAS.cc[k][i][j] = 0;
                  if(BCF.layers[k].layavg == 3){ BAS.buff[k][i][j]=0; }
                  continue;
                  
                }
                else if (wetOrDry == "wet"){
                
                  // C4 - CELL BECOMES WET.  SET INITIAL HEAD AND VERTICAL CONDUCTANCE.
                  if(BCF.ihdwet !== 0){
                    BAS.hnew[k][i][j] = BAS.elev[k+1][i][j]+BCF.wetfct*wd;
                  }
                  if(BCF.ihdwet === 0){
                    BAS.hnew[k][i][j] = BAS.elev[k+1][i][j]+BCF.wetfct*(htmp-BAS.elev[k+1][i][j]);
                  }
                  if(k+1 != BAS.nlay){
                    if(BAS.ibound[k+1][i][j] !== 0) BAS.cv[k][i][j]= BCF.cvwd[k][i][j];
                  }
                  if(k !== 0){
                    if(BAS.ibound[k-1][i][j] !== 0) BAS.cv[k-1][i][j]= BCF.cvwd[k-1][i][j];
                  }
                  BAS.ibound[k][i][j]=30000;
                  
                  
                  // C4A - PRINT MESSAGE SAYING CELL HAS BEEN CONVERTED TO WET.
                  if (ihdcnv===0){
                    OUT.Write("CELL CONVERSIONS FOR ITER.=" + kiter + "  LAYER=" + k + "  STEP=" + kstp + "  PERIOD=" + kper );
                    ihdcnv=1;
                  }
                  OUT.Write("WET ("+i+", "+j+")");
                  
                }
                
              }
              
              // C5 - CALCULATE SATURATED THICKNESS.
              var hd = BAS.hnew[k][i][j];
              var bbot=BAS.elev[k+1][i][j];
              if(BCF.layers[k].laycon!==1){
                var ttop=BAS.elev[k][i][j];
                if(bbot > ttop){
                  throw "negative cell thickness at (layer,row,col)" + [k,i,j].join(",");
                }
                if(hd > ttop) hd=ttop;
              }
              var thck=hd-bbot;
              
              // C6 - CHECK TO SEE IF SATURATED THICKNESS IS GREATER THAN ZERO.
              if(thck > 0){
              
                // C6A - IF SATURATED THICKNESS>0 THEN EITHER CALCULATE TRANSMISSIVITY
                // C6A - AS HYDRAULIC CONDUCTIVITY TIMES SATURATED THICKNESS OR STORE
                // C6A - K IN CC AND SATURATED THICKNESS IN BUFF.
                if( BCF.layers[k].layavg == 3){
                   BAS.cc[k][i][j] = BCF.layers[k].hy[i][j];
                   BAS.buff[k][i][j] = thck;
                }
                else{
                   BAS.cc[k][i][j] = thck*BCF.layers[k].hy[i][j];
                }
              
              }
              else{
                // C6B - WHEN SATURATED THICKNESS < 0, PRINT A MESSAGE AND SET
                // C6B - TRANSMISSIVITY, ibound, AND VERTICAL CONDUCTANCE =0
                if (ihdcnv===0){
                  OUT.Write("CELL CONVERSIONS FOR ITER.=" + kiter + "  LAYER=" + k + "  STEP=" + kstp + "  PERIOD=" + kper );
                  ihdcnv=1;
                }
                OUT.Write("DRY ("+i+", "+j+") ");
                
                BAS.hnew[k][i][j] = BAS.hdry;
                BAS.cc[k][i][j] = 0;
                if(BAS.ibound[k][i][j] < 0){
                  OUT.Write("CONSTANT-HEAD CELL WENT DRY -- SIMULATION ABORTED");
                  OUT.Write("LAYER="+k+"   ROW="+i+"   COLUMN="+j+"   ITERATION="+kiter+"   TIME STEP="+kstp+"   STRESS PERION="+kper);
                  throw("CONSTANT-HEAD CELL WENT DRY -- SIMULATION ABORTED");
                }
                BAS.ibound[k][i][j]=0
                if(k+1<BAS.nlay) BAS.cv[k][i][j]=0;
                if(k+1>1) BAS.cv[k-1][i][j]=0;
              }
              
            }
          }
          
          // C7 - PRINT ANY REMAINING CELL CONVERSIONS NOT YET PRINTED
          // Don't need to do this because I'm not grouping the print messages
          
          // C8 - CHANGE ibound VALUE FOR CELLS THAT CONVERTED TO WET THIS
          // C8 - ITERATION FROM 30000 to 1.
          if(BCF.iwdflg === true){
            for (var i=0; i<BAS.nrow; i++){
              for (var j=0; j<BAS.ncol; j++){
                if(BAS.ibound[k][i][j] == 30000) BAS.ibound[k][i][j]=1;
              }
            }
          }
          
          // C9 - COMPUTE HORIZONTAL BRANCH CONDUCTANCES FROM TRANSMISSIVITY.
          if(BCF.layers[k].layavg === 0){
            
            // COMPUTE BRANCH CONDUCTANCE USING HARMONIC MEAN OF BLOCK
            // CONDUCTANCES -- BLOCK TRANSMISSIVITY IS IN CC UPON ENTRY
            
            var yx=BCF.layers[k].trpy*2;
            
            // C1 - FOR EACH CELL CALCULATE BRANCH CONDUCTANCES FROM THAT CELL
            // C1 - TO THE ONE ON THE RIGHT AND THE ONE IN FRONT.
            for (var i=0; i<BAS.nrow; i++){
              for (var j=0; j<BAS.ncol; j++){
              
                var t1=BAS.cc[k][i][j];
                var t2;
                
                // C2 - IF T=0 THEN SET CONDUCTANCE EQUAL TO 0. GO ON TO NEXT CELL.
                if(t1 === 0){
                  BAS.cr[k][i][j]=0;
                  continue;
                }
                
                // C3 - IF THIS IS NOT THE LAST COLUMN(RIGHTMOST) THEN CALCULATE
                // C3 - BRANCH CONDUCTANCE IN THE ROW DIRECTION (CR) TO THE RIGHT.
                if(j+1 != BAS.ncol){
                  t2 = BAS.cc[k][i][j+1];
                  BAS.cr[k][i][j] = 2*t2*t1*BAS.delc[i]/(t1*BAS.delr[j+1]+t2*BAS.delr[j]);
                }
                // C4 - IF THIS IS NOT THE LAST ROW(FRONTMOST) THEN CALCULATE
                // C4 - BRANCH CONDUCTANCE IN THE COLUMN DIRECTION (CC) TO THE FRONT.
                if(i+1 != BAS.nrow){
                  t2 = BAS.cc[k][i+1][j];
                  BAS.cc[k][i][j] = yx*t2*t1*BAS.delr[j]/(t1*BAS.delc[i+1]+t2*BAS.delc[i]);
                }
              }
            }
            
          }
          else if(BCF.layers[k].layavg === 1){
            
            // COMPUTE CONDUCTANCE USING ARITHMETIC MEAN TRANSMISSIVITY
            // ACTIVATED BY LAYAVG=1
            
            var yx=BCF.layers[k].trpy;
            
            // C1 - FOR EACH CELL CALCULATE BRANCH CONDUCTANCES FROM THAT CELL
            // C1 - TO THE ONE ON THE RIGHT AND THE ONE IN FRONT.
            for (var i=0; i<BAS.nrow; i++){
              for (var j=0; j<BAS.ncol; j++){
              
                var t1=BAS.cc[k][i][j];
                var t2;
                
                // C2 - IF T=0 THEN SET CONDUCTANCE EQUAL TO 0. GO ON TO NEXT CELL.
                if(t1 === 0){
                  BAS.cr[k][i][j]=0;
                  continue;
                }
                
                // C3 - IF THIS IS NOT THE LAST COLUMN(RIGHTMOST) THEN CALCULATE
                // C3 - BRANCH CONDUCTANCE IN THE ROW DIRECTION (CR) TO THE RIGHT.
                if(j+1 != BAS.ncol){
                  t2=BAS.cc[k][i][j+1];
                  if (t2===0){ BAS.cr[k][i][j]=0;                                                }
                  else       { BAS.cr[k][i][j]=BAS.delc[i]*(t1+t2)/(BAS.delr[j+1]+BAS.delr[j]);  }
                }
                // C4 - IF THIS IS NOT THE LAST ROW(FRONTMOST) THEN CALCULATE
                // C4 - BRANCH CONDUCTANCE IN THE COLUMN DIRECTION (CC) TO THE FRONT.
                if(i+1 != BAS.nrow){
                  t2=BAS.cc[k][i+1][j];
                  if (t2===0){ BAS.cc[k][i][j] = 0;                                                   }
                  else       { BAS.cc[k][i][j] = yx*BAS.delr[j]*(t1+t2)/(BAS.delc[i+1]+BAS.delc[i]);  }
                }
              }
            }
          }
          else if(BCF.layers[k].layavg === 2){
            
            // C - COMPUTE CONDUCTANCE USING LOGARITHMIC MEAN TRANSMISSIVITY
            // C - ACTIVATED BY LAYAVG=2
            
            var frac1 = 1.005;
            var frac2 = 0.995; 
            var yx=BCF.layers[k].trpy*2;
            
            // C1 - FOR EACH CELL CALCULATE BRANCH CONDUCTANCES FROM THAT CELL
            // C1 - TO THE ONE ON THE RIGHT AND THE ONE IN FRONT.
            for (var i=0; i<BAS.nrow; i++){
              for (var j=0; j<BAS.ncol; j++){
              
                var t1=BAS.cc[k][i][j];
                var t2,t;
                
                // C2 - IF T=0 THEN SET CONDUCTANCE EQUAL TO 0. GO ON TO NEXT CELL.
                if(t1 === 0){
                  BAS.cr[k][i][j]=0;
                  continue;
                }
                
                // C3 - IF THIS IS NOT THE LAST COLUMN(RIGHTMOST) THEN CALCULATE
                // C3 - BRANCH CONDUCTANCE IN THE ROW DIRECTION (CR) TO THE RIGHT.
                if(j+1 != BAS.ncol){
                  t2=BAS.cc[k][i][j+1];
                  if (t2===0){ 
                    BAS.cr[k][i][j]=0;
                  }
                  else{ 
                    var ratio = t2/t1;
                    if (ratio > frac1 || ratio < frac2){ t=(t2-t1)/Math.log(ratio); }
                    else                               { t=0.5*(t1+t2);             }
                    BAS.cr[k][i][j]=2*BAS.delc[i]*t/(BAS.delr[j+1]+BAS.delr[j]);
                  }
                }
                // C4 - IF THIS IS NOT THE LAST ROW(FRONTMOST) THEN CALCULATE
                // C4 - BRANCH CONDUCTANCE IN THE COLUMN DIRECTION (CC) TO THE FRONT.
                if(i+1 != BAS.nrow){
                  t2=BAS.cc[k][i+1][j];
                  if (t2===0){ 
                    BAS.cc[k][i][j] = 0;
                  }
                  else { 
                    var ratio = t2/t1;
                    if (ratio > frac1 || ratio < frac2){ t=(t2-t1)/Math.log(ratio); }
                    else                               { t=0.5*(t1+t2);             }
                    BAS.cc[k][i][j] = yx*BAS.delr[j]*t/(BAS.delc[i+1]+BAS.delc[i]);
                  }
                }
              }
            }
            
          }
          else{
          
            // C - COMPUTE CONDUCTANCE USING ARITHMETIC MEAN SATURATED THICKNESS
            // C - AND LOGARITHMIC MEAN HYDRAULIC CONDUCTIVITY
            // C - NODE HYDRAULIC CONDUCTIVITY IS IN CC,
            // C - NODE SATURATED THICKNESS IS IN BUFF
            // C - ACTIVATED BY LAYAVG=3
            
            var frac1 = 1.005;
            var frac2 = 0.995; 
            var yx=BCF.layers.trpy[k];
            
            // C1 - FOR EACH CELL CALCULATE BRANCH CONDUCTANCES FROM THAT CELL
            // C1 - TO THE ONE ON THE RIGHT AND THE ONE IN FRONT.
            for (var i=0; i<BAS.nrow; i++){
              for (var j=0; j<BAS.ncol; j++){
              
                var t1=BAS.cc[k][i][j];
                var t2,t;
                
                // C2 - IF T=0 THEN SET CONDUCTANCE EQUAL TO 0. GO ON TO NEXT CELL.
                if(t1 === 0){
                  BAS.cr[k][i][j]=0;
                  continue;
                }
                
                // C3 - IF THIS IS NOT THE LAST COLUMN(RIGHTMOST) THEN CALCULATE
                // C3 - BRANCH CONDUCTANCE IN THE ROW DIRECTION (CR) TO THE RIGHT.
                if(j+1 != BAS.ncol){
                  t2=BAS.cc[k][i][j+1];
                  if (t2===0){ 
                    BAS.cr[k][i][j]=0;
                  }
                  else{ 
                    // C3B - LOGARITHMIC MEAN HYDRAULIC CONDUCTIVITY
                    var ratio = t2/t1;
                    if (ratio > frac1 || ratio < frac2){ t=(t2-t1)/Math.log(ratio); }
                    else                               { t=0.5*(t1+t2);             }
                    // C3C - MULTIPLY LOGARITHMIC K BY ARITHMETIC SAT THICK
                    BAS.cr[k][i][j]=BAS.delc[i]*t*(BAS.buff[k][i][j]+BAS.buff[k][i][j+1])/(BAS.delr[j+1]+BAS.delr[j]);
                  }
                }
                // C4 - IF THIS IS NOT THE LAST ROW(FRONTMOST) THEN CALCULATE
                // C4 - BRANCH CONDUCTANCE IN THE COLUMN DIRECTION (CC) TO THE FRONT.
                if(i+1 != BAS.nrow){
                  t2=BAS.cc[k][i+1][j];
                  if (t2===0){ 
                    BAS.cc[k][i][j] = 0;
                  }
                  else { 
                    var ratio = t2/t1;
                    if (ratio > frac1 || ratio < frac2){ t=(t2-t1)/Math.log(ratio); }
                    else                               { t=0.5*(t1+t2);             }
                    BAS.cc[k][i][j] = yx*BAS.delr[j]*t*(BAS.buff[k][i][j]+BAS.buff[k][i+1][j])/(BAS.delc[i+1]+BAS.delc[i])
                  }
                }
              }
            }
            
          }
          
          // C10 - RETURN.
        }
      
      }
      
      // C2 - IF THE SIMULATION IS TRANSIENT ADD STORAGE TO HCOF AND RHS
      if(issflg == false){
        for (var k=0; k<BAS.nlay; k++){
          
          // C3 - SEE IF THIS LAYER IS CONVERTIBLE OR NON-CONVERTIBLE.
          if (BCF.layers[k].laycon !== 3 && BCF.layers[k].laycon!==2 ){
            // C4 - NON-CONVERTIBLE LAYER, SO USE PRIMARY STORAGE
            for (var i=0; i<BAS.nrow; i++){
              for (var j=0; j<BAS.ncol; j++){
                if(BAS.ibound[k][i][j] > 0){
                  var rho=BCF.layers[k].sc1[i][j]*tled
                  BAS.hcof[k][i][j]-=rho;
                  BAS.rhs[k][i][j]-=rho*BAS.hold[k][i][j];
                }
              }
            }
          }
          else{
            // C5 - A CONVERTIBLE LAYER, SO CHECK OLD AND NEW HEADS TO DETERMINE
            // C5 - WHEN TO USE PRIMARY AND SECONDARY STORAGE
            for (var i=0; i<BAS.nrow; i++){
              for (var j=0; j<BAS.ncol; j++){
                // C5A - IF THE CELL IS EXTERNAL THEN SKIP IT.
                if(BAS.ibound[k][i][j] > 0){
                  
                  var tp = BAS.elev[k][i][j];
                  var rho2 = BCF.layers[k].sc2[i][j]*tled;
                  var rho1 = BCF.layers[k].sc1[i][j]*tled;
                  
                  // C5B - FIND STORAGE FACTOR AT START OF TIME STEP.
                  var sold = rho2;
                  if(BAS.hold[k][i][j] > tp){ 
                    sold=rho1;
                  }
                  
                  // C5C - FIND STORAGE FACTOR AT END OF TIME STEP.
                  var htmp = BAS.hnew[k][i][j];
                  var snew = rho2;
                  if(htmp > tp){
                    snew = rho1;
                  }
                  
                  // C5D - ADD STORAGE TERMS TO RHS AND HCOF.
                  BAS.hcof[k][i][j] -= snew;
                  BAS.rhs[k][i][j] = BAS.rhs[k][i][j] - sold*(BAS.hold[k][i][j]-tp) - snew*tp;
                  
                }
              }
            }
          }
        }
      }
      
      // C6 - FOR EACH LAYER DETERMINE IF CORRECTION TERMS ARE NEEDED FOR
      // C6 - FLOW DOWN INTO PARTIALLY SATURATED LAYERS.
      for (var k=0; k<BAS.nlay; k++){
        
        // C7 - SEE IF CORRECTION IS NEEDED FOR LEAKAGE FROM ABOVE.
        if (BCF.layers[k].laycon == 3 || BCF.layers[k].laycon==2 ){
          if(k+1 !== 1){
            
            // C7A - FOR EACH CELL MAKE THE CORRECTION IF NEEDED.
            for (var i=0; i<BAS.nrow; i++){
              for (var j=0; j<BAS.ncol; j++){
                // C7B - IF THE CELL IS EXTERNAL(ibound<=0) THEN SKIP IT.
                if(BAS.ibound[k][i][j]>0){
                  var htmp=BAS.hnew[k][i][j];
                  // C7C - IF HEAD IS ABOVE TOP THEN CORRECTION NOT NEEDED
                  if(htmp < BAS.elev[k][i][j]){
                    // C7D - WITH HEAD BELOW TOP ADD CORRECTION TERMS TO RHS.
                    BAS.rhs[k][i][j] += BAS.cv[k-1][i][j]*(BAS.elev[k][i][j]-htmp);
                  }
                }
              }
            }
            
          }
        }
        
        // C8 - SEE IF THIS LAYER MAY NEED CORRECTION FOR LEAKAGE TO BELOW.
        if(k+1 !== BAS.nlay){
          if (BCF.layers[k+1].laycon == 3 || BCF.layers[k+1].laycon==2 ){
            
            // C7A - FOR EACH CELL MAKE THE CORRECTION IF NEEDED.
            for (var i=0; i<BAS.nrow; i++){
              for (var j=0; j<BAS.ncol; j++){
                // C7B - IF THE CELL IS EXTERNAL(ibound<=0) THEN SKIP IT.
                if(BAS.ibound[k][i][j]>0){
                  // C8C - IF HEAD IN THE LOWER CELL IS LESS THAN TOP ADD CORRECTION
                  // C8C - TERM TO RHS.
                  var htmp=BAS.hnew[k+1][i][j];
                  if(htmp < BAS.elev[k+1][i][j]){
                    BAS.rhs[k][i][j] -= BAS.cv[k][i][j]*(BAS.elev[k+1][i][j]-htmp);
                  }
                  
                }
              }
            }
            
          }
        }
        
        
      }
      
    }
    BCF.OutputControl = function(){}
    BCF.WaterBudget = function(kstp, kper){
      
      var t = BAS.tstp;
      
      var ncel = BAS.nrow * BAS.ncol * BAS.nlay;
      OUT.ccFlow [t] = {};
      OUT.ccFlow [t]["STORAGE"      ] = new Float32Array(ncel);
      OUT.ccFlow [t]["CONSTANT HEAD"] = new Float32Array(ncel);
      OUT.ccFlow [t]["RIGHT"] = new Float32Array(ncel);
      OUT.ccFlow [t]["FRONT"] = new Float32Array(ncel);
      OUT.ccFlow [t]["LOWER"] = new Float32Array(ncel);
      OUT.vbSumIn   [t] = {};  
      OUT.vbSumOut  [t] = {};
    
    
      // GWF2BCF7BDS
      // ******************************************************************
      // COMPUTE STORAGE BUDGET FLOW TERM FOR BCF.
      // ******************************************************************
      
      var issflg=BAS.periods[kper].issflg;
      
      // C1 - INITIALIZE BUDGET ACCUMULATORS AND 1/DELT.
      var stoin=0;
      var stout=0;
      
      // C2 - IF STEADY STATE, STORAGE TERM IS ZERO
      if(issflg !== true){
        var tled=1/BAS.delt;
        
        // C3 - IF CELL-BY-CELL FLOWS WILL BE SAVED, SET FLAG IBD.
        // (not implemented - always save flows)
        
        
        // C5 - LOOP THROUGH EVERY CELL IN THE GRID.
        var n=0;
        for (var k=0; k<BAS.nlay; k++){
          for (var i=0; i<BAS.nrow; i++){
            for (var j=0; j<BAS.ncol; j++,n++){
              
              var lc = BCF.layers[k].laycon;
              
              // C6 - SKIP NO-FLOW AND CONSTANT-HEAD CELLS.
              if(BAS.ibound[k][i][j] > 0){
                var hsing=BAS.hnew[k][i][j];
                
                // C7 - CHECK LAYER TYPE TO SEE IF ONE STORAGE CAPACITY OR TWO.
                if(lc==3 || lc==2){
                  // C7A - TWO STORAGE CAPACITIES.
                  var tp=BAS.elev[k+1][i][j];
                  var rho2=BCF.layers[k].sc2[i][j]*tled;
                  var rho1=BCF.layers[k].sc1[i][j]*tled;
                  var sold=rho2;
                  if(BAS.hold[k][i][j] > tp) sold=rho1;
                  var snew=rho2;
                  if(hsing > tp) snew=rho1;
                  var strg=sold*(BAS.hold[k][i][j]-tp) + snew*tp - snew*hsing;
                }
                else{
                  // C7B - ONE STORAGE CAPACITY.
                  var rho=BCF.layers[k].sc1[i][j]*tled;
                  strg=rho*BAS.hold[k][i][j] - rho*hsing;
                }
                
                // C8 - STORE CELL-BY-CELL FLOW IN BUFFER AND ADD TO ACCUMULATORS.
                OUT.ccFlow[t]["STORAGE"][n] = strg;
                
                if(strg < 0){
                  stout=stout-strg;
                }else{
                  stoin=stoin+strg;
                }
                
              }
            }
          }
        }
        
        // C9 - IF IBD FLAG IS SET RECORD THE CONTENTS OF THE BUFFER.
        // ...
        
        
      }
      
      
      OUT.vbSumIn [t]["STORAGE"] = stoin*BAS.delt;
      OUT.vbSumOut[t]["STORAGE"] = stout*BAS.delt;
      
      // END SUB
      
      
      
      
      // GWF2BCF7BDCH
      // ******************************************************************
      // COMPUTE FLOW FROM CONSTANT-HEAD CELLS
      // ******************************************************************
      
      
      // C2 - CLEAR BUDGET ACCUMULATORS.
      var chin=0;
      var chout=0;
      var ibdlbl=0;
      
        
        // C3A - IF SAVING CELL-BY-CELL FLOW IN A LIST, COUNT CONSTANT-HEAD
        // C3A - CELLS AND WRITE HEADER RECORDS.
        // ()
        
        // C4 - LOOP THROUGH EACH CELL AND CALCULATE FLOW INTO MODEL FROM EACH
        // C4 - CONSTANT-HEAD CELL.
        for (var k=0; k<BAS.nlay; k++){
          var lc = BCF.layers[k].laycon;
          for (var i=0; i<BAS.nrow; i++){
            for (var j=0; j<BAS.ncol; j++){
              // C5 - IF CELL IS NOT CONSTANT HEAD SKIP IT & GO ON TO NEXT CELL.
              if (BAS.ibound[k][i][j] < 0){
                
                // C6 - CLEAR VALUES FOR FLOW RATE THROUGH EACH FACE OF CELL.
                var x1=0;
                var x2=0;
                var x3=0;
                var x4=0;
                var x5=0;
                var x6=0;
                var chch1=0;
                var chch2=0;
                var chch3=0;
                var chch4=0;
                var chch5=0;
                var chch6=0;
                
                // C7 - CALCULATE FLOW THROUGH THE LEFT FACE.
                // C7 - COMMENTS A-C APPEAR ONLY IN THE SECTION HEADED BY COMMENT 7,
                // C7 - BUT THEY APPLY IN A SIMILAR MANNER TO SECTIONS 8-12.

                // C7 - IF THERE IS NO FLOW TO CALCULATE THROUGH THIS FACE, THEN GO ON
                // C7 - TO NEXT FACE.  NO FLOW OCCURS AT THE EDGE OF THE GRID, TO AN
                // C7 - ADJACENT NO-FLOW CELL, OR TO AN ADJACENT CONSTANT-HEAD CELL.
                if (j!==0 && BAS.ibound[k][i][j-1] !==0){
                  
                  // C7B - CALCULATE FLOW THROUGH THIS FACE INTO THE ADJACENT CELL.
                  hdiff=BAS.hnew[k][i][j]-BAS.hnew[k][i][j-1];
                  chch1=hdiff*BAS.cr[k][i][j-1];
                  if(BAS.ibound[k][i][j-1] >= 0){
                    x1=chch1;

                    // C7C - ACCUMULATE POSITIVE AND NEGATIVE FLOW.
                    if (x1<0){
                      chout=chout-x1;
                    }else{
                      chin=chin+x1;
                    }
                  
                  }
                }

                // C8 - CALCULATE FLOW THROUGH THE RIGHT FACE.
                if (j+1!==BAS.ncol && BAS.ibound[k][i][j+1] !==0){
                  hdiff=BAS.hnew[k][i][j]-BAS.hnew[k][i][j+1];
                  chch2=hdiff*BAS.cr[k][i][j];
                  if(BAS.ibound[k][i][j+1] >= 0){
                    x2=chch2;
                    if(x2<0){
                      chout=chout-x2;
                    }else{
                      chin=chin+x2;
                    }
                  }
                }

                // C9 - CALCULATE FLOW THROUGH THE BACK FACE.
                if (i!==0 && BAS.ibound[k][i-1][j] !==0){
                  hdiff=BAS.hnew[k][i][j]-BAS.hnew[k][i-1][j];
                  chch3=hdiff*BAS.cc[k][i-1][j];
                  if(BAS.ibound[k][i-1][j] >= 0){
                    x3=chch3;
                    if(x3<0){
                      chout=chout-x3;
                    }else{
                      chin=chin+x3;
                    }
                  }
                }

                // C10 - CALCULATE FLOW THROUGH THE FRONT FACE.
                if (i+1!==BAS.nrow && BAS.ibound[k][i+1][j] !==0){
                  hdiff=BAS.hnew[k][i][j]-BAS.hnew[k][i+1][j];
                  chch4=hdiff*BAS.cc[k][i][j];
                  if(BAS.ibound[k][i+1][j] >= 0){
                    x4=chch4;
                    if(x4<0){
                      chout=chout-x4;
                    }else{
                      chin=chin+x4;
                    }
                  }
                }

                // C11 - CALCULATE FLOW THROUGH THE UPPER FACE.
                if (k!==0 && BAS.ibound[k-1][i][j] !==0){
                  var hd=BAS.hnew[k][i][j];
                  if (lc==3 || lc==2){
                    var tmp = hd;
                    if(tmp<BAS.botm[k+1-1][i][j]) hd=BAS.botm[k+1-1][i][j];
                  }
                  hdiff=hd-BAS.hnew[k-1][i][j];
                  chch5=hdiff*BAS.cv[k-1][i][j];
                  if(BAS.ibound[k-1][i][j] >= 0){
                    x5=chch5;
                    if(x5<0){
                      chout=chout-x5;
                    }else{
                      chin=chin+x5;
                    }
                  }
                }

                // C12 - CALCULATE FLOW THROUGH THE LOWER FACE.
                if (k+1!==BAS.nlay && BAS.ibound[k+1][i][j] !==0){
                  var hd=BAS.hnew[k+1][i][j];
                  if (BCF.layers[k+1].laycon==3 || BCF.layers[k+1].laycon==2){
                    var tmp = hd;
                    if(tmp<BAS.botm[k+1][i][j]) hd=BAS.botm[k+1][i][j];
                  }
                  hdiff=BAS.hnew[k][i][j]-hd;
                  chch6=hdiff*BAS.cv[k][i][j];
                  if(BAS.ibound[k+1][i][j] >= 0){
                    x6=chch6;
                    if(x6<0){
                      chout=chout-x6;
                    }else{
                      chin=chin+x6;
                    }
                  }
                }

                // C13 - SUM THE FLOWS THROUGH SIX FACES OF CONSTANT HEAD CELL, AND
                // C13 - STORE SUM IN BUFFER.
                var rate=chch1+chch2+chch3+chch4+chch5+chch6;
                OUT.ccFlow[t]["CONSTANT HEAD"][n] = rate;
                
              }
            }
          }
        }
      // C17 - SAVE TOTAL CONSTANT HEAD FLOWS AND VOLUMES IN VBVL TABLE
      // C17 - FOR INCLUSION IN BUDGET. PUT LABELS IN VBNM TABLE.
      
      OUT.vbSumIn [t]["CONSTANT HEAD"] = chin*BAS.delt;
      OUT.vbSumOut[t]["CONSTANT HEAD"] = chout*BAS.delt;
        
      
      // END SUB
      
      
      
      
      var ibdret = 0;
      var ic1 = 1;
      var ic2 = BAS.ncol;
      var ir1 = 1;
      var ir2 = BAS.nrow;
      var il1 = 1;
      var il2 = BAS.nlay;
      
      for (var idir=1; idir<=3; idir++){
        
        // GWF2BCF7BDADJ
        // ******************************************************************
        // COMPUTE FLOW BETWEEN ADJACENT CELLS IN A SUBREGION OF THE GRID
        // ******************************************************************
        
              
        // C3 - TEST FOR DIRECTION OF CALCULATION;  IF NOT ACROSS COLUMNS, GO TO
        // C3 - STEP 4.  IF ONLY 1 COLUMN, RETURN.
        if (idir==1){
          if (BAS.ncol==1) return;
          
          //C3B - FOR EACH CELL CALCULATE FLOW THRU RIGHT FACE & STORE IN BUFFER.
          var n=0;
          for (var k=0; k<BAS.nlay; k++){ 
            for (var i=0; i<BAS.nrow; i++){
              for (var j=0; j<BAS.ncol; j++,n++){
                if (j+1 !== BAS.ncol){
                  if(( (BAS.ichflg == 0)
                     && (BAS.ibound[k][i][j] > 0 || BAS.ibound[k][i][j+1] > 0)) ||
                     ( (BAS.ichflg != 0)
                     && (BAS.ibound[k][i][j] !== 0 && BAS.ibound[k][i][j+1] !== 0)) ){
                     
                    var hdiff=BAS.hnew[k][i][j]-BAS.hnew[k][i][j+1];
                    OUT.ccFlow[t]["RIGHT"][n] = hdiff*BAS.cr[k][i][j];
                  }
                }
              }
            }
          }

        }
        // C4 - TEST FOR DIRECTION OF CALCULATION;  IF NOT ACROSS ROWS, GO TO
        // C4 - STEP 5.  IF ONLY 1 ROW, RETURN.
        if (idir==2){
          if (BAS.nrow==1) return;
          
          //C3B - FOR EACH CELL CALCULATE FLOW THRU FRONT FACE & STORE IN BUFFER.
          var n=0;
          for (var k=0; k<BAS.nlay; k++){
            for (var i=0; i<BAS.nrow; i++){
              for (var j=0; j<BAS.ncol; j++,n++){
                if (i+1 !== BAS.nrow){
                  if(( (BAS.ichflg == 0)
                     && (BAS.ibound[k][i][j] > 0 || BAS.ibound[k][i+1][j] > 0)) ||
                     ( (BAS.ichflg != 0)
                     && (BAS.ibound[k][i][j] !== 0 && BAS.ibound[k][i+1][j] !== 0)) ){
                     
                    var hdiff=BAS.hnew[k][i][j]-BAS.hnew[k][i+1][j];
                    OUT.ccFlow[t]["FRONT"][n]=hdiff*BAS.cc[k][i][j];
                  }
                }
              }
            }
          }

        }
        //C5 - DIRECTION OF CALCULATION IS ACROSS LAYERS BY ELIMINATION.  IF
        //C5 - ONLY 1 LAYER, RETURN.
        if (idir==3){
          if (BAS.nlay==1) return;
          
          //C3B - FOR EACH CELL CALCULATE FLOW THRU FRONT FACE & STORE IN BUFFER.
          var n=0;
          for (var k=0; k<BAS.nlay-1; k++){
            for (var i=0; i<BAS.nrow; i++){
              for (var j=0; j<BAS.ncol; j++,n++){
                if (k+1 !== BAS.nlay){
                  if(( (BAS.ichflg == 0)
                     && (BAS.ibound[k][i][j] > 0 || BAS.ibound[k+1][i][j] > 0)) ||
                     ( (BAS.ichflg != 0)
                     && (BAS.ibound[k][i][j] !== 0 && BAS.ibound[k+1][i][j] !== 0)) ){
                    
                    var hd = BAS.hnew[k+1][i][j];
                    // if the flow is downward to a converted-to-unconfined layer, use the 
                    if(BCF.layers[k+1].laycon == 3 || BCF.layers[k+1].laycon==2){
                      if(hd < BAS.elev[k+1][i][j]) hd=BAS.elev[k+1][i][j];
                    }
                    var hdiff=BAS.hnew[k][i][j]-hd;
                    OUT.ccFlow[t]["LOWER"][n]=hdiff*BAS.cv[k][i][j];
                  }
                }
              }
            }
          }

        }


        // END SUB
        
      }
      
    
    }
    BCF.Output = function(kstp, kper){
      
      var t = BAS.tstp;
      var n = BAS.nrow*BAS.ncol*BAS.nlay;
      
      OUT.head [t] = new Float32Array(n);
      OUT.drawdown [t] = new Float32Array(n);
      
      var n=0;
      for (var k=0; k<BAS.nlay; k++){
        for (var i=0; i<BAS.nrow; i++){
          for (var j=0; j<BAS.ncol; j++,n++){
            OUT.head [t][n] = BAS.hnew[k][i][j];
            if (BAS.ibound[k][i][j] !== 0){
              OUT.drawdown [t][n] = BAS.hold[k][i][j] - BAS.hnew[k][i][j];
            }
            else{
              OUT.drawdown [t][n] = BAS.hnoflo;
            }
          }
        }
      }
      
    }
    BCF.DeallocateMemory = function(){}
    
    return BCF;
  }());
  
  var SIP = (function(){ // V!
    var SIP = {};
    
    (function SIP_init(){
      SIP.nparm = 0; 
      SIP.ipcalc = 0;
      SIP.hclose = 0;
      SIP.accl = 0;
      // SIP.iprsip not used (printout interval)
      
      SIP.el = [];
      SIP.fl = [];
      SIP.gl = [];
      SIP.v = [];
      SIP.w = [];
      SIP.lrch = [];
      SIP.hdcg = [];
    }());
    
    SIP.AllocateRead = function(input){
      
      
      // C2 - READ mxiter, AND nparm.
      BAS.mxiter = input.SIP.mxiter;
      SIP.nparm = input.SIP.nparm;
      
      var v;
      if ((v = checkIfInt(SIP.nparm)) != "ok")
        badinput("Problem with SIP.nparm (the number of iteration variables to be used) -- " + v);
      if (SIP.nparm<=0)
        badinput("Problem with SIP.nparm (the number of iteration variables to be used) -- Value must be greater than zero.");
      if ((v = checkIfInt(BAS.mxiter)) != "ok")
        badinput("Problem with SIP.mxiter (the max number of iterations) -- " + v);
      if (BAS.mxiter<=0)
        badinput("Problem with SIP.mxiter (the max number of iterations) -- Value must be greater than zero.");
      
      
      // C3 - ALLOCATE SPACE FOR THE SIP ARRAYS.
      for (var k=0; k<BAS.nlay; k++){
        SIP.el[k] = [];
        SIP.fl[k] = [];
        SIP.gl[k] = [];
        SIP.v[k] = [];
        for (var i=0; i<BAS.nrow; i++){
          SIP.el[k][i] = [];
          SIP.fl[k][i] = [];
          SIP.gl[k][i] = [];
          SIP.v[k][i] = [];
          for (var j=0; j<BAS.ncol; j++){
            SIP.el[k][i][j] = 0;
            SIP.fl[k][i][j] = 0;
            SIP.gl[k][i][j] = 0;
            SIP.v[k][i][j] = 0;
          }
        }
      }
      for (var k=0; k<SIP.nparm; k++){
        SIP.w[k] = 0;
      }
      for (var k=0; k<3; k++){
        SIP.lrch[k] = [];
        for (var i=0; i<BAS.mxiter; i++){
          SIP.lrch[k][i] = 0;
        }
      }
      for (var i=0; i<BAS.mxiter; i++){
        SIP.hdcg[i] = 0;
      }
      
      
      // READ accl,HCLOSE,wseed,ipcalc,IPRSIP
      SIP.accl = input.SIP.accl;
      SIP.hclose = input.SIP.err;
      SIP.ipcalc = input.SIP.ipcalc;
      SIP.wseed = input.SIP.wseed;
      if  (SIP.accl === 0){
        SIP.accl = 1;
      }
      
      if ((v = checkIfInt(SIP.accl)) != "ok")
        badinput("Problem with SIP.accl (the acceleration variable, which is generally equal to 1) -- " + v);
      if (SIP.accl<=0)
        badinput("Problem with SIP.accl (the acceleration variable, which is generally equal to 1) -- Value must be greater than zero.");
      if ((v = checkIfNumber(SIP.hclose)) != "ok")
        badinput("Problem with SIP.err (the head change criterion for convergence) -- " + v);
      if (SIP.hclose<=0)
        badinput("Problem with SIP.err (the head change criterion for convergence) -- Value must be greater than zero.");
      if ((v = checkIfNumber(SIP.ipcalc)) != "ok")
        badinput("Problem with SIP.ipcalc (flag indicating where the seed for calculating iteration variables will come from) -- " + v);
      if ((v = checkIfNumber(SIP.wseed)) != "ok")
        badinput("Problem with SIP.wseed (the seed for calculating iteration variables) -- " + v);
      
      
      // C6 - CHECK IF SPECIFIED VALUE OF wseed SHOULD BE USED OR IF
      // C6 - SEED SHOULD BE CALCULATED
      if(SIP.ipcalc !== 0){
        // C6A - CALCULATE SEED & ITERATION PARAMETERS PRIOR TO 1ST ITERATION
         OUT.Write("CALCULATE ITERATION PARAMETERS FROM MODEL " +
         " CALCULATED wseed");
      }
      else{
        // C6B - USE SPECIFIED VALUE OF wseed
        // C6B - CALCULATE AND PRINT ITERATION PARAMETERS
        var p1=-1
        var p2=SIP.nparm-1
        for (var i=0; i<SIP.nparm; i++){
          p1++;
          SIP.w[i] = 1 - Math.pow(SIP.wseed, p1/p2 );
        }
        OUT.Write( SIP.nparm + " ITERATION PARAMETERS CALCULATED FROM SPECIFIED wseed =" + SIP.wseed + ": " + SIP.w.join(", "));
        
      }
      
      
    }
    
    
    SIP.Approximate = function(kiter, kstp, kper){
      
      // ******************************************************************
      // SOLUTION BY THE STRONGLY IMPLICIT PROCEDURE -- 1 ITERATION
      // ******************************************************************
      
      // C1 - CALCULATE ITERATION PARAMETERS IF FLAG IS SET.  THEN
      // C1 - CLEAR THE FLAG SO THAT CALCULATION IS DONE ONLY ONCE.
      if (SIP.ipcalc !== 0){
        SIP.SSIP7I();
      }
      SIP.ipcalc = 0;
      
      // C2 - ASSIGN VALUES TO FIELDS THAT ARE CONSTANT DURING AN ITERATION
      var done=1.0;
      var ac=SIP.accl;
      var nrc=BAS.nrow*BAS.ncol;
      var nth=((kiter) % (SIP.nparm) );
      var ditpar=SIP.w[nth];
      
      // C3 - INITIALIZE VARIABLE THAT TRACKS MAXIMUM HEAD CHANGE DURING
      // C3 - THE ITERATION
      var bigg=0;
      var big=0;
      var ib=0;
      var jb=0;
      var kb=0;
      
      // C4 - CLEAR SIP WORK ARRAYS.
      for (var i=0; i<BAS.nodes; i++){
        SIP.el[i]=0;
        SIP.fl[i]=0;
        SIP.gl[i]=0;
        SIP.v[i]=0;
      }
      
      // C5 - SET NORMAL/REVERSE EQUATION ORDERING FLAG (1 OR -1) AND
      // C5 - CALCULATE INDEXES DEPENDENT ON ORDERING
      var idir=1
      if(((kiter+1) % 2) == 0) idir=-1;
      var idnrc=idir*nrc;
      var idncol=idir*BAS.ncol;
      
      // C6 - STEP THROUGH CELLS CALCULATING INTERMEDIATE VECTOR V
      // C6 - USING FORWARD SUBSTITUTION
      for (var k=0; k<BAS.nlay; k++){
        for (var i=0; i<BAS.nrow; i++){
          for (var j=0; j<BAS.ncol; j++){
             
            var ii,jj,kk;
            var nrn,nrl,ncn,ncl,nln,nll, ncf,ncd,nrb,nrh,nls,nlz;
            var b,elnrl,flnrl,glnrl,bhnew,vnrl;
            var h,hhnew;
            var d,elncl,flncl,glncl,dhnew,vncl;
            var f,fhnew;
            var z,elnll,flnll,glnll,zhnew,vnll;
            var s,shnew;
            var e;
            var al,bl,cl,ap,cp,gp,rp,tp,up;
            
            // C6A - SET UP CURRENT CELL LOCATION INDEXES.  THESE ARE DEPENDENT
            // C6A - ON THE DIRECTION OF EQUATION ORDERING.
            if (idir>=0){
              ii=i; jj=j; kk=k;
            }
            else{
              ii=BAS.nrow-i-1; jj=j; kk=BAS.nlay-k-1;
            }
            
            // C6B - CALCULATE 1 DIMENSIONAL SUBSCRIPT OF CURRENT CELL AND
            // C6B - SKIP CALCULATIONS IF CELL IS NOFLOW OR CONSTANT HEAD
            var n = jj + ii*BAS.ncol + kk*nrc;
            if ( BAS.ibound[kk][ii][jj] > 0 ){
              // C6C - CALCULATE 1 DIMENSIONAL SUBSCRIPTS FOR LOCATING THE 6
              // C6C - SURROUNDING CELLS
              nrn=n+idncol;
              nrl=n-idncol;
              ncn=n+1;
              ncl=n-1;
              nln=n+idnrc;
              nll=n-idnrc;
              
              // C6D - CALCULATE 1 DIMENSIONAL SUBSCRIPTS FOR CONDUCTANCE TO THE 6
              // C6D - SURROUNDING CELLS.  THESE DEPEND ON ORDERING OF EQUATIONS.
              if(idir>0){
                ncf=n;
                ncd=ncl;
                nrb=nrl;
                nrh=n;
                nls=n;
                nlz=nll;
              }
              else{
                ncf=n;   
                ncd=ncl; 
                nrb=n;
                nrh=nrn;
                nls=nln;
                nlz=n;
              }
              
              
              
              // C6E - ASSIGN VARIABLES IN MATRICES A & U INVOLVING ADJACENT CELLS
              //
              
              // C6E1 - NEIGHBOR IS 1 ROW BACK
              b=0
              elnrl=0
              flnrl=0
              glnrl=0
              bhnew=0
              vnrl=0
              if(i!==0){ 
                b=BAS.cc[kk][ii-(idir>0?1:0)][jj];  // nrb
                elnrl=SIP.el[nrl];
                flnrl=SIP.fl[nrl];
                glnrl=SIP.gl[nrl];
                bhnew=b*BAS.hnew[kk][ii-1*idir][jj] // nrl
                vnrl=SIP.v[nrl];
              }
              
              // C6E2 - NEIGHBOR IS 1 ROW AHEAD
              h=0;
              hhnew=0;
              if(i+1!==BAS.nrow){
                h=BAS.cc[kk][ii-(idir>0?0:1)][jj]; // nrh
                hhnew=h*BAS.hnew[kk][ii+1*idir][jj]  // nrn
              }
              
              
              
              // C6E3 - NEIGHBOR IS 1 COLUMN BACK
              d=0
              elncl=0
              flncl=0
              glncl=0
              dhnew=0
              vncl=0
              if(j!==0){
                d=BAS.cr[kk][ii][jj-1]; // ncd
                elncl=SIP.el[ncl];
                flncl=SIP.fl[ncl];
                glncl=SIP.gl[ncl];
                dhnew=d*BAS.hnew[kk][ii][jj-1]; // ncl
                vncl=SIP.v[ncl];
              }
              
              // C6E4 - NEIGHBOR IS 1 COLUMN AHEAD
              f=0
              fhnew=0
              if(j+1 !== BAS.ncol){
                f=BAS.cr[kk][ii][jj] //ncf
                fhnew=f*BAS.hnew[kk][ii][jj+1]; // ncn
              }
              
              // C6E5 - NEIGHBOR IS 1 LAYER BEHIND
              z=0;
              elnll=0;
              flnll=0;
              glnll=0;
              zhnew=0;
              vnll=0;
              if(k !== 0){
                z=BAS.cv[kk-(idir>0?1:0)][ii][jj]; // nlz
                elnll=SIP.el[nll];
                flnll=SIP.fl[nll];
                glnll=SIP.gl[nll];
                zhnew=z*BAS.hnew[kk-1*idir][ii][jj]; // nll
                vnll=SIP.v[nll];
              }
              
              // C6E6 - NEIGHBOR IS 1 LAYER AHEAD
              s=0;
              shnew=0;
              if(k+1 !== BAS.nlay){
                s=BAS.cv[kk-(idir>0?0:1)][ii][jj]// nls
                shnew=s*BAS.hnew[kk+1*idir][ii][jj]; // nln
              }
              
              // C6E7 - CALCULATE THE NEGATIVE SUM OF ALL CONDUCTANCES TO NEIGHBORING
              // C6E7 - CELLS
              e=-z-b-d-f-h-s;
              
              
              // C6F - CALCULATE COMPONENTS OF THE UPPER AND LOWER MATRICES, WHICH
              // C6F - ARE THE FACTORS OF MATRIX (A+B)
              al=z/(done+ditpar*(elnll+flnll));
              bl=b/(done+ditpar*(elnrl+glnrl));
              cl=d/(done+ditpar*(flncl+glncl));
              ap=al*elnll;
              cp=bl*elnrl;
              gp=cl*flncl;
              rp=cl*glncl;
              tp=al*flnll;
              up=bl*glnrl;
              var hhcof=BAS.hcof[kk][ii][jj];
              var dl=e+hhcof+ditpar*(ap+tp+cp+gp+up+rp)-al*glnll-bl*flnrl-cl*elncl;
              if (dl == 0){
                throw("DIVIDE BY 0 IN SIP AT LAYER "+kk+" ROW "+ii+ " COLUMN "+jj+ ". THIS CAN OCCUR WHEN A CELL IS CONNECTED TO THE REST OF THE MODEL THROUGH A SINGLE CONDUCTANCE BRANCH.  CHECK FOR THIS SITUATION AT THE INDICATED CELL.");
              }
              SIP.el[n]=(f-ditpar*(ap+cp))/dl;
              SIP.fl[n]=(h-ditpar*(tp+gp))/dl;
              SIP.gl[n]=(s-ditpar*(rp+up))/dl;
              
              
              // C6G - CALCULATE THE RESIDUAL
              var rrhs=BAS.rhs[kk][ii][jj];
              var res=rrhs-zhnew-bhnew-dhnew-e*BAS.hnew[kk][ii][jj]-hhcof*BAS.hnew[kk][ii][jj]-fhnew-hhnew-shnew;
              
              
              // C6H - CALCULATE THE INTERMEDIATE VECTOR V
              SIP.v[n]=(ac*res-al*vnll-bl*vnrl-cl*vncl)/dl;
              
              if (SIP.v[n] > 3500){
                console.error("Big residual!  " + rrhs + " = " + [zhnew,bhnew,dhnew,e*BAS.hnew[kk][ii][jj],hhcof*BAS.hnew[kk][ii][jj],fhnew,hhnew,shnew].join(", ") )
                console.error( [z,b,d,f,h,s,e].join(",  ") )
                //throw("too big!" + [rrhs, "...", zhnew,bhnew,dhnew, e*BAS.hnew[kk][ii][jj], hhcof*BAS.hnew[kk][ii][jj],fhnew,hhnew,shnew].join(", ") )
              }
              
              if ( isNaN(SIP.v[n]) ) throw "bad calculated v at " + n + ".  " + [rrhs,zhnew,bhnew,dhnew,e,BAS.hnew[kk][ii][jj],hhcof,BAS.hnew[kk][ii][jj],fhnew,hhnew,shnew].join(",")
              
            }
            
          }
        }
      }
      
      
      
      
      // C7 - STEP THROUGH EACH CELL AND SOLVE FOR HEAD CHANGE BY BACK
      // C7 - SUBSTITUTION
      for (var k=0; k<BAS.nlay; k++){
        for (var i=0; i<BAS.nrow; i++){
          for (var j=0; j<BAS.ncol; j++){
            
            var ii,jj,kk;
            var nc,nr,nl;
            var elxi,flxi,glxi;
            var vn;
            var tchk;
            
            // C7A - SET UP CURRENT CELL LOCATION INDEXES.  THESE ARE DEPENDENT
            // C7A - ON THE DIRECTION OF EQUATION ORDERING.
            if (idir>=0){
              kk=BAS.nlay-k-1; ii=BAS.nrow-i-1; jj=BAS.ncol-j-1;
            }
            else{
              kk=k; ii=i; jj=BAS.ncol-j-1; 
            }
            
            // C7B - CALCULATE 1 DIMENSIONAL SUBSCRIPT OF CURRENT CELL AND
            // C7B - SKIP CALCULATIONS IF CELL IS NOFLOW OR CONSTANT HEAD
            var n = jj + ii*BAS.ncol + kk*nrc;
            
            if ( BAS.ibound[kk][ii][jj] > 0 ){
              
              // C7C - CALCULATE 1 DIMENSIONAL SUBSCRIPTS FOR THE 3 NEIGHBORING CELLS
              // C7C - BEHIND (RELATIVE TO THE DIRECTION OF THE BACK SUBSTITUTION
              // C7C - ORDERING) THE CURRRENT CELL.
              nc=n+1;
              nr=n+idncol;
              nl=n+idnrc;
              
              // C7D - BACK SUBSTITUTE, STORING HEAD CHANGE IN ARRAY V IN PLACE OF
              // C7D - INTERMEDIATE FORWARD SUBSTITUTION VALUES.
              elxi=0;
              flxi=0;
              glxi=0;
              if(jj+1!==BAS.ncol) elxi=SIP.el[n]*SIP.v[nc];
              if(i!==0) flxi=SIP.fl[n]*SIP.v[nr];
              if(k!==0) glxi=SIP.gl[n]*SIP.v[nl];
              vn=SIP.v[n];
              SIP.v[n]=vn-elxi-flxi-glxi;
              
      if ( isNaN(SIP.v[n]) || typeof SIP.v[n] == "undefined") throw "bad calculated v at " + n + ".  " + [vn,elxi,flxi,glxi].join(",")
      if ( isNaN(SIP.el[n]) || typeof SIP.el[n] == "undefined") throw "bad calculated el at " + n + ".  "
      if ( isNaN(SIP.fl[n]) || typeof SIP.fl[n] == "undefined") throw "bad calculated fl at " + n + ".  "
      if ( isNaN(SIP.gl[n]) || typeof SIP.gl[n] == "undefined") throw "bad calculated gl at " + n + ".  "
    
              
              // C7E - GET THE ABSOLUTE HEAD CHANGE. IF IT IS MAX OVER GRID SO FAR.
              // C7E - THEN SAVE IT ALONG WITH CELL INDICES AND HEAD CHANGE.
              tchk=Math.abs(SIP.v[n]);
              if (tchk > bigg){
                bigg=tchk;
                big=SIP.v[n];
                ib=ii;
                jb=jj;
                kb=kk;
              }
              
              // C7F - ADD HEAD CHANGE THIS ITERATION TO HEAD FROM THE PREVIOUS
              // C7F - ITERATION TO GET A NEW ESTIMATE OF HEAD.
              BAS.hnew[kk][ii][jj] += SIP.v[n];
              
            }
            
          }
        }
      }
      
      // C8 - STORE THE LARGEST ABSOLUTE HEAD CHANGE (THIS ITERATION) AND
      // C8 - AND ITS LOCATION.
      SIP.hdcg[kiter]=big;
      SIP.lrch[0][kiter]=kb;
      SIP.lrch[1][kiter]=ib;
      SIP.lrch[2][kiter]=jb;
      BAS.icnvg=false;
      if(bigg <= SIP.hclose) BAS.icnvg=true;
      
      OUT.Write("ITERATION NO " + kiter + " --- MAX HEAD CHANGE: " + bigg.toPrecision(4) );
      
      
      // C9 - IF END OF TIME STEP, PRINT # OF ITERATIONS THIS STEP
      if(BAS.icnvg == true || kiter == BAS.mxiter){
        
        OUT.Write(kiter+" ITERATIONS FOR TIME STEP "+kstp+" IN STRESS PERIOD "+kper);
        
        
        // C10 - PRINT HEAD CHANGE EACH ITERATION IF PRINTOUT INTERVAL IS REACHED
        // not implemented...
        
      }
      
      
      
    }
    
    
    SIP.DeallocateMemory = function(){}
    
    
    SIP.SSIP7I = function(){
      // ******************************************************************
      // CALCULATE AN ITERATION PARAMETER SEED AND USE IT TO CALCULATE SIP
      // ITERATION PARAMETERS
      // ******************************************************************
      
      // C1 - CALCULATE CONSTANTS AND INITIALIZE VARIABLES
      var piepie=9.869604;
      var ccol=piepie/(2*BAS.ncol*BAS.ncol)
      var crow=piepie/(2*BAS.nrow*BAS.nrow)
      var clay=piepie/(2*BAS.nlay*BAS.nlay)
      var wminmn=1
      var avgsum=0
      var nodes=0
      
      // C2 - LOOP THROUGH ALL CELLS, CALCULATING A SEED FOR EACH CELL
      // C2 - THAT IS ACTIVE
      for (var k=0; k<BAS.nlay; k++){
        for (var i=0; i<BAS.nrow; i++){
          for (var j=0; j<BAS.ncol; j++){
            if (BAS.ibound[k][i][j] > 0){
              // C2A - CONDUCTANCE FROM THIS CELL
              // C2A - TO EACH OF THE 6 ADJACENT CELLS
              var d=0;
              if(j!=0) d=BAS.cr[k][i][j-1];
              var f=0;
              if(j+1!=BAS.ncol) f=BAS.cr[k][i][j];
              var b=0;
              if(i!=0) b=BAS.cc[k][i-1][j];
              var h=0;
              if(i+1!=BAS.nrow) h=BAS.cc[k][i][j];
              var z=0;
              if(k!=0) z=BAS.cv[k-1][i][j];
              var s=0;
              if(k+1 != BAS.nlay) s=BAS.cv[k][i][j];
              
              // C2B - FIND THE MAXIMUM AND MINIMUM OF THE 2 CONDUCTANCE COEFFICIENTS
              // C2B - IN EACH PRINCIPAL COORDINATE DIRECTION
              var dfmx=Math.max(d,f);
              var bhmx=Math.max(b,h);
              var zsmx=Math.max(z,s);
              var dfmn=Math.min(d,f);
              var bhmn=Math.min(b,h);
              var zsmn=Math.min(z,s);
              if(dfmn === 0) dfmn=dfmx;
              if(bhmn === 0) bhmn=bhmx;
              if(zsmn === 0) zsmn=zsmx;
              
              // C2C - CALCULATE A SEED IN EACH PRINCIPAL COORDINATE DIRECTION
              var wcol=1;
              if(dfmn !== 0) wcol=ccol/(1+(bhmx+zsmx)/dfmn);
              var wrow=1;
              if(bhmn !== 0) wrow=crow/(1+(dfmx+zsmx)/bhmn);
              var wlay=1;
              if(zsmn !== 0) wlay=clay/(1+(dfmx+bhmx)/zsmn);
              
              // C2D - SELECT THE CELL SEED, WHICH IS THE MINIMUM SEED OF THE 3.
              // C2D - SELECT THE MINIMUM SEED OVER THE WHOLE GRID.
              var wmin=Math.min(Math.min(wcol,wrow),wlay);
              wminmn=Math.min(wminmn,wmin);
              
              // C2E - ADD THE CELL SEED TO THE ACCUMULATOR AVGSUM FOR USE
              // C2E - IN GETTING THE AVERAGE SEED.
              var dwmin=wmin;
              avgsum+=dwmin;
              nodes++;
            }
          }
        }
      }
      
      // C3 - CALCULATE THE AVERAGE SEED OF THE CELL SEEDS, AND PRINT
      // C3 - THE AVERAGE AND MINIMUM SEEDS.
      var tmp=nodes;
      var avgmin=avgsum;
      avgmin=avgmin/tmp;
      OUT.Write("AVERAGE SEED ="+avgmin+"  MINIMUM SEED ="+wminmn);
      
      // C4 - CALCULATE AND PRINT ITERATION PARAMETERS FROM THE AVERAGE SEED
      var p1=-1;
      var p2=SIP.nparm-1;
      for (var i=0; i<SIP.nparm; i++){
        p1++;
        SIP.w[i]=1-Math.pow(avgmin,(p1/p2));
      }
      OUT.Write(SIP.nparm + " ITERATION PARAMETERS CALCULATED FROM AVERAGE SEED:"+SIP.w.join(","));
      
      return;
    }
    
    return SIP;
  }());
  
  var WEL = (function(){ // V!
    var WEL = {};
    
    WEL.AllocateRead = function(input){
      WEL.data = input.WEL.data;
      
      // Some validation
      //
      var v;
      if ((v = checkIfArray(WEL.data, BAS.periods.length)) != "ok")
        badinput("Problem with WEL.data -- " + v);
      
      for (var p=0; p<WEL.data.length; p++){
        
        if ((v = checkIfArray(WEL.data[p])) != "ok")
          badinput("Problem with WEL.data["+p+"] -- " + v);
          
        for (var a=0; a<WEL.data[p].length; a++){
          
          if ((v = checkIfInt(WEL.data[p][a].layer)) != "ok")
            badinput("Problem with WEL.data["+p+"]["+a+"].layer -- " + v);
          if (WEL.data[p][a].layer <= 0 || WEL.data[p][a].layer > BAS.nlay)
            badinput("Problem with WEL.data["+p+"]["+a+"].layer -- Value is too large or too small to be a layer number.");
          if ((v = checkIfInt(WEL.data[p][a].row)) != "ok")
            badinput("Problem with WEL.data["+p+"]["+a+"].row -- " + v);
          if (WEL.data[p][a].row <= 0 || WEL.data[p][a].row > BAS.nrow)
            badinput("Problem with WEL.data["+p+"]["+a+"].row -- Value is too large or too small to be a row number.");
          if ((v = checkIfInt(WEL.data[p][a].column)) != "ok")
            badinput("Problem with WEL.data["+p+"]["+a+"].column -- " + v);
          if (WEL.data[p][a].column <= 0 || WEL.data[p][a].column > BAS.ncol)
            badinput("Problem with WEL.data["+p+"]["+a+"].column -- Value is too large or too small to be a column number.");
          if ((v = checkIfNumber(WEL.data[p][a].q)) != "ok")
            badinput("Problem with WEL.data["+p+"]["+a+"].q -- " + v);
            
        }
        
      }
      
    }
    
    WEL.ReadPrepare = function(){
      // ?? I didn't see anything neccessary
      
    }
    WEL.Formulate = function(kiter, kstp, kper){
      
      if ( WEL.data[kper].length == 0 ) return;
      
      for (var a=0; a<WEL.data[kper].length; a++){
        
        var ir = WEL.data[kper][a].row-1; 
        var ic = WEL.data[kper][a].column-1; 
        var il = WEL.data[kper][a].layer-1; 
        var q = WEL.data[kper][a].q; 
        
        // C2A - IF THE CELL IS INACTIVE THEN BYPASS PROCESSING.
        if (BAS.ibound[il][ir][ic] > 0){
          
          // C2B - IF THE CELL IS VARIABLE HEAD THEN SUBTRACT Q FROM
          //       THE RHS ACCUMULATOR.
          BAS.rhs[il][ir][ic] -= q;
        }
        
      }
      
    }
    WEL.WaterBudget = function(kstp, kper){
      
      var t = BAS.tstp;
      
      var ncel = BAS.nrow * BAS.ncol * BAS.nlay;
      OUT.ccFlow [t]["WEL"] = new Float32Array(ncel);
      OUT.vbSumIn [t]["WEL"] = 0;  
      OUT.vbSumOut [t]["WEL"] = 0;
      
      // C5 - LOOP THROUGH EACH WELL CALCULATING FLOW.
      for (var a=0; a<WEL.data[kper].length; a++){
        var ir = WEL.data[kper][a].row-1; 
        var ic = WEL.data[kper][a].column-1; 
        var il = WEL.data[kper][a].layer-1; 
        var q = WEL.data[kper][a].q; 
        var n = ic + ir*BAS.ncol + il*BAS.ncol*BAS.nrow;
        
        // C5B - IF THE CELL IS NO-FLOW OR CONSTANT_HEAD, IGNORE IT.
        if (BAS.ibound[il][ir][ic] > 0){
          OUT.ccFlow [t]["WEL"][n] = q;
          if (q>0){
            OUT.vbSumIn [t]["WEL"]+=q;
          }
          else{
            OUT.vbSumOut [t]["WEL"]-=q;
          }
        }
      }
     
      OUT.vbSumIn [t]["WEL"] *= BAS.delt;  
      OUT.vbSumOut [t]["WEL"] *= BAS.delt;
      
    }
    WEL.DeallocateMemory = function(){}
    
    return WEL;
  }());
  
  var DRN = (function(){ // V!
    var DRN = {};
    
    DRN.AllocateRead = function(input){
      DRN.data = input.DRN.data;
      
      // Some validation
      //
      var v;
      if ((v = checkIfArray(DRN.data, BAS.periods.length)) != "ok")
        badinput("Problem with DRN.data -- " + v);
      
      for (var p=0; p<DRN.data.length; p++){
        
        if ((v = checkIfArray(DRN.data[p])) != "ok")
          badinput("Problem with DRN.data["+p+"] -- " + v);
          
        for (var a=0; a<DRN.data[p].length; a++){
          
          if ((v = checkIfInt(DRN.data[p][a].layer)) != "ok")
            badinput("Problem with DRN.data["+p+"]["+a+"].layer -- " + v);
          if (DRN.data[p][a].layer <= 0 || DRN.data[p][a].layer > BAS.nlay)
            badinput("Problem with DRN.data["+p+"]["+a+"].layer -- Value is too large or too small to be a layer number.");
          if ((v = checkIfInt(DRN.data[p][a].row)) != "ok")
            badinput("Problem with DRN.data["+p+"]["+a+"].row -- " + v);
          if (DRN.data[p][a].row <= 0 || DRN.data[p][a].row > BAS.nrow)
            badinput("Problem with DRN.data["+p+"]["+a+"].row -- Value is too large or too small to be a row number.");
          if ((v = checkIfInt(DRN.data[p][a].column)) != "ok")
            badinput("Problem with DRN.data["+p+"]["+a+"].column -- " + v);
          if (DRN.data[p][a].column <= 0 || DRN.data[p][a].column > BAS.ncol)
            badinput("Problem with DRN.data["+p+"]["+a+"].column -- Value is too large or too small to be a column number.");
          if ((v = checkIfNumber(DRN.data[p][a].elevation)) != "ok")
            badinput("Problem with DRN.data["+p+"]["+a+"].elevation -- " + v);
          if ((v = checkIfNumber(DRN.data[p][a].condfact)) != "ok")
            badinput("Problem with DRN.data["+p+"]["+a+"].condfact -- " + v);
            
        }
        
      }
      
      
    }
    DRN.ReadPrepare = function(){
      // noting too important
    }
    DRN.Formulate = function(kiter, kstp, kper){
      
      if ( DRN.data[kper].length == 0 ) return;
      
      for (var a=0; a<DRN.data[kper].length; a++){
        
        var ir = DRN.data[kper][a].row-1; 
        var ic = DRN.data[kper][a].column-1; 
        var il = DRN.data[kper][a].layer-1;
        
        // C4 - IF THE CELL IS EXTERNAL SKIP IT.
        if (BAS.ibound[il][ir][ic] > 0){
          
          // C5 - IF THE CELL IS INTERNAL GET THE DRAIN DATA.
          var el = DRN.data[kper][a].elevation;
          var c = DRN.data[kper][a].condfact
          
          if (BAS.hnew[il][ir][ic] > el){
            // C7 - HEAD IS HIGHER THAN DRAIN. ADD TERMS TO RHS AND HCOF.
            BAS.hcof[il][ir][ic] -= c;
            BAS.rhs[il][ir][ic] -= c*el;
          }
        }
        
      }
      
    }
    DRN.WaterBudget = function(kstp, kper){
      
      var t = BAS.tstp;
      
      var ncel = BAS.nrow * BAS.ncol * BAS.nlay;
      OUT.ccFlow [t]["DRN"] = new Float32Array(ncel);
      OUT.vbSumIn [t]["DRN"] = 0;  
      OUT.vbSumOut [t]["DRN"] = 0;
      
      // C5 - LOOP THROUGH EACH DRAIN CALCULATING FLOW.
      for (var a=0; a<DRN.data[kper].length; a++){
      
        // C5A - GET LAYER, ROW & COLUMN OF CELL CONTAINING REACH.
        var ir = DRN.data[kper][a].row-1; 
        var ic = DRN.data[kper][a].column-1; 
        var il = DRN.data[kper][a].layer-1; 
        var el = DRN.data[kper][a].elevation;
        var c = DRN.data[kper][a].condfact
        var q = 0;
        var n = ic + ir*BAS.ncol + il*BAS.ncol*BAS.nrow;
        
        // C5B - IF THE CELL IS NO-FLOW OR CONSTANT_HEAD, IGNORE IT.
        if (BAS.ibound[il][ir][ic] > 0){
          
          // C5D - IF HEAD HIGHER THAN DRAIN, CALCULATE Q=C*(EL-HHNEW).
          // C5D - SUBTRACT Q FROM RATOUT.
          if (BAS.hnew[il][ir][ic] > el){
            q=c*el - c*BAS.hnew[il][ir][ic];
          }
          
          OUT.ccFlow [t]["DRN"][n] = q;
          OUT.vbSumOut [t]["DRN"]-=q;
          
        }
      }
    
      OUT.vbSumIn [t]["DRN"] *= BAS.delt;  
      OUT.vbSumOut [t]["DRN"] *= BAS.delt;
    
    }
    DRN.Output = function(){}
    DRN.DeallocateMemory = function(){}
    
    return DRN;
  }());
  
  var RCH = (function(){ // V!
    var RCH = {};
    RCH.nrchop = 0; // (1)-Layer 1 is recharged, 
                    // (2)-use IRCH to determine, 
                    // (3)-application of the recharge to the uppermost variable-head cell in the vertical column, provided no constant-head cell is above the variable-head cell in the column
    RCH.irch = [];  // ?? Should this be variable for each stress period? Right now it is constant.
    RCH.rech = []; 
    RCH.calc = []; // this is the recharge for a particular stress period multiplied by cell area
    
    RCH.AllocateRead = function(input){
    
      RCH.nrchop = input.RCH.nrchop;
      if ((v = checkIfInt(RCH.nrchop)) != "ok")
        badinput("Problem with RCH.nrchop (the recharge option code) -- " + v);
      
      // C4 - CHECK TO SEE THAT OPTION IS LEGAL.
      
      if ( RCH.nrchop != 1 && RCH.nrchop != 2 && RCH.nrchop != 3 ){
        badinput("Problem with RCH.nrchop (the recharge option code) -- Illegal option code of "+RCH.nrchop+", expected 1, 2 or 3.");
      }
      // C5 - OPTION IS LEGAL -- PRINT OPTION CODE.
      if ( RCH.nrchop == 1 ) OUT.Write("OPTION 1 -- RECHARGE TO TOP LAYER")
      if ( RCH.nrchop == 2 ) OUT.Write("OPTION 2 -- RECHARGE TO ONE SPECIFIED NODE IN EACH VERTICAL COLUMN")
      if ( RCH.nrchop == 3 ) OUT.Write("OPTION 3 -- RECHARGE TO HIGHEST ACTIVE NODE IN EACH VERTICAL COLUMN")
      
      RCH.irch = input.RCH.irch;
      RCH.rech = input.RCH.rech;
      
      // initialize calc array
      for (var ir=0; ir<BAS.nrow; ir++){
        RCH.calc[ir]=[];
        for (var ic=0; ic<BAS.ncol; ic++){
          RCH.calc[ir][ic]=0
        }
      }
      
      
      // Validate irch and rech
      var v;
      if ((v = checkIfArray(RCH.rech, BAS.periods.length)) != "ok")
        badinput("Problem with RCH.rech -- " + v);
      
      for (var p=0; p<RCH.rech.length; p++){
        if ((v = checkIfArray(RCH.rech[p], BAS.nrow)) != "ok")
          badinput("Problem with RCH.rech["+p+"] -- " + v);
        for (var i=0; i<RCH.rech[p].length; i++){
          if ((v = checkIfArray(RCH.rech[p][i], BAS.ncol)) != "ok")
            badinput("Problem with RCH.rech["+p+"]["+i+"] -- " + v); 
          for (var j=0; j<RCH.rech[p][i].length; j++){
            if ((v = checkIfNumber(RCH.rech[p][i][j])) != "ok")
              badinput("Problem with RCH.rech["+p+"]["+i+"]["+j+"] -- " + v);
          }
        }
      }
      
      if (RCH.nrchop == 2){
      
        if ((v = checkIfArray(RCH.irch, BAS.periods.length)) != "ok")
          badinput("Problem with RCH.irch -- " + v);
        
        for (var p=0; p<RCH.irch.length; p++){
          if ((v = checkIfArray(RCH.irch[p], BAS.nrow)) != "ok")
            badinput("Problem with RCH.irch["+p+"] -- " + v);
          for (var i=0; i<RCH.irch[p].length; i++){
            if ((v = checkIfArray(RCH.irch[p][i], BAS.ncol)) != "ok")
              badinput("Problem with RCH.irch["+p+"]["+i+"] -- " + v); 
            for (var j=0; j<RCH.irch[p][i].length; j++){
              if ((v = checkIfInt(RCH.irch[p][i][j])) != "ok")
                badinput("Problem with RCH.irch["+p+"]["+i+"]["+j+"] -- " + v);
              if (RCH.irch[p][i][j] < 1 || RCH.irch[p][i][j] > BAS.nlay)
                badinput("Problem with RCH.irch["+p+"]["+i+"]["+j+"] -- Value is not a valid layer number.");
            }
          }
        }
      
      }
      
    }
    RCH.ReadPrepare = function(kper){
      
      // C4 - MULTIPLY RECHARGE RATE BY CELL AREA TO GET VOLUMETRIC RATE.
      for (var ir=0; ir<BAS.nrow; ir++){
        for (var ic=0; ic<BAS.ncol; ic++){
          RCH.calc[ir][ic] = RCH.rech[kper][ir][ic] * BAS.delr[ic]*BAS.delc[ir];
        }
      }
      
      // C5 - IF NRCHOP=2 THEN A LAYER INDICATOR ARRAY IS NEEDED.  TEST INIRCH
      // C5 - TO SEE HOW TO DEFINE IRCH.
      if (RCH.nrchop == 2){
        
        
        // C5B - INIRCH=>0, SO CALL U2DINT TO READ LAYER INDICATOR ARRAY(IRCH)
        for (var ir=0; ir<BAS.nrow; ir++){
          for (var ic=0; ic<BAS.ncol; ic++){
            if (RCH.irch[kper][ir][ic] < 1 || RCH.irch[kper][ir][ic] > BAS.nlay ){
              throw "INVALID LAYER NUMBER IN IRCH FOR COLUMN "+ic+"  ROW "+ir+"  : "+RCH.irch[kper][ir][ic];
            }
          }
        }
        
      }
      
    }
    RCH.Formulate = function(kiter, kstp, kper){
      
      // C2 - DETERMINE WHICH RECHARGE OPTION.
      
      if (RCH.nrchop == 1){
        // C3 - NRCHOP IS 1, SO RECHARGE IS IN TOP LAYER. LAYER INDEX IS 1.
        for (var ir=0; ir<BAS.nrow; ir++){
          for (var ic=0; ic<BAS.ncol; ic++){
            if (BAS.ibound[0][ir][ic] > 0){
              BAS.rhs[0][ir][ic] -= RCH.calc[ir][ic];
            }
            continue;
          }
        }
      }
      
      if (RCH.nrchop == 2){
        // C4 - NRCHOP IS 2, SO RECHARGE IS INTO LAYER IN INDICATOR ARRAY
        for (var ir=0; ir<BAS.nrow; ir++){
          for (var ic=0; ic<BAS.ncol; ic++){
            var il = RCH.irch[kper][ir][ic] - 1;
            if (il<0) continue;
            if (BAS.ibound[il][ir][ic] > 0){
              BAS.rhs[il][ir][ic] -= RCH.calc[ir][ic];
            }
            continue;
          }
        }
      }
      
      if (RCH.nrchop == 3){
        // C5 - NRCHOP IS 3, RECHARGE IS INTO HIGHEST VARIABLE-HEAD CELL, EXCEPT
        // C5 - CANNOT PASS THROUGH CONSTANT HEAD NODE
        for (var ir=0; ir<BAS.nrow; ir++){
          for (var ic=0; ic<BAS.ncol; ic++){
            for (var il=0; il<BAS.nlay; il++){
              // C5A - IF CELL IS CONSTANT HEAD MOVE ON TO NEXT HORIZONTAL LOCATION.
              if (BAS.ibound[il][ir][ic] < 0){ il=BAS.nlay; continue; }
              
              if (BAS.ibound[il][ir][ic] > 0){
                BAS.rhs[il][ir][ic] -= RCH.calc[ir][ic];
                il=BAS.nlay; continue;
              }
              
            }
          }
        }
      }
      
      
    }
    RCH.WaterBudget = function(kstp, kper){
      
      var t = BAS.tstp;
      
      var ncel = BAS.nrow * BAS.ncol * BAS.nlay;
      OUT.ccFlow [t]["RCH"] = new Float32Array(ncel);
      OUT.vbSumIn [t]["RCH"] = 0;  
      OUT.vbSumOut [t]["RCH"] = 0;
      
      //C4 - DETERMINE THE RECHARGE OPTION.
      if (RCH.nrchop==1){
        // C5 - NRCHOP=1, SO RECH GOES INTO LAYER 1. PROCESS EACH HORIZONTAL
        // C5 - CELL LOCATION.
        var n=0;
        for (var i=0; i<BAS.nrow; i++){
          for (var j=0; j<BAS.ncol; j++,n++){
            // C5A - IF CELL IS VARIABLE HEAD, THEN DO BUDGET FOR IT.
            if (BAS.ibound[0][i][j] > 0){
              var q = RCH.calc[i][j];
              OUT.ccFlow [t]["RCH"][n] = q;
              if (q>0){
                OUT.vbSumIn [t]["RCH"]+=q;
              }
              else{
                OUT.vbSumOut [t]["RCH"]-=q;
              }
            }
          }
        }
      }
      else if (RCH.nrchop==2){
        // C6 - NRCHOP=2, RECH IS IN LAYER SPECIFIED IN INDICATOR ARRAY(IRCH).
        // C6 - PROCESS EACH HORIZONTAL CELL LOCATION.
        var n=0;
        for (var i=0; i<BAS.nrow; i++){
          for (var j=0; j<BAS.ncol; j++,n++){
            // C6A - GET LAYER INDEX FROM INDICATOR ARRAY(IRCH).
            var il = RCH.irch[kper][i][j]-1;
            // C6B - IF CELL IS VARIABLE HEAD, THEN DO BUDGET FOR IT.
            if (BAS.ibound[il][i][j] > 0){
              var q = RCH.calc[i][j];
              OUT.ccFlow [t]["RCH"][n+il*(BAS.nrow*BAS.ncol)] = q;
              if (q>0){
                OUT.vbSumIn [t]["RCH"]+=q;
              }
              else{
                OUT.vbSumOut [t]["RCH"]-=q;
              }
            }
          }
        }
      }
      else if (RCH.nrchop==3){
        // C7 - NRCHOP=3; RECHARGE IS INTO HIGHEST CELL IN A VERTICAL COLUMN
        // C7 - THAT IS NOT NO FLOW.  PROCESS EACH HORIZONTAL CELL LOCATION.
        var n=0;
        for (var i=0; i<BAS.nrow; i++){
          for (var j=0; j<BAS.ncol; j++,n++){
          
            // C7A - INITIALIZE IRCH TO 1, AND LOOP THROUGH CELLS IN A VERTICAL
            // C7A - COLUMN TO FIND WHERE TO PLACE RECHARGE.
            for (var k=0; k<BAS.nlay; k++){
            
              // C7B - IF CELL IS CONSTANT HEAD, MOVE ON TO NEXT HORIZONTAL LOCATION.
              if (BAS.ibound[k][i][j] < 0) break;
              
              if (BAS.ibound[k][i][j] > 0){
            
                var q = RCH.calc[i][j];
                OUT.ccFlow [t]["RCH"][n + k*(BAS.nrow*BAS.ncol)] = q;
                if (q>0){
                  OUT.vbSumIn [t]["RCH"]+=q;
                }
                else{
                  OUT.vbSumOut [t]["RCH"]-=q;
                }
                k=BAS.nlay; // move on to next horizontal location
              }
              
            }
            
          }
        }
      }
      
      OUT.vbSumIn [t]["RCH"] *= BAS.delt;  
      OUT.vbSumOut [t]["RCH"] *= BAS.delt;
      
    }
    RCH.DeallocateMemory = function(){}
    
    return RCH;
  }());
  
  var RIV = (function(){ // V!
    var RIV = {};
    RIV.data = [] // array of stresses for each stress period
    
    RIV.AllocateRead = function(input){
      RIV.data = input.RIV.data;
      
      // Some validation
      //
      var v;
      if ((v = checkIfArray(RIV.data, BAS.periods.length)) != "ok")
        badinput("Problem with RIV.data -- " + v);
      
      for (var p=0; p<RIV.data.length; p++){
        
        if ((v = checkIfArray(RIV.data[p])) != "ok")
          badinput("Problem with RIV.data["+p+"] -- " + v);
          
        for (var a=0; a<RIV.data[p].length; a++){
          
          if ((v = checkIfInt(RIV.data[p][a].layer)) != "ok")
            badinput("Problem with RIV.data["+p+"]["+a+"].layer -- " + v);
          if (RIV.data[p][a].layer <= 0 || RIV.data[p][a].layer > BAS.nlay)
            badinput("Problem with RIV.data["+p+"]["+a+"].layer -- Value is too large or too small to be a layer number.");
          if ((v = checkIfInt(RIV.data[p][a].row)) != "ok")
            badinput("Problem with RIV.data["+p+"]["+a+"].row -- " + v);
          if (RIV.data[p][a].row <= 0 || RIV.data[p][a].row > BAS.nrow)
            badinput("Problem with RIV.data["+p+"]["+a+"].row -- Value is too large or too small to be a row number.");
          if ((v = checkIfInt(RIV.data[p][a].column)) != "ok")
            badinput("Problem with RIV.data["+p+"]["+a+"].column -- " + v);
          if (RIV.data[p][a].column <= 0 || RIV.data[p][a].column > BAS.ncol)
            badinput("Problem with RIV.data["+p+"]["+a+"].column -- Value is too large or too small to be a column number.");
          if ((v = checkIfNumber(RIV.data[p][a].conductance)) != "ok")
            badinput("Problem with RIV.data["+p+"]["+a+"].conductance -- " + v);
          if ((v = checkIfNumber(RIV.data[p][a].riverbottom)) != "ok")
            badinput("Problem with RIV.data["+p+"]["+a+"].riverbottom -- " + v);
            
        }
        
      }
      
      
    }
    RIV.ReadPrepare = function(){
      // nothing
    }
    RIV.Formulate = function(kiter, kstp, kper){
      
      if ( RIV.data[kper].length == 0 ) return;
      
      for (var a=0; a<RIV.data[kper].length; a++){
        
        var ir = RIV.data[kper][a].row-1; 
        var ic = RIV.data[kper][a].column-1; 
        var il = RIV.data[kper][a].layer-1;
        
        // C4 - IF THE CELL IS EXTERNAL SKIP IT.
        if (BAS.ibound[il][ir][ic] > 0){
          
          // C5 - SINCE THE CELL IS INTERNAL GET THE RIVER DATA.
          var hriv = RIV.data[kper][a].stage;
          var criv = RIV.data[kper][a].conductance;
          var rbot = RIV.data[kper][a].riverbottom;
          
          // C6 - COMPARE AQUIFER HEAD TO BOTTOM OF STREAM BED.
          if (BAS.hnew[il][ir][ic] > rbot){
            // C7 - SINCE HEAD>BOTTOM ADD TERMS TO RHS AND HCOF.
            BAS.rhs[il][ir][ic] -= criv*hriv;
            BAS.hcof[il][ir][ic] -= criv;
          }
          else{
            //C8 - SINCE HEAD<BOTTOM ADD TERM ONLY TO RHS.
            BAS.rhs[il][ir][ic] -= criv*(hriv-rbot)
          }
          
        }
        
      }
      
    }
    RIV.WaterBudget = function(kstp, kper){
      var t = BAS.tstp;
      
      var ncel = BAS.nrow * BAS.ncol * BAS.nlay;
      OUT.ccFlow [t]["RIV"] = new Float32Array(ncel);
      OUT.vbSumIn [t]["RIV"] = 0;  
      OUT.vbSumOut [t]["RIV"] = 0;
      
      // C5 - LOOP THROUGH EACH RIVER REACH CALCULATING FLOW.
      for (var a=0; a<RIV.data[kper].length; a++){
      
        // C5A - GET LAYER, ROW & COLUMN OF CELL CONTAINING REACH.
        var ir = RIV.data[kper][a].row-1; 
        var ic = RIV.data[kper][a].column-1; 
        var il = RIV.data[kper][a].layer-1; 
        var q = 0;
        
        var n = ic + ir*BAS.ncol + il*BAS.ncol*BAS.nrow;
        
        // C5B - IF CELL IS NO-FLOW OR CONSTANT-HEAD MOVE ON TO NEXT REACH.
        if (BAS.ibound[il][ir][ic] > 0){
          
          // C5C - GET RIVER PARAMETERS FROM RIVER LIST.
          var hriv = RIV.data[kper][a].stage;
          var criv = RIV.data[kper][a].conductance;
          var rbot = RIV.data[kper][a].riverbottom;
          var hnew = BAS.hnew[il][ir][ic];
          
          // C5D - COMPARE HEAD IN AQUIFER TO BOTTOM OF RIVERBED.
          if (hnew > rbot){
            // C5E - AQUIFER HEAD > BOTTOM THEN RATE=CRIV*(HRIV-HNEW).
            q = criv*hriv - criv*hnew;
          }
          else{
            // C5F - AQUIFER HEAD < BOTTOM THEN RATE=CRIV*(HRIV-RBOT).
            q = criv*(hriv-rbot);
          }
          
          OUT.ccFlow [t]["RIV"][n] = q;
          if (q>0){
            OUT.vbSumIn [t]["RIV"]+=q;
          }
          else{
            OUT.vbSumOut [t]["RIV"]-=q;
          }
        }
      }
    
      OUT.vbSumIn [t]["RIV"] *= BAS.delt;  
      OUT.vbSumOut [t]["RIV"] *= BAS.delt;
    
    }
    RIV.Output = function(){}
    RIV.DeallocateMemory = function(){}
    
    return RIV;
  }());
  
  var EVT = (function(){ // V!

    var data = {
      nevtop: 0,   // must be 1 or 2 or 3, indicating whether to use the top layer or a specified layer or the top active layer for each location
      surf: [], 
      evtr: [],    // this is modified, multiplied by the cell area
      exdp: [], 
      ievt: []
    };
    
    /** Allow the data used by this package to be accessed by other packages or external code */
    var getData = function(key){
      // If the key argument was not provided, return all the data
      if (typeof key == "undefined"){
        return data;
      }
      // If a valid key argument was provided, return the desired data
      if (data.hasOwnProperty(key)){
        return data[key];
      }
      // If neither of the above, throw an error
      throw "Could not find item "+ key +" in the GHB package";
    }
    
    /** Allow the data used by this package to be set by other packages or external code */
    var setData = function(key, value){
      
      var v;
      
      if (key == "nevtop"){
        data.nevtop = input.EVT.nevtop;
        
        if ((v = checkIfInt(data.nevtop)) != "ok")
          badinput("Problem with EVT.nevtop -- " + v);
        if ( data.nevtop != 1 && data.nevtop != 2 && data.nevtop != 3){
          badinput("Problem with EVT.nevtop -- Must be 1 (calculated for top layer) or 2 (layer specified by EVT.ievt) or 3 (top active layer).");
        }
        
      }
      
      if (key == "surf"){
        data.surf = input.EVT.surf;
        if ((v = checkIfArray(data.surf, BAS.periods.length)) != "ok")
          badinput("Problem with EVT.surf -- " + v);
        
        for (var p=0; p<data.surf.length; p++){
          if ((v = checkIfArray(data.surf[p])) != "ok")
            badinput("Problem with EVT.surf["+p+"] -- " + v);
          for (var a=0; a<data.surf[p].length; a++){
            if ((v = checkIfArray(data.surf[p], BAS.nrow)) != "ok")
              badinput("Problem with EVT.surf["+p+"] -- " + v);
            for (var i=0; i<data.surf[p].length; i++){
              if ((v = checkIfArray(data.surf[p][i], BAS.ncol)) != "ok")
                badinput("Problem with EVT.surf["+p+"]["+i+"] -- " + v); 
              for (var j=0; j<data.surf[p][i].length; j++){
                if ((v = checkIfNumber(data.surf[p][i][j])) != "ok")
                  badinput("Problem with EVT.surf["+p+"]["+i+"]["+j+"] -- " + v);
              }
            }
          }
        }
        
      }
      
      if (key == "evtr"){
        data.evtr = input.EVT.evtr;
        if ((v = checkIfArray(data.evtr, BAS.periods.length)) != "ok")
          badinput("Problem with EVT.evtr -- " + v);
        
        for (var p=0; p<data.evtr.length; p++){
          if ((v = checkIfArray(data.evtr[p])) != "ok")
            badinput("Problem with EVT.evtr["+p+"] -- " + v);
          for (var a=0; a<data.evtr[p].length; a++){
            if ((v = checkIfArray(data.evtr[p], BAS.nrow)) != "ok")
              badinput("Problem with EVT.evtr["+p+"] -- " + v);
            for (var i=0; i<data.evtr[p].length; i++){
              if ((v = checkIfArray(data.evtr[p][i], BAS.ncol)) != "ok")
                badinput("Problem with EVT.evtr["+p+"]["+i+"] -- " + v); 
              for (var j=0; j<data.evtr[p][i].length; j++){
                if ((v = checkIfNumber(data.evtr[p][i][j])) != "ok")
                  badinput("Problem with EVT.evtr["+p+"]["+i+"]["+j+"] -- " + v);
              }
            }
          }
        }
        
      }
      
      if (key == "exdp"){
        data.exdp = input.EVT.exdp;
        if ((v = checkIfArray(data.exdp, BAS.periods.length)) != "ok")
          badinput("Problem with EVT.exdp -- " + v);
        
        for (var p=0; p<data.exdp.length; p++){
          if ((v = checkIfArray(data.exdp[p])) != "ok")
            badinput("Problem with EVT.exdp["+p+"] -- " + v);
          for (var a=0; a<data.exdp[p].length; a++){
            if ((v = checkIfArray(data.exdp[p], BAS.nrow)) != "ok")
              badinput("Problem with EVT.exdp["+p+"] -- " + v);
            for (var i=0; i<data.exdp[p].length; i++){
              if ((v = checkIfArray(data.exdp[p][i], BAS.ncol)) != "ok")
                badinput("Problem with EVT.exdp["+p+"]["+i+"] -- " + v); 
              for (var j=0; j<data.exdp[p][i].length; j++){
                if ((v = checkIfNumber(data.exdp[p][i][j])) != "ok")
                  badinput("Problem with EVT.exdp["+p+"]["+i+"]["+j+"] -- " + v);
              }
            }
          }
        }
        
      } 
      
      if (key == "ievt"){
        data.ievt = input.EVT.ievt;
        if ((v = checkIfArray(data.ievt, BAS.periods.length)) != "ok" && data.nevtop == 2 )
          badinput("Problem with EVT.ievt -- " + v);
        
        if ( data.nevtop == 2 ){
          for (var p=0; p<data.ievt.length; p++){
            if ((v = checkIfArray(data.ievt[p])) != "ok")
              badinput("Problem with EVT.ievt["+p+"] -- " + v);
            for (var a=0; a<data.ievt[p].length; a++){
              if ((v = checkIfArray(data.ievt[p], BAS.nrow)) != "ok")
                badinput("Problem with EVT.ievt["+p+"] -- " + v);
              for (var i=0; i<data.ievt[p].length; i++){
                if ((v = checkIfArray(data.ievt[p][i], BAS.ncol)) != "ok")
                  badinput("Problem with EVT.ievt["+p+"]["+i+"] -- " + v); 
                for (var j=0; j<data.ievt[p][i].length; j++){
                  if ((v = checkIfNumber(data.ievt[p][i][j])) != "ok")
                    badinput("Problem with EVT.ievt["+p+"]["+i+"]["+j+"] -- " + v);
                }
              }
            }
          }
        }
        
      }
      
    }
    
    return {
      get: getData,
      set: setData,
      subroutines: {
    
        "AllocateRead" : function(input){
          
          setData("nevtop", input.EVT.nevtop)
          setData("surf", input.EVT.surf)
          setData("evtr", input.EVT.evtr)
          setData("exdp", input.EVT.exdp)
          setData("ievt", input.EVT.ievt)
          
          
        }
        ,
        "ReadPrepare" : function(kper){
          
          // C5 - MULTIPLY MAX ET RATE BY CELL AREA TO GET VOLUMETRIC RATE
          for (var ir=0; ir<BAS.nrow; ir++){
            for (var ic=0; ic<BAS.ncol; ic++){
              data.evtr[kper][ir][ic] = data.evtr[kper][ir][ic] * BAS.delr[ic]*BAS.delc[ir];
            }
          }
          
        }
        ,
        "Formulate" : function(kiter, kstp, kper){
          
          // C2 - PROCESS EACH HORIZONTAL CELL LOCATION
          for (var ir=0; ir<BAS.nrow; ir++){
            for (var ic=0; ic<BAS.ncol; ic++){
              
              // C3 - SET THE LAYER INDEX -- FOR OPTION 1, THE LAYER IS 1;
              // C3 - FOR OPTION 2, THE LAYER IS SPECIFIED IN IEVT.
              var il;
              if (data.nevtop == 1){
                 il=0
              }
              else if(data.nevtop == 2){
                 il = data.ievt[kper][ir][ic] - 1;
                 if (il < 0) continue;
              }
              else{
                //C4 - FOR OPTION 3, FIND UPPERMOST ACTIVE CELL.
                il=0;
                for (var k=0; k<BAS.nlay; k++){
                  if(BAS.ibound[k][ir][ic] !== 0){
                    il = k;
                    break;
                  }
                }
              }
              
              
              // C5 - IF THE CELL IS NOT VARIABLE HEAD, IGNORE IT.  IF CELL IS
              // C5 - VARIABLE HEAD, GET DATA NEEDED TO COMPUTE FLOW TERMS.
              if(BAS.ibound[il][ir][ic] > 0){
                var c = data.evtr[kper][ir][ic];
                var s = data.surf[kper][ir][ic];
                var hh = BAS.hnew[il][ir][ic];
                
                
                
                // C6 - IF AQUIFER HEAD IS GREATER THAN OR EQUAL TO SURF, ET IS CONSTANT
                if(hh >= s){
                  
                  // C6A - HEAD IS GREATER THAN OR EQUAL TO SURF.  ADD EVTR TO RHS
                  BAS.rhs[il][ir][ic] += c;
                  
                }
                else{
                  
                  // C7 - IF DEPTH TO WATER>=EXTINCTION DEPTH, THEN ET IS 0.
                  var dd = s-hh;
                  var x = data.exdp[kper][ir][ic];
                  if(dd < x){
                    
                    // C8 - LINEAR RANGE. ADD ET TERMS TO BOTH RHS AND HCOF.
                    BAS.rhs[il][ir][ic] += c-c*s/x;
                    BAS.hcof[il][ir][ic] -= c/x;
                    
                  }
                }
              }
              
            }
            
          }
          
        }
        ,
        "WaterBudget" : function(kstp, kper){
          
          var t = BAS.tstp;
          
          var ncel = BAS.nrow * BAS.ncol * BAS.nlay;
          OUT.ccFlow [t]["EVT"] = new Float32Array(ncel);
          OUT.vbSumIn [t]["EVT"] = 0;  
          OUT.vbSumOut [t]["EVT"] = 0;
          
          // C4 - PROCESS EACH HORIZONTAL CELL LOCATION.
          var n=0;
          for (var ir=0; ir<BAS.nrow; ir++){
            for (var ic=0; ic<BAS.ncol; ic++,n++){
              
              // C5 - SET THE LAYER INDEX -- FOR OPTION 1, THE LAYER IS 1;
              // C5 - FOR OPTION 2, THE LAYER IS SPECIFIED IN IEVT.
              var il;
              if (data.nevtop == 1){
                 il=0
              }
              else if(data.nevtop == 2){
                 il = data.ievt[kper][ir][ic] - 1;
                 if (il <= 0) continue;
              }
              else{
                //C6 - FOR OPTION 3, FIND UPPERMOST ACTIVE CELL.
                il=0;
                for (var k=0; k<BAS.nlay; k++){
                  if(BAS.ibound[k][ir][ic] !== 0){
                    il = k;
                    break;
                  }
                }
              }
              
              var q=0;
              
              // C7 - IF CELL IS EXTERNAL THEN IGNORE IT.
              if(BAS.ibound[il][ir][ic] > 0){
                var c = data.evtr[kper][ir][ic];
                var s = data.surf[kper][ir][ic];
                var hh = BAS.hnew[il][ir][ic];
                
                // C8 - IF AQUIFER HEAD => SURF,SET Q=MAX ET RATE.
                if(hh >= s){
                  q = -c;
                }
                else{
                  
                  // C9 - IF DEPTH=>EXTINCTION DEPTH, ET IS 0.
                  var dd = s-hh;
                  var x = data.exdp[kper][ir][ic];
                  if(dd < x){
    
                    // C10 - LINEAR RANGE. Q= -HNEW*EVTR/EXDP -EVTR + EVTR*SURF/EXDP.
                    var hhcof = -c/x;
                    var rrhs = (c*s/x)-c;
                    q = hh*hhcof+rrhs;
                    
                  }
                }
              }
              
              OUT.ccFlow [t]["EVT"][n + il*(BAS.nrow*BAS.ncol)] = q;
              if (q>0){
                OUT.vbSumIn [t]["EVT"]+=q;
              }
              else{
                OUT.vbSumOut [t]["EVT"]-=q;
              }
              
            }
          }
          
          
          OUT.vbSumIn [t]["EVT"] *= BAS.delt;  
          OUT.vbSumOut [t]["EVT"] *= BAS.delt;
        
        }
        ,
        "Output" : function(){}
        ,
        "DeallocateMemory" : function(){}
    
      }
    } // end return
    
  }());
  
  var GHB = (function(){ // V!
    
    var data = {
      bounds: []
    };
    
    /** Allow the data used by this package to be accessed by other packages or external code */
    var getData = function(key){
      // If the key argument was not provided, return all the data
      if (typeof key == "undefined"){
        return data;
      }
      // If a valid key argument was provided, return the desired data
      if (data.hasOwnProperty(key)){
        return data[key];
      }
      // If neither of the above, throw an error
      throw "Could not find item "+ key +" in the GHB package";
    }
    
    /** Allow the data used by this package to be set by other packages or external code */
    var setData = function(key, value){
      
      if (key == "bounds"){
          data.bounds = value;
          
          // Some validation
          //
          var v;
          if ((v = checkIfArray(data, BAS.periods.length)) != "ok")
            badinput("Problem with GHB.data -- " + v);
          
          for (var p=0; p<data.bounds.length; p++){
            
            if ((v = checkIfArray(data.bounds[p])) != "ok")
              badinput("Problem with GHB.bounds["+p+"] -- " + v);
              
            for (var a=0; a<data.bounds[p].length; a++){
              
              if ((v = checkIfInt(data.bounds[p][a].layer)) != "ok")
                badinput("Problem with GHB.bounds["+p+"]["+a+"].layer -- " + v);
              if (data.bounds[p][a].layer <= 0 || data.bounds[p][a].layer > BAS.nlay)
                badinput("Problem with GHB.bounds["+p+"]["+a+"].layer -- Value is too large or too small to be a layer number.");
              if ((v = checkIfInt(data.bounds[p][a].row)) != "ok")
                badinput("Problem with GHB.bounds["+p+"]["+a+"].row -- " + v);
              if (data.bounds[p][a].row <= 0 || data.bounds[p][a].row > BAS.nrow)
                badinput("Problem with GHB.bounds["+p+"]["+a+"].row -- Value is too large or too small to be a row number.");
              if ((v = checkIfInt(data.bounds[p][a].column)) != "ok")
                badinput("Problem with GHB.bounds["+p+"]["+a+"].column -- " + v);
              if (data.bounds[p][a].column <= 0 || data.bounds[p][a].column > BAS.ncol)
                badinput("Problem with GHB.bounds["+p+"]["+a+"].column -- Value is too large or too small to be a column number.");
              if ((v = checkIfNumber(data.bounds[p][a].bhead)) != "ok")
                badinput("Problem with GHB.bounds["+p+"]["+a+"].bhead -- " + v);
              if ((v = checkIfNumber(data.bounds[p][a].cond)) != "ok")
                badinput("Problem with GHB.bounds["+p+"]["+a+"].cond -- " + v);
                
            }
            
          }
        
      }
    }
    
    return {
      get: getData,
      set: setData,
      subroutines: {
        
        "AllocateRead" : function(input){
          if (input.GHB.data){
            setData("bounds", input.GHB.data);
          }
        }
        ,
        "ReadPrepare" : function(){
          // noting too important
        }
        ,
        "Formulate" : function(kiter, kstp, kper){
          
          var bounds = data.bounds
          
          // C1 - IF NBOUND<=0 THEN THERE ARE NO GENERAL HEAD BOUNDS. RETURN.
          if ( bounds[kper].length == 0 ) return;
          
          // C2 - PROCESS EACH ENTRY IN THE GENERAL HEAD BOUND LIST (BNDS).
          for (var a=0; a<bounds[kper].length; a++){
            
            // C3 - GET COLUMN, ROW AND LAYER OF CELL CONTAINING BOUNDARY.
            var il = bounds[kper][a].layer-1;
            var ir = bounds[kper][a].row-1; 
            var ic = bounds[kper][a].column-1; 
            
            // C4 - IF THE CELL IS EXTERNAL SKIP IT.
            if (BAS.ibound[il][ir][ic] > 0){
              
              // C5 - SINCE THE CELL IS INTERNAL GET THE BOUNDARY DATA.
              var hb = bounds[kper][a].bhead;
              var c = bounds[kper][a].cond;
              
              // C6 - ADD TERMS TO RHS AND HCOF.
              BAS.hcof[il][ir][ic] -= c;
              BAS.rhs[il][ir][ic] -= c*hb;
              
            }
            
          }
          
        }
        ,
        "WaterBudget" : function(kstp, kper){
          
          var bounds = data.bounds
          var t = BAS.tstp;
          
          var ncel = BAS.nrow * BAS.ncol * BAS.nlay;
          OUT.ccFlow [t]["GHB"] = new Float32Array(ncel);
          OUT.vbSumIn [t]["GHB"] = 0;  
          OUT.vbSumOut [t]["GHB"] = 0;
          
          // C5 - LOOP THROUGH EACH BOUNDARY CALCULATING FLOW.
          for (var a=0; a<bounds[kper].length; a++){
          
            // C5A - GET LAYER, ROW & COLUMN OF EACH GENERAL HEAD BOUNDARY.
            var ir = bounds[kper][a].row-1; 
            var ic = bounds[kper][a].column-1; 
            var il = bounds[kper][a].layer-1; 
            var hb = bounds[kper][a].bhead;
            var c = bounds[kper][a].cond;
            var q = 0;
            var n = ic + ir*BAS.ncol + il*BAS.ncol*BAS.nrow;
            
            // C5B - IF CELL IS NO-FLOW OR CONSTANT-HEAD, THEN IGNORE IT.
            if (BAS.ibound[il][ir][ic] > 0){
              
              // C5D - CALCULATE THE FOW RATE INTO THE CELL.
              q = c*hb - c*BAS.hnew[il][ir][ic];
              
              OUT.ccFlow [t]["GHB"][n] = q;
              if (q<0) { OUT.vbSumOut [t]["GHB"]-=q; }
              else     { OUT.vbSumIn  [t]["GHB"]+=q; }
              
            }
          }
        
          OUT.vbSumIn [t]["GHB"] *= BAS.delt;  
          OUT.vbSumOut [t]["GHB"] *= BAS.delt;
        
        }
        ,
        "Output" : function(){}
        ,
        "DeallocateMemory" : function(){}
      }
    }; // end return
    
    
  }());
  
  
  
  
  
  
  
  
  var OUT = (function(){
    // data to return 
    var OUT = {};
    
    OUT.Init = function(){
      OUT.messages=[];
      OUT.head=[];
      OUT.drawdown=[];
      OUT.ccFlow=[];   // array with an object for each time step. The object has arrays of flows for each cell.
      OUT.vbSumIn=[];     // array with an object for each time step. The object has the flow sums.
      OUT.vbSumOut=[];    // array with an object for each time step. The object has the flow sums.
      OUT.rateIn=[];     
      OUT.rateOut=[];    
      OUT.budperc = 0;    // the percent error of the budget
    }
    
    OUT.Write = function(s){
      OUT.messages.push(s);
    }
    
    return OUT;
  }());
  
  
  
  
  var run = function(){
    
    var start_time = (new Date).getTime();
    
    // ALREAY DID ALOCATE AND READ
    //run_init();
    OUT.Init();
    
    BAS.tstp=0;  // keeps track of the absolute time step, not the time step of the current stress perios
    var NCVGERR = 0; // flag that is set to 1 if does not converge
    
    // SIMULATE EACH STRESS PERIOD.
    for( var kper = 0; kper < BAS.nper; kper++){
      
      BAS.Stress( kper )
      
      // Read and Prepare
      if (input.RCH){ RCH.ReadPrepare(kper); }
      if (input.EVT){ EVT.subroutines.ReadPrepare(kper); }
      
      
      // SIMULATE EACH TIME STEP.
      BAS.icnvg = false; // has not converged
      
      for (var kstp = 0; kstp< BAS.periods[kper].nstp; kstp++, BAS.tstp++ ){
        
        BAS.AdvanceTime( kper, kstp );
        if (input.BCF){ BCF.AdvanceTime( kper, kstp ); }
        OUT.Write(' Solving:  Stress period: ' + kper + ', Time step: '+ kstp +', Ground-Water Flow Eqn.')

				
        //ITERATIVELY FORMULATE AND SOLVE THE FLOW EQUATIONS.
        for (var kiter=0; kiter<BAS.mxiter; kiter++){

          //FORMULATE THE FINITE DIFFERENCE EQUATIONS.
          BAS.Formulate(kiter, kstp, kper);
          if (input.BCF){ BCF.Formulate(kiter, kstp, kper); }
          if (input.WEL){ WEL.Formulate(kiter, kstp, kper); }
          if (input.DRN){ DRN.Formulate(kiter, kstp, kper); }
          if (input.RIV){ RIV.Formulate(kiter, kstp, kper); }
          if (input.RCH){ RCH.Formulate(kiter, kstp, kper); }
          if (input.EVT){ EVT.subroutines.Formulate(kiter, kstp, kper); }
          if (input.GHB){ GHB.subroutines.Formulate(kiter, kstp, kper); }
          
          // C7C2B---MAKE ONE CUT AT AN APPROXIMATE SOLUTION.
          BAS.ierr = 0;
          if (input.SIP){ SIP.Approximate(kiter, kstp, kper); }
          
          
          if (BAS.ierr == 1){
            throw ("");
          }
          // IF CONVERGENCE CRITERION HAS BEEN MET STOP ITERATING.
          if (BAS.icnvg == true){ 
            kiter = BAS.mxiter;
          }
          
        }
        
        // DETERMINE WHICH OUTPUT IS NEEDED.
        BAS.OutputControl();
        
        // C7C4 - CALCULATE BUDGET TERMS. SAVE CELL-BY-CELL FLOW TERMS.
        if (input.BCF){ BCF.WaterBudget(kstp, kper); }
        if (input.WEL){ WEL.WaterBudget(kstp, kper); }
        if (input.DRN){ DRN.WaterBudget(kstp, kper); }
        if (input.RIV){ RIV.WaterBudget(kstp, kper); }
        if (input.RCH){ RCH.WaterBudget(kstp, kper); }
        if (input.EVT){ EVT.subroutines.WaterBudget(kstp, kper); }
        if (input.GHB){ GHB.subroutines.WaterBudget(kstp, kper); }
        
        BCF.Output(kstp, kper);
        BAS.Output(kstp, kper);
        
        
        
        // JUMP TO END OF PROGRAM IF CONVERGENCE WAS NOT ACHIEVED.
        if (BAS.icnvg == false){
          NCVGERR=1;
          
          OUT.Write('FAILURE TO MEET SOLVER CONVERGENCE CRITERIA' + '\n' +
                'BUDGET PERCENT DISCREPANCY IS ' + Math.round(OUT.budperc*10)/10 );
          if (Math.abs(OUT.budperc) > BAS.stoper){
            OUT.Write('STOPPING SIMULATION');
            BAS.Output(); // for testing purposes
            throw("FAILURE TO MEET SOLVER CONVERGENCE CRITERIA - STOPPING SIMULATION");
          }
          else{
            OUT.Write('CONTINUING EXECUTION');
          }
        }
        
        
      }
      
      
      

    } // END OF TIME STEP (kstp) AND STRESS PERIOD (kper) LOOPS
		
    BAS.DeallocateMemory();
		
		
    // END OF PROGRAM.
    if (NCVGERR > 0){
      OUT.Write('FAILED TO MEET SOLVER CONVERGENCE CRITERIA');
    }
    else{
      var end_time = (new Date).getTime();
      var run_time = end_time - start_time;
      OUT.Write('NORMAL TERMINATION OF SIMULATION');
      OUT.Write('RUN TIME: ' + run_time/1000 + " sec.");
    }
    
    
    
  }

  
  var run_init = function(){
    
    OUT.Init();
    
    // ALLOCATE AND READ (AR) PROCEDURE
    BAS.AllocateRead(input);
    if (input.BCF){ BCF.AllocateRead(input); }
    if (input.WEL){ WEL.AllocateRead(input); }
    if (input.DRN){ DRN.AllocateRead(input); }
    if (input.RCH){ RCH.AllocateRead(input); }
    if (input.RIV){ RIV.AllocateRead(input); }
    if (input.SIP){ SIP.AllocateRead(input); }
    if (input.EVT){ EVT.subroutines.AllocateRead(input); }
    if (input.GHB){ GHB.subroutines.AllocateRead(input); }
    
    return true;
    
  }
  
  run_init();
  
  return {
    run: run,
    BAS: BAS,
    BCF: BCF,
    SIP: SIP,
    WEL: WEL,
    DRN: DRN,
    RCH: RCH,
    RIV: RIV,
    EVT: EVT,
    GHB: GHB,
    OUT: OUT
  };
  
}
