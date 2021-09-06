/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * WEBGL 2.0    :   Atrial Minimal Model
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Mon 11 Jun 2018 05:16:56 PM EDT
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
define([    'require',
            'shader!vertShader.vert',
            'shader!crdtShader.frag',
            'shader!neighborMapShader.frag',
            'shader!initShader.frag',
            'shader!compShader.frag',
            'shader!pAvgShader.frag',
            'shader!clickShader.frag',
            'Abubu/Abubu',
            'image!./structure.png',
            ],
function(   require,
            vertShader,
            crdtShader,
            neighborMapShader,
            initShader,
            compShader,
            pAvgShader,
            clickShader,
            Abubu,
            structure,
            ){
            "use strict" ;

var log = console.log ;
var params ;        /* parameters = env         */
var env ;           /* environmental variables  */
var gui ;
/*========================================================================
 * createGui()
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
    gui.mdlPrmFldr.add(env, 'Set', 
        ['P1','P1-Alt','P2','P3','P4','P5','original'])
                                        .onChange(updateSet) ;
    addCoeficients( gui.mdlPrmFldr, [
            'u_c' , 'u_v' , 'u_w',  'u_d',  't_vm', 't_vp', 't_wm', 't_wp', 
            't_sp', 't_sm' ,'u_csi','x_k',  't_d',  't_o',  't_soa',
            't_sob','u_so', 'x_tso','t_si', 't_vmm','C_m',  'diffCoef'  ] , 
            [env.comp1,env.comp2], {min:0}) ;

    gui.mdlPrmFldr.open() ;
/*------------------------------------------------------------------------
 * display
 *------------------------------------------------------------------------
 */
    gui.dispFldr = gui.addFolder('Display');
    gui.dispFldr.add( env, 'colormap',
            Abubu.getColormapList() )
                .onChange(  function(){
                                env.vrc.setColormap(env.colormap);
                                env.vrc.render() ;
                            }   ).name('Colormap') ;

    gui.dispFldr.add(env, 'alphaCorrection').name('Alpha Correction').
        min(0.003).max(1.0).onChange(function(){
                env.vrc.setAlphaCorrection( env.alphaCorrection ) ;
                } ) ;
    gui.dispFldr.add(env, 'noSteps').name('Number of Steps').
        min(30).max(200).step(1).onChange(function(){
                env.vrc.setNoSteps(env.noSteps) ;
        } ) ;
    gui.dispFldr.add(env, 'lightShift').step(0.05).onChange(function(){
        env.vrc.setLightShift( env.lightShift) ;
    } ) ;

    gui.dispFldr.add(env, 'frameRate').min(60).max(12000).step(60) ;
    gui.dispFldr.open() ;


/*------------------------------------------------------------------------
 * simulation
 *------------------------------------------------------------------------
 */
    gui.smlPrmFldr = gui.addFolder('Simulation') ;
    gui.smlPrmFldr.add( env, 'time').listen() ;
    gui.smlPrmFldr.add( env, 'initialize').name('Initialize Solution') ;
    gui.smlPrmFldr.add( env, 'solve' ).name('Solve/Pause') ;
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
            var coefGui =   fldr.add( params, coef )
                .onChange( 
                        function(){
                        Abubu.setUniformInSolvers(  coef, 
                                params[coef], 
                                solvers  ) ;
                        } ) ;

            return coefGui ;

        }
    }
}

/*========================================================================
 * updateSet
 *========================================================================
 */
