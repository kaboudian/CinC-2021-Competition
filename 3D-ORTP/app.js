"use strict" ;

/*========================================================================
 * get the source code for fragment shaders
 *========================================================================
 */
function source( sid ){
    return  document.getElementById( sid ).innerHTML.trim() ;
}



/*========================================================================
 * Environment : structure that holds all global variables
 *========================================================================
 */
function Environment(){
    this.domainSize         = [8,8,8] ;
   /* Model Parameters         */
    this.capacitance= 0.185,

    this.C_m        = 1.0 ;
    this.diffCoef   = 0.001 ;

    this.minVlt     = -100 ;
    this.maxVlt     = 50. ;

    
    /* Extra-cellular concenterations */
    this.Ca_o       = 1.8 ;
    this.Na_o       = 140 ;
    this.K_o        = 5.4 ;

    /* Current Multipliers      */
    this.C_Na       = 1.0 ; 
    this.C_NaCa     = 1.0 ; 
    this.C_to       = 1.0 ; 
    this.C_CaL      = 1.0 ; 
    this.C_CaNa     = 1.0 ; 
    this.C_CaK      = 1.0 ; 
    this.C_Kr       = 1.0 ; 
    this.C_Ks       = 1.0 ; 
    this.C_K1       = 1.0 ; 
    this.C_NaCai    = 1.0 ; 
    this.C_NaCass   = 1.0 ; 
    this.C_NaKNa    = 1.0 ; 
    this.C_NaKK     = 1.0 ; 
    this.C_NaK      = 1.0 ; 
    this.C_Nab      = 1.0 ; 
    this.C_Kb       = 1.0 ; 
    this.C_Cab      = 1.0 ; 
    this.C_pCa      = 1.0 ; 
    this.C_relNP    = 1.0 ; 
    this.C_relCaMK  = 1.0 ; 
    this.C_upNP     = 1.0 ; 
    this.C_upCaMK   = 1.0 ; 
    this.C_leak     = 1.0 ; 
    this.C_up       = 1.0 ; 
    this.C_tr       = 1.0 ; 
    this.C_rel      = 1.0 ; 
    this.C_diffCa   = 1.0 ; 
    this.C_diffNa   = 1.0 ; 
    this.C_diffK    = 1.0 ; 

    /* Time Factor Multipliers  */
    this.Ct_m        =   1.0 ; 
    this.Ct_h        =   1.0 ; 
    this.Ct_j        =   1.0 ; 
    this.Ct_hCaMKslow=   1.0 ; 
    this.Ct_hslow    =   1.0 ; 
    this.Ct_mL       =   1.0 ; 
    this.Ct_jCaMK    =   1.0 ; 
    this.Ct_hL       =   1.0 ; 
    this.Ct_hLCaMK   =   1.0 ; 
    this.Ct_a        =   1.0 ; 
    this.Ct_ifast    =   1.0 ; 
    this.Ct_islow    =   1.0 ; 
    this.Ct_aCaMK    =   1.0 ; 
    this.Ct_iCaMKfast=   1.0 ; 
    this.Ct_iCaMKslow=   1.0 ; 
    this.Ct_d        =   1.0 ; 
    this.Ct_ffast    =   1.0 ; 
    this.Ct_fslow    =   1.0 ; 
    this.Ct_fCafast  =   1.0 ; 
    this.Ct_fCaslow  =   1.0 ; 
    this.Ct_jCa      =   1.0 ; 
    this.Ct_fCaMKfast=   1.0 ; 
    this.Ct_fCaCaMKfast =    1.0 ;
    this.Ct_n        =   1.0 ; 
    this.Ct_xrfast   =   1.0 ; 
    this.Ct_xrslow   =   1.0 ; 
    this.Ct_xs1      =   1.0 ; 
    this.Ct_xs2      =   1.0 ; 
    this.Ct_xk1      =   1.0 ; 
    this.Ct_relNP    =   1.0 ; 
    this.Ct_relCaMK  =   1.0 ; 
    this.Ct_tr       =   1.0 ; 
    this.Ct_diffCa   =   1.0 ; 
    this.Ct_diffNa   =   1.0 ; 
    this.Ct_diffK    =   1.0 ; 

    /* Scaling Factors          */
    this.EPI         = 0 ;
    this.ENDO        = 1 ;
    this.MID         = 2 ;
    this.cellType    =  this.MID ;
    this.epiEndoMid  =  'Mid-Myocardium';
    this.SGNalate    =   1.0 ; 
    this.SGto        =   1.0 ; 
    this.SPCa        =   1.0 ; 
    this.SGKr        =   1.0 ; 
    this.SGKs        =   1.0 ; 
    this.SGK1        =   1.0 ; 
    this.SGNaCa      =   1.0 ; 
    this.SGNaK       =   1.0 ; 
    this.SGKb        =   1.0 ; 
    this.SJrel       =   1.0 ; 
    this.SJup        =   1.0 ; 
    this.SCMDN       =   1.0 ; 

    /* Display Parameters       */
    this.colormap    =   'oygb';
    this.dispWidth   =   512 ;
    this.dispHeight  =   512 ;
    this.frameRate   =   2400 ;
    this.timeWindow  =   1000 ;
    this.probeVisiblity = false ;

    this.tiptVisiblity= false ;
    this.tiptThreshold=  -80.;
    this.tiptColor    = "#FFFFFF";

    /* Solver Parameters        */
    this.width       =   512 ;
    this.height      =   512 ;
    this.dt          =   1.e-1 ;
    this.cfl         =   1.0 ;
    this.ds_x        =   12 ;
    this.ds_y        =   12 ;
    this.C_Na        =   1.0 ;
    this.C_NaCa      =   1.0 ;
    this.C_to        =   1.0 ;
    this.C_CaL       =   1.0 ;
    this.C_Kr        =   1.0 ;
    this.C_Ks        =   1.0 ;
    this.C_K1        =   1.0 ;
    this.C_NaK       =   1.0 ;
    this.C_bNa       =   1.0 ;
    this.C_pK        =   1.0 ;
    this.C_bCa       =   1.0 ;
    this.C_pCa       =   1.0 ;
    this.C_leak      =   1.0 ;
    this.C_up        =   1.0 ;
    this.C_rel       =   1.0 ;
    this.C_xfer      =   1.0 ;

    /* Model Parameters         */
    this.C_m        = 1.0 ;
    this.diffCoef   = 0.001 ;

    this.dt         = 1.e-1 ;
    this.time       = 0 ;

    /* Display Parameters       */
    this.colormap    =   'oygb';
    this.dispWidth   =   512 ;
    this.dispHeight  =   512 ;
    this.frameRate   =   2400 ;
    this.timeWindow  =   1000 ;

    this.clickRadius = 0.1 ;
    this.alphaCorrection = 0.24 ;
    this.structural_alpha = 1.0 ;
    this.noSteps    = 120 ;
    this.lightShift = 1.2 ;

    this.running    = false ;
    this.solve      = function(){
        this.running = !this.running ;
    }
}
var env = new Environment() ;
var params = env ;
var gui ;

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
//var fileInput = document.getElementById('json_structure') ;
//
//fileInput.onchange = function(){
//  let file = fileInput.files[0] ;
//  if ( !file ){
//      return ;
//  }
//  let reader = new FileReader() ;
//  reader.readAsText(file) ;
//
//  reader.onload = function(e){
//      let result = e.target.result ;
//      loadedJSON = JSON.parse(result) ;
//      $('#chooser').hide() ;
//      $('.loaded').show() ;
//      loadWebGL() ;
//  } ;
//}

