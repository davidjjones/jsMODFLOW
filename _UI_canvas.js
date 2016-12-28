  
function UI(){
  var canvas;
  var model;
  
  var data_array, layNum=1, fillMin=0, fillMax=0;
  
  
  
  var ColorEngine = new (function(){
    
    var rainbow = new Rainbow(); // by default, range is 0 to 100
		rainbow.setSpectrum('green', 'yellow', 'red');
		
    
    var setScale = function(min, max){
      
      // Get min and max:
      var findmin = false;
      var findmax = false;
      var noflow = 9999.990234375;
      var e = noflow*1e-7;
      if (typeof min != "number") { findmin = true; min=Infinity;}
      if (typeof max != "number") { findmax = true; max=-Infinity;}
      if (findmin || findmax){
        var k=0;
        for (var k=0; k<model.BAS.nlay; k++){
          for (var i=0; i<model.BAS.nrow; i++){
            for (var j=0; j<model.BAS.ncol; j++,k++){
              
              if (findmin && min > data_array[k] 
               && Math.abs(data_array[k]-noflow)>e) min = data_array[k];
              if (findmax && max < data_array[k] 
               && Math.abs(data_array[k]-noflow)>e) max = data_array[k];
               
            }
          }
        }
      }
      if (max == min){ max++; min--;}
      
      //
      rainbow.setNumberRange(min, max);
      
      
    }
    
    var setScaleFromArray = function(array){
      
      var min = Infinity;
      var max = -Infinity;
      
      var noflow = 9999.990234375;
      var e = noflow*1e-7;
      
      for (var i=0, len=array.length; i<len; i++){
        if (array[i]<min && Math.abs(array[i]-noflow)>e) min = array[i];
        if (array[i]>max && Math.abs(array[i]-noflow)>e) max = array[i];
      }
      
      setScale(min, max)
      
    }
    
    var colorAt = function(value){
      return rainbow.colourAt( value );
    }
    
    return {
      setScale: setScale,
      setScaleFromArray: setScaleFromArray,
      colorAt: colorAt
    }
    
  })();
  
  
  var ViewEngine = new (function(){
    
    // top_y, right_x, bottom_y, left_x
    var model_view; // [0,0,0,0];
    var canvas_width;
    var canvas_height;
    var scale;
    
    
    var zoomFit = function(){
      
      // update canvas width and height
      canvas_width = canvas.width;
      canvas_height = canvas.height;
      
      
      // determine the model width and height
      var model_width=0;
      var model_height=0;
      for (var j=0; j<model.BAS.ncol; j++) model_width  += model.BAS.delr[j];
      for (var i=0; i<model.BAS.nrow; i++) model_height += model.BAS.delc[i];
      
      
      // keep the same scales in the x and y direction
      var xScale = model_width/canvas_width;
      var yScale = model_height/canvas_height;
      
      
      if (xScale > yScale){
        var vertical_padding = (xScale - yScale)*canvas_height;
        model_view = [-vertical_padding/2, model_width, model_height+vertical_padding/2, 0];
        scale = xScale;
      }
      else{
        var horizontal_padding = (yScale - xScale)*canvas_width;
        model_view = [0, model_width+horizontal_padding/2, model_height, -horizontal_padding/2];
        scale = yScale;
      }
      
      
    }
    
    var getScale = function(){
      return scale;
    }
    
    var getTopLeft = function(){
      return [model_view[0], model_view[3]];
    }
    
    return {
      zoomFit: zoomFit,
      getScale: getScale,
      getTopLeft: getTopLeft
    }
    
  })();
  
  
  var render = function() {
    
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height)
    
    var scale  = ViewEngine.getScale();
    var factor = 1/scale;
    
    
    // Add a box for each model cell:
    var topLeft = ViewEngine.getTopLeft();
    
    
    var x=0;
    var y=0;
    var n=0;
    
    n = (layNum-1)*model.BAS.nrow*model.BAS.ncol;
    
    y = -topLeft[0];
    for (var i=0; i<model.BAS.nrow; i++){
      var dy = model.BAS.delc[i];
      x = -topLeft[1];
      for (var j=0; j<model.BAS.ncol; j++){
        var dx = model.BAS.delr[j];
        
        var value = data_array[n];
        var hnoflo = model.BAS.hnoflo;
        if (Math.abs(value-hnoflo)> 1e-7*hnoflo){
        
          ctx.fillStyle = ("#" + ColorEngine.colorAt(value) );
          ctx.fillRect( Math.floor(x*factor), 
                        Math.floor(y*factor), 
                        Math.ceil(dx*factor), 
                        Math.ceil(dy*factor) );
        
        }
        
        n++;
        
        x+=dx;
      }
      y+=dy;
    }
    
    
  }
  
  
  
  var applyColorScheme = function(_data_array, min, max){
    data_array = _data_array;
    
    if (typeof min == "number" && typeof max == "number"){
      ColorEngine.setScale(min, max);
    }
    else{
      ColorEngine.setScaleFromArray(data_array);
    }
    
    
    render();
    
  }
  
  
  
  var initUI = function (nodeId, _model){
    
    model = _model;
    var containingNode = document.getElementById(nodeId);
    
    
    var domConst = function (elem, options, appendTo){
      
      var newNode = document.createElement(elem);
      
      if (typeof options == "object"){
        for (var key in options){
          var val = options[key];
          if (key == "innerHTML"){
            newNode.innerHTML = val;
          }
          else{
            newNode.setAttribute(key, val);
          }
        }
      }
      
      if (typeof appendTo == "string"){
        appendTo = document.getElementById(appendTo);
      }
      if (typeof appendTo == "object"){
        appendTo.appendChild(newNode);
      }
      
      return newNode;
      
    }
    
    containingNode.innerHTML = "";
    canvas = domConst("canvas", {width:"500px", height:"500px"}, containingNode);
    
    
    
    ViewEngine.zoomFit();
    ColorEngine.setScale(0,100);
    
  };
  
  
  var UI = this;
  UI.applyColorScheme = applyColorScheme;
  UI.render = render;
  UI.initUI = initUI;
  
  return UI;
  
}