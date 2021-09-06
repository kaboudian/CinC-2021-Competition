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
 * creating textures for time stepping 
 *------------------------------------------------------------------------
 */
    env.fcolor0 = new Abubu.Float32Texture( env.width, env.height ) ;
    env.fcolor1 = new Abubu.Float32Texture( env.width, env.height ) ;
    env.fcolor2 = new Abubu.Float32Texture( env.width, env.height ) ;
    env.fcolor3 = new Abubu.Float32Texture( env.width, env.height ) ;
    env.fcolor4 = new Abubu.Float32Texture( env.width, env.height ) ;

    env.scolor0 = new Abubu.Float32Texture( env.width, env.height ) ;
    env.scolor1 = new Abubu.Float32Texture( env.width, env.height ) ;
    env.scolor2 = new Abubu.Float32Texture( env.width, env.height ) ;
    env.scolor3 = new Abubu.Float32Texture( env.width, env.height ) ;
    env.scolor4 = new Abubu.Float32Texture( env.width, env.height ) ;

    env.fcolors = 
        [   env.fcolor0, 
            env.fcolor1, 
            env.fcolor2, 
            env.fcolor3, 
            env.fcolor4 ] ;
    env.scolors = 
        [   env.scolor0, 
            env.scolor1, 
            env.scolor2, 
            env.scolor3, 
            env.scolor4 ] ;

    env.colors = [ ...env.fcolors, ...env.scolors ] ;
    for(var i=0; i< env.colors.length ; i++){
        env.colors[i].pairable = true ;
    }

    function TpTargets( colors ){
        this.ocolor0 = { location : 0 , target : colors[0] } ;
        this.ocolor1 = { location : 1 , target : colors[1] } ;
        this.ocolor2 = { location : 2 , target : colors[2] } ;
        this.ocolor3 = { location : 3 , target : colors[3] } ;
        this.ocolor4 = { location : 4 , target : colors[4] } ;
    }
/*------------------------------------------------------------------------
 * Initial conditions  
 *------------------------------------------------------------------------
 */
    env.finit = new Abubu.Solver({
        fragmentShader : source('init') ,
        targets : new TpTargets( env.fcolors ) , 
    } ) ;
    env.sinit = new Abubu.Solver({
        fragmentShader : source('init') ,
        targets : new TpTargets( env.scolors ) ,
    } ) ;

    // function to initialize solution ...................................
    env.initialize = function(){
        env.finit.run() ;
        env.sinit.run() ;

        env.splot.init() ;
        env.pplot.init() ;
        env.vsgn.init(0) ;
        env.osgn.init(0) ;

        env.time = 0. ;
    }

