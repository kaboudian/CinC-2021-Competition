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
    return  document.getElementById( sid ).innerHTML.trim() ;
}
/*========================================================================
 * Global Parameters
 *========================================================================
 */
let env = {} ;

/*========================================================================
 * import surface data
 *========================================================================
 */
let loadedJSON ;
/*=========================================================================
 * blinkText
 *=========================================================================
 */
//function blinkText(){
//    $('.blink').fadeOut(500) ;
//    $('.blink').fadeIn(500) ;
//}
//setInterval(blinkText, 1000) ;

/*========================================================================
 * let the user select the file
 *========================================================================
 */
var fileInput = document.getElementById('json_structure') ;

fileInput.onchange = function(){
  let file = fileInput.files[0] ;
  if ( !file ){
      return ;
  }
  let reader = new FileReader() ;
  reader.readAsText(file) ;

  reader.onload = function(e){
      let result = e.target.result ;
      loadedJSON = JSON.parse(result) ;
      $('#chooser').hide() ;
      $('.loaded').show() ;
      loadWebGL() ;
  } ;
}

/*========================================================================
 * read from file on the server
 *========================================================================
 */
//let structureFile = new XMLHttpRequest();
//
//structureFile.onreadystatechange = () => {
//    if (structureFile.readyState == 4 && structureFile.status == 200) {
//        loadedJSON = JSON.parse(structureFile.responseText);
//        console.log(loadedJSON) ;
//        loadWebGL() ;
//    }
//};
//structureFile.open("GET", "jsons/structure_pig_192x192x192.json", true);
//structureFile.send();
var gl = Abubu.gl ;

/*========================================================================
 * loadWebGL : entry point for the WebGL application
 *========================================================================
 */