/*========================================================================
 * read from file on the server
 *========================================================================
 */
let structureFile = new XMLHttpRequest();

structureFile.onreadystatechange = () => {
    if (structureFile.readyState == 4 && structureFile.status == 200) {
        loadedJSON = JSON.parse(structureFile.responseText);
        console.log(loadedJSON) ;
        loadWebGL() ;
    }
};
structureFile.open("GET", "jsons/structure_pig_192x192x192.json", true);
structureFile.send();
var gl = Abubu.gl ;

/*========================================================================
 * loadWebGL : entry point for the WebGL application
 *========================================================================
 */
function loadWebGL(){
    env.skip = 10 ;
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
 * stats
 *------------------------------------------------------------------------
 */

/*------------------------------------------------------------------------
 * defining all render targets
 *------------------------------------------------------------------------
 */
    env.fmhjj   = new Abubu.FloatRenderTarget(env.width, env.height) ;
    env.fjaii   = new Abubu.FloatRenderTarget(env.width, env.height) ;
    env.faiid   = new Abubu.FloatRenderTarget(env.width, env.height) ;
    env.fffff   = new Abubu.FloatRenderTarget(env.width, env.height) ;
    env.fjffn   = new Abubu.FloatRenderTarget(env.width, env.height) ;
    env.fxxxx   = new Abubu.FloatRenderTarget(env.width, env.height) ;
    env.fvvxc   = new Abubu.FloatRenderTarget(env.width, env.height) ;
    env.fcccc   = new Abubu.FloatRenderTarget(env.width, env.height) ;
    env.fkknn   = new Abubu.FloatRenderTarget(env.width, env.height) ;

    env.smhjj   = new Abubu.FloatRenderTarget(env.width, env.height) ;
    env.sjaii   = new Abubu.FloatRenderTarget(env.width, env.height) ;
    env.saiid   = new Abubu.FloatRenderTarget(env.width, env.height) ;
    env.sffff   = new Abubu.FloatRenderTarget(env.width, env.height) ;
    env.sjffn   = new Abubu.FloatRenderTarget(env.width, env.height) ;
    env.sxxxx   = new Abubu.FloatRenderTarget(env.width, env.height) ;
    env.svvxc   = new Abubu.FloatRenderTarget(env.width, env.height) ;
    env.scccc   = new Abubu.FloatRenderTarget(env.width, env.height) ;
    env.skknn   = new Abubu.FloatRenderTarget(env.width, env.height) ;

/*------------------------------------------------------------------------
 * s1 and s2 Targets
 *------------------------------------------------------------------------
 */
    env.s1Targets = function(   
            _aiid,
            _ffff,                  
            _jffn,  
            _xxxx   ){
        this.aiidOut = { location : 0, target : _aiid } ;
        this.ffffOut = { location : 1, target : _ffff } ;
        this.jffnOut = { location : 2, target : _jffn } ;
        this.xxxxOut = { location : 3, target : _xxxx } ;
    } ;
    env.s2Targets = function(   
            _mhjj,  
            _jaii,                
            _vvxc, 
            _cccc,                
            _kknn ){
        this.mhjjOut = { location : 0, target : _mhjj } ;
        this.jaiiOut = { location : 1, target : _jaii } ;
        this.vvxcOut = { location : 2, target : _vvxc } ;
        this.ccccOut = { location : 3, target : _cccc } ;
        this.kknnOut = { location : 4, target : _kknn } ;
    } ;

/*------------------------------------------------------------------------
 * s1init
 *------------------------------------------------------------------------
 */
    env.fs1init  = new Abubu.Solver( {
       fragmentShader  :   source('s1initShader'),
       renderTargets   : new env.s1Targets( env.faiid, env.fffff ,
                                            env.fjffn, env.fxxxx  ) ,
    } ) ;
    env.ss1init  = new Abubu.Solver( {
       fragmentShader  :   source('s1initShader'),
       renderTargets   : new env.s1Targets( env.saiid, env.sffff ,
                                            env.sjffn, env.sxxxx  ) ,
    } ) ;

/*------------------------------------------------------------------------
 * s2init
 *------------------------------------------------------------------------
 */
    env.s2initUniforms = function(){
        this.minVlt = { type : 'f', value : env.minVlt } ;
        this.maxVlt = { type : 'f', value : env.maxVlt } ;
    }
    env.fs2init = new Abubu.Solver({
        fragmentShader  :   source('s2initShader'),
        uniforms        :   new env.s2initUniforms() ,
        renderTargets   :   new env.s2Targets(
                                env.fmhjj ,
                                env.fjaii ,
                                env.fvvxc ,
                                env.fcccc ,
                                env.fkknn   ) ,
    } ) ;
    env.ss2init = new Abubu.Solver({
        fragmentShader  :   source('s2initShader'),
        uniforms        :   new env.s2initUniforms() ,
        renderTargets   :   new env.s2Targets(
                                env.smhjj ,
                                env.sjaii ,
                                env.svvxc ,
                                env.scccc ,
                                env.skknn   ) ,
    } ) ;

    env.initialize = function(){
        env.fs1init.render() ;
        env.ss1init.render() ;
        env.fs2init.render() ;
        env.ss2init.render() ;
    } ;
/*------------------------------------------------------------------------
 * s1comp
 *------------------------------------------------------------------------
 */
   env.s1compUniforms = function(  
            _aiid, 
            _ffff,  
            _jffn,  
            _xxxx, 
            _mhjj,  
            _jaii,
            _vvxc, 
            _cccc,  
            _kknn ){

        /* other            */
        this.dt             = { type : 'f', value : env.dt          } ;
        
        /* input variable textures */
        this.aiidIn         = { type : 't', value : _aiid           } ;
        this.ffffIn         = { type : 't', value : _ffff           } ;
        this.jffnIn         = { type : 't', value : _jffn           } ;
        this.xxxxIn         = { type : 't', value : _xxxx           } ;
        this.mhjjIn         = { type : 't', value : _mhjj           } ;
        this.jaiiIn         = { type : 't', value : _jaii           } ;
        this.vvxcIn         = { type : 't', value : _vvxc           } ;
        this.ccccIn         = { type : 't', value : _cccc           } ;
        this.kknnIn         = { type : 't', value : _kknn           } ;

        /* Time Factor Multipliers  */
        this.Ct_m           = { type : 'f', value : env.Ct_m        } ; 
        this.Ct_h           = { type : 'f', value : env.Ct_h        } ; 
        this.Ct_j           = { type : 'f', value : env.Ct_j        } ; 
        this.Ct_hCaMKslow   = { type : 'f', value : env.Ct_hCaMKslow} ; 
        this.Ct_hslow       = { type : 'f', value : env.Ct_hslow    } ; 
        this.Ct_mL          = { type : 'f', value : env.Ct_mL       } ; 
        this.Ct_jCaMK       = { type : 'f', value : env.Ct_jCaMK    } ; 
        this.Ct_hL          = { type : 'f', value : env.Ct_hL       } ; 
        this.Ct_hLCaMK      = { type : 'f', value : env.Ct_hLCaMK   } ; 
        this.Ct_a           = { type : 'f', value : env.Ct_a        } ; 
        this.Ct_ifast       = { type : 'f', value : env.Ct_ifast    } ; 
        this.Ct_islow       = { type : 'f', value : env.Ct_islow    } ; 
        this.Ct_aCaMK       = { type : 'f', value : env.Ct_aCaMK    } ; 
        this.Ct_iCaMKfast   = { type : 'f', value : env.Ct_iCaMKfast} ; 
        this.Ct_iCaMKslow   = { type : 'f', value : env.Ct_iCaMKslow} ; 
        this.Ct_d           = { type : 'f', value : env.Ct_d        } ; 
        this.Ct_ffast       = { type : 'f', value : env.Ct_ffast    } ; 
        this.Ct_fslow       = { type : 'f', value : env.Ct_fslow    } ; 
        this.Ct_fCafast     = { type : 'f', value : env.Ct_fCafast  } ; 
        this.Ct_fCaslow     = { type : 'f', value : env.Ct_fCaslow  } ; 
        this.Ct_jCa         = { type : 'f', value : env.Ct_jCa      } ; 
        this.Ct_fCaMKfast   = { type : 'f', value : env.Ct_fCaMKfast} ; 
        this.Ct_fCaCaMKfast = { type : 'f', value : env.Ct_fCaCaMKfast } ;
        this.Ct_n           = { type : 'f', value : env.Ct_n        } ; 
        this.Ct_xrfast      = { type : 'f', value : env.Ct_xrfast   } ; 
        this.Ct_xrslow      = { type : 'f', value : env.Ct_xrslow   } ; 
        this.Ct_xs1         = { type : 'f', value : env.Ct_xs1      } ; 
        this.Ct_xs2         = { type : 'f', value : env.Ct_xs2      } ; 
        this.Ct_xk1         = { type : 'f', value : env.Ct_xk1      } ; 
        this.Ct_relNP       = { type : 'f', value : env.Ct_relNP    } ; 
        this.Ct_relCaMK     = { type : 'f', value : env.Ct_relCaMK  } ; 
        this.Ct_tr          = { type : 'f', value : env.Ct_tr       } ; 
        this.Ct_diffCa      = { type : 'f', value : env.Ct_diffCa   } ; 
        this.Ct_diffNa      = { type : 'f', value : env.Ct_diffNa   } ; 
        this.Ct_diffK       = { type : 'f', value : env.Ct_diffK    } ; 

        /* Scaling Factors          */
        this.SGNalate       = { type : 'f', value : env.SGNalate    } ; 
        this.SGto           = { type : 'f', value : env.SGto        } ; 
        this.SPCa           = { type : 'f', value : env.SPCa        } ; 
        this.SGKr           = { type : 'f', value : env.SGKr        } ; 
        this.SGKs           = { type : 'f', value : env.SGKs        } ; 
        this.SGK1           = { type : 'f', value : env.SGK1        } ; 
        this.SGNaCa         = { type : 'f', value : env.SGNaCa      } ; 
        this.SGNaK          = { type : 'f', value : env.SGNaK       } ; 
        this.SGKb           = { type : 'f', value : env.SGKb        } ; 
        this.SJrel          = { type : 'f', value : env.SJrel       } ; 
        this.SJup           = { type : 'f', value : env.SJup        } ; 
        this.SCMDN          = { type : 'f', value : env.SCMDN       } ; 
    }

    /* s1comp1  */
    env.s1comp1 = new Abubu.Solver({
        fragmentShader  :   source('s1compShader') ,
        uniforms        : 
            new env.s1compUniforms(
                env.faiid,  env.fffff,  env.fjffn,  
                env.fxxxx,  env.fmhjj,  env.fjaii,
                env.fvvxc,  env.fcccc,  env.fkknn       ) ,
        renderTargets   : 
            new env.s1Targets(
                env.saiid, 
                env.sffff,  
                env.sjffn,  
                env.sxxxx       ) ,
    } ) ;

    /* s1comp1  */
    env.s1comp2 = new Abubu.Solver({
        fragmentShader  :   source('s1compShader') ,
        uniforms        : 
            new env.s1compUniforms(
                env.saiid,  env.sffff,  env.sjffn,  
                env.sxxxx,  env.smhjj,  env.sjaii,
                env.svvxc,  env.scccc,  env.skknn       ) ,
        renderTargets   : 
            new env.s1Targets(
                env.faiid,  
                env.fffff,  
                env.fjffn,  
                env.fxxxx       ) ,
    } ) ;

/*------------------------------------------------------------------------
 * s2comp1 and s2comp2 solvers for time stepping
 *------------------------------------------------------------------------
 */
    env.s2compUniforms = function( 
            _aiid, 
            _ffff,  
            _jffn,  
            _xxxx, 
            _mhjj,  
            _jaii,
            _vvxc, 
            _cccc,  
            _kknn ){
        /* input variable textures */
        this.mhjjIn         = { type : 't', value : _mhjj           } ;
        this.jaiiIn         = { type : 't', value : _jaii           } ;
        this.aiidIn         = { type : 't', value : _aiid           } ;
        this.ffffIn         = { type : 't', value : _ffff           } ;
        this.jffnIn         = { type : 't', value : _jffn           } ;
        this.xxxxIn         = { type : 't', value : _xxxx           } ;
        this.vvxcIn         = { type : 't', value : _vvxc           } ;
        this.ccccIn         = { type : 't', value : _cccc           } ;
        this.kknnIn         = { type : 't', value : _kknn           } ;

        /* other            */
        this.idir0          = { type : 't', value : env.idir0       } ;
        this.idir1          = { type : 't', value : env.idir1       } ;
        this.compressed3dCrdt = { type : 't', 
            value : env.compressed3dCrdt }  ;
        this.mx = { type : 'i',  value : env.mx } ;
        this.my = { type : 'i',  value : env.my } ;
        
        this.Ca_o           = { type : 'f', value : env.Ca_o        } ;
        this.K_o            = { type : 'f', value : env.K_o         } ;
        this.Na_o           = { type : 'f', value : env.Na_o        } ;

        this.dt             = { type : 'f', value : env.dt          } ;
        this.diffCoef       = { type : 'f', value : env.diffCoef    } ;
        this.C_m            = { type : 'f', value : env.C_m         } ;
        this.minVlt         = { type : 'f', value : env.minVlt      } ;
        this.maxVlt         = { type : 'f', value : env.maxVlt      } ;

        /* Time Factor Multipliers  */
        this.Ct_m           = { type : 'f', value : env.Ct_m        } ; 
        this.Ct_h           = { type : 'f', value : env.Ct_h        } ; 
        this.Ct_j           = { type : 'f', value : env.Ct_j        } ; 
        this.Ct_hCaMKslow   = { type : 'f', value : env.Ct_hCaMKslow} ; 
        this.Ct_hslow       = { type : 'f', value : env.Ct_hslow    } ; 
        this.Ct_mL          = { type : 'f', value : env.Ct_mL       } ; 
        this.Ct_jCaMK       = { type : 'f', value : env.Ct_jCaMK    } ; 
        this.Ct_hL          = { type : 'f', value : env.Ct_hL       } ; 
        this.Ct_hLCaMK      = { type : 'f', value : env.Ct_hLCaMK   } ; 
        this.Ct_a           = { type : 'f', value : env.Ct_a        } ; 
        this.Ct_ifast       = { type : 'f', value : env.Ct_ifast    } ; 
        this.Ct_islow       = { type : 'f', value : env.Ct_islow    } ; 
        this.Ct_aCaMK       = { type : 'f', value : env.Ct_aCaMK    } ; 
        this.Ct_iCaMKfast   = { type : 'f', value : env.Ct_iCaMKfast} ; 
        this.Ct_iCaMKslow   = { type : 'f', value : env.Ct_iCaMKslow} ; 
        this.Ct_d           = { type : 'f', value : env.Ct_d        } ; 
        this.Ct_ffast       = { type : 'f', value : env.Ct_ffast    } ; 
        this.Ct_fslow       = { type : 'f', value : env.Ct_fslow    } ; 
        this.Ct_fCafast     = { type : 'f', value : env.Ct_fCafast  } ; 
        this.Ct_fCaslow     = { type : 'f', value : env.Ct_fCaslow  } ; 
        this.Ct_jCa         = { type : 'f', value : env.Ct_jCa      } ; 
        this.Ct_fCaMKfast   = { type : 'f', value : env.Ct_fCaMKfast} ; 
        this.Ct_fCaCaMKfast = { type : 'f', value : env.Ct_fCaCaMKfast } ;
        this.Ct_n           = { type : 'f', value : env.Ct_n        } ; 
        this.Ct_xrfast      = { type : 'f', value : env.Ct_xrfast   } ; 
        this.Ct_xrslow      = { type : 'f', value : env.Ct_xrslow   } ; 
        this.Ct_xs1         = { type : 'f', value : env.Ct_xs1      } ; 
        this.Ct_xs2         = { type : 'f', value : env.Ct_xs2      } ; 
        this.Ct_xk1         = { type : 'f', value : env.Ct_xk1      } ; 
        this.Ct_relNP       = { type : 'f', value : env.Ct_relNP    } ; 
        this.Ct_relCaMK     = { type : 'f', value : env.Ct_relCaMK  } ; 
        this.Ct_tr          = { type : 'f', value : env.Ct_tr       } ; 
        this.Ct_diffCa      = { type : 'f', value : env.Ct_diffCa   } ; 
        this.Ct_diffNa      = { type : 'f', value : env.Ct_diffNa   } ; 
        this.Ct_diffK       = { type : 'f', value : env.Ct_diffK    } ; 

        /* current multipliers */
        this.C_Na           = { type : 'f', value : env.C_Na        } ; 
        this.C_NaCa         = { type : 'f', value : env.C_NaCa      } ; 
        this.C_to           = { type : 'f', value : env.C_to        } ; 
        this.C_CaL          = { type : 'f', value : env.C_CaL       } ; 
        this.C_CaNa         = { type : 'f', value : env.C_CaNa      } ; 
        this.C_CaK          = { type : 'f', value : env.C_CaK       } ; 
        this.C_Kr           = { type : 'f', value : env.C_Kr        } ; 
        this.C_Ks           = { type : 'f', value : env.C_Ks        } ; 
        this.C_K1           = { type : 'f', value : env.C_K1        } ; 
        this.C_NaCai        = { type : 'f', value : env.C_NaCai     } ; 
        this.C_NaCass       = { type : 'f', value : env.C_NaCass    } ; 
        this.C_NaKNa        = { type : 'f', value : env.C_NaKNa     } ; 
        this.C_NaKK         = { type : 'f', value : env.C_NaKK      } ; 
        this.C_NaK          = { type : 'f', value : env.C_NaK       } ; 
        this.C_Nab          = { type : 'f', value : env.C_Nab       } ; 
        this.C_Kb           = { type : 'f', value : env.C_Kb        } ; 
        this.C_Cab          = { type : 'f', value : env.C_Cab       } ; 
        this.C_pCa          = { type : 'f', value : env.C_pCa       } ; 
        this.C_relNP        = { type : 'f', value : env.C_relNP     } ; 
        this.C_relCaMK      = { type : 'f', value : env.C_relCaMK   } ; 
        this.C_upNP         = { type : 'f', value : env.C_upNP      } ; 
        this.C_upCaMK       = { type : 'f', value : env.C_upCaMK    } ; 
        this.C_leak         = { type : 'f', value : env.C_leak      } ; 
        this.C_up           = { type : 'f', value : env.C_up        } ; 
        this.C_tr           = { type : 'f', value : env.C_tr        } ; 
        this.C_rel          = { type : 'f', value : env.C_rel       } ; 
        this.C_diffCa       = { type : 'f', value : env.C_diffCa    } ; 
        this.C_diffNa       = { type : 'f', value : env.C_diffNa    } ; 
        this.C_diffK        = { type : 'f', value : env.C_diffK     } ; 

        /* Scaling Factors          */
        this.SGNalate       = { type : 'f', value : env.SGNalate    } ; 
        this.SGto           = { type : 'f', value : env.SGto        } ; 
        this.SPCa           = { type : 'f', value : env.SPCa        } ; 
        this.SGKr           = { type : 'f', value : env.SGKr        } ; 
        this.SGKs           = { type : 'f', value : env.SGKs        } ; 
        this.SGK1           = { type : 'f', value : env.SGK1        } ; 
        this.SGNaCa         = { type : 'f', value : env.SGNaCa      } ; 
        this.SGNaK          = { type : 'f', value : env.SGNaK       } ; 
        this.SGKb           = { type : 'f', value : env.SGKb        } ; 
        this.SJrel          = { type : 'f', value : env.SJrel       } ; 
        this.SJup           = { type : 'f', value : env.SJup        } ; 
        this.SCMDN          = { type : 'f', value : env.SCMDN       } ; 

        this.cellType       = { type : 'i', value : env.cellType    } ;
    }
    /* s2comp1  */
    env.s2comp1 = new Abubu.Solver({
        fragmentShader  :   source('s2compShader') ,
        uniforms        : 
            new env.s2compUniforms(
                env.saiid,  
                env.sffff,  
                env.sjffn,  
                env.sxxxx,  
                env.fmhjj,  
                env.fjaii,
                env.fvvxc,  
                env.fcccc,  
                env.fkknn       ) ,
        renderTargets   : 
            new env.s2Targets(
                env.smhjj,  
                env.sjaii ,
                env.svvxc,  
                env.scccc,  
                env.skknn       ) , 
    } ) ;

    env.s2comp2 = new Abubu.Solver({
        fragmentShader  :   source('s2compShader'),
        uniforms        : 
            new env.s2compUniforms(
                env.faiid,  
                env.fffff,  
                env.fjffn,  
                env.fxxxx,  
                env.smhjj,  
                env.sjaii,
                env.svvxc,  
                env.scccc,  
                env.skknn       ) ,
        renderTargets   : 
            new env.s2Targets(
                env.fmhjj,  
                env.fjaii ,
                env.fvvxc,  
                env.fcccc,  
                env.fkknn       ) , 
    } ) ;

/*========================================================================
 * Postprocessing 
 *========================================================================
 */
    env.visurf = new Abubu.SurfaceVisualizer({
        canvas : canvas_1 ,
        target : env.fvvxc ,
        structure : env.structure ,
        fovy : 0.45,
        rotation : [1.76,3.25,-1.25] ,
        lightDirection : [ 0.6,0.25,-2.06] ,
        lightSpecularTerm : 0.5, 
        lightAmbientTerm : 0.1, 
        materialSpecularTerm : 5.2 ,
        materialAmbientTerm : 0.1 ,
        shininess : 10 ,
        minValue : -60 ,
        maxValue : 20 ,
    } ) ;

    // signal plots
    env.plot = new Abubu.SignalPlot( { 
        noPltPoints : 512 ,
        grid    : 'on',
        nx : 5,
        ny : 10,
        xticks : { mode : 'auto', unit : 'ms', font:'11pt Times'} ,
        yticks : { mode : 'auto', unit : 'mv' } ,
        canvas : canvas_2 ,
        } ) ;
    env.vsgn = env.plot.addSignal( env.fvvxc, {
            channel : 'r',
            minValue : -100 ,
            maxValue : 50 ,
            restValue: -83,
            color : [0.5,0,0],
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
        fragmentShader : source( 'click' ) ,
        uniforms : {
            icolor0 : { type : 't', value : env.fvvxc } ,
            compressed3dCrdt : { type : 't', 
                value : env.structure.compressed3dCrdt            } ,
            projectedCoordinates : { type : 't', 
                value : env.visurf.projectedCoordinates  } ,
            clickPosition : { type : 'v2', value : [0.,0] } ,
            clickRadius     : { type : 'f', value : 0.1 } ,
        } ,
        targets : {
            ocolor0 : { location : 0 , target : env.svvxc } ,
        }
    } ) ;

    env.clickCopy = new Abubu.Copy( env.svvxc, env.fvvxc ) ;
    
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

    
    env.shiftClick = new Abubu.ShiftClickListener(
        canvas_1,
        (e)=>{
            var clickCompPosition = 
            env.visurf.getCompressedClickPosition(e.position);
            env.plot.setProbePosition( clickCompPosition ) ;
            env.plot.init(env.time) ;
        } ) ;

    
/*========================================================================
 * render
 *========================================================================
 */

    env.render = function(){
        if (env.running){
            for(var i=0; i< env.skip ; i++){
                env.s1comp1.render() ;
                env.s2comp1.render() ;
                env.s1comp2.render() ;
                env.s2comp2.render() ;
                env.time += env.dt*2.0 ;
                env.plot.update(env.time) ;
            }
        }
        env.visurf.render() ;
        env.plot.render() ;
        requestAnimationFrame(env.render) ;
    }
    createGui() ;
    env.initialize() ;
    env.render() ;
}


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
    gui.mdlPrmFldr.add( env, 'epiEndoMid', 
                [
                    'Endocardium', 
                    'Epicardium', 
                    'Mid-Myocardium'    ] )
        .name(  'Cell Type'  ).onChange(function(){
            switch( env.epiEndoMyo ){
                case 'Endocardium' :
                    env[ 'SGNalate'      ] = 1.0 ;
                    env[ 'SGto'          ] = 1.0 ;
                    env[ 'SPCa'          ] = 1.0 ;
                    env[ 'SGKr'          ] = 1.0 ;
                    env[ 'SGKs'          ] = 1.0 ;
                    env[ 'SGK1'          ] = 1.0 ;
                    env[ 'SGNaCa'        ] = 1.0 ;
                    env[ 'SGNaK'         ] = 1.0 ;
                    env[ 'SGKb'          ] = 1.0 ;
                    env[ 'SJrel'         ] = 1.0 ;
                    env[ 'SJup'          ] = 1.0 ;
                    env[ 'SCMDN'         ] = 1.0 ;
                    env.cellType = env.ENDO ;
                    env.breakTime = 270 ;

                    break ;
                case  'Epicardium' :
                    env[ 'SGNalate'      ] = 0.6 ;
                    env[ 'SGto'          ] = 4.0 ;
                    env[ 'SPCa'          ] = 1.2 ;
                    env[ 'SGKr'          ] = 1.3 ;
                    env[ 'SGKs'          ] = 1.4 ;
                    env[ 'SGK1'          ] = 1.2 ;
                    env[ 'SGNaCa'        ] = 1.1 ;
                    env[ 'SGNaK'         ] = 0.9 ;
                    env[ 'SGKb'          ] = 0.6 ;
                    env[ 'SJrel'         ] = 1.0 ;
                    env[ 'SJup'          ] = 1.3 ;
                    env[ 'SCMDN'         ] = 1.3 ;
                    
                    env.cellType    = env.EPI ;
                    env.breakTime   = 270 ;

                    break ;
                case    'Mid-Myocardium'    :
                    env[ 'SGNalate'      ] = 1.0 ;
                    env[ 'SGto'          ] = 4.0 ;
                    env[ 'SPCa'          ] = 2.5 ;
                    env[ 'SGKr'          ] = 0.8 ;
                    env[ 'SGKs'          ] = 1.0 ;
                    env[ 'SGK1'          ] = 1.3 ;
                    env[ 'SGNaCa'        ] = 1.5 ;
                    env[ 'SGNaK'         ] = 0.7 ;
                    env[ 'SGKb'          ] = 1.0 ;
                    env[ 'SJrel'         ] = 1.7 ;
                    env[ 'SJup'          ] = 1.0 ;
                    env[ 'SCMDN'         ] = 1.0 ;
                    env.breakTime = 373 ;
                    env.cellType = env.MID ;

                    break ;
            }
            Abubu.setUniformsInSolvers(
            [   'cellType'                  ] ,
            [   env.cellType                ] ,
            [   env.s2comp1, env.s2comp2    ] ) ;
            Abubu.setUniformsInSolvers(
            [
            'SGNalate' ,
            'SGto'     ,
            'SPCa'     ,
            'SGKr'     ,
            'SGKs'     ,
            'SGK1'     ,
            'SGNaCa'   ,
            'SGNaK'    ,
            'SGKb'     ,
            'SJrel'    ,
            'SJup'     ,
            'SCMDN'
            ] ,
            [
            env.SGNalate ,
            env.SGto     ,
            env.SPCa     ,
            env.SGKr     ,
            env.SGKs     ,
            env.SGK1     ,
            env.SGNaCa   ,
            env.SGNaK    ,
            env.SGKb     ,
            env.SJrel    ,
            env.SJup     ,
            env.SCMDN
            ] ,
            [
                env.s1comp1,
            env.s1comp2,
            env.s2comp1,
            env.s2comp2
            ]   ) ;
        } ) ;

    addCoeficients( gui.mdlPrmFldr, ['C_m', 'diffCoef'] , 
            [env.s2comp1,env.s2comp2], {min:0}) ;

