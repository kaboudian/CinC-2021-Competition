"use strict" ;

/*========================================================================
 * get the source code for fragment shaders
 *========================================================================
 */
function source( sid ){
    return  document.getElementById( sid ).innerHTML.trim() ;
}
/*========================================================================
 * Global Parameters
 *========================================================================
 */
let env = {} ;

/*========================================================================
 * loadWebGL code
 *========================================================================
 */ 
function loadWebGL(){
    env.width  = 512 ;
    env.height = 512 ;
    env.time   = 0. ;
    env.allTxtrs = [] ;

/*------------------------------------------------------------------------
 * domain and direction calculations 
 *------------------------------------------------------------------------
 */
    env.fdomain = new Abubu.Float32Texture( env.width, env.height ,
            { pairable : true } ) ;
    env.sdomain = new Abubu.Float32Texture( env.width, env.height ,
            { pairable : true } ) ;
    
    env.domain = env.fdomain ;

    env.initDomain = new Abubu.Solver({
        fragmentShader : source( 'initDomain' ) ,
        targets : { 
            domain0 : { location : 0 , target : env.fdomain }, 
            domain1 : { location : 1 , target : env.sdomain } 
        }
    } ) ;
    env.initDomain.render() ;

/*------------------------------------------------------------------------
 * directionator 
 *------------------------------------------------------------------------
 */
    env.dir0 = new Abubu.Uint32Texture( env.width, env.height ) ;
    env.dir1 = new Abubu.Uint32Texture( env.width, env.height ) ;


    env.idir0 = env.dir0 ;
    env.idir1 = env.dir1 ;

    env.zeroFluxDirections = new Abubu.Solver({
        fragmentShader : source('zeroFluxDirections'),
        uniforms : {
            domain : { type : 's', value : env.domain, minFilter : 'nearest', magFilter : 'nearest' } ,
        } ,
        targets : { 
            odir0 : { location : 0, target : env.idir0 } ,
            odir1 : { location : 1, target : env.idir1 } ,
        }
    } ) ;
    env.zeroFluxDirections.render() ;
            
    env.allTxtrs.push( 'domain','idir0','idir1') ;

/*------------------------------------------------------------------------
 * creating textures for time stepping 
 *------------------------------------------------------------------------
 */
    env.fcolors = [] ;
    env.scolors = [] ;
    for(let i=0; i<11; i++){
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

    env._cellType = 2 ; // default is endocardial cells



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

    // Cells .............................................................
    class Sets{
        constructor(no){
            this.floats = [ 
                'SGNalate', 'SGto'    ,  'SPCa'    ,  'SGKr'    , 
                'SGKs'    , 'SGK1'    , 'SGNaCa'  ,   'SGNaK'   , 
                'SGKb'    , 'SJrel'   , 'SJup'    , 'SCMDN'   , 
            ] ;
            this.list = [ 
                    'Mid-Myocardium','Epicardium', 'Endocardium', ] ;
            this.number = no ;

        } // end of constructor

        get number(){
            return this._no ;
        }
        set number(no){
            this._no = no ;
            switch (this.number){
                case 0: // Mid-Myocardium
                    this._value = [
                        1.0 , 4.0 , 2.5 , 0.8 , 1.0 , 1.3 , 
                        1.5 , 0.7 , 1.0 , 1.7 , 1.0 , 1.0 ,
                    ] ;
                    break ;
                case 1: // Epicardium
                    this._value = [ 
                        0.6 , 4.0 , 1.2 , 1.3 , 1.4 , 1.2 ,
                        1.1 , 0.9 , 0.6 , 1.0 , 1.3 , 1.3 ,
                    ] ;
                    break ;
                case 2: // Endocardium
                    this._value = [
                        1.0 , 1.0 , 1.0 , 1.0 , 1.0 , 1.0 ,
                        1.0 , 1.0 , 1.0 , 1.0 , 1.0 , 1.0 ,
                    ] ;
                    break ;
            } // end of switch statement
            for(let i in this.floats){
                let name  = this.floats[i] ;
                env[name] = this._value[i] ;
            }
        }// end of set number

        get name(){
            return this.list[this.number] ;
        }
        set name(n){
            for(let i=0; i < this.list.length; i++){
                if(this.list[i] == n){
                    this.number = i ;
                }
            }
        }
        updateSolvers(){
            for(let name of this.floats){
                env.fcomp1.uniforms[name].value = env[name] ;
                env.scomp1.uniforms[name].value = env[name] ;
                env.fcomp2.uniforms[name].value = env[name] ;
                env.scomp2.uniforms[name].value = env[name] ;
            }
            env.cellType = this.number ;
        }
    } ;
 
    env.sets = new Sets(2) ;

    // celltype ..........................................................
    Object.defineProperty( env, 'cellType' , {
        get : ()=>{
            return  env._cellType ;
        } ,
        set : (nv) =>{
            env._cellType = nv ;
            env.sets.number = nv ;
            env.fcomp1.uniforms.cellType.value = nv ;
            env.scomp1.uniforms.cellType.value = nv ;
            env.fcomp2.uniforms.cellType.value = nv ;
            env.scomp2.uniforms.cellType.value = nv ;
        } 
    } ) ;

    // pacemaker .........................................................
    env.pacemakerPeriod     = 500 ;
    env.pacemakerPositionX  = 0.2 ;
    env.pacemakerPositionY  = 0.1 ;
    env.pacemakerRadius     = 0.03 ;
    env.pacemakerActive     = false ;

    env.pacemakerFloats     = [ 
        'pacemakerPeriod', 
        'pacemakerPositionX','pacemakerPositionY', 
        'pacemakerRadius' ] ;
    env.pacemakerBools = [ 'pacemakerActive' ] ;

    env.compFloats.push(...env.pacemakerFloats ) ;
    env.compInts.push( 'pacemakerActive' ) ;

    // initialize values to 1.0 ..........................................
    for(let i in env.oneFloats){
        let name = env.oneFloats[i] ;
        env[name] = 1. ;
    }

    // Common uniforms for comp1 & comp2 solvers .........................
    class CompUniforms{
        constructor( obj, floats, ints, txtrs){
            for(let i in floats ){
                let name    = floats[i] ;
                this[name]  = { type :'f', value : obj[name] } ;
            }
            for(let i in ints){
                let name    = ints[i] ;
                this[name]  = { type : 'i', value : obj[name] } ;
            }
            for(let name of txtrs){
                this[name] = { type : 't', value : obj[name] } ;
            }
        }
    }

    // uniforms for comp1 solvers ........................................
    class Comp1Uniforms extends CompUniforms{
        constructor( _fc, _sc ){
            super(env, env.compFloats, env.compInts, env.allTxtrs ) ;
            for(let i=0; i<11 ; i++){
                this['icolor'+i] = { type : 't', value : _fc[i] } ;
            }   
        }
    }

    // uniforms for comp2 solvers ........................................
    class Comp2Uniforms extends CompUniforms{
        constructor( _fc, _sc ){
            super(env, env.compFloats, env.compInts, env.allTxtrs ) ; 
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
    class Clicker{
        constructor(){
            this._radius = 0.05 ;
            this.types = [ 
                'Pace tissue', 
                'Remove obstacles' , 'Add obstacles' ] ;
            this.no = 0 ;
        }

        get type(){
            return this.types[this.no] ;
        }
        
        get radius(){
            return this._radius ;
        }
        
        set radius(nv){
            this._radius = nv ;
            env.clickSolver.uniforms.radius.value = nv ;
        }

        set type(nv){
            for(let i=0 ; i<this.types.length; i++){
                if(this.types[i] == nv){
                    this.no = i ;
                }
            }
            switch (this.no){
                case 0 :
                    env.clickSolver.uniforms.adding.value = false ;
                    env.clickSolver.uniforms.pacing.value = true ;
                    break ;
                case 1 : 
                    env.clickSolver.uniforms.adding.value = false ;
                    env.clickSolver.uniforms.pacing.value = false ;
                    break ;
                case 2 : 
                    env.clickSolver.uniforms.adding.value = true ;
                    env.clickSolver.uniforms.pacing.value = false ;
                    break ;
            }
        }
    }

    env.clicker = new Clicker() ;

    env.clickSolver = new Abubu.Solver({
        fragmentShader : source( 'click' ) ,
        uniforms : {
            idomain : { type : 't', value : env.fdomain         } ,
            icolor4 : { type : 't', value : env.fcolor4         } ,
            radius  : { type : 'f', value : env.clicker.radius  } ,
            clickPosition 
                    : { type : 'v2',value : [0,0]               } ,
            adding  : { type : 'b', value : false               } ,
            pacing  : { type : 'b', value : true                } ,
        } ,
        targets : {
            odomain : { location : 0 , target : env.sdomain } ,
            ocolor4 : { location : 1, target : env.scolor4 } ,
        }
    } ) ;
   
    env.domCopy = new Abubu.Copy( env.sdomain, env.fdomain ) ;
    env.colCopy = new Abubu.Copy( env.scolor4, env.fcolor4 ) ;
    
    let mouseDrag_1 = new Abubu.MouseListener({
        canvas : document.getElementById('canvas_1') ,
        event : 'drag' ,
        callback : (e)=>{
            env.clickSolver.uniforms.clickPosition.value = e.position ;
            env.clickSolver.render() ;
            env.domCopy.render() ;
            env.colCopy.render() ;
            env.zeroFluxDirections.render() ;
        } 
    } ) ; 

/*------------------------------------------------------------------------
 * Editors 
 *------------------------------------------------------------------------
 */
    env.editor = new Abubu.Editor({
        sources : { 
            initializeDomain : {
                source : source('initDomain') ,
                solvers : [ env.initDomain ] ,
                title : [ 'Domain Def. Shader' ] ,
                filename : 'domainDefinition.frag' ,
                callback : ()=> { 
                    env.initDomain.render() ;
                    env.zeroFluxDirections.render() ;
                } 
            } ,
            init1 : {
                source : source('init1' ) ,
                solvers : [ env.finit1 , env.sinit1 ] ,
                title : 'IC Shader #1' ,
                filename : 'init1.frag',
            } ,
            init2 : {
                source : source('init2' ) ,
                solvers : [ env.finit2 , env.sinit2 ] ,
                title : 'IC Shader #2' ,
                filename : 'init1.frag',
            } ,
            comp1 : {
                source : source( 'comp1' ) ,
                solvers : [ env.fcomp1, env.scomp1 ] ,
                title : 'Compute Shader #1' ,
                filename : 'comp1.frag', 
            } ,
            comp2 : {
                source : source( 'comp2' ) ,
                solvers : [ env.fcomp2, env.scomp2 ] ,
                title : 'Compute Shader #2' ,
                filename : 'comp2.frag', 
            } ,
            clickSolver : { 
                source : source( 'click' ) ,
                title  : 'Click Shader' ,
                filename : 'click.frag', 
                solvers : [ env.clickSolver ],
            }
        } ,
        id : 'editor',
        active : 'comp1' ,
    } ) ;
    
    env.toggleEditor = function(){
        $("#editorSection").fadeToggle(300)
    } ;
/*------------------------------------------------------------------------
 * save and load 
 *------------------------------------------------------------------------
 */
    class SaveAndReload{
        constructor(opt){
            this.jsonObject = {}  ;
            this.filename = opt?.filename ?? 'ovvr-save' ;
            this.comments = opt?.comments ?? '' ;

            this.loader = document.createElement( 'input' ) ;
            this.loader.setAttribute( 'type', 'file' ) ;

            // read the chose files
            this.loader.onchange = (e)=>{
                if( !this.loader.files[0] ){
                    console.log('No file selected') ;
                }

                let file = this.loader.files[0] ;
                let reader = new FileReader() ;
                reader.readAsText(file) ;

                reader.onload = (e) =>{
                    let result  = event.target.result ;
                    let json = JSON.parse(result) ;
                    // read floats from json
                    for(let name of env.compFloats)
                        env[name] = json[name] ;
                    env.time = json.time ;
                    
                    // read ints from json
                    for(let name of env.compInts){
                        console.log(name, json[name] );
                        env[name] = json[name] ;
                    }

                    this.comments = json.comments ;

                    env.GUI.updateDisplay() ;

                    // update textures from json
                    for(let i=0 ; i< 11 ; i++){
                        env['fcolor'+i].data 
                            = new Float32Array( json['color'+i] ) ; 
                        env['scolor'+i].data 
                            = new Float32Array( json['color'+i] ) ; 
                    }
                    env.fdomain.data = new Float32Array( json.domain ) ;
                    env.sdomain.data = new Float32Array( json.domain ) ;

                    // recalculate zero flux directions
                    env.zeroFluxDirections.render() ;
                }
            }
        } /* End of constructor */

        reload(){
            this.loader.click() ;
        }

        save(){
            this.jsonObject.comments = this.comments ;

            // add all floats to the jsonObject ..........................
            for(let name of env.compFloats)
                this.jsonObject[name] = env[name] ;
            this.jsonObject.time = env.time ;

            // add all integers to the jsonObject ........................
            for(let name of env.compInts)
                this.jsonObject[name] = env[name] ;
        
            // add texture values to the json ............................
            this.jsonObject.domain  = Array.from(env.fdomain.value) ;
            
            for(let i=0; i<11 ; i++){
                this.jsonObject['color'+i] = 
                    Array.from(env['fcolor'+i].value) ;
            }

            let json = "data:text;charset=utf-8," + 
                JSON.stringify(this.jsonObject) ;
            let data = encodeURI( json ) ;
            
            let link = document.createElement('a') ;
            link.setAttribute( 'href', data ) ;
            link.setAttribute( 'download', this.filename +'.json') ;
            link.click() ;
        }
    } ;

    env.saveAndReload = new SaveAndReload() ;
    
/*------------------------------------------------------------------------
 * Postprocessing 
 *------------------------------------------------------------------------
 */
    // voltage plot ------------------------------------------------------
    env.vplot = new Abubu.Plot2D({
        target      : env.fcolor4 ,
        phaseField  : env.domain , 
        channel     : 'r' ,
        minValue    : -90 ,
        maxValue    : 50 ,
        colorbar    : true ,
        probeVisible: true ,
        canvas      : document.getElementById('canvas_1') ,
    } ) ;
    env.vplot.init() ;

    // signal plots ------------------------------------------------------
    env.splot = new Abubu.SignalPlot({
        noPltPoints : 1024, // number of sample points
        grid : 'on', 
        nx   : 10 , // number of division in x 
        ny   : 7 , // ... in y 

        xticks : {  mode : 'auto', unit : 'ms', font : '11pt Times' } ,
        yticks : {  mode : 'auto', unit : 'mv' , 
                    font : '12pt Times',precision : 1 } ,
        canvas : document.getElementById('canvas_2') 
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
            maxValue : 50 ,
            restValue : -87.0 ,
            color : [ 1.,0.,0.0 ],
            visible : true ,
            timewindow : 1000 , 
            probePosition : [0.5,0.5] 
    } ) ;


    // updateSignals -----------------------------------------------------
    env.updateSignals= function(){
        env.vsgn.update(env.time) ;
        env.osgn.update(env.time) ;
    }

    // refreshDisplay ----------------------------------------------------
    env.refreshDisplay = function(){
        env.vplot.render() ;
        env.splot.render() ;
    }

    // probe -------------------------------------------------------------
    env.probePosition = env.vplot.probePosition ;
    Object.defineProperty( env, 'probePositionX' , {
        get : ()=>{
            return  env.probePosition[0] ;
        } ,
        set : (nv) =>{
            env.probePosition[0] = nv ;
            env.vplot.probePosition = env.probePosition ;
            env.splot.probePosition = env.probePosition ;
        } 
    } ) ;
    Object.defineProperty( env, 'probePositionY' , {
        get : ()=>{
            return  env.probePosition[1] ;
        } ,
        set : (nv) =>{
            env.probePosition[1] = nv ;
            env.vplot.probePosition = env.probePosition ;
            env.splot.probePosition = env.probePosition ;
        } 
    } ) ;

/*------------------------------------------------------------------------
 * Run sequence
 *------------------------------------------------------------------------
 */
    env.skip = 30 ;
    env.running = false ;
    env.run = function(){
        if (env.running){
            for(let i = 0 ; i<env.skip ; i++){
                env.march() ;
                env.updateSignals() ; 
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
    let elements = {} ;
    for(let param of paramList){
        elements[param] = 
            guiElemenent.add(obj, param ).onChange( ()=> {
                Abubu.setUniformInSolvers( 
                    param, obj[param], solverList ) ;
            } ) ;
    }
    return elements ;
}

/*========================================================================
 * createGui
 *========================================================================
 */ 
function createGui(){
    let gui = new Abubu.Gui() ;             /*  create a graphical user 
                                                interface               */
    env.GUI = gui ;
    let p1 = gui.addPanel({width:400}) ; /*  add a panel to the GUI  */

    // model parameters ..................................................
    let mdl = p1.addFolder("Model Parameters") ;
    mdl
        .add( env.sets, 'name', env.sets.list )
        .name('Cell Type')
        .onChange(
            () =>{
                mdl.updateDisplay() ;
                env.sets.updateSolvers() ;
            } ) ;


    addToGui(mdl, env,env.modelFloats , env.comps) ;

    let crnt = mdl.addFolder("Current Multipliers") ;
    addToGui(crnt, env,env.currentMultipliers , env.comps) ;
    
    let tcst = mdl.addFolder("Time Constant Multipliers") ;
    addToGui(tcst, env,env.timeMultipliers , env.comps) ;

    let scl  = mdl.addFolder("Scaling Factors") ;
    addToGui( scl,env, env.scalingFactors, env.comps ) ;
    //
    // clicker ...........................................................
    p1.clicker = p1.addFolder('Mouse Click Settings' ) ;
    p1.clicker.add( env.clicker, 'type', env.clicker.types ) ;
    p1.clicker.add( env.clicker, 'radius' ).step(0.001).min(0) ;

    // pacemaker .........................................................
    p1.pacemaker = p1.addFolder('Pacemaker' ) ;    
    addToGui( p1.pacemaker, env, [...env.pacemakerFloats,...env.pacemakerBools], env.comps ) ;

    // display options ...................................................
    p1.display = p1.addFolder('Visualization options') ;
    p1.display.add( env.vplot , 'colormap', env.vplot.colormapList ) ;
    p1.display.add( env.vplot , 'colorbar' ) ;
    p1.display.add( env.vplot , 'probeVisible' ).onChange(()=>{env.vplot.init() })  ;
    p1.display.add( env, 'probePositionX' ) ;
    p1.display.add( env, 'probePositionY' ) ;
    p1.display.add( env.splot, 'timeWindow') ;

    // source code editos ................................................
    p1.source  = p1.addFolder('Edit/Save/Load Source Code') ;
    p1.source.add( env , 'toggleEditor').name('Show/Hide Editor' ) ;
    p1.source.add( env.editor , 'title', env.editor.titles ).name('Edit source').onChange( ()=>{ p1.updateDisplay() ;} ) ;
    p1.source.add( env.editor , 'filename').name('Filename') ;
    p1.source.add( env.editor , 'save' ).name('Save to file') ;
    p1.source.add( env.editor , 'load' ).name('Load from file') ;

    // save and load .....................................................
    p1.save = p1.addFolder('Save and Reload Simulation') ;
    p1.save.add(env.saveAndReload , 'comments' ) ;
    p1.save.add(env.saveAndReload , 'filename' ) ;
    p1.save.add(env.saveAndReload , 'save' ) ;
    p1.save.add(env.saveAndReload,  'reload' ) ;

    // execution .........................................................
    let exe = p1.addFolder('Execution') ;
    exe.add(env,'time').listen() ;
    exe.add(env,'skip') ;
    exe.add(env,'initialize') ;
    exe.add(env,'running') ;
    exe.open() ;
}
