/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * WEBGL 2.0    :   2D Lattice-Boltzmann 
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Wed 24 Oct 2018 16:45:17 (EDT) 
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
define([    'require',
            'shader!vertShader.vert',
            'shader!initShader.frag',
            'shader!collideShader.frag',
            'shader!streamShader.frag',
            'shader!curlShader.frag',
            'shader!boundaryShader.frag',
            'shader!paceShader.frag',
            'shader!clickShader.frag',
            'shader!bvltShader.frag',
            ],
function(   require,
            vertShader,
            initShader,
            collideShader,
            streamShader,
            curlShader,
            boundaryShader,
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
    gui.mdlPrmFldr.add( env, 'viscosity').onChange(function(){
            env.stream.uniforms.viscosity.value = env.viscosity ;
            env.collide.uniforms.viscosity.value = env.viscosity ;
            env.init.uniforms.viscosity.value = env.viscosity ;
            } ) ;
    gui.mdlPrmFldr.add( env, 'u0').onChange(function(){
            env.stream.uniforms.u0.value = env.u0 ;
            env.init.uniforms.u0.value = env.u0 ;
            } ) ;
    gui.mdlPrmFldr.add( env, 'dt').onChange(function(){
            env.stream.uniforms.dt.value = env.dt ;
            env.collide.uniforms.dt.value = env.dt ;
            env.init.uniforms.dt.value = env.dt ;
            } ) ;
    gui.mdlPrmFldr.add( env, 'dx').onChange(function(){
            env.stream.uniforms.dx.value = env.dx ;
            env.collide.uniforms.dx.value = env.dx ;
            env.init.uniforms.dx.value = env.dx ;
    } ) ;


    gui.mdlPrmFldr.open() ;

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
    
    gui.dspPrmFldr.add( env, 'range' ).min(0.0001).step(0.0001).max(0.1).onChange(function(){
        env.disp.setMinValue( -env.range ) ;
        env.disp.setMaxValue(  env.range ) ;
        refreshDisplay() ;
    } ) ;

    gui.dspPrmFldr.add( env, 'frameRate').name('Frame Rate Limit')
        .min(60).max(36000).step(60) ;
    gui.dspPrmFldr.open() ;

/*------------------------------------------------------------------------
 * save
 *------------------------------------------------------------------------
 */
    var svePrmFldr = gui.addFolder('Save Canvases') ;
    svePrmFldr.add( env, 'savePlot2DPrefix').name('File Name Prefix') ;
    svePrmFldr.add( env, 'savePlot2D' ).name('Save Plot2D') ;

/*------------------------------------------------------------------------
 * Simulation
 *------------------------------------------------------------------------
 */
    gui.smlPrmFldr  = gui.addFolder(    'Simulation'    ) ;
    gui.smlPrmFldr.add( env,  'clickRadius' )
        .min(0.002).max(.1).step(0.001)
        .name('Click Radius')
        .onChange(function(){
                env.click.setUniform('clickRadius',env.clickRadius) ;
                } ) ;
    gui.smlPrmFldr.add( env,
        'clicker',
        [   'Create Barrier',
            'Clear Barrier',
              ] ).name('Clicker Type') ;

    gui.smlPrmFldr.add( env, 'time').name('Solution Time [ms]').listen() ;
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
        if (options != undefined ){
            if (options.min != undefined ){
                min = options.min ;
            }
            if (options.max != undefined ){
                max = options.max ;
            }
        }
        for(var i=0; i<coefs.length; i++){
            var coef = addCoef(fldr,coefs[i],solvers) ;
            if (min != undefined ){
                coef.min(min) ;
            }
            if (max != undefined ){
                coef.max(max) ;
            }
            coefGui[coefs[i]] = coef ;
        }
        return coefGui ;

        /* addCoef */
        function addCoef( fldr,
                coef,
                solvers     ){
            var coefGui =   fldr.add( env, coef )
                .onChange(
                        function(){
                        Abubu.setUniformInSolvers(  coef,
                                env[coef],
                                solvers  ) ;
                        } ) ;

            return coefGui ;

        }
    }

    return ;
} /* End of createGui */