/*------------------------------------------------------------------------
 * Time Coeficients
 *------------------------------------------------------------------------
 */
    gui.tcfPrmFldr = gui.addFolder( 'Time Coeficients' ) ;
    addCoeficients( 
        gui.tcfPrmFldr, [
            'Ct_m'        , 
            'Ct_h'        , 
            'Ct_j'        , 
            'Ct_hCaMKslow', 
            'Ct_hslow'    , 
            'Ct_mL'       , 
            'Ct_jCaMK'    , 
            'Ct_hL'       , 
            'Ct_hLCaMK'   , 
            'Ct_a'        , 
            'Ct_ifast'    , 
            'Ct_islow'    , 
            'Ct_aCaMK'    , 
            'Ct_iCaMKfast', 
            'Ct_iCaMKslow', 
            'Ct_d'        , 
            'Ct_ffast'    , 
            'Ct_fslow'    , 
            'Ct_fCafast'  , 
            'Ct_fCaslow'  , 
            'Ct_jCa'      , 
            'Ct_fCaMKfast', 
            'Ct_fCaCaMKfast' ,
            'Ct_n'        ,
            'Ct_xrfast'   ,
            'Ct_xrslow'   ,
            'Ct_xs1'      ,
            'Ct_xs2'      ,
            'Ct_xk1'      ,
            'Ct_relNP'    ,
            'Ct_relCaMK'  ,
            'Ct_tr'       ,
            'Ct_diffCa'   ,
            'Ct_diffNa'   ,
            'Ct_diffK'    ,
        ] ,
        [ 
            env.s1comp1, 
            env.s1comp2, 
            env.s2comp1, 
            env.s2comp2 
        ] ) ;