function updateSet(){
    switch (env.Set){
        case 'P1' :
            env.u_c     = 0.1313    ; 
            env.u_v     = 0.3085    ; 
            env.u_w     = 0.2635    ; 
            env.u_d     = 0.05766   ; 
            env.t_vm    = 57.12     ; 
            env.t_vp    = 2.189     ; 
            env.t_wm    = 68.50     ; 
            env.t_wp    = 871.4     ; 
            env.t_sp    = 1.110     ; 
            env.t_sm    = 1.7570    ; 
            env.u_csi   = 0.1995    ; 
            env.x_k     = 6.043     ; 
            env.t_d     = 0.12990   ; 
            env.t_o     = 15.17     ; 
            env.t_soa   = 72.66     ; 
            env.t_sob   = 7.933     ; 
            env.u_so    = 0.4804    ; 
            env.x_tso   = 2.592     ; 
            env.t_si    = 40.11     ; 
            env.t_vmm   = 1012      ; 
            env.diffCoef= 1.611E-03 ;

            break ;
        case 'P1-Alt':
            env.u_c     = 0.2171     ; 
            env.u_v     = 0.1142     ; 
            env.u_w     = 0.2508     ; 
            env.u_d     = 0.1428     ; 
            env.t_vm    = 46.77      ; 
            env.t_vp    = 1.759      ; 
            env.t_wm    = 80.18      ; 
            env.t_wp    = 749.5      ; 
            env.t_sp    = 1.484      ; 
            env.t_sm    = 1.983      ; 
            env.u_csi   = 0.2168     ; 
            env.x_k     = 21.62      ; 
            env.t_d     = 0.08673    ; 
            env.t_o     = 17.05      ; 
            env.t_soa   = 54.90      ; 
            env.t_sob   = 1.685      ; 
            env.u_so    = 0.6520     ; 
            env.x_tso   = 2.161      ; 
            env.t_si    = 38.82      ; 
            env.t_vmm   = 1321       ; 
            env.diffCoef= 1.337E-03  ;

            break ;

        case 'P2' :
            env.u_c     = 0.2579     ; 
            env.u_v     = 0.1799     ; 
            env.u_w     = 0.2566     ; 
            env.u_d     = 0.1943     ; 
            env.t_vm    = 40.31      ; 
            env.t_vp    = 1.349      ; 
            env.t_wm    = 89.08      ; 
            env.t_wp    = 777.0      ; 
            env.t_sp    = 1.144      ; 
            env.t_sm    = 1.086      ; 
            env.u_csi   = 0.2722     ; 
            env.x_k     = 6.142      ; 
            env.t_d     = 0.04456    ; 
            env.t_o     = 23.45      ; 
            env.t_soa   = 97.89      ; 
            env.t_sob   = 3.308      ; 
            env.u_so    = 0.4185     ; 
            env.x_tso   = 1.997      ; 
            env.t_si    = 36.60      ; 
            env.t_vmm   = 1183       ; 
            env.diffCoef= 1.405E-03  ;

            break ;

        case 'P3' :
            env.u_c     = 0.2131     ; 
            env.u_v     = 0.1107     ; 
            env.u_w     = 0.2798     ; 
            env.u_d     = 0.1601     ; 
            env.t_vm    = 35.75      ; 
            env.t_vp    = 1.247      ; 
            env.t_wm    = 109.8      ; 
            env.t_wp    = 751.8      ; 
            env.t_sp    = 1.487      ; 
            env.t_sm    = 2.241      ; 
            env.u_csi   = 0.2097     ; 
            env.x_k     = 8.679      ; 
            env.t_d     = 0.06880    ; 
            env.t_o     = 18.31      ; 
            env.t_soa   = 54.43      ; 
            env.t_sob   = 4.894      ; 
            env.u_so    = 0.6804     ; 
            env.x_tso   = 2.187      ; 
            env.t_si    = 40.39      ; 
            env.t_vmm   = 1187       ; 
            env.diffCoef= 1.704E-03  ;

            break ;
        
        case 'P4' :
            env.u_c     = 0.2069      ; 
            env.u_v     = 0.03489     ; 
            env.u_w     = 0.1788      ; 
            env.u_d     = 3.140E-04   ; 
            env.t_vm    = 971.3       ; 
            env.t_vp    = 2.243       ; 
            env.t_wm    = 110.7       ; 
            env.t_wp    = 616.0       ; 
            env.t_sp    = 16.29       ; 
            env.t_sm    = 7.104E-03   ; 
            env.u_csi   = 0.1682      ; 
            env.x_k     = 8.958       ; 
            env.t_d     = 0.08511     ; 
            env.t_o     = 6.754       ; 
            env.t_soa   = 152.9       ; 
            env.t_sob   = 19.82       ; 
            env.u_so    = 6.013E-03   ; 
            env.x_tso   = 8.677       ; 
            env.t_si    = 18.94       ; 
            env.t_vmm   = 120.5       ; 
            env.diffCoef= 2.696E-03   ;

            break ;
        
        case 'P5' :
            env.u_c     = 0.2588      ; 
            env.u_v     = 0.1382      ; 
            env.u_w     = 0.2589      ; 
            env.u_d     = 0.1797      ; 
            env.t_vm    = 45.15       ; 
            env.t_vp    = 2.194       ; 
            env.t_wm    = 166.4       ; 
            env.t_wp    = 836.3       ; 
            env.t_sp    = 1.315       ; 
            env.t_sm    = 0.764       ; 
            env.u_csi   = 0.2023      ; 
            env.x_k     = 7.351       ; 
            env.t_d     = 0.06711     ; 
            env.t_o     = 18.28       ; 
            env.t_soa   = 105.4       ; 
            env.t_sob   = 3.264       ; 
            env.u_so    = 0.3497      ; 
            env.x_tso   = 1.968       ; 
            env.t_si    = 39.23       ; 
            env.t_vmm   = 1166        ; 
            env.diffCoef= 8.479E-04   ;

            break ;
        
        case 'original' :
            env.u_c     = 0.1300      ; 
            env.u_v     = 0.04000     ; 
            env.u_w     = 0.1300      ; 
            env.u_d     = 0.1300      ; 
            env.t_vm    = 19.60       ; 
            env.t_vp    = 3.330       ; 
            env.t_wm    = 41.00       ; 
            env.t_wp    = 870.0       ; 
            env.t_sp    = 1.000       ; 
            env.t_sm    = 1.000       ; 
            env.u_csi   = 0.8500      ; 
            env.x_k     = 10.00       ; 
            env.t_d     = 0.2500      ; 
            env.t_o     = 12.50       ; 
            env.t_soa   = 33.30       ; 
            env.t_sob   = 33.30       ; 
            env.u_so    = 0.8500      ; 
            env.x_tso   = 10.00       ; 
            env.t_si    = 29.00       ; 
            env.t_vmm   = 1250        ; 
            env.diffCoef= 1.000E-3    ;

            break ;
    }

    Abubu.setUniformsInSolvers( [
            'u_c'        , 
            'u_v'        , 
            'u_w'        , 
            'u_d'        , 
            't_vm'       , 
            't_vp'       , 
            't_wm'       , 
            't_wp'       , 
            't_sp'       , 
            't_sm'       , 
            'u_csi'      , 
            'x_k'        , 
            't_d'        , 
            't_o'        , 
            't_soa'      , 
            't_sob'      , 
            'u_so'       , 
            'x_tso'      , 
            't_si'       , 
            't_vmm'      ,
            'diffCoef'     ] ,
            [ 
            env.u_c        , 
            env.u_v        , 
            env.u_w        , 
            env.u_d        , 
            env.t_vm       , 
            env.t_vp       , 
            env.t_wm       , 
            env.t_wp       , 
            env.t_sp       , 
            env.t_sm       , 
            env.u_csi      , 
            env.x_k        , 
            env.t_d        , 
            env.t_o        , 
            env.t_soa      , 
            env.t_sob      , 
            env.u_so       , 
            env.x_tso      , 
            env.t_si       , 
            env.t_vmm      ,
            env.diffCoef  ] , [env.comp1, env.comp2] ) ;

    gui.mdlPrmFldr.updateDisplay() ;
}
/*========================================================================
 * Environment : structure that holds all global variables
 *========================================================================
 */