/*========================================================================
 * Environment
 *========================================================================
 */
function Environment(){
    this.running = false ;

    /* model parameters         */
    this.viscosity   = 0.05 ;
    this.u0          = 0.17 ;

    /* Display Parameters       */
    this.colormap    =   'jet';
    this.dispWidth   =   1200 ;
    this.dispHeight  =   300 ;
    this.frameRate   =   2400 ;
    this.timeWindow  =   1000 ;
    this.probeVisiblity = false ;
    this.range      = 0.01 ;

    /* Solver Parameters        */
    this.width       =   1200 ;
    this.height      =   300 ;

    this.dt          =  1.0 ;
    this.dx          =  1.0 ;


    /* Solve                    */
    this.solve       = function(){
        this.running = !this.running ;
        return ;
    } ;
    this.time        = 0.0 ;
    this.clicker     = 'Create Barrier';


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
    this.clickRadius     = 0.01 ;
    this.clickPosition   = [0.5,0.5] ;
    this.clickValue     = [0.,0,0,0] ;
}

var canvas_1 ;
/*========================================================================
 * Initialization of the GPU and Container
 *========================================================================
 */
function loadWebGL()
{
    env = new Environment() ;

    canvas_1 = document.createElement('canvas') ;
    document.body.append(canvas_1) ;
    canvas_1.width = env.dispWidth ;
    canvas_1.height= env.dispHeight ;

/*-------------------------------------------------------------------------
 * stats
 *-------------------------------------------------------------------------
 */
    var stats       = new Stats() ;
    document.body.appendChild( stats.domElement ) ;

/*------------------------------------------------------------------------
 * defining all render targets
 *------------------------------------------------------------------------
 */
    var width   = env.width ;
    var height  = env.height ;

    env.e_n_s_e_w       = new Abubu.Float32Texture( width, height ) ;
    env.o_n_s_e_w       = new Abubu.Float32Texture( width, height ) ;
    
    env.e_ne_se_nw_sw   = new Abubu.Float32Texture( width, height ) ;
    env.o_ne_se_nw_sw   = new Abubu.Float32Texture( width, height ) ;
    
    env.e_n0_rho_ux_uy  = new Abubu.Float32Texture( width, height ) ;
    env.o_n0_rho_ux_uy  = new Abubu.Float32Texture( width, height ) ;
    
    env.e_fluid_curl    = new Abubu.Float32Texture( width, height ) ;
    env.o_fluid_curl    = new Abubu.Float32Texture( width, height ) ;

/*------------------------------------------------------------------------
 * init solver to initialize all textures
 *------------------------------------------------------------------------
 */
    env.init  = new Abubu.Solver( {
       fragmentShader  : initShader.value ,
       vertexShader    : vertShader.value ,
       uniforms: { 
            viscosity       : { type : 'f', value : env.viscosity       } ,
            u0              : { type : 'f', value : env.u0              } ,
            dt              : { type : 'f', value : env.dt              } ,
            dx              : { type : 'f', value : env.dx              } ,
            width   : { type : 'f', value : env.width   } ,
            height  : { type : 'f', value : env.height  } ,
            } ,
       renderTargets   : {
        e_n_s_e_w       : { location : 0, target: env.e_n_s_e_w         } ,
        o_n_s_e_w       : { location : 1, target: env.o_n_s_e_w         } ,
        e_ne_se_nw_sw   : { location : 2, target: env.e_ne_se_nw_sw     } ,
        o_ne_se_nw_sw   : { location : 3, target: env.o_ne_se_nw_sw     } , 
        e_n0_rho_ux_uy  : { location : 4, target: env.e_n0_rho_ux_uy    } , 
        o_n0_rho_ux_uy  : { location : 5, target: env.o_n0_rho_ux_uy    } , 
        e_fluid_curl    : { location : 6, target: env.e_fluid_curl      } ,
        o_fluid_curl    : { location : 7, target: env.o_fluid_curl      } ,
       }
    } ) ;

/*------------------------------------------------------------------------
 * even and odd collide solvers
 *------------------------------------------------------------------------
 */
    env.collide = new Abubu.Solver({
        fragmentShader : collideShader.value ,
        vertexShader   : vertShader.value ,
        uniforms : {
            in_n_s_e_w      : { type : 't', value : env.e_n_s_e_w       } ,
            in_ne_se_nw_sw  : { type : 't', value : env.e_ne_se_nw_sw   } ,
            in_n0_rho_ux_uy : { type : 't', value : env.e_n0_rho_ux_uy  } ,
            viscosity       : { type : 'f', value : env.viscosity       } ,
            dt              : { type : 'f', value : env.dt              } ,
            dx              : { type : 'f', value : env.dx              } ,
        } ,
        renderTargets  : {
            out_n_s_e_w     : 
                { location : 0 , target : env.o_n_s_e_w     } ,
            out_ne_se_nw_sw : 
                { location : 1 , target : env.o_ne_se_nw_sw } ,
            out_n0_rho_ux_uy: 
                { location : 2 , target : env.o_n0_rho_ux_uy} ,
        } ,
 
        clear   : true
    } ) ;

/*------------------------------------------------------------------------
 * stream 
 *------------------------------------------------------------------------
 */
    env.stream = new Abubu.Solver({
        fragmentShader  : streamShader.value ,
        vertexShader    : vertShader.value ,
        uniforms    : {
            in_n_s_e_w      : { type : 't', value : env.o_n_s_e_w       } ,
            in_ne_se_nw_sw  : { type : 't', value : env.o_ne_se_nw_sw   } ,
            in_n0_rho_ux_uy : { type : 't', value : env.o_n0_rho_ux_uy  } ,
            in_fluid_curl   : { type : 't', value : env.o_fluid_curl    } ,
            viscosity       : { type : 'f', value : env.viscosity       } ,
            u0              : { type : 'f', value : env.u0              } ,
            dt              : { type : 'f', value : env.dt              } ,
            dx              : { type : 'f', value : env.dx              } ,

        } ,
        renderTargets: {
            out_n_s_e_w     : 
                { location : 0 , target : env.e_n_s_e_w     } ,
            out_ne_se_nw_sw : 
                { location : 1 , target : env.e_ne_se_nw_sw } ,
            out_n0_rho_ux_uy: 
                { location : 2 , target : env.e_n0_rho_ux_uy} ,
        } ,
        clear : true ,
    } ) ;

/*------------------------------------------------------------------------
 * calculate curl 
 *------------------------------------------------------------------------
 */
    env.curl = new Abubu.Solver({
        fragmentShader  : curlShader.value ,
        vertexShader    : vertShader.value ,
        uniforms        : {
            in_n0_rho_ux_uy : { type : 't', value : env.e_n0_rho_ux_uy  } ,
            in_fluid_curl   : { type : 't', value : env.e_fluid_curl    } ,
        } ,
        renderTargets   : { 
            out_fluid_curl : 
                { location : 0 , target : env.o_fluid_curl } 
        } ,
        clear : true ,
    } ) ;

    env.curlCopy = new Abubu.Copy(env.o_fluid_curl, env.e_fluid_curl ) ;

    env.computeCurl = function(){
        env.curl.render() ;
        env.curlCopy.render() ;
    } ;

/*------------------------------------------------------------------------
 * click solver
 *------------------------------------------------------------------------
 */
    env.click = new Abubu.Solver( {
        vertexShader    : vertShader.value ,
        fragmentShader  : clickShader.value ,
        uniforms        : {
            map             : { type: 't',  value : env.o_fluid_curl   } ,
            clickValue      : { type: 'v4', value : 
                env.clickValue        } ,
            clickPosition   : { type: 'v2', value : env.clickPosition  } ,
            clickRadius     : { type: 'f',  value : env.clickRadius    } ,
        } ,
        renderTargets   : {
            FragColor   : { location : 0,   target : env.e_fluid_curl  } ,
        } ,
        clear           : true ,
    } ) ;
    env.clickCopy = new Abubu.Copy(env.e_fluid_curl, env.o_fluid_curl ) ;
    
/*------------------------------------------------------------------------
 * disp
 *------------------------------------------------------------------------
 */
    env.disp= new Abubu.Plot2D({
       // target : env.e_n0_rho_ux_uy ,
        target : env.o_fluid_curl ,
        phase  : env.e_fluid_curl ,
        phaseColor : [1.,1.0,1.0,1],
        channel: 'g',
        colormap : env.colormap,
        canvas : canvas_1 ,
        minValue: -env.range ,
        maxValue: env.range ,
        colorbar : false ,
        unit : '',
    } );
    
 //   env.disp.addMessage(  'LBM Method',
 //                       0.05,   0.08, /* Coordinate of the
 //                                        message ( x,y in [0-1] )   */
 //                       {   font: "12pt Arial",
 //                           style:"#000000",
 //                           align : "start"             }   ) ;

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
    canvas_1.addEventListener("click",      onClick,        false   ) ;
    canvas_1.addEventListener('mousemove',
            function(e){
                if ( e.buttons >=1 ){
                    onClick(e) ;
                }
            } , false ) ;

    env.noSteps = 0 ;
    env.lapsed = 0 ;
    
/*------------------------------------------------------------------------
 * rendering the program ;
 *------------------------------------------------------------------------
 */
    env.render = function(){
        if (env.running){
            env.startDate = performance.now() ;
            for(var i=0 ; i< env.frameRate/60 ; i++){
                env.collide.render() ;
                env.stream.render() ;
                stats.update() ;
                
                env.time += 1 ;
                env.disp.updateTipt() ;
            }
            env.computeCurl() ;
            env.endDate = performance.now() ;
            env.lapsed += (env.endDate - env.startDate) ;
            refreshDisplay();
        }
        requestAnimationFrame(env.render) ;
    }

/*------------------------------------------------------------------------
 * add environment to document
 *------------------------------------------------------------------------
 */
    document.env = env ;

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
 * onClick
 *========================================================================
 */
function onClick(e){
    env.clickPosition[0] =
        (e.clientX-canvas_1.offsetLeft) / env.dispWidth ;
    env.clickPosition[1] =  1.0-
        (e.clientY-canvas_1.offsetTop) / env.dispHeight ;

    env.click.setUniform('clickPosition',env.clickPosition) ;

    if (    env.clickPosition[0]   >   1.0 ||
            env.clickPosition[0]   <   0.0 ||
            env.clickPosition[1]   >   1.0 ||
            env.clickPosition[1]   <   0.0 ){
        return ;
    }
    clickRender() ;
    return ;
}

/*========================================================================
 * Render and display click event
 *========================================================================
 */
function clickRender(){
    switch( env['clicker']){
    case 'Create Barrier':
        env.click.setUniform('clickValue', [0,0,0,0]) ;
        clickSolve() ;
        requestAnimationFrame(clickSolve) ;
        break ;
    case 'Clear Barrier':
        env.click.setUniform('clickValue', [1,0,0,0]) ;
        clickSolve() ;
        requestAnimationFrame(clickSolve) ;
        break ;
   case 'Signal Loc. Picker':
        env.plot.setProbePosition( env.clickPosition ) ;
        env.disp.setProbePosition( env.clickPosition ) ;
        env.plot.init() ;
        refreshDisplay() ;
        break ;
    case 'Autopace Loc. Picker':
        ///pacePos = new THREE.Vector2(clickPos.x, env.clickPosition[1]) ;
        paceTime = 0 ;
    }
    return ;
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
