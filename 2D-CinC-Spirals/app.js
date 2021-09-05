/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * app.js       : The main app to bind all shaders together and facilitate
 * the interactions necessary in the app
 *
 * PROGRAMMER   : ABOUZAR KABOUDIAN
 * DATE         : Wed 14 Apr 2021 18:10:57 (EDT)
 * PLACE        : Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */

"use strict" ;

/*========================================================================
 * get the source code for fragment shaders
 *========================================================================
 */
function source( sid ){
    return document.getElementById( sid ).innerHTML ;
}
/*========================================================================
 * Global Parameters
 *========================================================================
 */
let env = {} ;

/*========================================================================
 * loadWebGL : entry point for the WebGL application
 *========================================================================
 */
function loadWebGL(){
    env.width   = 1346 ;
    env.height  = 584 ;

    env.allFloats = [] ;
    env.allInts   = [] ;
    env.allTxtrs  = [] ;
/*------------------------------------------------------------------------
 * canvas
 *------------------------------------------------------------------------
 */
    env.canvas_1 = document.getElementById('canvas_1') ;
    env.canvas_1.width= env.width ;
    env.canvas_1.height= env.height ;

    env.simg = document.getElementById('structure') ;

    env.sdom = new Abubu.ImageTexture( env.simg, {flipY: true} ) ;

/*------------------------------------------------------------------------
 * textures for time-stepping
 *------------------------------------------------------------------------
 */
    env.fcolors = [] ;
    env.scolors = [] ;

    for(let i=0; i<1; i++){
        env['fcolor'+i] = new Abubu.Float32Texture( 
                env.width, env.height, { pairable : true } ) ;
        env['scolor'+i] = new Abubu.Float32Texture( 
                env.width, env.height, { pairable : true } ) ;
        env.fcolors.push(env['fcolor'+i]) ;
        env.scolors.push(env['scolor'+i]) ;
    }
    env.colors = [ ...env.fcolors, ...env.scolors ] ;

/*------------------------------------------------------------------------
 * init solvers
 *------------------------------------------------------------------------
 */
    // init. .............................................................
    class InitTargets{
        constructor( colors ){
            for(let i=0; i<1 ; i++){
                this["ocolor"+i] = {location : i, target: colors[i]} ;
            }
        }
    }
    env.finit = new Abubu.Solver({
        fragmentShader : source('initSolution') ,
        targets : new InitTargets( env.fcolors ) ,
    } ) ;

    env.sinit = new Abubu.Solver({
        fragmentShader : source('initSolution') ,
        targets : new InitTargets( env.scolors ) ,
    } ) ;

    env.init = function(){
        env.finit.render() ;
        env.sinit.render() ;
    }
    env.init() ;

/*------------------------------------------------------------------------
 * domain and direction calculations 
 *------------------------------------------------------------------------
 */
    env.fdomain = new Abubu.Float32Texture( env.width, env.height ,
            { data : env.simg , pairable : true } ) ;
    env.sdomain = new Abubu.Float32Texture( env.width, env.height ,
            { data : env.simg , pairable : true } ) ;
    
    env.domain = env.fdomain ;

    env.initDomain = new Abubu.Solver({
        fragmentShader : source( 'initDomain' ) ,
        targets : { 
            domain0 : { location : 0 , target : env.fdomain }, 
            domain1 : { location : 1 , target : env.sdomain } 
        }
    } ) ;
    //env.initDomain.render() ;

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
 * model parameters 
 *------------------------------------------------------------------------
 */
    class Sets{
        constructor(no){
            this.floats = [ 'tau_pv',   'tau_v1',   'tau_v2',   'tau_pw',
                            'tau_mw',   'tau_d' ,   'tau_0' ,   'tau_r' ,
                            'tau_si',   'K'     ,   'V_sic' ,   'V_c'   ,
                            'V_v'   ,   'C_si'  ,] ;
            this.list = [ 
                    'Set 01', 'Set 02', 'Set 03', 'Set 04', 'Set 05', 
                    'Set 06', 'Set 07', 'Set 08', 'Set 09', 'Set 10' ] ;
            this.number = no ;

        } // end of constructor

        get number(){
            return this._no ;
        }
        set number(no){
            this._no = no ;
            switch (this.number){
                case 0: // Set 01
                    this._value = [ 
                        3.33    , 19.6    , 1000    , 667     , 11    ,   
                        0.42    , 8.3     , 50      , 45      , 10    , 
                        0.85    , 0.13    , 0.055   , 1.0     ] ;
                    break ;
                case 1: // Set 02
                    this._value = [
                        10.0    , 10.0    , 10.0    , 667     , 11      ,
                        0.25    , 10.0    , 190     , 45      , 10      ,
                        0.85    , 0.13    , 0.055   , 0.0     ] ;
                    break ;
                case 2: // Set 03
                    this._value = [
                        3.33    , 19.6    , 1250    , 870     , 41      ,
                        0.25    , 12.5    , 33.33   , 29      , 10      ,
                        0.85    , 0.13    , 0.04    , 1.0     ] ;
                    break ;
                case 3: // Set 04
                    this._value = [
                        3.33    , 15.6    , 5       , 350     , 80      ,
                        0.407   , 9       , 34      , 26.5    , 15      ,
                        0.45    , 0.15    , 0.04    , 1.00    ] ;
                    break ;
                case 4: // Set 05
                    this._value = [
                        3.33    , 12      , 2       , 1000    , 100     ,
                        0.362   , 5       , 33.33   , 29      , 15      ,
                        0.70    , 0.13    , 0.04    , 1.00    ] ;
                    break ;
                case 5: // Set 06 
                    this._value = [
                        3.33    , 9       , 8       , 250     , 60      ,
                        0.395   , 9       , 33.33   , 29      , 15      ,
                        0.50    , 0.13    , 0.04    , 1.00    ] ;
                    break ;
                case 6: // Set 07
                    this._value = [
                        10      , 7       , 7       , 250     , 60      ,
                        0.25    , 12      , 100     , 29      , 15      ,
                        0.50    , 0.13    , 0.04    , 0.00    ] ;
                    break ;
                case 7: // Set 08
                    this._value = [
                        13.03   , 19.6    , 1250    , 800     , 40      ,
                        0.45    , 12.5    , 33.25   , 29      , 10      ,
                        0.85    , 0.13    , 0.04    , 1.00    ] ;
                    break ;
                case 8: // Set 09
                    this._value = [
                        3.33    , 15      , 2       , 670     , 61      ,
                        0.25    , 12.5    , 28      , 29      , 10      ,
                        0.45    , 0.13    , 0.05    , 1.00    ] ;
                    break ;
                case 9: // Set 10
                    this._value = [
                        10      , 40      , 333     , 1000    , 65      ,
                        0.115   , 12.5    , 25      , 22.22   , 10      ,
                        0.85    , 0.13    , 0.025   , 1.00    ] ;
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
                env.fcomp.uniforms[name].value = env[name] ;
                env.scomp.uniforms[name].value = env[name] ;
            }
        }
    } ;
 
    env.sets = new Sets(3) ;
    env.allFloats.push(...env.sets.floats) ; 
    

    env.diffCoef = 0.001 ;
    env.C_m      = 1. ;
    env.dt       = 0.05 ;
    env.lx       = 50 ;

    env.allFloats.push( 'diffCoef', 'C_m', 'lx','dt' );

/*------------------------------------------------------------------------
 * Time stepping solvers
 *------------------------------------------------------------------------
 */
    // general and common uniforms .......................................
    class CompGeneralUniforms{
        constructor( obj, floats, ints, txtrs){
            for(let name of floats ){
                this[name]  = { type :'f', value : obj[name] } ;
            }
            for(let name of ints){
                this[name]  = { type : 'i', value : obj[name] } ;
            }
            for(let name of txtrs){
                this[name] = { type : 't', value : obj[name] } ;
            }
        }
    }

    // time-step specific uniforms .......................................
    class CompUniforms extends CompGeneralUniforms{
        constructor( _fc, _sc ){
            super(env, env.allFloats, env.allInts, env.allTxtrs ) ;
            for(let i =0 ; i <1 ; i++){
                this['icolor'+i] = { type: 't', value : _fc[i] } ;
            }
        }
    }

    // time-stepping target ..............................................
    class CompTargets{
        constructor( _fc,_sc ){
            for(let i=0; i<1 ; i++){
                let j = i ;
                this['ocolor'+i] = {location : i, target : _sc[j] } ;
            }
        }
    }

    // time-stepping solvers .............................................
    env.fcomp = new Abubu.Solver({
        fragmentShader : source('computeTimeStep') ,
        uniforms : new CompUniforms(env.fcolors, env.scolors ) ,
        targets  : new CompTargets( env.fcolors, env.scolors ) ,
    } ) ;

    env.scomp = new Abubu.Solver({
        fragmentShader : source('computeTimeStep') ,
        uniforms : new CompUniforms(env.scolors, env.fcolors ) ,
        targets  : new CompTargets( env.scolors, env.fcolors ) ,
    } ) ;

/*------------------------------------------------------------------------
 * display 
 *------------------------------------------------------------------------
 */
    env.plot2d = new Abubu.Plot2D({
        target : env.fcolor0 ,
        prevTarget : env.scolor0 ,
        canvas : document.getElementById('canvas_1') ,
        minValue: 0 ,
        maxValue: 1.0 ,
        tipt : false ,
        tiptThreshold : env.tiptThreshold ,
        phaseField : env.domain ,
        phaseColor : [1,1,1] ,
        probeVisible : false ,
        colorbar : false ,
        cblborder: 15 ,
        cbrborder: 15 ,
        unit : '',
    } );
    env.plot2d.initialize() ;

    env.display = function(){
        env.plot2d.render() ;
    }

/*------------------------------------------------------------------------
 * click
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
        fragmentShader  : source('click' ) ,
        uniforms : { 
            idomain : { type : 't', value : env.fdomain         } ,
            icolor0 : { type : 't', value : env.fcolor0         } ,
            radius  : { type : 'f', value : env.clicker.radius  } ,
            clickPosition 
                    : { type : 'v2', value : [0,0]              } ,
            adding : { type : 'b', value : false                } ,
            pacing : { type : 'b', value : true                 } ,
        } ,
        targets : {
            odomain : { location : 0, target : env.sdomain } ,
            ocolor0 : { location : 1, target : env.scolor0 } ,
        }
    } ) ;

    env.domCopy = new Abubu.Copy( env.sdomain, env.fdomain ) ;
    env.colCopy = new Abubu.Copy( env.scolor0, env.fcolor0 ) ;

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
 * initialize 
 *------------------------------------------------------------------------
 */
    env.initialize = function(){
        env.finit.render() ;
        env.sinit.render() ;
        env.zeroFluxDirections.render() ;
        env.plot2d.initialize() ;
        env.time = 0 ;
    }
    env.initialize() ;

/*------------------------------------------------------------------------
 * main time loop
 *------------------------------------------------------------------------
 */
    env.running = false ;
    env.skip = 10 ;

    env.solveOrPause = function(){
        env.running = !env.running ;
    }

    env.run = function(){
        if(env.running){
            for(let i=0 ; i<env.skip ; i++){
                env.fcomp.render() ;
                env.scomp.render() ;
                env.time += env.dt*2. ;
            }
        }
        env.display();

        requestAnimationFrame(env.run) ;
    }


    createGUI() ;
    env.run() ;

    return ;
} // end of loadWebGL

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
 * createGUI : create the graphical user interface
 *========================================================================
 */