function Environment(){
    this.width      = 2048 ;
    this.height     = 1024 ;

    this.mx         = 16 ;
    this.my         = 8 ;

    this.domainResolution   = [128,128,128] ;
    this.domainSize         = [5.75,7.5,8] ;

    /* time coeficients         */
    this.minVlt     = -90 ;
    this.maxVlt     = 30 ;

    /* Model Parameters         */
    this.Set        = 'P1' ;
    this.u_c        = 0.1313    ; 
    this.u_v        = 0.3085    ; 
    this.u_w        = 0.2635    ; 
    this.u_d        = 0.05766   ; 
    this.t_vm       = 57.12     ; 
    this.t_vp       = 2.189     ; 
    this.t_wm       = 68.50     ; 
    this.t_wp       = 871.4     ; 
    this.t_sp       = 1.110     ; 
    this.t_sm       = 1.7570    ; 
    this.u_csi      = 0.1995    ; 
    this.x_k        = 6.043     ; 
    this.t_d        = 0.12990   ; 
    this.t_o        = 15.17     ; 
    this.t_soa      = 72.66     ; 
    this.t_sob      = 7.933     ; 
    this.u_so       = 0.4804    ; 
    this.x_tso      = 2.592     ; 
    this.t_si       = 40.11     ; 
    this.t_vmm      = 1012      ; 
    this.diffCoef   = 1.611E-03 ;
    this.C_m        = 1.0 ;


    this.dt         = 1.e-1 ;
    this.time       = 0 ;

    /* Display Parameters       */
    this.colormap    =   'jet';
    this.dispWidth   =   512 ;
    this.dispHeight  =   512 ;
    this.frameRate   =   2400 ;
    this.timeWindow  =   500 ;

    this.clickRadius = 0.1 ;
    this.alphaCorrection = 0.23 ;
    this.noSteps    = 120 ;
    this.lightShift = 1.2 ;

    this.running    = false ;
    this.solve      = function(){
        this.running = !this.running ;
    }
}

