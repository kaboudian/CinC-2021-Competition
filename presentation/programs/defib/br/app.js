/*========================================================================
 * get the source code for fragment shaders
 *========================================================================
 */
function source( id ){
    return document.getElementById( id ).innerHTML ;
}
var env = {} ; // Global variable

/*========================================================================
 * loadWebGL code
 *========================================================================
 */ 
function loadWebGL(){
    env.width  = 512 ;
    env.height = 512 ;
    env.time   = 0. ;
    
/*------------------------------------------------------------------------
 * Creating tables to speed up calculations on the GPU
 *------------------------------------------------------------------------
 */
    env.noSamples = 1024 ;
    env.minVlt    = -100. ;
    env.maxVlt    = 50. ;

    var Vlt     = new Float64Array(env.noSamples) ;
    var table   = new Float32Array(env.noSamples*4) ;

    // initializing an array of voltages .................................
    for (var i=0 ; i<Vlt.length ; i++){
        Vlt[i] = (i+0.5)*(env.maxVlt - env.minVlt)/env.noSamples +
            env.minVlt ;
    }

    // coeficients of alpha and beta .....................................
    var ca_x1= [0.0005,     0.083,  50.,    0.0,
                0.0,        0.057,          1.0     ] ;

    var cb_x1= [0.0013,     -0.06,  20.,    0.0,
                0.0,        -0.04,          1.0     ] ;

    var ca_m = [0.0000,     0.0,    47.,   -1.0,
                47.,        -0.1,           -1.0    ] ;

    var cb_m = [40.,        -0.056, 72.,    0.0,
                0.0,        0.0,            0.0     ] ;

    var ca_h = [.126,       -.25,   77.,    0.0,
                0.0,        0.0,            0.0     ] ;

    var cb_h = [1.7,        0.0,    22.5,   0.0,
                0.0,        -0.082,         1.0     ] ;

    var ca_j = [.055,       -.25,   78.0,   0.0,
                0.0,        -0.2,           1.0     ] ;

    var cb_j = [.3,         0.0,    32.,    0.0,
                0.0,        -0.1,           1.0     ] ;

    var ca_d = [0.095,      -0.01,  -5.,    0.0,
                0.0,        -0.072,         1.0     ] ;

    var cb_d = [0.07,       -0.017, 44.,    0.0,
                0.0,        0.05,           1.0     ] ;

    var ca_f = [0.012,      -0.008, 28.,    0.0,
                0.0,        0.15,           1.0     ] ;

    var cb_f = [.0065,      -0.02,  30.,    0.0,
                0.0,        -0.2,           1.0     ] ;


    // function to calculate the coeficients .............................
    function abCoef(Vm,C){
        return (
            (C[0]*Math.exp(C[1]*(Vm+C[2])) + C[3]*(Vm+C[4]))/
            (Math.exp(C[5]*(Vm+C[2])) + C[6]) ) ;
    }

    /* m_inf, tau_m, h_inf, tau_h */
    var p = 0 ;
    for(var i = 0; i<env.noSamples; i++){
        var V = Vlt[i] ;

        var a_m  = abCoef(V, ca_m) ;
        var b_m  = abCoef(V, cb_m) ;
        var a_h  = abCoef(V, ca_h ) ;
        var b_h  = abCoef(V, cb_h ) ;

        /* m_inf        */
        table[ p++ ] = a_m/(a_m+b_m) ;

        /* tau_m        */
        table[ p++ ] = 1.0/(a_m+b_m) ;

        /* h_inf        */
        table[ p++ ] = a_h/(a_h + b_h) ;

        /* tau_h        */
        table[ p++ ] = 1.0/(a_h + b_h) ;
    }
    env.table1 = new Abubu.TableTexture( table, env.noSamples, 1 ) ;

    
    /* j_inf, tau_j, d_inf, tau_d */
    p = 0 ;
    for(var i = 0; i<env.noSamples; i++){
        var V = Vlt[i] ;
        var a_j = abCoef(V, ca_j ) ;
        var b_j = abCoef(V, cb_j ) ;
        var a_d = abCoef(V, ca_d ) ;
        var b_d = abCoef(V, cb_d ) ;

        /* j_inf        */
        table[ p++ ] = a_j/(a_j+b_j) ;

        /* tau_j        */
        table[ p++ ] = 1.0/(a_j+b_j) ;

        /* d_inf        */
        table[ p++ ] = a_d/(a_d+b_d) ;

        /* tau_d        */
        table[ p++ ] = 1.0/(a_d+b_d) ;
    }
    env.table2 = new Abubu.TableTexture( table, env.noSamples ) ;

    /* x1_inf, tau_x1, f_inf, tau_f */ 
    p = 0 ;
    for(var i = 0; i<env.noSamples; i++){
        var V = Vlt[i] ;
        var a_x1 = abCoef( V, ca_x1 ) ;
        var b_x1 = abCoef( V, cb_x1 ) ;
        var a_f  = abCoef( V, ca_f  ) ;
        var b_f  = abCoef( V, cb_f  ) ;

        /* x1_inf */
        table[ p++ ] = a_x1/(a_x1 + b_x1) ;
        
        /* tau_x1 */
        table[ p++ ] = 1.0/(a_x1 + b_x1 ) ;

        /* f_inf */
        table[ p++ ] = a_f/(a_f + b_f)  ;

        /* tau_f */
        table[ p++ ] = 1.0/(a_f + b_f)  ;
    }
    env.table3 = new Abubu.TableTexture( table, env.noSamples ) ;

    /* ikix */
    for(var i = 0; i<env.noSamples; i++){
        var indx = i*4 ;
        var Vm = Vlt[i] ;

        /* ik1 */
        table[ indx   ] = 0.35 *(4*(Math.exp(0.04 * (Vm + 85)) - 1) /
                (Math.exp(0.08 * (Vm + 53))
                    + Math.exp(0.04 * (Vm + 53)))
                + 0.2 * ((Vm + 23) / (1 - Math.exp(-0.04 * (Vm + 23)))));
        
        /* ix1bar */
        table[ indx+1 ] = 0.8 * ( Math.exp(0.04 * (Vm + 77)) - 1)/
                                Math.exp(0.04 * (Vm + 35));
        table[ indx+2 ] = 0.0 ;
        table[ indx+3 ] = 0.0 ;
    }

    env.table4 = new Abubu.TableTexture( table, env.noSamples ) ;

/*------------------------------------------------------------------------
 * creating textures for time stepping 
 *------------------------------------------------------------------------
 */
    env.fcolor1 = new Abubu.Float32Texture( env.width , env.height, 
    { pairable : true } ) ;
    env.fcolor2 = new Abubu.Float32Texture( env.width , env.height, 
    { pairable : true } ) ;
    env.scolor1 = new Abubu.Float32Texture( env.width , env.height, 
    { pairable : true } ) ;
    env.scolor2 = new Abubu.Float32Texture( env.width , env.height, 
    { pairable : true } ) ;

/*------------------------------------------------------------------------
 * Solvers  
 *------------------------------------------------------------------------
 */
    // Applying initial conditions .......................................
    env.init = new Abubu.Solver({
        fragmentShader : source('init') ,
        targets : {
            fcolor1 : { location : 0 , target : env.fcolor1 } ,
            fcolor2 : { location : 1 , target : env.fcolor2 } ,
            scolor1 : { location : 2 , target : env.scolor1 } ,
            scolor2 : { location : 3 , target : env.scolor2 } ,
        } 
    } ) ;


    // function to initialize solution ...................................
    env.initialize = function(){
        env.init.run() ;
         env.splot.init() ;
         env.pplot.init() ;
        env.vsgn.init(0) ;
        env.osgn.init(0) ;
        env.time = 0. ;
    }

    // compute solvers ...................................................
    env.dt = 0.05 ;
    env.Ct_d = 1. ;
    env.Ct_f = 1. ;
    var compUniforms = function(_c1,_c2){
        this.inColor1 = { type : 't', value : _c1 } ;
        this.inColor2 = { type : 't', value : _c2 } ;
        this.inTable1 = { type : 't', value : env.table1 } ;
        this.inTable2 = { type : 't', value : env.table2 } ;
        this.inTable3 = { type : 't', value : env.table3 } ;
        this.inTable4 = { type : 't', value : env.table4 } ;
        this.dt       = { type : 'f', value : env.dt } ;
        this.diffCoef = { type : 'f', value : 0.001 } ;
        this.minVlt   = { type : 'f', value : env.minVlt } ;
        this.maxVlt   = { type : 'f', value : env.maxVlt } ;
        this.Ct_f   = { type : 'f', value : env.Ct_f } ;
        this.Ct_d   = { type : 'f', value : env.Ct_d } ;
    } ;
    var compTargets = function(_c1, _c2 ){
        this.outColor1 = {location : 0 , target : _c1 } ;
        this.outColor2 = {location : 1 , target : _c2 } ;
    } ;

    env.fcomp = new Abubu.Solver({
        fragmentShader : source('comp') ,
        uniforms : new compUniforms( env.fcolor1, env.fcolor2 ) ,
        targets : new compTargets( env.scolor1, env.scolor2 ) ,
    } ) ;
    env.scomp = new Abubu.Solver({
        fragmentShader : source('comp') ,
        uniforms : new compUniforms( env.scolor1, env.scolor2 ) ,
        targets : new compTargets( env.fcolor1, env.fcolor2 ) ,
    } ) ;

    env.march = function(){
        env.fcomp.render() ;
        env.scomp.render() ;
        env.time += 2.*env.dt ;
    } ;

/*------------------------------------------------------------------------
 * click to excite 
 *------------------------------------------------------------------------
 */
    var click = new Abubu.Solver({
        fragmentShader : source( 'click' ) ,
        uniforms : {
            inTexture       : { type : 't', value  : env.fcolor1    } ,
            clickRadius     : { type : 'f', value  : 0.1            } ,
            clickPosition   : { type : 'v2', value : [0.5,0.5]      } ,
        } ,
        targets : {
            ocolor : { location : 0 , target : env.scolor1 } ,
        }
    } ) ;
    
    var clickCopy = new Abubu.Copy( env.scolor1, env.fcolor1 ) ;
    
    var mouseDrag_1 = new Abubu.MouseListener({
        canvas : document.getElementById('canvas_1') ,
        event : 'drag' ,
        callback : function(e){
            click.uniforms.clickPosition.value = e.position ;
            click.render() ;
            clickCopy.render() ;
        }
    } ) ; 

    var mouseDrag_2 = new Abubu.MouseListener({
        canvas : document.getElementById('canvas_2') ,
        event : 'drag' ,
        callback : function(e){
            click.uniforms.clickPosition.value = e.position ;
            click.render() ;
            clickCopy.render() ;
        }
    } ) ; 

/*------------------------------------------------------------------------
 * shift-click to set probe position 
 *------------------------------------------------------------------------
 */

    var setProbe_1 = new Abubu.MouseListener({
        canvas : document.getElementById('canvas_1') ,
        event  : 'click' ,
        shift  : true ,
        callback : function(e){
            env.pplot.probePosition = e.position ;
            env.pplot.init() ;
            env.vplot.setProbePosition(e.position) ;
            env.splot.setProbePosition(e.position) ;
            env.splot.init() ;
            env.pplot.init() ;
            env.vplot.init() ;
        }
    } ) ;

    var setProbe_2 = new Abubu.MouseListener({
        canvas : document.getElementById('canvas_2') ,
        event  : 'click' ,
        shift  : true ,
        callback : function(e){
            env.pplot.probePosition = e.position ;
            env.pplot.init() ;
            env.vplot.setProbePosition(e.position) ;
            env.splot.setProbePosition(e.position) ;
            env.splot.init() ;
            env.pplot.init() ;
            env.vplot.init() ;
        }
    } ) ;

/*------------------------------------------------------------------------
 * defibrilate 
 *------------------------------------------------------------------------
 */
    env.defib = {} ;
    env.thickness  = 0.05 ;
    env.uThreshold = -20 ;
    env.vThreshold = 0.45 ;

    env.defib_s1 = new Abubu.Solver({
        fragmentShader : source('defib') ,
        uniforms :{
            inColor : { type : 's', value : env.fcolor1, 
                        magFilter: 'linear' } ,
            thickness  : { type : 'f', value : env.thickness   } ,
            uThreshold : { type : 'f', value : env.uThreshold  } ,
            vThreshold : { type : 'f', value : env.vThreshold  } ,
        } ,
        targets : {
            ocolor : { location : 0 , target : env.scolor1 } ,
        }
    } ) ;
    
    env.defib_s2 = new Abubu.Copy(env.scolor1, env.fcolor1) ;
    env.defibrillate = function(){
        env.defib_s1.render() ;
        env.defib_s2.render() ;
    }
/*------------------------------------------------------------------------
 * save and load file 
 *------------------------------------------------------------------------
 */

    // save file .........................................................
    env.csvFileName = 'fcolor1_2.csv' ;
    env.saveCsvFile = function(){
        var link = document.createElement('a') ;
        var data = "data:text;charset=utf-8," +
            env.fcolor1.width + ',' + 
            env.fcolor1.height ;
        var width = env.fcolor1.width ;
        var height = env.fcolor1.height ;
        var f1val = env.fcolor1.value ;
        var f2val = env.fcolor2.value ;

        for(var i=0 ; i<(width*height) ; i++){
            var indx = i*4 ;
            data += ','+ 
                f1val[indx  ].toExponential()+ ',' +
                f1val[indx+1].toExponential()+ ',' +
                f1val[indx+2].toExponential()+ ',' +
                f1val[indx+3].toExponential()+ ',' +
                f2val[indx  ].toExponential()+ ',' +
                f2val[indx+1].toExponential()+ ',' +
                f2val[indx+2].toExponential()+ ',' +
                f2val[indx+3].toExponential() ;
        }
        
        var csv = encodeURI( data ) ;
        link.setAttribute( 'href', csv ) ;
        link.setAttribute( 'download', env.csvFileName ) ;
        link.click() ;
    }

    // load file .........................................................
    env.loadCsvFile = document.createElement('input') ;
    env.loadCsvFile.setAttribute('type', 'file') ;
    env.loadCsvFile.onchange = function(){
        /* check if a no file was selected */
        if ( !env.loadCsvFile.files[0] ){        
            return ;
        } ;
    
        var file = env.loadCsvFile.files[0] ;
        var reader = new FileReader() ;
        reader.readAsText(file) ;
    
        // only the when the file is loaded it can be analyzed
        reader.onload = function(event){
            var result  = event.target.result ;
            var data = result.split(',') ;
    
            var width = parseInt(data[0]) ;
            var height = parseInt(data[1]) ;
    
            var table1 = new Float32Array(width*height*4) ;
            var table2 = new Float32Array(width*height*4) ;
            var p = 2 ;
            var indx ;
            for (var i=0 ; i< (width*height) ; i++){ // modify accordingly
                indx = i*4 ;
                table1[ indx   ] = parseFloat( data[p++]) ;
                table1[ indx+1 ] = parseFloat( data[p++]) ;
                table1[ indx+2 ] = parseFloat( data[p++]) ;
                table1[ indx+3 ] = parseFloat( data[p++]) ;
                table2[ indx   ] = parseFloat( data[p++]) ;
                table2[ indx+1 ] = parseFloat( data[p++]) ;
                table2[ indx+2 ] = parseFloat( data[p++]) ;
                table2[ indx+3 ] = parseFloat( data[p++]) ;
            }
    
            env.fcolor1.data = table1 ;
            env.scolor1.data = table1 ;

            env.fcolor2.data = table2 ;
            env.scolor2.data = table2 ;
        }
    }
    
/*------------------------------------------------------------------------
 * Postprocessing 
 *------------------------------------------------------------------------
 */
    // voltage plot ------------------------------------------------------
    env.vplot = new Abubu.Plot2D({
        target : env.fcolor1 ,
        channel: 'r' ,
        minValue : -90 ,
        maxValue : 30 ,
        colorbar : true ,
        probeVisible : true ,
        canvas : document.getElementById('canvas_1') ,
    } ) ;
    env.vplot.init() ;

    // tplot -------------------------------------------------------------
    env.tplot = new Abubu.Solver({
        fragmentShader : source("display") ,
        uniforms : {
            inColor : { type : 't', value : env.fcolor1 } ,
            thickness  : { type : 'f', value : env.thickness   } ,
            uThreshold : { type : 'f', value : env.uThreshold  } ,
            vThreshold : { type : 'f', value : env.vThreshold  } ,
        } ,
        canvas :  document.getElementById('canvas_2') 
    } ) ;

    // signal plots ------------------------------------------------------
    env.splot = new Abubu.SignalPlot({
        noPltPoints : 1024, // number of sample points
        grid : 'on', 
        nx   : 10 , // number of division in x 
        ny   : 12 , // ... in y 

        xticks : {  mode : 'auto', unit : 'ms', font : '11pt Times' } ,
        yticks : {  mode : 'auto', unit : '' , 
                    font : '12pt Times',precision : 1  } ,
        canvas : document.getElementById('canvas_3') 
    } ) ;

    env.osgn = env.splot.addSignal( env.fcolor1, {
            channel : 'a',
            minValue : -.1,
            maxValue : 1.1 ,
            restValue : 0. ,
            color : [ 0.3,0.,0.0 ],
            visible : true ,
            timewindow : 1000 , 
            probePosition : [0.5,0.5] 
    } ) ;

    // voltage signal ....................................................
    env.vsgn = env.splot.addSignal( env.fcolor1, {
            channel : 'r',
            minValue : -90,
            maxValue : 30 ,
            restValue : -83.0 ,
            color : [ 0.,.4,0.0 ],
            visible : true ,
            timewindow : 1000 , 
            probePosition : [0.5,0.5] 
    } ) ;


    env.splot.init() ;
    env.vsgn.init(0) ;
    env.osgn.init(0) ;

    // phase plot --------------------------------------------------------
    env.pplot = new Abubu.PhasePlot({
        canvas : document.getElementById('canvas_4') ,
        grid : 'on',
        probePosition : [0.5,0.5], 
    
        // horizontal axis info
        xcolor      : env.fcolor1 ,
        xchannel    : 'a' ,
        xmin        : -.5 ,
        xmax        : 1.5 ,
        nx          : 10, 
    
        // vertical axis info
        ycolor      : env.fcolor1 ,
        ychannel    : 'r' ,
        ymin        : -90 ,
        ymax        : 30 ,
        ny          : 12, 
    
        // xticks
        xticks : {  
            mode : 'auto', 
            unit : '', 
            font : '11pt Times' , precision : 2 } ,
        
        // yticks
        yticks : {  
            mode : 'auto', unit : '', font : '11pt Times', 
            precision : 1 } ,
    }) ; 

    // updateSignals -----------------------------------------------------
    env.updateSignals= function(){
        env.vsgn.update(env.time) ;
        env.osgn.update(env.time) ;
    }

    // refreshDisplay ----------------------------------------------------
    env.refreshDisplay = function(){
        env.pplot.render() ;
        env.vplot.render() ;
        env.splot.render() ;
        env.tplot.render() ;
    }

/*------------------------------------------------------------------------
 * Run sequence
 *------------------------------------------------------------------------
 */
    env.skip = 30 ;
    env.running = false ;
    env.run = function(){
        if (env.running){
            for(var i = 0 ; i<env.skip ; i++){
                env.march() ;
                env.updateSignals() ; 

                if ( i%5 === 0 ){
                    env.pplot.update() ;
                }
            }
        }
        env.refreshDisplay() ;
        requestAnimationFrame(env.run) ;
    }

    createGui() ;

    env.initialize() ;
    env.run() ;
}

