#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * s1compShader :   mhji, haii, aiid, ffff, jffn, xxxx
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Wed 26 Jul 2017 10:36:21 AM EDT
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
precision highp float;
precision highp int ;

/*------------------------------------------------------------------------
 * Interface variables 
 *------------------------------------------------------------------------
 */
in vec2 pixPos ;

uniform float       dt ;

/* Input texture variables */
uniform sampler2D   aiidIn ; 
uniform sampler2D   ffffIn ; 
uniform sampler2D   jffnIn ; 
uniform sampler2D   xxxxIn ; 
uniform sampler2D   mhjjIn ;
uniform sampler2D   jaiiIn ;
uniform sampler2D   vvxcIn ; 
uniform sampler2D   ccccIn ; 
uniform sampler2D   kknnIn ; 

/* time factor multipliers */
uniform float       Ct_m          ; 
uniform float       Ct_h          ; 
uniform float       Ct_j          ; 
uniform float       Ct_hCaMKslow  ; 
uniform float       Ct_hslow      ; 
uniform float       Ct_mL         ; 
uniform float       Ct_jCaMK      ; 
uniform float       Ct_hL         ; 
uniform float       Ct_hLCaMK     ; 
uniform float       Ct_a          ; 
uniform float       Ct_ifast      ; 
uniform float       Ct_islow      ; 
uniform float       Ct_aCaMK      ; 
uniform float       Ct_iCaMKfast  ; 
uniform float       Ct_iCaMKslow  ; 
uniform float       Ct_d          ; 
uniform float       Ct_ffast      ; 
uniform float       Ct_fslow      ; 
uniform float       Ct_fCafast    ; 
uniform float       Ct_fCaslow    ; 
uniform float       Ct_jCa        ; 
uniform float       Ct_fCaMKfast  ; 
uniform float       Ct_fCaCaMKfast; 
uniform float       Ct_n          ; 
uniform float       Ct_xrfast     ; 
uniform float       Ct_xrslow     ; 
uniform float       Ct_xs1        ; 
uniform float       Ct_xs2        ; 
uniform float       Ct_xk1        ; 
uniform float       Ct_relNP      ; 
uniform float       Ct_relCaMK    ; 
uniform float       Ct_tr         ; 
uniform float       Ct_diffCa     ; 
uniform float       Ct_diffNa     ; 
uniform float       Ct_diffK      ; 

/* Scaling Factors          */
uniform float       SGNalate ;  
uniform float       SGto     ;  
uniform float       SPCa     ;  
uniform float       SGKr     ;  
uniform float       SGKs     ;  
uniform float       SGK1     ;  
uniform float       SGNaCa   ;  
uniform float       SGNaK    ;  
uniform float       SGKb     ;  
uniform float       SJrel    ;  
uniform float       SJup     ;  
uniform float       SCMDN    ;  

/*------------------------------------------------------------------------
 * outputs
 *------------------------------------------------------------------------
 */
layout (location = 0 )  out vec4  aiidOut ;
layout (location = 1 )  out vec4  ffffOut ;
layout (location = 2 )  out vec4  jffnOut ;
layout (location = 3 )  out vec4  xxxxOut ;