/*========================================================================
 * loadWebGL
 *========================================================================
 */
function loadWebGL()
{
    /* Create a Global Environment */
    env = new Environment() ;

    params = env ;

    var canvas_1 = document.getElementById("canvas_1") ;
    canvas_1.width = env.dispWidth ;
    canvas_1.height= env.dispHeight ;

    var canvas_2 = document.getElementById('canvas_2') ;
    canvas_2.width = env.dispWidth ;
    canvas_2.height= env.dispHeight ;

/*------------------------------------------------------------------------
 * sparsePhase
 *------------------------------------------------------------------------
 */
    log('Compressing structure...') ;
    env.sparsePhase = new Abubu.SparseDataFromImage(structure, 
            { channel : 'r', threshold : 0.01 } ) ;
    log('Done!') ;
    log('Compression ratio :', env.sparsePhase.getCompressionRatio() ) ;

    env.fphaseTxt   = env.sparsePhase.full  ;
    env.cphaseTxt   = env.sparsePhase.sparse ;
    env.compMap     = env.sparsePhase.compressionMap ;
    env.dcmpMap     = env.sparsePhase.decompressionMap ;

    env.width   = params.cphaseTxt.width ;
    env.height  = params.cphaseTxt.height ;
    env.fwidth  = params.fphaseTxt.width ;      /* full-width   */
    env.fheight = params.fphaseTxt.height ;     /* full-height  */

/*------------------------------------------------------------------------
 * stats
 *------------------------------------------------------------------------
 */
    env.stats   = new Stats() ;
    document.body.appendChild( env.stats.domElement ) ;

/*------------------------------------------------------------------------
 * set textures of calculation
 *------------------------------------------------------------------------
 */
    env.ftrgt = new Abubu.FloatRenderTarget(
        env.width  ,
        env.height
    ) ;

    env.strgt = new Abubu.FloatRenderTarget(
        env.width  ,
        env.height
    ) ;

    env.nsewAvgTxt = new Abubu.FloatRenderTarget(
        env.width ,
        env.height
    ) ;

    env.updnAvgTxt = new Abubu.FloatRenderTarget(
        env.width ,
        env.height
    ) ;

    env.nhshMapTxt = new Abubu.FloatRenderTarget(
        env.width ,
        env.height
    ) ;

    env.etwtMapTxt = new Abubu.FloatRenderTarget(
        env.width ,
        env.height
    ) ;

    env.updnMapTxt = new Abubu.FloatRenderTarget(
        env.width ,
        env.height
    ) ;

    env.crdtTxt  = new Abubu.FloatRenderTarget(
            env.fwidth,
            env.fheight
    ) ;
/*------------------------------------------------------------------------
 * coordinates
 *------------------------------------------------------------------------
 */
      env.coordinator  = new Abubu.Solver( {
        vertexShader    : vertShader.value ,
        fragmentShader  : crdtShader.value ,
        uniforms : {
            mx  : {
                type    : 'f',
                value   : env.mx
            } ,
            my : {
                type    : 'f',
                value   : env.my ,
            } ,
        } ,
        renderTargets : {
            crdt    : {
                location    : 0 ,
                target      : env.crdtTxt ,
            }
        } ,
    } ) ;
    env.coordinator.render() ;

/*------------------------------------------------------------------------
 * neighbors
 *------------------------------------------------------------------------
 */
    env.neighborMapper = new Abubu.Solver({
        vertexShader    : vertShader.value ,
        fragmentShader  : neighborMapShader.value ,
        uniforms        :{ 
            domainResolution : {
                type    : 'v3',
                value   : env.domainResolution 
            } ,
            mx  : {
                type    : 'f',
                value   : env.mx
            } ,
            my : {
                type    : 'f',
                value   : env.my ,
            } ,
            crdtTxt     : {
                type    : 't',
                value   : env.crdtTxt ,
            } ,
            compMap     : {
                type    : 't', 
                value   : env.compMap ,
            },
            dcmpMap     : {
                type    : 't',
                value   : env.dcmpMap ,
            }
        } ,
        renderTargets   : {
            nhshMap     : { location : 0,  target : env.nhshMapTxt } ,
            etwtMap     : { location : 1,  target : env.etwtMapTxt } ,
            updnMap     : { location : 2,  target : env.updnMapTxt } ,
        }
    } ) ;
  
    env.neighborMapper.render() ;

/*------------------------------------------------------------------------
 * init
 *------------------------------------------------------------------------
 */
    env.init = new Abubu.Solver({
        vertexShader    : vertShader.value ,
        fragmentShader  : initShader.value ,
        uniforms :{
            dcmpMap : { type: 't', value : env.dcmpMap  } ,
            crdtTxt : { type: 't', value : env.crdtTxt  } ,
        },
        renderTargets   : {
            outTrgt     : {
                location: 0 ,
                target  : env.ftrgt 
            } ,
            outSmhjd    : {
                location: 1 ,
                target  : env.strgt 
            } ,
        } ,
        clear   : true
    } ) ;

    env.init.render() ;

    env.initialize = function(){
        env.init.render() ;
    }

/*------------------------------------------------------------------------
 * pAvg
 *------------------------------------------------------------------------
 */
    env.calcPhaseAvg = new Abubu.Solver({
        vertexShader    : vertShader.value ,
        fragmentShader  : pAvgShader.value ,
        uniforms        : {
            phaseTxt    : {
                type    : 't', 
                value   : env.cphaseTxt ,
            } ,
            nhshMapTxt  : {
                type    : 't',
                value   : env.nhshMapTxt,
            } ,
            etwtMapTxt  : {
                type    : 't',
                value   : env.etwtMapTxt,
            } ,
            updnMapTxt  : {
                type    : 't',
                value   : env.updnMapTxt,
            } ,
        } ,
        renderTargets   : {
            nsew    : {
                location: 0 ,
                target  : env.nsewAvgTxt
            } ,
            updn    : {
                location: 1,
                target  : env.updnAvgTxt
            } ,
        } ,
        clear : true ,
    } ) ;

    env.calcPhaseAvg.render() ;
/*------------------------------------------------------------------------
 * comp1 and comp2
 *------------------------------------------------------------------------
 */
    env.compUniforms    = function( _inTrgt){
        /* Variable Texture Inputs */
        this.inTrgt     = { type : 't' , value : _inTrgt        } ;
        
        /* Domain Related */
        this.domainResolution = {
            type    : 'v3' ,
            value   : env.domainResolution
        } ;
        this.domainSize = { type : 'v3', value : env.domainSize } ;
        this.phaseTxt   = { type : 't' , value : env.cphaseTxt  } ;
        this.nsewAvgTxt = { type : 't' , value : env.nsewAvgTxt } ;
        this.updnAvgTxt = { type : 't' , value : env.updnAvgTxt } ;
        this.dt         = { type : 'f' , value : env.dt         } ;

        this.u_c        = { type : 'f' , value : env.u_c        } ;
        this.u_v        = { type : 'f' , value : env.u_v        } ;
        this.u_w        = { type : 'f' , value : env.u_w        } ;
        this.u_d        = { type : 'f' , value : env.u_d        } ;
        this.t_vm       = { type : 'f' , value : env.t_vm       } ;
        this.t_vp       = { type : 'f' , value : env.t_vp       } ;
        this.t_wm       = { type : 'f' , value : env.t_wm       } ;
        this.t_wp       = { type : 'f' , value : env.t_wp       } ;
        this.t_sp       = { type : 'f' , value : env.t_sp       } ;
        this.t_sm       = { type : 'f' , value : env.t_sm       } ;
        this.u_csi      = { type : 'f' , value : env.u_csi      } ;
        this.x_k        = { type : 'f' , value : env.x_k        } ;
        this.t_d        = { type : 'f' , value : env.t_d        } ;
        this.t_o        = { type : 'f' , value : env.t_o        } ;
        this.t_soa      = { type : 'f' , value : env.t_soa      } ;
        this.t_sob      = { type : 'f' , value : env.t_sob      } ;
        this.u_so       = { type : 'f' , value : env.u_so       } ;
        this.x_tso      = { type : 'f' , value : env.x_tso      } ;
        this.t_si       = { type : 'f' , value : env.t_si       } ;
        this.t_vmm      = { type : 'f' , value : env.t_vmm      } ;
        this.diffCoef   = { type : 'f' , value : env.diffCoef   } ;
        this.C_m        = { type : 'f' , value : env.C_m        } ;

        /* compression and phase-field maps */
        this.nhshMapTxt = {
                type    : 't',
                value   : env.nhshMapTxt,
            } ;
        this.etwtMapTxt = {
                type    : 't',
                value   : env.etwtMapTxt,
            } ;
        this.updnMapTxt = {
                type    : 't',
                value   : env.updnMapTxt,
            } ;

    } ;

    env.compTargets = function(_outTrgt){
        this.outTrgt    = { location: 0, target: _outTrgt       } ;
    } ;

    env.comp1Uniforms   = new env.compUniforms( env.ftrgt ) ;
    env.comp1Targets    = new env.compTargets(  env.strgt ) ;

    env.comp2Uniforms   = new env.compUniforms( env.strgt ) ;
    env.comp2Targets    = new env.compTargets(  env.ftrgt ) ;

    env.comp1 = new Abubu.Solver({
        vertexShader    : vertShader.value ,
        fragmentShader  : compShader.value ,
        uniforms        : env.comp1Uniforms ,
        renderTargets   : env.comp1Targets,
        clear: false ,
    } ) ;
    env.comp2 =  new Abubu.Solver({
        vertexShader    : vertShader.value ,
        fragmentShader  : compShader.value ,
        uniforms        : env.comp2Uniforms ,
        renderTargets   : env.comp2Targets ,
        clear :false ,
    } ) ;
                 
/*------------------------------------------------------------------------
 * VolumeRayCaster
 *------------------------------------------------------------------------
 */
    env.vrc = new Abubu.VolumeRayCaster({
        target          : env.ftrgt ,//fphaseTxt,
        phaseField      : env.fphaseTxt,
        compressionMap  : env.compMap,
        canvas          : canvas_1,
        channel         : 'r' ,
        threshold       : 0.2 ,
        noSteps         : env.noSteps,
        mx              : env.mx,
        my              : env.my ,
        pointLights     : [ 3,3,3,
                            -3,-3,-3,
                            10,10,10,
                            -10,-10,10,
                        ],
        lightShift      : env.lightShift , 
        floodLights     : [],
        minValue        : 0.2 ,
        maxValue        : 1. ,
        alphaCorrection : env.alphaCorrection ,
        colorbar        : true ,
        colormap        : env.colormap,
        unit            : ''
    } ) ;
    env.vrc.addMessage(
        '3D Atrial Minimal Model by Abouzar Kaboudian',
        0.5,
        0.05,
        {
            font: "italic 11pt Arial",
            style: "#000000",
            align : "center"
        }
    ) ;

    env.vrc.initForeground() ;

/*-------------------------------------------------------------------------
 * plot
 *-------------------------------------------------------------------------
 */
    env.plot = new Abubu.SignalPlot( { 
        noPltPoints : 512 ,
        grid    : 'on',
        nx : 5,
        ny : 7,
        xticks : { mode : 'auto', unit : 'ms', font:'11pt Times'} ,
        yticks : { mode : 'auto', unit : '' , precision:1} ,
        canvas : canvas_2 ,
        } ) ;
    env.vsgn = env.plot.addSignal( env.ftrgt, {
            channel : 'r',
            minValue : -.2 ,
            maxValue : 1.2 ,
            restValue: 0.,
            color : [1.,1.,1.],
            visible: true,
            linewidth : 3,
            timeWindow: env.timeWindow,
            probePosition : [0.5,0.5] , } ) ;

    env.plot.init(0) ;
    env.plot.render() ;

/*------------------------------------------------------------------------
 * click
 *------------------------------------------------------------------------
 */
    env.click = new Abubu.Solver({
        vertexShader    :   vertShader.value,
        fragmentShader  :   clickShader.value ,
        uniforms    :{
            clickCoordinates    : {
                type    :   't',
                value   :   env.vrc.clickCoordinates
            } ,
            clickRadius : {
                type    : 'f' ,
                value   : env.clickRadius,
            } ,
            clickValue  : {
                type    : 'f',
                value   : 1 ,
            } ,
            crdtTxt     : {
                type    : 't',
                value   : env.crdtTxt ,
            } ,
            compMap     : {
                type    : 't',
                value   : env.compMap 
            } ,
            dcmpMap     : {
                type    : 't',
                value   : env.dcmpMap
            },
            phaseTxt    : {
                type    : 't',
                value   : env.cphaseTxt ,
            } ,
            target      : {
                type    : 't',
                value   : env.ftrgt,
            } ,
        } ,
        renderTargets:{
            FragColor   : {
                location : 0 ,
                target  : env.strgt ,
            } ,
        },
    } ) ;

    env.copyClickValues = new Abubu.Copy( env.strgt, env.ftrgt ) ;

/*------------------------------------------------------------------------
 * adding event listeners
 *------------------------------------------------------------------------
 */
    env.ctrlClick = new Abubu.CtrlClickListener(
       canvas_1,
       function(e){
            env.vrc.updateClickPosition(e.position) ;
            env.click.render() ;
            env.copyClickValues.render() ;
       },
       {    mousemove : true ,}
    ) ;

    env.dbleClick = new Abubu.DoubleClickListener(
            canvas_1,
            function(e){
                env.vrc.updateClickPosition(e.position) ;
                env.click.render() ;
                env.copyClickValues.render() ;
    } ) ;
    

    env.shiftClick = new Abubu.ShiftClickListener(
            canvas_1,
            function(e){
                env.vrc.updateClickPosition(e.position) ;
                env.plot.setProbePosition( env.vrc.getClickVoxelPosition() ) ;
                env.plot.init() ;
            } ) ;
    env.longClick = new Abubu.LongClickListener(
            canvas_1,
            function(e){
                env.vrc.updateClickPosition(e.position) ;
                env.plot.setProbePosition( env.vrc.getClickVoxelPosition() ) ;
                env.plot.init() ;
            } ,
            { duration : 800 } ) ;
  
/*------------------------------------------------------------------------
 * rendering function
 *------------------------------------------------------------------------
 */
    env.render = function(){
        if (env.running){
            for(var i=0; i<(env.frameRate/120); i++){
                env.comp1.render() ;
                env.comp2.render() ;
                env.time += env.dt*2.0 ;
                env.stats.update() ;
                env.stats.update() ;
                env.plot.update(env.time) ;
            }
        }
        env.vrc.render() ;
        env.plot.render() ;
        requestAnimationFrame(env.render) ;
    }

/*------------------------------------------------------------------------
 * create gui and run
 *------------------------------------------------------------------------
 */
    createGui() ;
    env.render() ;

/*------------------------------------------------------------------------
 * adding environment to document
 *------------------------------------------------------------------------
 */
    document.env = env;

}/*  End of loadWebGL  */
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * End of require()
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
loadWebGL() ;
} ) ;