function loadWebGL(){
    env.allFloats = [] ;
    env.allInts   = [] ;
    env.allTxtrs  = [] ;

/*------------------------------------------------------------------------
 * display parameters
 *------------------------------------------------------------------------
 */
    env.colormap    = 'rainbowHotSpring' ;
    env.dispWidth   = 512 ;
    env.dispHeight  = 512 ;

    env.canvas_1 = document.getElementById("canvas_1") ;
    env.canvas_2 = document.getElementById("canvas_2") ;
    env.canvas_1.width  = env.dispWidth ;
    env.canvas_1.height = env.dispHeight ;

/*------------------------------------------------------------------------
 * load the structure and process it
 *------------------------------------------------------------------------
 */
    env.mx = loadedJSON.mx ; env.my = loadedJSON.my ;
    env.allInts = [...env.allInts, 'mx','my' ] ;

    env.structure = new Abubu.StructureFromJSON( loadedJSON ) ;

    env.width                   = env.structure.width ;
    env.height                  = env.structure.height ;
    env.fwidth                  = env.structure.fwidth ; 
    env.fheight                 = env.structure.fheight ;

    env.fullTexelIndex          = env.structure.fullTexelIndex ;
    env.compressedTexelIndex    = env.structure.compressedTexelIndex ;
    env.full3dCrdt              = env.structure.full3dCrdt ;
    env.compressed3dCrdt        = env.structure.compressed3dCrdt ;
    env.normals                 = env.structure.normals ;

    env.loaded = true ;

    env.allTxtrs = [...env.allTxtrs, 'compressed3dCrdt' ] ;  
    
/*------------------------------------------------------------------------
 * zero-flux directionator 
 *------------------------------------------------------------------------
 */
    env.dir0 = new Abubu.Uint32Texture( env.width, env.height ) ;
    env.dir1 = new Abubu.Uint32Texture( env.width, env.height ) ;

    env.idir0 = env.dir0 ;
    env.idir1 = env.dir1 ;

    env.directionator = new Abubu.Solver({
        fragmentShader : source('directionator') ,
        uniforms : {
            mx : { type : 'i' , value : env.mx } ,
            my : { type : 'i' , value : env.my } ,
            fullTexelIndex : { 
                type : 't', value : env.fullTexelIndex 
            } ,
            compressedTexelIndex : { 
                type : 't', value : env.compressedTexelIndex
            } ,
        },
        targets: {
            odir0 : { location : 0, target : env.dir0 } ,
            odir1 : { location : 1, target : env.dir1 } ,
        }
    } ) ;
    env.directionator.render() ; 

    env.allTxtrs = [...env.allTxtrs, 'idir0', 'idir1' ] ;

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
    env.lx       = 8 ;

    env.allFloats.push( 'diffCoef', 'C_m', 'lx','dt' );

/*------------------------------------------------------------------------
 * pacemaker
 *-----------------------------------------------------------------------
 */
    env.pacemakerPeriod = 150 ;
    env.pacemakerPositionX = 0.2 ;
    env.pacemakerPositionY = 0.1 ;
    env.pacemakerRadius = 0.03 ;
    env.pacemakerActive = false ;

    env.pacemakerFloats = [ 'pacemakerPeriod', 'pacemakerPositionX','pacemakerPositionY', 'pacemakerRadius' ] ;
    env.pacemakerBools = [ 'pacemakerActive' ] ;

    env.allFloats.push(...env.pacemakerFloats ) ;
    env.allInts.push( 'pacemakerActive' ) ;
    
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
    env.visurf = new Abubu.SurfaceVisualizer({
        canvas : canvas_1 ,
        target : env.fcolor0 ,
        structure : env.structure ,
        fovy : 0.45,
        rotation : [1.76,3.25,-1.25] ,
        lightDirection : [ 0.6,0.25,-2.06] ,
        lightSpecularTerm : 0.5, 
        lightAmbientTerm : 0.1, 
        materialSpecularTerm : 5.2 ,
        materialAmbientTerm : 0.1 ,
        shininess : 10 ,
        minValue : 0.1 ,
        maxValue : 0.7 ,
    } ) ;

    env.plot = new Abubu.SignalPlot( {
            noPltPoints : 1024,
            grid        : 'on' ,
            nx          : 5 ,
            ny          : 7 ,
            xticks : { mode : 'auto', unit : 'ms', font:'11pt Times'} ,
            yticks : { mode : 'auto', unit : '', precision : 1 } ,
            canvas      : document.getElementById('canvas_2'),
            legend      : {visible: true , place: 'top-right', 
                location : [0.15,0.05],
                font :"bold 14pt Times",
                length: 0.1} ,

    });

    env.vsgn = env.plot.addSignal( env.fcolor0, {
            channel : 'r',
            name : 'Scaled membrane potential',
            minValue : -0.2 ,
            maxValue : 1.2 ,
            restValue: 0,
            color : [0.5,0,0],
            visible: true,
            linewidth : 3,
            timeWindow: 1000.,
            probePosition : [0.5,0.5] , } ) ;

    env.display = function(){
        env.plot.render() ;
        env.visurf.render() ;

    }

    Object.defineProperty( env, 'probePositionX' , {
        get : ()=>{
            return  env.probePosition[0] ;
        } ,
        set : (nv) =>{
            env.probePosition[0] = nv ;
            env.plot.probePosition = env.probePosition ;
        } 
    } ) ;
    Object.defineProperty( env, 'probePositionY' , {
        get : ()=>{
            return  env.probePosition[1] ;
        } ,
        set : (nv) =>{
            env.probePosition[1] = nv ;
            env.plot.probePosition = env.probePosition ;
        } 
    } ) ;

/*------------------------------------------------------------------------
 * click
 *------------------------------------------------------------------------
 */
    env.click = new Abubu.Solver({
        fragmentShader : source( 'click' ) ,
        uniforms : {
            icolor0 : { type : 't', value : env.fcolor0 } ,
            compressed3dCrdt : { type : 't', 
                value : env.structure.compressed3dCrdt            } ,
            projectedCoordinates : { type : 't', 
                value : env.visurf.projectedCoordinates  } ,
            clickPosition : { type : 'v2', value : [0.,0] } ,
            clickRadius     : { type : 'f', value : 0.1 } ,
        } ,
        targets : {
            ocolor0 : { location : 0 , target : env.scolor0 } ,
        }
    } ) ;

    env.clickCopy = new Abubu.Copy( env.scolor0, env.fcolor0 ) ;
    
    env.cmndClick = new Abubu.CommandClickListener(
        canvas_1 , (e) =>{
            env.click.uniforms.clickPosition.value = e.position ;
            env.click.render() ;
            env.clickCopy.render() ;
        } , { mousemove : true  } 
    ) ;

    env.cntrlClick = new Abubu.CtrlClickListener(
        canvas_1 , (e) =>{
            env.click.uniforms.clickPosition.value = e.position ;
            env.click.render() ;
            env.clickCopy.render() ;
        } , { mousemove : true  } 
    ) ;
    env.doubleClick = new Abubu.DoubleClickListener(
        canvas_1 , (e) =>{
            env.click.uniforms.clickPosition.value = e.position ;
            env.click.render() ;
            env.clickCopy.render() ;
        } ) ;

    env.shiftClick = new Abubu.ShiftClickListener(
        canvas_1,
        (e)=>{
            var clickCompPosition = 
            env.visurf.getCompressedClickPosition(e.position);
            env.plot.setProbePosition( clickCompPosition ) ;
            env.plot.init() ;
        } ) ;

/*------------------------------------------------------------------------
 * save and reload
 *------------------------------------------------------------------------
 */
    class SaveAndReload{
        constructor(opt){
            this.jsonObject = {}  ;
            this.filename = opt?.filename ?? '3v-save' ;
            this.comments = opt?.comments ?? '' ;

            this.loader = document.createElement( 'input' ) ;
            this.loader.setAttribute( 'type', 'file' ) ;

            // read the chose files
            this.loader.onchange = ()=>{
                if( !this.loader.files[0] ){
                    console.log('No file selected') ;
                }

                let reader = new FileReader() ;

                let file = this.loader.files[0] ;
                reader.readAsText(file) ;

                reader.onload = (e) =>{
                    let result  = event.target.result ;
                    let json = JSON.parse(result) ;
                    // read floats from json
                    for(let name of env.allFloats)
                        env[name] = json[name] ;
                    env.time = json.time ;

                    // read ints from json
                    for(let name of env.allInts)
                        env[name] = json[name] ;

                    this.comments = json.comments ;

                    env.GUI.updateDisplay() ;

                    // update textures from json
                    env.fcolor0.data = new Float32Array( json.color0 ) ; 
                    env.scolor0.data = new Float32Array( json.color0 ) ; 

                    // recalculate zero flux directions
                    //     } ) ;
                }
            }
        } /* End of constructor */

        reload(){
            this.loader.click() ;
        }

        save(){
            this.jsonObject.comments = this.comments ;

            // add all floats to the jsonObject ..........................
            for(let name of env.allFloats)
                this.jsonObject[name] = env[name] ;
            this.jsonObject.time = env.time ;

            // add all integers to the jsonObject ........................
            for(let name of env.allInts)
                this.jsonObject[name] = env[name] ;
        
            // add texture values to the json ............................
            this.jsonObject.color0 = Array.from(env.fcolor0.value) ;
            
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
 * Editors 
 *------------------------------------------------------------------------
 */
    env.editor = new Abubu.Editor({
        sources : { 
            initialCondition : {
                source : source('initSolution' ) ,
                solvers : [ env.finit , env.sinit ] ,
                title : 'Initial Condition Shader' ,
                filename : 'initCondition.frag',
            } ,
            computeTimeStep : {
                source : source( 'computeTimeStep' ) ,
                solvers : [ env.fcomp, env.scomp ] ,
                title : 'Time Stepping Shader' ,
                filename : 'computeTimeStep.frag', 
            } ,
            clickSolver : { 
                source : source( 'click' ) ,
                title  : 'Click Shader' ,
                filename : 'click.frag', 
                solvers : [ env.clickSolver ],
            }
        } ,
        id : 'editor',
        active : 'computeTimeStep' ,
    } ) ;
    
    env.toggleEditor = function(){
        $("#editorSection").fadeToggle(300)
    } ;

/*------------------------------------------------------------------------
 * initialize 
 *------------------------------------------------------------------------
 */
    env.initialize = function(){
        env.finit.render() ;
        env.sinit.render() ;
        env.plot.init(0) ;
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
                env.vsgn.update(env.time) ;
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


    // clicker ...........................................................
//    p1.clicker = p1.addFolder('Mouse Click Settings' ) ;
//    p1.clicker.add( env.clicker, 'type', env.clicker.types ) ;
//    p1.clicker.add( env.clicker, 'radius' ).step(0.001).min(0) ;

    // pacemaker .........................................................
//    p1.pacemaker = p1.addFolder('Pacemaker' ) ;    
//    addToGui( p1.pacemaker, env, [...env.pacemakerFloats,...env.pacemakerBools], [env.fcomp, env.scomp] ) ;
    
    // display options ...................................................
    p1.display = p1.addFolder('Visualization options') ;
    p1.display.visurf = env.visurf.controlByGui( p1.display ) ;

//    p1.display.add( env, 'probePositionX' ) ;
//    p1.display.add( env, 'probePositionY' ) ;
//    p1.display.add( env.plot, 'timeWindow') ;

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

    // simulation ........................................................
    p1.exe = p1.addFolder('Execution'  ) ;
    p1.exe.add( env, 'time' ).listen() ;
    p1.exe.add( env, 'skip'             ).min(1).step(1) ;
    p1.exe.add( env, 'initialize'       ).name('Initialize Simulation');
    p1.exe.add( env, 'solveOrPause'     ).name('Start/Pause simulation') ;

    p1.exe.open() ;

    return ;
}
