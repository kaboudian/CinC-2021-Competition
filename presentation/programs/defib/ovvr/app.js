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
    env.fcolors = [] ;
    env.scolors = [] ;
    for(var i=0; i<11; i++){
        env['fcolor'+i] = new Abubu.Float32Texture( 
                env.width, env.height, { pairable : true } ) ;
        env['scolor'+i] = new Abubu.Float32Texture( 
                env.width, env.height, { pairable : true } ) ;
        env.fcolors.push(env['fcolor'+i]) ;
        env.scolors.push(env['scolor'+i]) ;
    }
    env.colors = [ ...env.fcolors, ...env.scolors ] ;

    class OvvrTargets1{
        constructor( colors ){
            for(let i=0; i<4 ; i++){
                this["ocolor"+i] = {location : i, target: colors[i]} ;
            }
        }
    }
    class OvvrTargets2{
        constructor( colors ){
            for ( let i =0 ; i< 7 ; i++){
                let j=4+i ;
                this["ocolor"+j] = { location : i, target : colors[j] } ;
            }
        }
    }

/*------------------------------------------------------------------------
 * Initial conditions  
 *------------------------------------------------------------------------
 */
    // init sets 0 to 3 ..................................................
    env.finit1 = new Abubu.Solver({
        fragmentShader : source( 'init1' ) ,
        targets : new OvvrTargets1( env.fcolors ) ,
    } ) ;
    env.sinit1 = new Abubu.Solver({
        fragmentShader : source( 'init1' ) ,
        targets : new OvvrTargets1( env.scolors ) ,
    } ) ;

    // init sets 4 to 11 .................................................
    env.finit2 = new Abubu.Solver({
        fragmentShader : source( 'init2' ) ,
        targets : new OvvrTargets2( env.fcolors ) ,
    } ) ;
    env.sinit2 = new Abubu.Solver({
        fragmentShader : source( 'init2' ) ,
        targets : new OvvrTargets2( env.scolors ) ,
    } ) ;

    // function to initialize solution ...................................
    env.initialize = function(){
        env.finit1.run() ;
        env.sinit1.run() ;
        
        env.finit2.run() ;
        env.sinit2.run() ;


        env.splot.init() ;
        env.pplot.init() ;
        env.vsgn.init(0) ;
        env.osgn.init(0) ;

        env.time = 0. ;
    }