/*------------------------------------------------------------------------
 * marching steps 
 *------------------------------------------------------------------------
 */
    env.ds_x        =   12 ;
    env.ds_y        =   12 ;
    env.C_Na        =   1.0 ;
    env.C_NaCa      =   1.0 ;
    env.C_to        =   1.0 ;
    env.C_CaL       =   1.0 ;
    env.C_Kr        =   1.0 ;
    env.C_Ks        =   1.0 ;
    env.C_K1        =   1.0 ;
    env.C_NaK       =   1.0 ;
    env.C_bNa       =   1.0 ;
    env.C_pK        =   1.0 ;
    env.C_bCa       =   1.0 ;
    env.C_pCa       =   1.0 ;
    env.C_leak      =   1.0 ;
    env.C_up        =   1.0 ;
    env.C_rel       =   1.0 ;
    env.C_xfer      =   1.0 ;
    env.dt          = 0.05 ;
    env.capacitance = 0.185,
    env.C_m         = 1.0 ;
    env.diffCoef    = 0.001 ;
    env.cellType    = 0 ; // mid : 0, epi:1, endo :2 

    // uniforms to be sent to the two marching solvers
    var compUniforms = function(_cs){
        this.icolor0    = { type : 't', value : _cs[0]          } ;
        this.icolor1    = { type : 't', value : _cs[1]          } ;
        this.icolor2    = { type : 't', value : _cs[2]          } ;
        this.icolor3    = { type : 't', value : _cs[3]          } ;
        this.icolor4    = { type : 't', value : _cs[4]          } ;
        this.ds_x       = { type : 'f', value : env.ds_x        } ;
        this.ds_y       = { type : 'f', value : env.ds_y        } ;
        this.C_Na       = { type : 'f', value : env.C_Na        } ;
        this.C_NaCa     = { type : 'f', value : env.C_NaCa      } ;
        this.C_to       = { type : 'f', value : env.C_to        } ;
        this.C_CaL      = { type : 'f', value : env.C_CaL       } ;
        this.C_Kr       = { type : 'f', value : env.C_Kr        } ;
        this.C_Ks       = { type : 'f', value : env.C_Ks        } ;
        this.C_K1       = { type : 'f', value : env.C_K1        } ;
        this.C_NaK      = { type : 'f', value : env.C_NaK       } ;
        this.C_bNa      = { type : 'f', value : env.C_bNa       } ;
        this.C_pK       = { type : 'f', value : env.C_pK        } ;
        this.C_bCa      = { type : 'f', value : env.C_bCa       } ;
        this.C_pCa      = { type : 'f', value : env.C_pCa       } ;
        this.C_leak     = { type : 'f', value : env.C_leak      } ;
        this.C_up       = { type : 'f', value : env.C_up        } ;
        this.C_rel      = { type : 'f', value : env.C_rel       } ;
        this.C_xfer     = { type : 'f', value : env.C_xfer      } ;
        this.dt         = { type : 'f', value : env.dt          } ;
        this.capacitance= { type : 'f', value : env.capacitance } ;
        this.C_m        = { type : 'f', value : env.C_m         } ;
        this.diffCoef   = { type : 'f', value : env.diffCoef    } ;
        this.cellType   = { type : 'i', value : env.cellType    } ;
    } ;

    // reads fcolors and writes scolors ..................................
    env.fcomp = new Abubu.Solver({
        fragmentShader : source('comp') ,
        uniforms : new compUniforms( env.fcolors ) ,
        targets : new TpTargets( env.scolors ) ,
    } ) ;

    // reads scolors and writes fcolors ..................................
    env.scomp = new Abubu.Solver({
        fragmentShader : source('comp') ,
        uniforms : new compUniforms( env.scolors ) ,
        targets : new TpTargets( env.fcolors ) ,
    } ) ;

    // marches the solution for two time steps ...........................
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
            inTexture       : { type : 't', value  : env.fcolor0    } ,
            clickRadius     : { type : 'f', value  : 0.1            } ,
            clickPosition   : { type : 'v2', value : [0.5,0.5]      } ,
        } ,
        targets : {
            ocolor : { location : 0 , target : env.scolor1 } ,
        }
    } ) ;
    
    var clickCopy = new Abubu.Copy( env.scolor1, env.fcolor0 ) ;
    
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
    env.vThreshold = 0.25 ;

    env.defib_s1 = new Abubu.Solver({
        fragmentShader : source('defib') ,
        uniforms :{
            inColor : { type : 's', value : env.fcolor0, 
                        magFilter: 'linear' } ,
            thickness  : { type : 'f', value : env.thickness   } ,
            uThreshold : { type : 'f', value : env.uThreshold  } ,
            vThreshold : { type : 'f', value : env.vThreshold  } ,
        } ,
        targets : {
            ocolor : { location : 0 , target : env.scolor0 } ,
        }
    } ) ;
    
    env.defib_s2 = new Abubu.Copy(env.scolor0, env.fcolor0) ;
    env.defibrillate = function(){
        env.defib_s1.render() ;
        env.defib_s2.render() ;
    }