/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * Main body of the shader
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
void main() {
    vec4    vvxcVal = texture(vvxcIn, pixPos ) ;
    vec2    v       = vec2( vvxcVal.g, 0.5 ) ;
       float   V       = vvxcVal.r ;

/*========================================================================
 * aiid
 *========================================================================
 */
    vec4    aiidVal = texture( aiidIn, pixPos   ) ;


/*------------------------------------------------------------------------
 * a_CaMK
 *------------------------------------------------------------------------
 */
    float   aCaMKinf = 1./
            (   1. +    exp(  -(V-24.34)/14.82 )           ) ;

    float   ta       = 1.0515/
            (   1./ (   1.2089*(1.+exp(-(V-18.41)/29.38))  ) +
                3.5/(   1. + exp(  (V+100.)/29.38  )   )   ) ;

    ta *= Ct_aCaMK ;

    aiidVal.r = aCaMKinf + ( aiidVal.r - aCaMKinf)*exp(-dt/ta ) ;
    
/*------------------------------------------------------------------------
 * i_CaMK,fast --- i_CaMK,slow
 *------------------------------------------------------------------------
 */
    float   iCaMKinf = 1./
            (   1. + exp(   (V+43.94)/5.711    )           ) ;

    float   dCaMKdev = 1.354 + 1.0e-4/
            (   exp(           (V-167.4)/15.89     ) +
                exp(          -(V-12.23)/0.2145    )       ) ;

    float   dCaMKrec = 1.0 - 0.5/
            (   1. +    exp(   (V+70.)/20.0        )       ) ;

    float   tifast   = 4.562 + 1./
            (   0.3933*exp(-(V+100.)/100.  ) +
                0.08004*exp((V+50.0)/16.59 )               ) ;


    float   tislow   = 23.62 +
            1./( 0.001416*exp(-(V+96.52)/59.05 )
                +1.7808e-8*exp((V+114.1)/8.079 )           ) ;
    float   tiCaMKfast = tifast*dCaMKdev*dCaMKrec*Ct_iCaMKfast ;
    float   tiCaMKslow = tislow*dCaMKdev*dCaMKrec*Ct_iCaMKslow ;

    aiidVal.g = iCaMKinf + ( aiidVal.g - iCaMKinf)*exp( -dt/tiCaMKfast ) ;
    aiidVal.b = iCaMKinf + ( aiidVal.b - iCaMKinf)*exp( -dt/tiCaMKslow ) ;
 
/*------------------------------------------------------------------------
 * d
 *------------------------------------------------------------------------
 */
    float   dinf = 1./
            (   1. +    exp(   -(V+3.940)/4.230    )       ) ;

    float   td   =  0.6 + 1./
            (   exp(   -0.05*(V+6.0)               ) +
                exp(    0.09*(V+14.0)              )       ) ;
    td *= Ct_d ;

    aiidVal.a = dinf + ( aiidVal.a - dinf )*exp( -dt/td ) ;

/*-----------------------------------------------------------------------
 * aiidOut
 *-----------------------------------------------------------------------
 */
    aiidOut = aiidVal ;
    
/*========================================================================
 * ffff
 *========================================================================
 */ 
    vec4    ffffVal = texture( ffffIn, pixPos   ) ;

/*------------------------------------------------------------------------
 * f_fast --- f_slow
 *------------------------------------------------------------------------
 */
    float   finf    =  1./
            (   1. + exp(      (V+19.58)/3.696     )       ) ;

    float   tffast  =  7.0 + 1./
            (   0.0045*exp(   -(V+20.0)/10.0       ) +
                0.0045*exp(    (V+20.0)/10.0       )       ) ;
    tffast *= Ct_ffast ;

    float   tfslow  = 1000.0 +
                1./(    0.000035*exp(-(V+5.0)/4.0 ) +
                        0.000035*exp( (V+5.0)/6.0 )        ) ;
    tfslow *= Ct_fslow ;

    ffffVal.r = finf + ( ffffVal.r - finf)*exp( -dt/tffast ) ;
    ffffVal.g = finf + ( ffffVal.g - finf)*exp( -dt/tfslow ) ;

/*------------------------------------------------------------------------
 * f_Ca,fast --- f_Ca,slow
 *------------------------------------------------------------------------
 */
    float   fCainf   = finf ;
    float   tfCafast = 7.0 +
                1./(    0.04*exp( -(V-4.0)/7.0)    +
                        0.04*exp(  (V-4.0)/7.0)            ) ;
    tfCafast *= Ct_fCafast ;

    float   tfCaslow = 100.0 +
                1./(    0.00012*exp( -V/3.0 ) +
                        0.00012*exp(  V/7.0 )              ) ;
    tfCaslow *= Ct_fCaslow ;

    ffffVal.b = fCainf + ( ffffVal.b - fCainf)*exp( -dt/tfCafast ) ;
    ffffVal.a = fCainf + ( ffffVal.a - fCainf)*exp( -dt/tfCaslow ) ;

/*------------------------------------------------------------------------
 * ffffOut
 *------------------------------------------------------------------------
 */ 
    ffffOut = ffffVal ;

/*========================================================================
 * jffn
 *========================================================================
 */    
    vec4    jffnVal = texture( jffnIn, pixPos   ) ;
    vec4    ccccVal = texture( ccccIn, pixPos   ) ;

/*------------------------------------------------------------------------
 * j_Ca
 *------------------------------------------------------------------------
 */
    float   jCainf  =  1./
            (   1. + exp(      (V+19.58)/3.696     )       ) ;


    float   tjCa    = 75.0*Ct_jCa ;
    jffnVal.r = jCainf      + ( jffnVal.r - jCainf  )
                            *exp( -dt/tjCa  ) ;

/*------------------------------------------------------------------------
 * j_CaMK,fast
 *------------------------------------------------------------------------
 */
    float   fCaMKinf = jCainf ;

    float   tfCaCMfast = 7.0 + 1./
            (   0.0045*exp(   -(V+20.0)/10.0       ) +
                0.0045*exp(    (V+20.0)/10.0       )       ) ;
    tfCaCMfast *= 2.5*Ct_fCaMKfast ;
    
    jffnVal.g = fCaMKinf    + ( jffnVal.g - fCaMKinf                )
                                            *exp( -dt/tfCaCMfast    ) ;

/*------------------------------------------------------------------------
 * j_Ca,CaMK,fast
 *------------------------------------------------------------------------
 */
    float   fCaCaMKinf = jCainf ;

    float   tfCaCaMKfast = 7.0 + 1./
            (   0.0045*exp(   -(V+20.0)/10.0       ) +
                0.0045*exp(    (V+20.0)/10.0       )       ) ;
    tfCaCaMKfast *=  2.5*2.5*Ct_fCaCaMKfast ;

    jffnVal.b = fCaCaMKinf  + ( jffnVal.b - fCaCaMKinf              )
                                            *exp( -dt/tfCaCaMKfast  ) ;

/*------------------------------------------------------------------------
 * n
 *------------------------------------------------------------------------
 */
    float Kmn  = 0.002 ; float kp2n = 1000.0 ; float km2n = jffnVal.r ;
    float Cass = ccccVal.b ;

    float kappa     = 1. + Kmn/Cass ;
    kappa           = kappa*kappa*kappa*kappa ;

    float alpha_n   = 1.0 /( kp2n/km2n  + kappa ) ;
    float ninf      = alpha_n*kp2n/km2n ;
    float tn        = Ct_n/km2n ;
    jffnVal.a       = ninf + ( jffnVal.a - ninf )*exp(-dt/tn ) ;

/*------------------------------------------------------------------------
 * jffnOut
 *------------------------------------------------------------------------
 */
    jffnOut = jffnVal ;

/*========================================================================
 * xxxx
 *========================================================================
 */ 
    vec4    xxxxVal = texture( xxxxIn,  pixPos   ) ;


/*-------------------------------------------------------------------------
 * x_r,fast --- x_r,inf
 *-------------------------------------------------------------------------
 */
    float   xrinf   = 1./
            (   1.  +   exp(   -(V+8.337)/6.789    )       ) ;

    float   txrfast  = (
             12.98 + 1./
            (   0.3652*exp(     (V-31.66)/3.869    ) +
                4.123e-5*exp(  -(V-47.78)/20.38    )       )
        )*Ct_xrfast ;

    float   txrslow  = (
                1.865 + 1./
            (   0.06629*exp(    (V-34.70)/7.355    ) +
                1.128e-5*exp(   (29.74-V)/25.94    )       ) 
        ) * Ct_xrslow ;

    xxxxVal.r = xrinf + ( xxxxVal.r - xrinf )*exp( -dt/txrfast ) ;
    xxxxVal.g = xrinf + ( xxxxVal.g - xrinf )*exp( -dt/txrslow ) ;

/*-------------------------------------------------------------------------
 * x_s1 --- x_s2
 *-------------------------------------------------------------------------
 */
    float   xs1inf  = 1./
            (   1. +    exp(   -(V+11.60)/8.932    )       ) ;

    float   xs2inf  = xs1inf ;
    float   txs1    = (
             817.3 + 1./
            (   2.326e-4*exp(   (V+48.28)/17.80    ) +
                0.001292*exp(  -(V+210.0)/230.0    )       )
        ) * Ct_xs1 ;
    float   txs2    = (
             1./
            (   0.01*exp(       (V-50.0)/20.0      ) +
                0.0193*exp(    -(V+66.54)/31.      )       ) 
        ) * Ct_xs2 ;
    xxxxVal.b = xs1inf + ( xxxxVal.b - xs1inf )*exp( -dt/txs1 ) ;
    xxxxVal.a = xs2inf + ( xxxxVal.a - xs2inf )*exp( -dt/txs2 ) ;

/*------------------------------------------------------------------------
 * xxxxOut
 *------------------------------------------------------------------------
 */
    xxxxOut = xxxxVal ;

    return ;
}