/*========================================================================
 * add multiple parameters to the GUI
 *========================================================================
 */ 
function addToGui( 
        guiElemenent ,  // gui element to add options into
        obj,            // object that holds parameters
        paramList,      // array of strings that contains list 
                        // of parmeters to be added
        solverList      // array of solvers that need to be update upon 
                        // change of a parameter through gui interactions
    ){
    var elements = {} ;
    for(i in paramList){
        var param = paramList[i] ;
        elements[param] = guiElemenent.add(obj, param )  ;
        elements[param].onChange(function(){
            console.log(this) ;
            Abubu.setUniformInSolvers( 
                    this.property , // this refers to the GUI element 
                    this.object[this.property] , 
                    solverList ) ;
        } ) ;
    }
    return elements ;
}

/*========================================================================
 * createGui
 *========================================================================
 */ 
function createGui(){
    var gui = new Abubu.Gui() ;     /*  create a graphical user 
                                        interface               */
    var panel = gui.addPanel() ;    /*  add a panel to the GUI  */

    // model parameters ..................................................
    var mdl = panel.addFolder("Model Parameters") ;
    addToGui(mdl, env,[ "Ct_f", 'Ct_d' ], [env.fcomp, env.scomp] ) ;

    // defibrilation -----------------------------------------------------
    var dfb = panel.addFolder("Defibrillation") ;
    dfb.elements = addToGui( dfb, env, 
        [
            "thickness" ,
            "uThreshold" ,
            "vThreshold" 
        ] , [ env.defib_s1, env.tplot ] ) ;
   
    dfb.add(env,'defibrillate') ;
    dfb.open() ;
    
    // csv files ---------------------------------------------------------
    var csv = panel.addFolder('Save and Load CSV') ;
    csv.add(env,'csvFileName' ) ;
    csv.add(env,'saveCsvFile' ) ;
    csv.add(env.loadCsvFile , 'click').name('loadCsvFile') ;

    // execution .........................................................
    var exe = panel.addFolder('Execution') ;
    exe.add(env,'time').listen() ;
    exe.add(env,'skip') ;
    exe.add(env,'initialize') ;
    exe.add(env,'running') ;
    exe.open() ;
}