/*------------------------------------------------------------------------
 * save and load file 
 *------------------------------------------------------------------------
 */

    // save file .........................................................
    env.csvFileName = 'colorsSets_0_4.csv' ;
    env.saveCsvFile = function(){
        var link = document.createElement('a') ;
        var data = "data:text;charset=utf-8," +
            env.fcolor0.width + ',' + 
            env.fcolor0.height ;
        var width = env.fcolor0.width ;
        var height = env.fcolor0.height ;
        var f0 = env.fcolor0.value ;
        var f1 = env.fcolor1.value ;
        var f2 = env.fcolor2.value ;
        var f3 = env.fcolor3.value ;
        var f4 = env.fcolor4.value ;

        for(var i=0 ; i<(width*height) ; i++){
            var indx = i*4 ;
            data += ','+ 
                f0[indx  ].toExponential()+ ',' +
                f0[indx+1].toExponential()+ ',' +
                f0[indx+2].toExponential()+ ',' +
                f0[indx+3].toExponential()+ ',' +
                f1[indx  ].toExponential()+ ',' +
                f1[indx+1].toExponential()+ ',' +
                f1[indx+2].toExponential()+ ',' +
                f1[indx+3].toExponential()+ ',' +
                f2[indx  ].toExponential()+ ',' +
                f2[indx+1].toExponential()+ ',' +
                f2[indx+2].toExponential()+ ',' +
                f2[indx+3].toExponential()+ ',' +
                f3[indx  ].toExponential()+ ',' +
                f3[indx+1].toExponential()+ ',' +
                f3[indx+2].toExponential()+ ',' +
                f3[indx+3].toExponential()+ ',' +
                f4[indx  ].toExponential()+ ',' +
                f4[indx+1].toExponential()+ ',' +
                f4[indx+2].toExponential()+ ',' +
                f4[indx+3].toExponential() ;
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
    
            var tabs = [] ;
            for(var i = 0 ; i<5 ; i++){
                tabs.push( new Float32Array(width*height*4) ) ;
            }
            
            var p = 2 ;
            var indx ;

            for (var i=0 ; i< (width*height) ; i++){ // modify accordingly
                indx = i*4 ;
                for(var j=0 ; j< 5 ; j++){
                    tabs[j][ indx   ] = parseFloat( data[p++]) ;
                    tabs[j][ indx+1 ] = parseFloat( data[p++]) ;
                    tabs[j][ indx+2 ] = parseFloat( data[p++]) ;
                    tabs[j][ indx+3 ] = parseFloat( data[p++]) ;
                }
             }

            for( var j=0 ; j<5; j++){
                env.fcolors[j].data = tabs[j] ;
                env.scolors[j].data = tabs[j] ;
            }
        }
    }
    
/*------------------------------------------------------------------------
 * Postprocessing 
 *------------------------------------------------------------------------
 */
    // voltage plot ------------------------------------------------------
    env.vplot = new Abubu.Plot2D({
        target : env.fcolor0 ,
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
            inColor : { type : 't', value : env.fcolor0 } ,
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

    env.osgn = env.splot.addSignal( env.fcolor0, {
            channel : 'g',
            minValue : -.1,
            maxValue : 1.1 ,
            restValue : 0. ,
            color : [ 0.3,0.,0.0 ],
            visible : true ,
            timewindow : 1000 , 
            probePosition : [0.5,0.5] 
    } ) ;

    // voltage signal ....................................................
    env.vsgn = env.splot.addSignal( env.fcolor0, {
            channel : 'r',
            minValue : -90,
            maxValue : 30 ,
            restValue : -83.0 ,
            color : [ 0.,.4,0.0 ],
            visible : true ,
            timewindow : 1000 , 
            probePosition : [0.5,0.5] 
    } ) ;

    // updateSignals -----------------------------------------------------
    env.updateSignals= function(){
        env.vsgn.update(env.time) ;
        env.osgn.update(env.time) ;
    }

    // phase plot --------------------------------------------------------
    env.pplot = new Abubu.PhasePlot({
        canvas : document.getElementById('canvas_4') ,
        grid : 'on',
        probePosition : [0.5,0.5], 
    
        // horizontal axis info
        xcolor      : env.fcolor0 ,
        xchannel    : 'g' ,
        xmin        : -.1 ,
        xmax        : 1.1 ,
        nx          : 12, 
    
        // vertical axis info
        ycolor      : env.fcolor0 ,
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
                if( i%5 === 0 ){
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
    addToGui(mdl, env,[ ], [env.fcomp, env.scomp] ) ;

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