function createGUI(){
    env.GUI = new Abubu.Gui() ;
    env.panel1 = env.GUI.addPanel({width:400}) ;
    let p1 = env.panel1 ;

    // model parameters ..................................................
    p1.model = p1.addFolder('Model Parameters') ;
    p1.model
        .add( env.sets, 'name', env.sets.list )
        .name('Parameter Set')
        .onChange(
            () =>{
                p1.model.updateDisplay() ;
                env.sets.updateSolvers() ;
            } ) ;
    addToGui( p1.model, env, env.allFloats , [env.fcomp, env.scomp] ) ;

    // pacemaker .........................................................
    p1.pacemaker = p1.addFolder('Pacemaker' ) ;    

    // clicker ...........................................................
    p1.clicker = p1.addFolder('Mouse Click Settings' ) ;
    p1.clicker.add( env.clicker, 'type', env.clicker.types ) ;
    p1.clicker.add( env.clicker, 'radius' ).step(0.001).min(0) ;

    // display options ...................................................
    p1.display = p1.addFolder('Visualization options') ;

    // source code editos ................................................
    p1.source  = p1.addFolder('Edit/Save/Load Source Code') ;

    // simulation ........................................................
    p1.sim = p1.addFolder('Simulation'  ) ;
    p1.sim.add( env, 'time' ).listen() ;
    p1.sim.add( env, 'skip'             ).min(1).step(1) ;
    p1.sim.add( env, 'initialize'       ).name('Initialize Simulation');
    p1.sim.add( env, 'solveOrPause'     ).name('Start/Pause simulation') ;

    p1.sim.open() ;
    
    // save and load .....................................................
    p1.save = p1.addFolder('Save and Reload Simulation') ;

    return ;
}