/*------------------------------------------------------------------------
 * Current Multipliers
 *------------------------------------------------------------------------
 */
    gui.crtPrmFldr = gui.addFolder( 'Current Multipliers' ) ;
    addCoeficients(
        gui.crtPrmFldr ,
        [
            'C_Na'       , 
            'C_NaCa'     , 
            'C_to'       , 
            'C_CaL'      , 
            'C_CaNa'     , 
            'C_CaK'      , 
            'C_Kr'       , 
            'C_Ks'       , 
            'C_K1'       , 
            'C_NaCai'    , 
            'C_NaCass'   , 
            'C_NaKNa'    , 
            'C_NaKK'     , 
            'C_NaK'      , 
            'C_Nab'      , 
            'C_Kb'       , 
            'C_Cab'      , 
            'C_pCa'      , 
            'C_relNP'    , 
            'C_relCaMK'  , 
            'C_upNP'     , 
            'C_upCaMK'   , 
            'C_leak'     , 
            'C_up'       , 
            'C_tr'       , 
            'C_rel'      , 
            'C_diffCa'   , 
            'C_diffNa'   , 
            'C_diffK'
        ] ,
        [   
            env.s2comp1, 
            env.s2comp2  
        ] ) ;

/*------------------------------------------------------------------------
 * display
 *------------------------------------------------------------------------
 */
    gui.display = gui.addFolder('Visualization options') ;
    gui.display.visurf = env.visurf.controlByGui( gui.display ) ;
    gui.display.add( env, 'skip' ).name('Skip Frames [x2]') ;

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