/*------------------------------------------------------------------------
 * Initiate all coeficients 
 *------------------------------------------------------------------------
 */
    // current multipliers ...............................................
    env.currentMultipliers = [
        'C_Na',     'C_Nafast',     'C_Nalate',     'C_NaCa',   
        'C_to',     'C_CaL',        'C_CaNa',       'C_CaK',        
        'C_Kr',     'C_Ks',         'C_K1',         'C_NaCai',      
        'C_NaCass', 'C_NaKNa',      'C_NaKK',       'C_NaK',    
        'C_Nab',    'C_Kb',         'C_Cab',        'C_pCa',    
        'C_relNP',  'C_relCaMK',    'C_upNP',       'C_upCaMK', 
        'C_leak',   'C_up',         'C_tr',         'C_rel',        
        'C_diffCa', 'C_diffNa',     'C_diffK'                       ] ;
    
    // time multipliers ..................................................
    env.timeMultipliers = [
        'Ct_m',     'Ct_h',         'Ct_j',         'Ct_hCaMKslow', 
        'Ct_hslow', 'Ct_mL',        'Ct_jCaMK',     'Ct_hL', 
        'Ct_hLCaMK','Ct_a',         'Ct_ifast',     'Ct_islow', 
        'Ct_aCaMK', 'Ct_iCaMKfast', 'Ct_iCaMKslow', 'Ct_d',     
        'Ct_ffast', 'Ct_fslow',     'Ct_fCafast',   'Ct_fCaslow', 
        'Ct_jCa',   'Ct_fCaMKfast', 'Ct_fCaCaMKfast','Ct_n', 
        'Ct_xrfast','Ct_xrslow',    'Ct_xs1',       'Ct_xs2', 
        'Ct_xk1',   'Ct_relNP',     'Ct_relCaMK',   'Ct_tr', 
        'Ct_diffCa','Ct_diffNa',    'Ct_diffK',                     ] ;

    // scaling factors ...................................................
    env.scalingFactors = [
        'SGNalate' , 'SGto' ,       'SPCa',         'SGKr'     ,
        'SGKs'     , 'SGK1' ,       'SGNaCa',       'SGNaK'    , 
        'SGKb'     , 'SJrel' ,      'SJup',         'SCMDN' ] ;

    env.cellType = 2 ; // default is endocardial cells

    // model parameters ..................................................
    env.dt          = 0.05 ;        /* time step size       */
    env.ds          = 10. ;         /* domain size          */
    env.C_m         = 1. ;          /* conductance          */
    env.diffCoef    = 0.001 ;       /* diffusion            */

    env.modelFloats = [ 'dt', 'ds', 'C_m', 'diffCoef' ] ;

    // extra-cellular concentrations .....................................
    env.Na_o        = 140 ;         /* Sodium               */
    env.Ca_o        = 1.8 ;         /* Calcium              */ 
    env.K_o         = 5.4 ;         /* Potasium             */

    env.extraCellularConcentrations = [ 'Na_o', 'Ca_o', 'K_o' ] ;

    // all float uniforms to be sent to comp1 and comp2 ..................
    env.compFloats = [
        ...env.currentMultipliers,  ...env.timeMultipliers,
        ...env.scalingFactors,      ...env.modelFloats,
        ...env.extraCellularConcentrations ] ;

    env.compInts = [ 
        'cellType' ] ;
    
    // all float uniforms that need to be initialized with ones ..........
    env.oneFloats = [
        ...env.currentMultipliers,  ...env.timeMultipliers,
        ...env.scalingFactors ] ;

    // initialize values to 1.0 ..........................................
    for(let i in env.oneFloats){
        let name = env.oneFloats[i] ;
        env[name] = 1. ;
    }

    env.C_Na = 1. ;
    env['C_Na'] = 1. ;
    // Common uniforms for comp1 & comp2 solvers .........................
    class CompUniforms{
        constructor( obj, floats, ints){
            for(let i in floats ){
                let name    = floats[i] ;
                this[name]  = { type :'f', value : obj[name] } ;
            }
            for(let i in ints){
                let name    = ints[i] ;
                this[name]  = { type : 'i', value : obj[name] } ;
            }
        }
    }

    // uniforms for comp1 solvers ........................................
    class Comp1Uniforms extends CompUniforms{
        constructor( _fc, _sc ){
            super(env, env.compFloats, env.compInts) ;
            for(let i=0; i<11 ; i++){
                this['icolor'+i] = { type : 't', value : _fc[i] } ;
            }   
        }
    }

    // uniforms for comp2 solvers ........................................
    class Comp2Uniforms extends CompUniforms{
        constructor( _fc, _sc ){
            super(env, env.compFloats, env.compInts ) ; 
            // colors already updated by comp1
            for(let i=0; i<4 ; i++){
                this['icolor'+i] = { type : 't', value : _sc[i] } ;
            }
            // other colors
            for(let i=4; i<11 ; i++){
                this['icolor'+i] = { type : 't', value : _fc[i] } ;
            }
        }
    } ;

/*------------------------------------------------------------------------
 * marching steps 
 *------------------------------------------------------------------------
 */
    // comp1 solvers .....................................................
    env.fcomp1 = new Abubu.Solver({
        fragmentShader : source('comp1') ,
        uniforms : new Comp1Uniforms( env.fcolors, env.scolors ) ,
        targets : new OvvrTargets1( env.scolors ) ,
    } ) ;
    env.scomp1 = new Abubu.Solver({
        fragmentShader : source('comp1') ,
        uniforms : new Comp1Uniforms( env.scolors, env.fcolors ) ,
        targets : new OvvrTargets1( env.fcolors ) ,
    } ) ;

    // comp2 solvers .....................................................
    env.fcomp2 = new Abubu.Solver({
        fragmentShader : source( 'comp2' ) ,
        uniforms : new Comp2Uniforms( env.fcolors, env.scolors ) ,
        targets : new OvvrTargets2( env.scolors ) ,
    } ) ;

    env.scomp2 = new Abubu.Solver({
        fragmentShader : source( 'comp2' ) ,
        uniforms : new Comp2Uniforms( env.scolors, env.fcolors ) ,
        targets : new OvvrTargets2( env.fcolors ) ,
    } ) ;

    env.comps = [ env.fcomp1, env.fcomp2, env.scomp1, env.scomp2 ] ;
    // marches the solution for two time steps ...........................
    env.march = function(){
        env.fcomp1.render() ;
        env.fcomp2.render() ;
        env.scomp1.render() ;
        env.scomp2.render() ;
        env.time += 2.*env.dt ;
    } ;

