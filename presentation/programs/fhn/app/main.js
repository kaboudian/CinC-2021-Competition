/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * WEBGL 2.0    :   2D 2-Variable FitzHugh Nagumo
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Thu 28 Sep 2017 11:33:48 AM EDT
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
define([    'require',
            'shader!vertShader.vert',
            'shader!initShader.frag',
            'shader!compShader.frag',
            'shader!paceShader.frag',
            'shader!clickShader.frag',
            'shader!bvltShader.frag',
            ],
function(   require,
            vertShader,
            initShader,
            compShader,
            paceShader,
            clickShader,
            bvltShader,
            ){
"use strict" ;

/*========================================================================
 * Global Parameters
 *========================================================================
 */
var log = console.log ;
var params ;
var env ;
var gui ;
var pan ;
/*========================================================================
 * createGui
 *========================================================================
 */
function createGui(){
    env.gui = new Abubu.Gui() ;
    gui = env.gui.addPanel({width:300}) ;
/*-------------------------------------------------------------------------
 * Model Parameters
 *-------------------------------------------------------------------------
 */
    gui.mdlPrmFldr  =   gui.addFolder( 'Model Parameters'   ) ;

    addCoeficients(     gui.mdlPrmFldr, ['C_m', 'diffCoef'] ,
                        [env.comp1,env.comp2], {min:0}) ;

    addCoeficients( gui.mdlPrmFldr, [
                        'a',
                        'b',
                        'epsilon',
                        'delta',
                    ] ,
                    [env.comp1,env.comp2 ],{ step: 0.001, 
            callback: function(){
                env.nc.run() ;
                return ;
                }
            }
                    ) ;

/*------------------------------------------------------------------------
 * Solver Parameters
 *------------------------------------------------------------------------
 */
    gui.slvPrmFldr  = gui.addFolder( 'Solver Parameters' ) ;
    gui.slvPrmFldr.add( env, 'boundaryConditions',[
            'periodic','no_flux']).onChange(
        function(){
            if (env.boundaryConditions == 'periodic' ){
            env.comp1.uniforms.inUv.wrapS = 'repeat' ;
            env.comp1.uniforms.inUv.wrapT = 'repeat' ;
            env.comp2.uniforms.inUv.wrapS = 'repeat' ;
            env.comp2.uniforms.inUv.wrapT = 'repeat' ;
            }else{
            env.comp1.uniforms.inUv.wrapS = 'clamp_to_edge' ;
            env.comp1.uniforms.inUv.wrapT = 'clamp_to_edge' ;
            env.comp2.uniforms.inUv.wrapS = 'clamp_to_edge' ;
            env.comp2.uniforms.inUv.wrapT = 'clamp_to_edge' ;
            }
            } ) ;

    gui.slvPrmFldr.add( env, 'dt').name('Delta t').onChange(
         function(){
            Abubu.setUniformInSolvers('dt', env.dt,
                    [env.comp1,env.comp2 ]) ;
         }
    );

    gui.slvPrmFldr.add( env, 'ds_x' ).name( 'Domain size-x').onChange(
        function(){
            Abubu.setUniformInSolvers('ds_x', env.ds_x,
                    [env.comp1,env.comp2 ]) ;

            refreshDisplay() ;
        }
    ) ;
    gui.slvPrmFldr.add( env, 'ds_y' ).name( 'Domain size-y').onChange(
        function(){
            Abubu.setUniformInSolvers('ds_y', env.ds_y,
                    [env.comp1,env.comp2 ]) ;
        }
    ) ;

    gui.slvPrmFldr.add( env, 'width').name( 'x-resolution' )
    .onChange( function(){
        Abubu.resizeRenderTargets(
                [env.fuv,env.suv], env.width, env.height);
    } ) ;

    gui.slvPrmFldr.add( env, 'height').name( 'y-resolution' )
    .onChange( function(){
        Abubu.resizeRenderTargets(
            [
                env.fuv,
                env.suv
            ],
            env.width,
            env.height);
    } ) ;

/*------------------------------------------------------------------------
 * Display Parameters
 *------------------------------------------------------------------------
 */
    gui.dspPrmFldr  = gui.addFolder( 'Display Parameters' ) ;
    gui.dspPrmFldr.add( env, 'colormap', Abubu.getColormapList() )
                .onChange(  function(){
                                env.disp.setColormap(env.colormap);
                                refreshDisplay() ;
                            }   ).name('Colormap') ;

    gui.dspPrmFldr.add( env, 'probeVisiblity').name('Probe Visiblity')
        .onChange(function(){
            env.disp.setProbeVisiblity(env.probeVisiblity);
            refreshDisplay() ;
        } ) ;
    gui.dspPrmFldr.add( env, 'frameRate').name('Frame Rate Limit')
        .min(60).max(140000).step(60)

    gui.dspPrmFldr.add( env, 'timeWindow').name('Signal Window [ms]')
    .onChange( function(){
        env.plot.updateTimeWindow(env.timeWindow) ;
        refreshDisplay() ;
    } ) ;

/*------------------------------------------------------------------------
 * tipt
 *------------------------------------------------------------------------
 */
    gui.tptPrmFldr = gui.dspPrmFldr.addFolder( 'Tip Trajectory') ;
    gui.tptPrmFldr.add( env, 'tiptVisiblity' )
        .name('Plot Tip Trajectory?')
        .onChange(function(){
            env.disp.setTiptVisiblity(env.tiptVisiblity) ;
            refreshDisplay() ;
        } ) ;
    gui.tptPrmFldr.add( env, 'tiptThreshold').name( 'Threshold [mv]')
        .onChange( function(){
                env.disp.setTiptThreshold( env.tiptThreshold ) ;
                } ) ;
    gui.tptPrmFldr.open() ;

    gui.dspPrmFldr.close() ;
/*------------------------------------------------------------------------
 * paceMaker
 *------------------------------------------------------------------------
 */
    gui.pmkr = gui.addFolder('Pace Maker') ;
    var p = env.pmkr;
    var pmkr = gui.pmkr ;
    pmkr.add(p,'active').onChange(function(){
        env.paceMaker.setActivity( env.pmkr.active) ;
    } ) ;
    pmkr.add(p, 'circular').onChange(function(){
        env.psol.uniforms.circular.value = env.pmkr.circular ;
    } ) ;
    pmkr.add(p, 'perturb').onChange(function(){
        env.psol.uniforms.perturb.value = env.pmkr.perturb ;
    } ) ;
    pmkr.add(p, 'period').onChange(function(){
        env.paceMaker.interval = env.pmkr.period ;
    } ) ;
    pmkr.add(p, 'radius').onChange(function(){
        env.psol.uniforms.radius.value = env.pmkr.radius ;
    } ) ;
    pmkr.add(p, 'setV').name('Set V?').onChange(function(){
        env.psol.uniforms.setV.value = env.pmkr.setV ;
    } ) ;
    pmkr.add(p, 'v' ).name('v-value').onChange(function(){
        env.psol.uniforms.v.value = env.pmkr.v ;
    } ) ;
    pmkr.add(p, 'setW').name('Set W?').onChange(function(){
        env.psol.uniforms.setW.value = env.pmkr.setW ;
    } ) ;

    pmkr.add(p, 'w' ).name('w-value').onChange(function(){
        env.psol.uniforms.w.value = env.pmkr.w ;
    } ) ;
    pmkr.add(p.position, 0).name('x-position').step(0.01).onChange(function(){
        env.psol.uniforms.pacePosition.value = env.pmkr.position ;
    }) ;
    pmkr.add(p.position, 1).name('y-position').step(0.01).onChange(function(){
        env.psol.uniforms.pacePosition.value = env.pmkr.position ;
    }) ;
    env.gui.pmkr = pmkr ;
    //pmkr.open() ;

/*------------------------------------------------------------------------
 * save
 *------------------------------------------------------------------------
 */
    var svePrmFldr = gui.addFolder('Save Canvases') ;
    svePrmFldr.add( env, 'savePlot2DPrefix').name('File Name Prefix') ;
    svePrmFldr.add( env, 'savePlot2D' ).name('Save Plot2D') ;

/*------------------------------------------------------------------------
 * Save and Load
 *------------------------------------------------------------------------
 */
    env.save = function(){
        Abubu.saveToXML({
                fileName : env.filename + '.xml' ,
                obj     : env,
                names   : saveList } ) ;
        Abubu.saveCanvas ( 'canvas_2',
                {
                    prefix  : env.filename ,
                    postfix : '_midplane' ,
                    format: 'png' } ) ;
        Abubu.saveCanvas ( 'canvas_3',
                {
                    prefix  : env.filename ,
                    postfix : '_signal' ,
                    format: 'png' } ) ;

    } ;

    env.input = document.createElement('input') ;
    env.input.setAttribute('type', 'file' ) ;
    env.input.onchange = function(){
        Abubu.loadFromXML({
            input   : env.input ,
            obj     : env ,
            names   : saveList,
            callback : function(){
                env.gui.update();
             } ,
        } ) ;
    } ;

    gui.save = gui.addFolder('Save and Load') ;
    gui.save.add( env.input, 'click' ).name('Load XML file') ;
    gui.save.add( env, 'comment'  ) ;
    gui.save.add( env, 'filename' ).name('File Name') ;
    gui.save.add( env, 'save' ) ;
    gui.save.close() ;

/*------------------------------------------------------------------------
 * Click 
 *------------------------------------------------------------------------
 */
    gui.click = gui.addFolder( "Click Info" ) ;
    gui.click.add( env,  'setV').name('Set U?').onChange(function(){
        env.click.uniforms.setV.value = env.setV ;
    });
    gui.click.add(env,  'v').name('v value').onChange(function(){
        env.click.uniforms.v.value = env.v ;
        env.nc.run() ;
    } ) ;
    gui.click.add( env,  'setW').name('Set w?').onChange(function(){
        env.click.uniforms.setW.value = env.setW ;
    });
    gui.click.add(env,  'w').name('w value').onChange(function(){
        env.click.uniforms.w.value = env.w ;
        env.nc.run() ;
    } ) ;

    gui.click.add( env,  'clickRadius' )
        .min(0.01).max(1.0).step(0.01)
        .name('Click Radius')
        .onChange(function(){
                env.click.uniforms.clickRadius.value = env.clickRadius ;
        } ) ;

    gui.click.close() ;

/*------------------------------------------------------------------------
 * editor
 *------------------------------------------------------------------------
 */

    gui.editor = gui.addFolder('Source Code Editor') ;
    gui.editor.add( env, 'toggleEditors').name('Display/Hide Editor') ;
    gui.editor.add( env.editor, 'title', env.editor.titles )
        .name('Choose Shader')
        .onChange(
            function(){
                gui.editor.updateDisplay() ;
                $('#editorTitle').text( 'Editing ' + env.editor.title ) ;
            } ) ;
    gui.editor.add( env.editor, 'filename') ;
    gui.editor.add( env.editor, 'save').name('Save Source to File') ;
    gui.editor.add( env.editor, 'load').name('Load Source From File') ;
    //gui.editor.open() ;

/*------------------------------------------------------------------------
 * Simulation
 *------------------------------------------------------------------------
 */
    gui.smlPrmFldr  = gui.addFolder(    'Simulation'    ) ;

    gui.smlPrmFldr.add( env, 'time').name('Solution Time [ms]').listen() ;
    gui.smlPrmFldr.add( env, 'fps').name('Actual Frame Rate [fps]').listen() ;

    gui.smlPrmFldr.add( env, 'initialize').name('Initialize') ;
    gui.smlPrmFldr.add( env, 'solve').name('Solve/Pause') ;
    gui.smlPrmFldr.open() ;

/*------------------------------------------------------------------------
 * addCoeficients
 *------------------------------------------------------------------------
 */
    function addCoeficients( fldr,
            coefs,
            solvers ,
            options ){
        var coefGui = {} ;
        var min = undefined ;
        var max = undefined ;
        var step = undefined ;
        var callback = undefined ;
        if (options != undefined ){
            if (options.min != undefined ){
                min = options.min ;
            }
            if (options.max != undefined ){
                max = options.max ;
            }
            if (options.step !=undefined ){
                step = options.step ;
            } 
            if (options.callback != undefined){
                callback = options.callback ;
            }
        }
        for(var i=0; i<coefs.length; i++){
            var coef = addCoef(fldr,coefs[i],solvers, callback) ;
            if (min != undefined ){
                coef.min(min) ;
            }
            if (max != undefined ){
                coef.max(max) ;
            }
            if (step != undefined){
                coef.step(step) ;
            }
            coefGui[coefs[i]] = coef ;
        }
        return coefGui ;

        /* addCoef */
        function addCoef( fldr,
                coef,
                solvers, 
                callback ){
            var coefGui  ;
            if (callback != undefined ){
                coefGui =   fldr.add( env, coef )
                .onChange(
                        function(){
                        callback() ;
                        Abubu.setUniformInSolvers(  coef,
                                env[coef],
                                solvers  ) ;
                        } ) ;

            }else{
            coefGui =   fldr.add( env, coef )
                .onChange(
                        function(){
                        Abubu.setUniformInSolvers(  coef,
                                env[coef],
                                solvers  ) ;
                        } ) ;
            }
            return coefGui ;

        }
    }

    return ;
} /* End of createGui */

var saveList = [ 'comment',
    'filename',
    'boundaryConditions',
    'time',
    'C_m',
    'diffCoef',
    'a',
    'b',
    'epsilon',
    'width',
    'height',
    'ds_x',
    'ds_y',
    'dt',
    'timeWindow'] ;

/*========================================================================
 * Environment
 *========================================================================
 */
function Environment(){
    this.running = false ;

    /* Model Parameters         */
    this.C_m        = 1.0 ;
    this.diffCoef   = 0.001 ;

    this.minVlt     = -90 ;
    this.maxVlt     = 30 ;

    /* time coeficients         */
    this.a = 0.1 ;
    this.b = 0.3 ;
    this.epsilon = 0.01 ;
    this.delta  = 0. ;

    /* Display Parameters       */
    this.colormap    =   'rainbowHotSpring';
    this.dispWidth   =   512 ;
    this.dispHeight  =   512 ;
    this.frameRate   =   3200 ;
    this.timeWindow  =   1000 ;
    this.probeVisiblity = false ;

    this.tiptVisiblity= false ;
    this.tiptThreshold=  .5 ;
    this.tiptColor    = "#FFFFFF";

    /* Solver Parameters        */
    this.boundaryConditions = 'no_flux' ;
    this.width       =   512 ;
    this.height      =   512 ;
    this.dt          =   5.e-2 ;
    this.cfl         =   1.0 ;
    this.ds_x        =   10 ;
    this.ds_y        =   10 ;

/*------------------------------------------------------------------------
 * Pace Maker info
 *------------------------------------------------------------------------
 */
    this.pmkr = {
        active : false ,
        setV: true ,
        v : 3.0 ,
        setW: true ,
        w : 0.0 ,
        perturb : false ,
        position : [0.,0.] ,
        radius : 0.1 ,
        circular : true ,
        period : 400 
    } ;

    /* Solve                    */
    this.solve       = function(){
        this.running = !this.running ;
        return ;
    } ;
    this.time        = 0.0 ;
    this.clicker     = 'Pace Region';

/*------------------------------------------------------------------------
 * click info
 *------------------------------------------------------------------------
 */ 
    this.setV = true ;
    this.setW = true ;
    this.v    = 1.0 ;
    this.w    = 0.0 ;
/*------------------------------------------------------------------------
 * Autobreak
 *------------------------------------------------------------------------
 */
/*   */
    this.autoBreakThreshold = -40 ;
    //this.bvltNow     = breakVlt ;
    this.ry          = 0.5 ;
    this.lx          = 0.5 ;
    this.autobreak   = true ;

    this.autostop    = false;
    this.autostopInterval = 300 ;

    this.savePlot2DPrefix = '' ;
    this.savePlot2D    = function(){
        this.running = false ;
        var prefix ;
        try{
            prefix = eval(env.savePlot2DPrefix) ;
        }catch(e){
            prefix = this.savePlot2DPrefix ;
        }
        Abubu.saveCanvas( 'canvas_1',
        {
            number  : this.time ,
            postfix : '_'+this.colormap ,
            prefix  : prefix,
            format  : 'png'
        } ) ;
    }

    /* Clicker                  */
    this.clickRadius     = 0.05 ;
    this.clickPosition   = [0.5,0.5] ;
    this.conductionValue = [1.,0,0,0] ;
    this.paceValue       = [1.,0,0,0] ;
    this.fps            = 0 ;

    this.filename = '' ;
    this.comment = '';
}

/*========================================================================
 * Initialization of the GPU and Container
 *========================================================================
 */
function loadWebGL()
{
    var canvas_1 = document.getElementById("canvas_1") ;
    var canvas_2 = document.getElementById("canvas_2") ;

    canvas_1.width  = 512 ;
    canvas_1.height = 512 ;

    env = new Environment() ;
    env.canvas_1 = canvas_1 ;

/*-------------------------------------------------------------------------
 * stats
 *-------------------------------------------------------------------------
 */
    var stats       = new Stats() ;
    document.body.appendChild( stats.domElement ) ;

/*-------------------------------------------------------------------------
 * setting up nulcline plots
 *-------------------------------------------------------------------------
 */
    var nc  = {} ;
    env.nc = nc ;
    nc.plt = new Plot(canvas_2) ;
    nc.plt.margins.left=60 ;
    nc.plt.margins.right = 20 ;
    nc.plt.margins.top = 10 ;
    nc.plt.xlabel = 'v' ;
    nc.plt.ylabel = 'w' ;
    nc.plt.xticks.precision = 1 ;
    nc.plt.yticks.precision = 1 ;
    nc.plt.xticks.noDivs = 6 ;
    nc.plt.yticks.noDivs = 10 ;
    nc.plt.xlimits = [-1.5,1.5] ;
    nc.plt.ylimits = [-1,1] ;
    nc.plt.grid = 'on' ;
    nc.plt.legend = 'on' ;
    nc.plt.legend.location = [canvas_2.width-150, 20] ;
    nc.plt.title = 'Nullclines Plot' ;

    nc.plt.init() ;
    nc.crv1 = nc.plt.addCurveFromPoints() ;
    nc.crv1.name = 'v-nullcline' ;
    nc.crv2 = nc.plt.addCurveFromPoints() ;
    nc.crv2.name = "w-nullcline" ;
    nc.crv3 = nc.plt.addCurveFromPoints() ;
    nc.crv3.name = 'Trajectory' ;

    nc.run = function(){
        nc.v = env.v ;
        nc.w = env.w ;
        nc.plt.reset() ;
        for(var v=-1.5; v<1.5 ; v+=0.01){
            var w = v*(1.0-v)*(v-env.a) ;
            nc.crv1.plot(v,w) ;
            w = env.b*v+env.delta ;
            nc.crv2.plot(v,w) ;
        }

        var v ,w  ;
        nc.crv3.plot(nc.v, nc.w) ;
        for( var t =0 ; t < 400 ; t+=env.dt){
            v =nc.v ; w =nc.w ;
            nc.dv = env.dt*(v*(1.0-v)*(v-env.a)-w) ;
            nc.dw = env.dt*(env.epsilon*(env.b*v-w+env.delta)) ;

            nc.v += nc.dv ;
            nc.w += nc.dw ;
            nc.crv3.plot(nc.v, nc.w) ;
        }
    }
    nc.onclick = function(e){
        env.v = e.x ;
        env.w = e.y ;
        env.click.uniforms.v.value = env.v ;
        env.click.uniforms.w.value = env.w ;
        env.nc.run() ;
        gui.click.updateDisplay() ;
    }
    nc.plt.addClickListener(nc.onclick) ;

    nc.run() ;

/*------------------------------------------------------------------------
 * defining all render targets
 *------------------------------------------------------------------------
 */
    env.fuv     = new Abubu.FloatRenderTarget(512, 512) ;
    env.suv     = new Abubu.FloatRenderTarget(512, 512) ;

/*------------------------------------------------------------------------
 * init solver to initialize all textures
 *------------------------------------------------------------------------
 */
    env.init  = new Abubu.Solver( {
       fragmentShader  : initShader.value ,
       vertexShader    : vertShader.value ,
       renderTargets   : {
           outFuv    : { location : 0, target: env.fuv     } ,
           outSuv    : { location : 1, target: env.suv     } ,
       }
    } ) ;

/*------------------------------------------------------------------------
 * comp1 and comp2 solvers for time stepping
 *------------------------------------------------------------------------
 */
    env.compUniforms = function(_inUv ){
        this.inUv       = { type : 's',     value   : _inUv ,
            wrapS : 'repeat', wrapT : 'repeat'} ;
        this.a          = { type : 'f',     value   : env.a         } ;
        this.b          = { type : 'f',     value   : env.b         } ;
        this.epsilon    = { type : 'f',     value   : env.epsilon   } ;
        this.delta      = { type : 'f',     value   : env.delta     } ;
        this.ds_x       = { type : 'f',     value   : env.ds_x      } ;
        this.ds_y       = { type : 'f',     value   : env.ds_y      } ;
        this.diffCoef   = { type : 'f',     value   : env.diffCoef  } ;
        this.C_m        = { type : 'f',     value   : env.C_m       } ;
        this.dt         = { type : 'f',     value   : env.dt        } ;

    } ;

    env.compTargets = function(_outUv){
        this.outUv = { location : 0  , target :  _outUv     } ;
    } ;

    env.comp1 = new Abubu.Solver( {
        fragmentShader  : compShader.value,
        vertexShader    : vertShader.value,
        uniforms        : new env.compUniforms( env.fuv    ) ,
        renderTargets   : new env.compTargets(  env.suv    ) ,
        clear   : false ,
    } ) ;

    env.comp2 = new Abubu.Solver( {
        fragmentShader  : compShader.value,
        vertexShader    : vertShader.value,
        uniforms        : new env.compUniforms( env.suv    ) ,
        renderTargets   : new env.compTargets(  env.fuv    ) ,
        clear   : false ,
    } ) ;
    if (env.boundaryConditions == 'periodic' ){
        env.comp1.uniforms.inUv.wrapS = 'repeat' ;
        env.comp1.uniforms.inUv.wrapT = 'repeat' ;
        env.comp2.uniforms.inUv.wrapS = 'repeat' ;
        env.comp2.uniforms.inUv.wrapT = 'repeat' ;
    }else{
        env.comp1.uniforms.inUv.wrapS = 'clamp_to_edge' ;
        env.comp1.uniforms.inUv.wrapT = 'clamp_to_edge' ;
        env.comp2.uniforms.inUv.wrapS = 'clamp_to_edge' ;
        env.comp2.uniforms.inUv.wrapT = 'clamp_to_edge' ;
    }

/*------------------------------------------------------------------------
 * click solver
 *------------------------------------------------------------------------
 */
    env.click = new Abubu.Solver( {
        vertexShader    : vertShader.value ,
        fragmentShader  : clickShader.value ,
        uniforms        : {
            map             : { type: 't',  value : env.fuv           } ,
            setV : { type : 'b' , value : env.setV} ,
            setW : { type : 'b' , value : env.setW} ,
            v    : { type : 'f' , value : env.v } ,
            w    : { type : 'f' , value : env.w } ,

            clickValue      : { type: 'v4', value :
                new Float32Array(1,0,0,0)         } ,
            clickPosition   : { type: 'v2', value : env.clickPosition  } ,
            clickRadius     : { type: 'f',  value : env.clickRadius    } ,
        } ,
        renderTargets   : {
            FragColor   : { location : 0,   target : env.suv      } ,
        } ,
        clear           : true ,
    } ) ;
    env.clickCopy = new Abubu.Copy(env.suv, env.fuv ) ;

/*------------------------------------------------------------------------
 * pace
 *------------------------------------------------------------------------
 */
    env.psol = new Abubu.Solver({
        fragmentShader  : paceShader.value,
        uniforms        : {
            in_map  : { type : 't', value : env.fuv             } ,
            setV    : { type : 'b', value : env.pmkr.setV       } ,
            v       : { type : 'f', value : env.pmkr.v          } ,
            setW    : { type : 'b', value : env.pmkr.setW       } ,
            w       : { type : 'f', value : env.pmkr.w          } ,
            pacePosition
                    : { type : 'v2', value: env.pmkr.position   } ,
            radius  : { type : 'f', value : env.pmkr.radius     } ,
            circular: { type : 'b', value : env.pmkr.circular   } ,
            perturb : { type : 'b', value : env.pmkr.perturb    } ,
        } ,
        renderTargets: {
            out_map : {location : 0 , target : env.suv }
        }
    } ) ;

    env.paceMaker = new Abubu.IntervalCaller({
        interval : env.pmkr.period,
        callback : function(){
            env.psol.render() ;
            env.clickCopy.render() ;
        } ,
        active  : env.pmkr.active
    } ) ;

    env.mouseListener_2 = new Abubu.MouseListener({
        canvas  : env.canvas_1 ,
        event   : 'click',
        shift   : true ,
        callback: function(e){
            env.pmkr.position[0] = e.position[0] ;
            env.pmkr.position[1] = e.position[1] ;
            env.psol.pacePosition = e.position ;
            env.gui.updateFolderDisplay(env.gui.pmkr ) ;
        }
    } ) ;

/*-------------------------------------------------------------------------
 * Editor 
 *-------------------------------------------------------------------------
 */
    env.editor = new Abubu.Editor({
        sources :{
            paceMaker : { 
                source : paceShader.value ,
                solvers: [ env.psol ] ,
                title : 'Pace-Maker Shader' ,
                filename : 'paceShader.frag' ,
            } ,
            init    : { 
                source : initShader.value ,
                solvers: [ env.init ] ,
                title    : 'Initial Condition Shader' ,
                callback : function(){env.initialize() ;} ,
                filename : 'initShader.frag' ,
            } ,
            compute : {
                source : compShader.value ,
                solvers: [env.comp1, env.comp2] ,
                title : 'Computational Shader' ,
                filename : 'computeShader.frag' ,
            } ,
            click : { 
                source : clickShader.value ,
                solvers : [env.click ],
                title : 'Click Shader',
                filename: 'clickShader.frag', 
            }
        } ,
        active  : 'paceMaker' ,
        id      : 'editor' ,
        options :{
            printMarginColumn : 74 ,
        }
    } ) ;

    env.toggleEditors = function(){
        $("#editors").fadeToggle(1000) ;
    } ;

    $('#editorTitle').text('Editing ' + env.editor.title) ;
    $('#editor').css('fontSize','8pt') ;
/*------------------------------------------------------------------------
 * disp
 *------------------------------------------------------------------------
 */
    env.disp= new Abubu.Plot2D({
        target : env.suv ,
        prevTarget : env.fuv ,
        colormap : env.colormap,
        canvas : canvas_1 ,
        minValue: -.2 ,
        maxValue: 1. ,
        tipt : false ,
        tiptThreshold : env.tiptThreshold ,
        probeVisible : false ,
        probePosition : [0.6,1.0] ,
        colorbar : true ,
        cblborder: 25 ,
        cbrborder: 15 ,
        unit : '',
    } );
    env.disp.showColorbar() ;
    env.disp.addMessage(  'v-variable',
                        0.05,   0.05, /* Coordinate of the
                                         message ( x,y in [0-1] )   */
                        {   font: "Bold 14pt Arial",
                            style:"#ffffff",
                            align : "start"             }   ) ;
    // env.disp.addMessage(  'Simulation by Abouzar Kaboudian @ CHAOS Lab',
    //                     0.05,   0.1,
    //                     {   font: "italic 10pt Arial",
    //                         style: "#ffffff",
    //                         align : "start"             }  ) ;

/*------------------------------------------------------------------------
 * initialize
 *------------------------------------------------------------------------
 */
    env.initialize = function(){
        env.time = 0 ;
        env.paceTime = 0 ;
        env.breaked = false ;
        env.init.render() ;
        env.disp.initialize() ;
        refreshDisplay() ;
    }

/*-------------------------------------------------------------------------
 * Render the programs
 *-------------------------------------------------------------------------
 */
   env.initialize() ;

/*------------------------------------------------------------------------
 * createGui
 *------------------------------------------------------------------------
 */
   createGui() ;

/*------------------------------------------------------------------------
 * clicker
 *------------------------------------------------------------------------
 */
    env.mouseListener_1 = new Abubu.MouseListener({
        canvas : env.canvas_1 ,
        event  : 'drag' ,
        callback: function(e){
          //  console.log(e) ;
            env.click.uniforms.clickPosition.value = e.position ;
            clickSolve() ;
        }
    }) ;
 
    env.noSteps = 0 ;
    env.lapsed = 0 ;

/*------------------------------------------------------------------------
 * rendering the program ;
 *------------------------------------------------------------------------
 */
    env.render = function(){
        if (env.running){
            env.startDate = performance.now() ;
            for(var i=0 ; i< env.frameRate/120 ; i++){
                env.comp1.render() ;
                stats.update() ;

                env.comp2.render() ;
                stats.update() ;

                env.time += 2.0*env.dt ;
                env.paceMaker.call(env.time) ;
                env.noSteps += 2 ;
                env.disp.updateTipt() ;
            }
            env.endDate = performance.now() ;
            env.lapsed += (env.endDate - env.startDate) ;

            if ( env.lapsed >10 ){
                env.fps = env.noSteps*1000.0/env.lapsed;
                env.noSteps = 0.0 ;
                env.lapsed = 0.0 ;
            }
            refreshDisplay();
        }
        requestAnimationFrame(env.render) ;
    }

/*------------------------------------------------------------------------
 * add environment to document
 *------------------------------------------------------------------------
 */
    window.env = env ;

/*------------------------------------------------------------------------
 * render the webgl program
 *------------------------------------------------------------------------
 */
    env.render();

}/*  End of loadWebGL  */

/*========================================================================
 * refreshDisplay
 *========================================================================
 */
function refreshDisplay(){
    env.disp.render() ;
}

/*========================================================================
 * solve click event
 *========================================================================
 */
function clickSolve(){
    env.click.render() ;
    env.clickCopy.render() ;
    refreshDisplay() ;
}

/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * End of require()
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
loadWebGL() ;
} ) ;