/*------------------------------------------------------------------------
 * click to excite 
 *------------------------------------------------------------------------
 */
    var click = new Abubu.Solver({
        fragmentShader : source( 'click' ) ,
        uniforms : {
            inTexture       : { type : 't', value  : env.fcolor4    } ,
            clickRadius     : { type : 'f', value  : 0.1            } ,
            clickPosition   : { type : 'v2', value : [0.5,0.5]      } ,
        } ,
        targets : {
            ocolor : { location : 0 , target : env.scolor4 } ,
        }
    } ) ;
    
    var clickCopy = new Abubu.Copy( env.scolor4, env.fcolor4 ) ;
    
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
            inColor : { type : 's', value : env.fcolor4, 
                        magFilter: 'linear' } ,
            thickness  : { type : 'f', value : env.thickness   } ,
            uThreshold : { type : 'f', value : env.uThreshold  } ,
            vThreshold : { type : 'f', value : env.vThreshold  } ,
        } ,
        targets : {
            ocolor : { location : 0 , target : env.scolor4 } ,
        }
    } ) ;
    
    env.defib_s2 = new Abubu.Copy(env.scolor4, env.fcolor4) ;
    env.defibrillate = function(){
        env.defib_s1.render() ;
        env.defib_s2.render() ;
    }

/*------------------------------------------------------------------------
 * save and load file 
 *------------------------------------------------------------------------
 */

    // save file .........................................................
    env.csvFileName = 'colorsSets_0_10.csv' ;
    env.saveCsvFile = function(){
        var link = document.createElement('a') ;
        var data = "data:text;charset=utf-8," +
            env.width + ',' + 
            env.height ;
        var width   = env.width ;
        var height = env.height ;
        var fvals = {} ;
        for(let i=0;i<11; i++){
            let color = "fcolor"+i ;
            fvals[color] = env[color].value ;
        }

        for(var i=0 ; i<(width*height) ; i++){
            var indx = i*4 ;
            let rows = "" ;
            for( let j=0; j<11; j++){
                name = "fcolor"+j ;
                rows += ',' + 
                fvals[name][indx  ].toExponential()+ ',' +
                fvals[name][indx+1].toExponential()+ ',' +
                fvals[name][indx+2].toExponential()+ ',' +
                fvals[name][indx+3].toExponential() ;
            }
            data += rows ;
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
            for(var i = 0 ; i<11 ; i++){
                tabs.push( new Float32Array(width*height*4) ) ;
            }
            
            var p = 2 ;
            var indx ;

            for (var i=0 ; i< (width*height) ; i++){ // modify accordingly
                indx = i*4 ;
                for(var j=0 ; j<11 ; j++){
                    tabs[j][ indx   ] = parseFloat( data[p++]) ;
                    tabs[j][ indx+1 ] = parseFloat( data[p++]) ;
                    tabs[j][ indx+2 ] = parseFloat( data[p++]) ;
                    tabs[j][ indx+3 ] = parseFloat( data[p++]) ;
                }
             }

            for( var j=0 ; j<11; j++){
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
        target      : env.fcolor4 ,
        channel     : 'r' ,
        minValue    : -90 ,
        maxValue    : 30 ,
        colorbar    : true ,
        probeVisible: true ,
        canvas      : document.getElementById('canvas_1') ,
    } ) ;
    env.vplot.init() ;

    // tplot -------------------------------------------------------------
    env.tplot = new Abubu.Solver({
        fragmentShader : source("display") ,
        uniforms : {
            inColor     : { type : 't', value : env.fcolor4     } ,
            thickness   : { type : 'f', value : env.thickness   } ,
            uThreshold  : { type : 'f', value : env.uThreshold  } ,
            vThreshold  : { type : 'f', value : env.vThreshold  } ,
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

    env.osgn = env.splot.addSignal( env.fcolor4, {
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
    env.vsgn = env.splot.addSignal( env.fcolor4, {
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
        xcolor      : env.fcolor4 ,
        xchannel    : 'g' ,
        xmin        : -.1 ,
        xmax        : 1.1 ,
        nx          : 12, 
    
        // vertical axis info
        ycolor      : env.fcolor4 ,
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

    addToGui(mdl, env,env.modelFloats , env.comps) ;

    var crnt = mdl.addFolder("Current Multipliers") ;
    addToGui(crnt, env,env.currentMultipliers , env.comps) ;
    
    var tcst = mdl.addFolder("Time Constant Multipliers") ;
    addToGui(tcst, env,env.timeMultipliers , env.comps) ;

    var scl  = mdl.addFolder("Scaling Factors") ;
    addToGui( scl,env, env.scalingFactors, env.comps ) ;


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

