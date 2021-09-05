#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * s2compShader :   vvxc, cccc, kknn
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Wed 26 Jul 2017 10:36:21 AM EDT
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
#include precision.glsl 

#include cellType.glsl

/*------------------------------------------------------------------------
 * Interface variables 
 *------------------------------------------------------------------------
 */
in      vec2 pixPos ;
in      vec2 cc ;

uniform float       dt ;
uniform float       ds_x, ds_y ;
uniform float       diffCoef, C_m ;
uniform float       minVlt, maxVlt ;

#define lx 10.0 
uniform sampler2D   icolor0 ;
uniform int     mx, my ;    /* number of z-layers in S and T 
                               directions  of the textures */

#include directionMap.glsl

// coordinate of the system ..............................................
uniform sampler2D   compressed3dCrdt ;
                              
// directional information ...............................................
uniform usampler2D  idir0 ;
uniform usampler2D  idir1 ;


/* Input texture variables */
uniform sampler2D   mhjjIn ; 
uniform sampler2D   jaiiIn ; 
uniform sampler2D   aiidIn ; 
uniform sampler2D   ffffIn ; 
uniform sampler2D   jffnIn ; 
uniform sampler2D   xxxxIn ; 
uniform sampler2D   vvxcIn ; 
uniform sampler2D   ccccIn ; 
uniform sampler2D   kknnIn ; 

/* Extra-cellular concenterations */
uniform float       Ca_o, Na_o, K_o ;

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

/* current multipliers */
uniform float       C_Na        ;
uniform float       C_NaCa      ;
uniform float       C_to        ;
uniform float       C_CaL       ;
uniform float       C_CaNa      ;
uniform float       C_CaK       ;
uniform float       C_Kr        ;
uniform float       C_Ks        ;
uniform float       C_K1        ;
uniform float       C_NaCai     ;
uniform float       C_NaCass    ;
uniform float       C_NaKNa     ;
uniform float       C_NaKK      ;
uniform float       C_NaK       ;
uniform float       C_Nab       ;
uniform float       C_Kb        ;
uniform float       C_Cab       ;
uniform float       C_pCa       ;
uniform float       C_relNP     ;
uniform float       C_relCaMK   ;
uniform float       C_upNP      ;
uniform float       C_upCaMK    ;
uniform float       C_leak      ;
uniform float       C_up        ;
uniform float       C_tr        ;
uniform float       C_rel       ;
uniform float       C_diffCa    ;
uniform float       C_diffNa    ;
uniform float       C_diffK     ;

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

uniform int         cellType ;

/*------------------------------------------------------------------------
 * outputs
 *------------------------------------------------------------------------
 */
layout (location = 0 )  out vec4  mhjjOut ;
layout (location = 1 )  out vec4  jaiiOut ;
layout (location = 2 )  out vec4  vvxcOut ;
layout (location = 3 )  out vec4  ccccOut ;
layout (location = 4 )  out vec4  kknnOut ;

/*-------------------------------------------------------------------------
 * pow8
 *-------------------------------------------------------------------------
 */
float   pow8(float x){
    return  x*x*x*x*
            x*x*x*x ;
}
/*-------------------------------------------------------------------------
 * macros (of constants)
 *-------------------------------------------------------------------------
 */
#define bt          4.75
#define arel        2.375
#define btCaMK      5.9375
#define arekCaMK    2.96875

#define i           0
#define ss          1

#define kNa1        15.0
#define kNa2        5.0
#define kNa3        88.12
#define kasymm      12.5
#define omegaNa     6.0e4
#define omegaCa     6.0e4
#define omegaNaCa   5.0e3
#define kCaon       1.5e6
#define kCaoff      5.0e3
#define KmCaAct     150.e-6

#define Nao         Na_o
#define Cao         Ca_o
#define Ko          K_o

#define qNa         0.5224
#define qCa         0.1670

//#define Nao         140.0
//#define Cao         1.8
//#define Ko          5.4

#define zNa         1.0
#define zCa         2.0
#define zK          1.0 

#define gKi         0.75
#define gKo         0.75
#define gCai        1.0 
#define gCao        0.341

#define GNaCa       0.0008
#define GNa         14.838
#define Gto         0.02

#define gNai        0.75
#define gNao        0.75

#define PNab        3.75e-10
#define PCab        2.5e-8
#define GpCa        0.0005
#define PRNaK       0.01833

#define arelCaMK    2.96875
#define byCaMK      5.9375

#define ACaMK       0.05
#define bCaMK       0.00068
#define CaMK0       0.05
#define KmCaM       0.0015
#define KmCaMK      0.15
#define CaMKo       0.05

#define GNafast     75.0
#define GNalate     0.0075

#define CSQN        10.
#define KmCSQN      0.8
#define CMDNI       0.05
#define KmCMDN      0.00238
#define TRPN        0.07
#define KmTRPN      0.0005
#define tdiffCaCnst 0.2

#define Acap        1.534e-4
#define Ageo        0.767e-4
#define vcell       38.0e-6
#define vss         0.76e-6
#define vmyo        25.84e-6
#define vnsr        2.098e-6
#define vjsr        0.182e-6

#define BSR         0.047
#define KmBSR       0.00087
#define BSL         1.124
#define KmBSL       0.0087


#define F           96486.7
#define R           8314.3
#define T           310.

#define kp1         949.5
#define kp2         687.2
#define kp3         1899.
#define kp4         639.0
#define km1         182.4
#define km2         39.4
#define km3         79300.0
#define km4         40.0
#define KKi         0.5
#define KKo         0.3582
#define MgADP       0.05
#define MgATP       9.8
#define KMgATP      1.698e-7
#define H           1.e-7
#define SP          4.2
#define KHP         1.698e-7
#define KNaP        224.0
#define KKP         292.0

#define K0Nai       9.073        
#define K0Nao       27.78 
#define Delta       -0.1550 

const float rtof    = R*T/F ;
const float fort    = F/(R*T) ;

/*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
 * Main body of the shader
 *%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
 */
void main() {
    // extract pixel values from textures ................................
    ivec2 isize = textureSize(vvxcIn,        0 ) ;
    ivec2 texelPos = ivec2( cc*vec2(isize) ) ; 

    vec4 mhjjVal  = texelFetch(mhjjIn, texelPos, 0 ) ; 
    vec4 jaiiVal  = texelFetch(jaiiIn, texelPos, 0 ) ; 
    vec4 aiidVal  = texelFetch(aiidIn, texelPos, 0 ) ; 
    vec4 ffffVal  = texelFetch(ffffIn, texelPos, 0 ) ; 
    vec4 jffnVal  = texelFetch(jffnIn, texelPos, 0 ) ; 
    vec4 xxxxVal  = texelFetch(xxxxIn, texelPos, 0 ) ; 
    vec4 vvxcVal  = texelFetch(vvxcIn, texelPos, 0 ) ; 
    vec4 ccccVal  = texelFetch(ccccIn, texelPos, 0 ) ; 
    vec4 kknnVal  = texelFetch(kknnIn, texelPos, 0 ) ; 

    float   V = vvxcVal.r ;
    vec2    v = vec2( vvxcVal.g, 0.5 ) ;

    vec2    cc      = pixPos ;
    vec2    size    = vec2(textureSize( vvxcIn, 0 ) );
    float   cddx    = size.x/ds_x ;
    float   cddy    = size.y/ds_y ;

    cddx *= cddx ;
    cddy *= cddy ;


/*========================================================================
 * mhjj and jaii
 *========================================================================
 */

/*-------------------------------------------------------------------------
 * m
 *-------------------------------------------------------------------------
 */
    float   minf    = 1./pow((1.+exp((-56.86-V)/9.03)),2.0) ;
    float   alpha_m = 1.0/(1.0+exp((-60.0-V)/5.0)) ;
    float   beta_m  = 0.1/(1.0+exp((V+35.0)/5.0))
                        + 0.1/(1.0+exp((V-50.0)/200.0)) ;

    float   tm      = alpha_m*beta_m*Ct_m ;

    mhjjVal.r   = minf + ( mhjjVal.r - minf     )*exp( -dt/tm    ) ;

/*-------------------------------------------------------------------------
 * h
 *-------------------------------------------------------------------------
 */
    float   hinf    = 1.0/pow(1.0+exp((V+71.55)/7.43),2.0) ;
    float   alpha_h ;
    float   beta_h ;
    if (V >= -40.0){
        alpha_h     = 0.0 ;
        beta_h      = 0.77/(0.13*(1.0 + exp(-(V+10.66)/11.1))) ;
    }else{
        alpha_h     = 0.057*exp( -(V+80.0)/6.8 ) ;
        beta_h      = 2.7*exp(0.079*V)
                    + 3.1e5*exp(0.3485*V) ;
    }

    float   th      = (1.0/(alpha_h + beta_h) )*Ct_h ;

    mhjjVal.g   = hinf + ( mhjjVal.g - hinf )*exp( -dt/th ) ;

/*-------------------------------------------------------------------------
 * j
 *-------------------------------------------------------------------------
 */
    float   jinf    = 1.0/pow(1.0 + exp((V+71.55)/7.43), 2.0) ;
    float   alpha_j ;
    float   beta_j ;
    if( V >= -40.0){
        alpha_j     = 0.0 ;
        beta_j      = 0.6*exp(0.057*V)
                    /(1.0 + exp(-0.1*(V+32.0))) ;
    }else{
        alpha_j     = ( -2.5428e4*exp(0.2444*V)
                        -6.948e-6*exp(-0.04391*V)  )
                    *(V+37.78)
                    /(1.0 + exp(0.311*(V+79.23))) ;
        beta_j      = 0.02424*exp(-0.01052*V)
                    /(1.0 + exp(-0.1378*(V+40.14))) ;
    }
    float   tj      = ( 1.0/(alpha_j + beta_j) )*Ct_j ;


    mhjjVal.b   = jinf + ( mhjjVal.b - jinf     )*exp( -dt/tj     ) ;


/*-------------------------------------------------------------------------
 *  x_k1
 *-------------------------------------------------------------------------
 */
    float   xK1inf  = 1./
            (   1.  +   exp(   -(V+2.5538*Ko + 144.59  )/
                                     (1.5692*Ko + 3.8115 )  )   ) ;


    float   txK1    = (
            122.2/
            (   exp(   -( V+127.2   )/20.36 ) +
                exp(    ( V+236.8   )/69.33 )              ) 
        ) * Ct_xk1 ;

    /* Updating x_k1 channel        */
    vvxcVal.b = xK1inf + ( vvxcVal.b - xK1inf)*exp( -dt/txK1 ) ;

/*-------------------------------------------------------------------------
 * a
 *-------------------------------------------------------------------------
 */
    float   ainf    = 1./
            (   1. +    exp(  -(V-14.34)/14.82     )       )  ;
    
    float   ta      = (
            1.0515/
            (   1./ (   1.2089*(1.+exp(-(V-18.41)/29.38))  ) +
                3.5/(   1. + exp(  (V+100.)/29.38  )   )   ) 
        )*Ct_a ;
    jaiiVal.g = ainf      + ( jaiiVal.g - ainf)*exp( -dt/ta       ) ;

/*-------------------------------------------------------------------------
 * i_fast --- i_slow
 *-------------------------------------------------------------------------
 */
    float   delta_epi   = ( cellType == EPI ) ?  1.0 - 
                    0.95/(1.0 + exp((V+70.0)/5.0)) : 1.0 ;

    float   iinf        = 1./
            (   1. + exp(   (V+43.94)/5.711    )           )  ;
    
    float   tifast      = (4.562 + 1./
            (   0.3933*exp(-(V+100.)/100.  ) +
                0.08004*exp((V+50.0)/16.59 )               ) 
        )*delta_epi*Ct_ifast ;

    float   tislow      = (23.62 +
            1./( 0.001416*exp(-(V+96.52)/59.05 )
                +1.7808e-8*exp((V+114.1)/8.079 )           ) 
        )*delta_epi*Ct_islow ;

    jaiiVal.b = iinf      + ( jaiiVal.b - iinf )*exp( -dt/tifast   ) ;
    jaiiVal.a = iinf      + ( jaiiVal.a - iinf )*exp( -dt/tislow   ) ;

/*========================================================================
 * kiii
 *========================================================================
 */
    float vfort   = V*fort ;
    float vffort  = vfort*F ;

    float   alphaCass ;
    float   betaCao ;
    float   alphaNass ; 
    float   betaNao ;
    float   alphaKss ;
    float   betaKo ;

    if ( abs(vfort)>0.01){
        alphaCass = (zCa*zCa*vffort*gCai*exp(zCa*vfort))/
                            (   exp(zCa*vfort) - 1.0        ) ; 
        betaCao     = zCa*zCa*vffort*gCao*Cao/
                        (   exp(zCa*vfort) - 1.0            )  ;
        alphaNass = zNa*zNa*vffort*gNai*exp(zNa*vfort)/
                            (   exp(zNa*vfort) - 1.0        ) ;

        betaNao =  zNa*zNa*vffort*gNao*Nao/
                            (   exp(zNa*vfort) - 1.0        ) ;
        betaKo  = zK*zK*vffort*gKo*Ko/
                            (   exp(zK*vfort) - 1.0         ) ;
        alphaKss = zK*zK*vffort*gKi*exp(zK*vfort)/
                            (   exp(zK*vfort) - 1.0         ) ;

    }else{
        alphaCass = (zCa*F*gCai + zCa*V*F*gCai ) ;
        betaCao = zCa*F*gCao*Cao/exp(zCa*vfort) ;
        alphaNass = zNa*gNai*(F+ vffort*zNa)  ;
        betaNao = zNa*F*gNao*Nao/
                            (   exp(zNa*vfort)        ) ;
        betaKo  = zK*F*gKo*Ko/ (   exp(zK*vfort)        ) ;

        alphaKss = zK*gKi*(F + vffort*zK) ;
    }


    float   Cass        = ccccVal.b ;
    float   PsiCa       = alphaCass*Cass - betaCao ;
    float   PCa         = 0.0001*SPCa ;
    float   IbarCaL     = PCa*PsiCa ;

    float   Nass        = kknnVal.b ;
    float   PsiCaNa     = alphaNass*Nass - betaNao ;
    float   PCaNa       = 0.00125*PCa ;
    float   IbarCaNa    = PCaNa*PsiCaNa ;

    float   PCaK        = 3.574e-4*PCa ;
    float   Kss         = kknnVal.r ;
    float   PsiCaK      = alphaKss*Kss - betaKo ;
    float   IbarCaK     = PCaK*PsiCaK ;

    float   PCaCaMK     = 1.1*PCa ;
    float   IbarCaLCaMK = PCaCaMK*PsiCa ;

    float   PCaNaCaMK   = 0.00125*PCaCaMK ;
    float   IbarCaNaCaMK= PCaNaCaMK*PsiCaNa ;

    float   PCaKCaMK    = 3.574e-4*PCaCaMK ;
    float   IbarCaKCaMK = PCaKCaMK*PsiCaK ;

    float   d           = aiidVal.a ;
    float   ffast       = ffffVal.r ;
    float   fslow       = ffffVal.g ;
    float   Affast      = 0.6 ;
    float   Afslow      = 1.-Affast ;
    float   f           = Affast*ffast + Afslow*fslow ;

    float   AfCafast    =  0.3 +
               0.6/(    1. + exp((V-10.)/10.)              ) ;
    float   AfCaslow    = 1. - AfCafast ;
    float   fCafast     = ffffVal.b ;
    float   fCaslow     = ffffVal.a ;
    float   fCa         = AfCafast*fCafast + AfCaslow*fCaslow ;

    float   fCaMKfast   = jffnVal.g ;
    float   fCaMKslow   = fslow ;
    float   AfCaMKfast  = Affast ;
    float   AfCaMKslow  = Afslow ;
    float   fCaMK       = AfCaMKfast*fCaMKfast + AfCaMKslow*fCaMKslow ;

    float   fCaCaMKfast = jffnVal.b ;
    float   fCaCaMKslow = fCaslow ;
    float   AfCaCaCMfast= Affast ;
    float   AfCaCaCMslow= Afslow ;
    float   fCaCaMK     = fCaCaMKfast*AfCaCaCMfast + fCaCaMKslow*AfCaCaCMslow ;

    float   n           = jffnVal.a ;
    float   jCa         = jffnVal.r ;

    float   CaMKt       = vvxcVal.a ;

    float   CaMKb       = CaMKo*(1.0-CaMKt)/(1.0+KmCaM/Cass) ;
    float   CaMKa       = CaMKb + CaMKt ;

    float   fICaLCaMK   = 1./(1.+KmCaMK/CaMKa) ;

    float   alpha_I = d*(1.0 - fICaLCaMK )*( f*(1.-n) + fCa*n*jCa) ;
    float   beta_I  = d*fICaLCaMK*( fCaMK*(1.-n) + fCaCaMK*n*jCa ) ;

/*-------------------------------------------------------------------------
 * CaMK_trap
 *-------------------------------------------------------------------------
 */
    float   dCaMKt2dt = ACaMK*CaMKb*(CaMKb + CaMKt) - bCaMK*CaMKt ;

     /* updating CaMK_trap channle  */
     vvxcVal.a += dCaMKt2dt*dt ;
     CaMKt = vvxcVal.a ;

/*-------------------------------------------------------------------------
 * I_CaL
 *-------------------------------------------------------------------------
 */
    float   ICaL    = C_CaL*(alpha_I*IbarCaL    + beta_I*IbarCaLCaMK    ) ;

/*-------------------------------------------------------------------------
 * I_CaNa
 *-------------------------------------------------------------------------
 */
    float   ICaNa   = C_CaNa*(alpha_I*IbarCaNa  + beta_I*IbarCaNaCaMK   ) ;

/*-------------------------------------------------------------------------
 * I_CaK
 *-------------------------------------------------------------------------
 */
    float   ICaK    = C_CaK*(alpha_I*IbarCaK    + beta_I*IbarCaKCaMK    ) ;

/*-------------------------------------------------------------------------
 * [K]_ss, JdiffK
 *-------------------------------------------------------------------------
 */
    float   tdiffK  = 2.0 * Ct_diffK ;
    float   Ki      = kknnVal.g ;
    float   JdiffK  = C_diffK*(Kss -Ki)/tdiffK ;

    float   dKss2dt = -ICaK*Acap/(F*vss) - JdiffK ;
    kknnVal.r       += dKss2dt*dt ;

/*-------------------------------------------------------------------------
 * J_rel,NP
 *-------------------------------------------------------------------------
 */
    float   Cajsr       = ccccVal.g ;

    float   bjsr        = -ICaL/(1.0+pow8(1.5/Cajsr)) ;
    float   ajsr        = 1.0/(1.0+(0.0123/Cajsr) ) ;

    float   JrelNP      = mhjjVal.a ;
    float   JrelNPinf   = arel*bjsr*SJrel ;
    float   trelNP      = max(bt*ajsr ,0.001) * Ct_relNP ;

    /* Updating J_rel,NP channel    */
    JrelNP = JrelNPinf + ( JrelNP - JrelNPinf)*exp(-dt/trelNP) ;

    mhjjVal.a = JrelNP ;

/*-------------------------------------------------------------------------
 * J_rel,CaMK
 *-------------------------------------------------------------------------
 */
    float   JrelCaMK    = jaiiVal.r ;
    float   JrelCaMKinf = arelCaMK*bjsr*SJrel ;
    float   trelCaMK    = max( btCaMK * ajsr , 0.001 ) * Ct_relCaMK ;

    /* Updatig J_rel,CaMK channel   */
    JrelCaMK = JrelCaMKinf + ( JrelCaMK - JrelCaMKinf )*exp(-dt/trelCaMK) ;

    jaiiVal.r = JrelCaMK ;

/*------------------------------------------------------------------------
 * J_rel
 *------------------------------------------------------------------------
 */
    CaMKt       = vvxcVal.a ;
    CaMKb       = CaMK0*(1.0-CaMKt)/(1.0 + KmCaM/Cass) ;
    CaMKa       = CaMKb + CaMKt ;

    float   frelCaMK    = 1.0/(1.0 + KmCaMK/CaMKa ) ;
    float   Jrel        = (1.0 - frelCaMK)*JrelNP +  frelCaMK*JrelCaMK ;
    Jrel               *= C_rel ;

/*------------------------------------------------------------------------
 * J_up
 *------------------------------------------------------------------------
 */
    float   Cai         = ccccVal.a ;
    float   Cansr       = ccccVal.r ;
    float   JupNP       = 0.004375*Cai/(0.00092 + Cai) ;
            JupNP       *= SJup ;
            JupNP       *= C_upNP ;

    float   dKmPLB      = 0.00017 ;
    float   dJupCAMK    = 1.75 ;

    float   JupCaMK     = ( 1.0 + dJupCAMK )*0.004375*Cai/
                (   0.00092 - dKmPLB + Cai                  ) ;
            JupCaMK    *= SJup ;
            JupCaMK    *= C_upCaMK ;

    float   fupCaMK = frelCaMK ;
    float   Jleak   = 0.0039375*Cansr/15.0 ;
            Jleak  *= C_leak ;

    float   Jup  = ( 1.0 - fupCaMK )*JupNP + fupCaMK*JupCaMK - Jleak ;
            Jup *= C_up ;

/*------------------------------------------------------------------------
 * Ca_nsr
 *------------------------------------------------------------------------
 */
    Cansr       = ccccVal.r ;
    Cajsr       = ccccVal.g ;
    Cass        = ccccVal.b ;
    Cai         = ccccVal.a ;
    float   ttr         = 100.0 * Ct_tr ;
    float   Jtr         = ( Cansr - Cajsr )/ttr ;
            Jtr        *= C_tr ;


    float   dCansr2dt = Jup - Jtr*vjsr/vnsr ;

    Cansr += dCansr2dt*dt ;

    /* Updating [Ca]_nsr channel    */
    ccccVal.r =  Cansr ;

/*------------------------------------------------------------------------
 * Ca_jsr
 *------------------------------------------------------------------------
 */
    float   aCajsrs= KmCSQN + Cajsr ;
    aCajsrs *= aCajsrs ;
    float   bCajsr = 1.0/(1.0 + CSQN*KmCSQN/aCajsrs ) ;

    float   dCajsr2dt = bCajsr*(Jtr - Jrel) ;
    Cajsr += dCajsr2dt*dt ;

    /* Updating [Ca]_jsr channel    */
    ccccVal.g =  Cajsr ;

/*========================================================================
 * ciii
 *========================================================================
 */
    float   hCa = exp(qCa*vfort) ;
    float   hNa = exp(qNa*vfort) ;

    float   Ca[2] ;
    float   Na[2] ;
    float   INaCaArray[2] ;
    float   aGNaCa[2] ;
    float   C_NaCaArray[2] ;

    aGNaCa[ i ] = 0.8*SGNaCa ;
    aGNaCa[ ss] = 0.2*SGNaCa ;

    C_NaCaArray[ i ] = C_NaCai ;
    C_NaCaArray[ ss] = C_NaCass ;

    Ca[ss]  = ccccVal.b ;
    Ca[i ]  = ccccVal.a ;
    Na[ss]  = kknnVal.b ;
    Na[i ]  = kknnVal.a ;

    float   h1 , h2 , h3 , h4 ,
            h5 , h6 , h7 , h8 ,
            h9 , h10, h11, h12;

    float   k1 , k2 , k3 , k4 ,
            k5 , k6 , k7 , k8 ;
    float   k3p, k3pp, k4p, k4pp ;

    float   x1 , x2 , x3 , x4 ;
    float   E1 , E2 , E3 , E4 ;
    float   xs ;

    float   KmCaAct2CaS ;
    float   allo ;
    float   JNaCaNa ;
    float   JNaCaCa ;

    /* Coefficients independent of i, ss values     */
    h7   = 1.0 + Nao*(1.0 + 1.0/hNa)/kNa3 ;
    h8   = Nao/(kNa3*hNa*h7) ;
    h9   = 1.0/h7 ;
    h10  = kasymm + 1.0 + Nao*(1.0+Nao/kNa2)/kNa1 ;
    h11  = Nao*Nao/(h10*kNa1*kNa2) ;
    h12  = 1.0/h10 ;

    k1   = h12*Cao*kCaon ;
    k2   = kCaoff ;
    k3p  = h9*omegaCa ;
    k3pp = h8*omegaNaCa ;
    k3   = k3p + k3pp ;

    /* Coefficients depending on i, and ss values   */
    for(int Y=0 ; Y<2 ; Y++){
        h1      = 1.0 + Na[Y]*(1.+hNa)/kNa3 ;
        h2      = Na[Y]*hNa/( kNa3*h1  ) ;
        h3      = 1.0/h1 ;
        h4      = 1.0+ Na[Y]*(1.0 + Na[Y]/kNa2)/kNa1 ;
        h5      = Na[Y]*Na[Y]/( h4*kNa1*kNa2   ) ;
        h6      = 1.0/h4 ;

        k4p     = h3*omegaCa/hCa ;
        k4pp    = h2*omegaNaCa ;
        k4      = k4p + k4pp ;
        k5      = kCaoff ;
        k6      = h6*Ca[Y]*kCaon ;
        k7      = h5*h2*omegaNa ;
        k8      = h8*h11*omegaNa ;
        x1      = k2*k4*(k7+k6) + k5*k7*(k2+k3) ;
        x2      = k1*k7*(k4+k5) + k4*k6*(k1+k8) ;
        x3      = k1*k3*(k7+k6) + k8*k6*(k2+k3) ;
        x4      = k2*k8*(k4+k5) + k3*k5*(k1+k8) ;
        xs      = x1 + x2 + x3 + x4 ;

        E1      = x1/xs ;
        E2      = x2/xs ;
        E3      = x3/xs ;
        E4      = x4/xs ;

        KmCaAct2CaS = KmCaAct/Ca[Y] ;
        KmCaAct2CaS *= KmCaAct2CaS ;

        allo    = 1./(1. + KmCaAct2CaS ) ;
        JNaCaNa = 3.0*(E4*k7 - E1*k8) + E3*k4pp - E2*k3pp ;
        JNaCaCa = E2*k2 - E1*k1 ;

        INaCaArray[Y]= C_NaCaArray[Y]*GNaCa*aGNaCa[Y]*allo*
                        (zNa*JNaCaNa + zCa*JNaCaCa) ;
    }

    /* Updating INaCai & INaCass channels */
    float INaCai    = INaCaArray[ i  ] ;
    float INaCass   = INaCaArray[ ss ] ;

/*-------------------------------------------------------------------------
 * I_pCa & I_Cab
 *-------------------------------------------------------------------------
 */
    float ICab  = C_Cab*PCab*(alphaCass*Cai - betaCao ) ;
    float IpCa  = C_pCa*GpCa*Cai/(0.0005+Cai) ;

/*-------------------------------------------------------------------------
 * [Ca]_i
 *-------------------------------------------------------------------------
 */
    float   tdiffCa = tdiffCaCnst * Ct_diffCa ;
    float   JdiffCa = (Cass - Cai)/tdiffCa ;
            JdiffCa*= C_diffCa ;

    float CMDN = CMDNI*SCMDN ;

    float b1    = KmCMDN + Cai ;
    b1 *= b1 ;

    float b2    = KmTRPN + Cai ;
    b2 *= b2 ;

    float betaCai = 1.0/(   1.0 +
                            CMDN*KmCMDN/b1 +
                            TRPN*KmTRPN/b2      ) ;

    float   dCai2dt = betaCai*
                (   -( IpCa + ICab - 2.0*INaCai )*Acap/(2.0*F*vmyo)
                    - Jup*vnsr/vmyo
                    + JdiffCa*vss/vmyo                              ) ;
    Cai += dCai2dt*dt ;

    /* Update [Ca]_i channel */
    ccccVal.a   = Cai ;

/*========================================================================
 * knni
 *========================================================================
 */

/*-------------------------------------------------------------------------
 * ENa and EK
 *-------------------------------------------------------------------------
 */
    Kss     = kknnVal.r ;
    Ki      = kknnVal.g ;
    Nass    = kknnVal.b ;
    float   Nai         = kknnVal.a ;

    float   ENa         = rtof*log( Nao/Nai ) ;
    float   EK          = rtof*log( Ko/Ki   ) ;

    float   EKs         = rtof*log((Ko+PRNaK*Nao)/(Ki + PRNaK*Ki)) ;

/*-------------------------------------------------------------------------
 * I_Na
 *-------------------------------------------------------------------------
 */
    float   fINaCaMK    = 1.0/(1.0 + (KmCaMK/CaMKa) ) ;
    float   fINaLCaMK   = fINaCaMK ;

    float   m   = mhjjVal.r ;
    float   h   = mhjjVal.g ;
    float   j   = mhjjVal.b ;
    float   INa = C_Na*GNa*m*m*m*h*j*(V - ENa ) ;

/*-------------------------------------------------------------------------
 * I_NaCa
 *-------------------------------------------------------------------------
 */
    float   INaCa       = C_NaCa*(INaCai + INaCass) ;

/*-------------------------------------------------------------------------
 * I_to
 *-------------------------------------------------------------------------
 */
    float   a           = jaiiVal.g ;

    float   ifast       = jaiiVal.b ;
    float   islow       = jaiiVal.a ;
    float   Aifast      = 1./
            (    1. +   exp(   (V-213.6)/151.2 )           )  ;
    float   Aislow      = 1.0 - Aifast ;
    float   iavg        = Aifast*ifast + Aislow*islow ;

    float   aCaMK       = aiidVal.r ;

    float   AiCaMKfast  = Aifast ;
    float   AiCaMKslow  = Aislow ;
    float   iCaMKfast   = aiidVal.g ;
    float   iCaMKslow   = aiidVal.b ;
    float   iCaMK       = AiCaMKfast*iCaMKfast + AiCaMKslow*iCaMKslow;

    float   fItoCaMK    = fINaCaMK ;

    float   Ito         = C_to*SGto*Gto*( V - EK  )*
        ( ( 1.0 - fItoCaMK )*a*iavg    +   fItoCaMK*aCaMK*iCaMK    ) ;

/*-------------------------------------------------------------------------
 * I_Kr
 *-------------------------------------------------------------------------
 */
    float   xrfast      = xxxxVal.r ;
    float   xrslow      = xxxxVal.g ;
    
    float   Axrfast     = 1./
            (   1.  +   exp(    (V+54.81)/38.21    )       )  ;
    
    float   Axrslow     = 1.0 - Axrfast ;
    float   xr          = Axrfast*xrfast    +   Axrslow*xrslow ;

    float   RKr         = 1./( ( 1.+exp((V+55.)/75.) )*
                             ( 1.+exp((V-10.)/30.) )       ) ;

    float   GKr         = 0.046*SGKr ;

    float   IKr         = C_Kr*GKr*sqrt(Ko/5.4)*xr*RKr*(V-EK) ;

/*-------------------------------------------------------------------------
 * I_Ks
 *-------------------------------------------------------------------------
 */
    float   xs1         = xxxxVal.b ;
    float   xs2         = xxxxVal.a ;
    float   GKs         = 0.0034*SGKs ;

    float   IKs         = C_Ks*GKs*(1.0 + 0.6/(1.0 + pow(3.8e-5/Cai, 1.4)))*
                            xs1*xs2*( V - EKs   ) ;

/*-------------------------------------------------------------------------
 * I_K1
 *-------------------------------------------------------------------------
 */
    float   xK1         = vvxcVal.b ;
    float   RK1         = 1./
            (   1. + exp((  V + 105.8 - 2.6*Ko  )/9.493 )   )  ;
    float   GK1         = 0.1908*sqrt(Ko)*SGK1 ;
    float   IK1         = C_K1*GK1*xK1*RK1*( V - EK ) ;

/*-------------------------------------------------------------------------
 * I_NaK
 *-------------------------------------------------------------------------
 */
    float   KNai        = K0Nai*exp( Delta*vfort/3.0       )  ;   
    float   KNao        = K0Nao*exp( (1.0-Delta)*vfort/3.0 ) ;

    float   P           = SP/(  1.0 + H/KHP + Nai/KNaP + Ki/KKP     ) ;

    float   Nao2KNao    = Nao/KNao ;
    float   Nai2KNai    = Nai/KNai ;
    float   Ko2KKo      = Ko/KKo ;
    float   Ki2KKi      = Ki/KKi ;

    float   OPNao2KNao  = 1. + Nao2KNao ;
    float   OPNai2KNai  = 1. + Nai2KNai ;
    float   OPKo2KKo    = 1. + Ko2KKo ;
    float   OPKi2KKi    = 1. + Ki2KKi ;

    float   alpha1      = kp1*Nai2KNai*Nai2KNai*Nai2KNai/
        (   OPNai2KNai*OPNai2KNai*OPNai2KNai + OPKi2KKi*OPKi2KKi - 1.0  ) ;

    float   beta1       = km1*MgADP ;

    float   alpha2      = kp2 ;

    float   beta2       = km2*Nao2KNao*Nao2KNao*Nao2KNao/
        (   OPNao2KNao*OPNao2KNao*OPNao2KNao + OPKo2KKo*OPKo2KKo - 1.0  ) ;

    float   alpha3      = kp3*Ko2KKo*Ko2KKo/
        (   OPNao2KNao*OPNao2KNao*OPNao2KNao + OPKo2KKo*OPKo2KKo - 1.0  ) ;

    float   beta3       = km3*P*H/(   1.0 + MgATP/KMgATP                ) ;

    float   alpha4      = kp4*(MgATP/KMgATP)/( 1. + MgATP/KMgATP        ) ;

    float   beta4       = km4*Ki2KKi*Ki2KKi/
        (   OPNai2KNai*OPNai2KNai*OPNai2KNai + OPKi2KKi*OPKi2KKi - 1.0  ) ;

    float x11          =   alpha4*alpha1*alpha2 +  beta2*beta4*beta3
                +   alpha2*beta4*beta3   +  beta3*alpha1*alpha2   ;

    float x22          =   beta2*beta1*beta4    +  alpha1*alpha2*alpha3
                +   alpha3*beta1*beta4   +  alpha2*alpha3*beta4   ;

    float x33          =   alpha2*alpha3*alpha4 +  beta3*beta2*beta1
                +   beta2*beta1*alpha4   +  alpha3*alpha4*beta1   ;

    float x44          =   beta4*beta3*beta2    +  alpha3*alpha4*alpha1
                        +   beta2*alpha4*alpha1  +  beta3*beta2*alpha1    ;

    float   xsum    = x11 + x22 + x33 + x44 ;
    float   E11     = x11/xsum ;
    float   E22     = x22/xsum ;
    float   E33     = x33/xsum ;
    float   E44     = x44/xsum ;

    float   JNaKNa  = C_NaKNa   * 3.0 *( E11*alpha3   -   E22*beta3    ) ;
    float   JNaKK   = C_NaKK    * 2.0 *( E44*beta1    -   E33*alpha1   ) ;
    float   INaK    = C_NaK     * SGNaK * 30. *( JNaKNa+   JNaKK       ) ;

/*-------------------------------------------------------------------------
 * I_Nab
 *-------------------------------------------------------------------------
 */
    float   aNai        = alphaNass/gNai ;
    float   bNao        = betaNao/gNao ;

    float   INab        = C_Nab*PNab*(aNai*Nai - bNao) ;

/*-------------------------------------------------------------------------
 * I_Kb
 *-------------------------------------------------------------------------
 */
    float   xKb         = 1.0/
            (   1.0 + exp( ( 14.48 - V )/18.34 )           )  ;
    float   GKb         = 0.003*SGKb ;

    float   IKb         = C_Kb*GKb*xKb*(V-EK) ;

/*-------------------------------------------------------------------------
 * J_diff,Na
 *-------------------------------------------------------------------------
 */
    float   tauDiffNa   = 2.0 * Ct_diffNa ;
    float   tauDiffK    = 2.0 * Ct_diffK ;

    float   JdiffNa     = C_diffNa * ( Nass    - Nai   )/tauDiffNa ;
    JdiffK      = C_diffK  * ( Kss     - Ki    )/tauDiffK ;

/*-------------------------------------------------------------------------
 * [K]_i
 *-------------------------------------------------------------------------
 */
    float   dKi2dt      =
        -( Ito + IKr + IKs + IK1 +IKb - 2.0*INaK )*Acap/(F*vmyo) +
        JdiffK*vss/vmyo ;
    Ki +=  dKi2dt*dt ;
    kknnVal.g   = Ki ;

/*-------------------------------------------------------------------------
 * [Na]_i
 *-------------------------------------------------------------------------
 */
    float   dNai2dt     =
        -( INa + 3.0*INaCai + 3.0*INaK + INab)*Acap/(F*vmyo) +
        JdiffNa*vss/vmyo ;
    Nai += dNai2dt*dt ;
    kknnVal.a = Nai ;

/*-------------------------------------------------------------------------
 * [Na]_ss
 *-------------------------------------------------------------------------
 */
    float   dNass2dt    =
        -( ICaNa + 3.0*INaCass  )*Acap/(F*vss)  - JdiffNa ;
    Nass += dNass2dt*dt ;
    kknnVal.b = Nass ;

/*-------------------------------------------------------------------------
 * [Ca]_ss
 *-------------------------------------------------------------------------
 */
    Cansr = ccccVal.r ;
    Cajsr = ccccVal.g ;
    Cass  = ccccVal.b ;
    Cai   = ccccVal.a ;


    tdiffCa = 0.2 ;
    JdiffCa = (Cass - Cai)/tdiffCa ;
    JdiffCa*= C_diffCa ;

    b1 = KmBSR + Cass ;
    b1 *= b1 ;

    b2 = KmBSL + Cass ;
    b2 *= b2 ;

    float betaCass = 1.0/(  1.0 + BSR*KmBSR/b1 + BSL*KmBSL*b2   ) ;

    float dCass2dt = betaCass*
                (   -( ICaL - 2.0*INaCass )*Acap/(2.0*F*vss)
                    + Jrel*vjsr/vss
                    - JdiffCa                                   ) ;

    /* Updating [Ca]_ss channel */
    ccccVal.b += dCass2dt*dt ;

/*-------------------------------------------------------------------------
 * Laplacian
 *-------------------------------------------------------------------------
 */
    #include directionMap.glsl 

    #define vlt_txtr    vvxcIn
    #define vchannel    r

    uvec4 dir0  = texelFetch( idir0 , texelPos,0 ) ;
    uvec4 dir1  = texelFetch( idir1 , texelPos,0 ) ;

    float  dx = lx/float(mx*my) ;
    float laplacian = (
            texelFetch( vlt_txtr, unpack( NORTH ), 0 )
        +   texelFetch( vlt_txtr, unpack( SOUTH ), 0 )
        +   texelFetch( vlt_txtr, unpack( EAST  ), 0 )
        +   texelFetch( vlt_txtr, unpack( WEST  ), 0 )
        +   texelFetch( vlt_txtr, unpack( UP    ), 0 )
        +   texelFetch( vlt_txtr, unpack( DOWN  ), 0 )
        -6.*texelFetch( vlt_txtr, texelPos, 0 )         ).vchannel ;
    
    laplacian = laplacian/(dx*dx) ;


    float dVlt2dt = laplacian*diffCoef ;


//    vec3 cdd = domainResolution/domainSize ;
//    cdd  *= cdd ;
//
//    vec4    nhshMap = texture(nhshMapTxt, pixPos ) ;
//    vec4    etwtMap = texture(etwtMapTxt, pixPos ) ;
//    vec4    updnMap = texture(updnMapTxt, pixPos ) ;
//
//    vec4    nsewAvg    = texture( nsewAvgTxt, pixPos ) ;
//    vec4    updnAvg    = texture( updnAvgTxt, pixPos ) ;
//
//    float   nGrad = nsewAvg.r*(texture(vvxcIn,nhshMap.xy).r - V) ;
//    float   sGrad =-nsewAvg.a*(texture(vvxcIn,nhshMap.zw).r - V) ;
//    float   eGrad = nsewAvg.g*(texture(vvxcIn,etwtMap.xy).r - V) ;
//    float   wGrad =-nsewAvg.b*(texture(vvxcIn,etwtMap.zw).r - V) ;
//    float   uGrad = updnAvg.r*(texture(vvxcIn,updnMap.xy).r - V) ;
//    float   dGrad =-updnAvg.b*(texture(vvxcIn,updnMap.zw).r - V) ;
//
//    float dVlt2dt   = (eGrad - wGrad)*cdd.x 
//                    + (nGrad - sGrad)*cdd.y 
//                    + (uGrad - dGrad)*cdd.z
//                    ;

/*------------------------------------------------------------------------
 * I_sum
 *------------------------------------------------------------------------
 */
    float I_sum =   INa
                +   Ito
                +   ICaL 
                +   ICaNa 
                +   ICaK 
                +   IKr 
                +   IKs 
                +   IK1 
                +   INaCa 
                +   INaK
                +   INab
                +   ICab
                +   IKb
                +   IpCa
                ;

/*------------------------------------------------------------------------
 * Time integration for membrane potential
 *------------------------------------------------------------------------
 */
    dVlt2dt -= I_sum/C_m ;
    V += dVlt2dt*dt ;
    vvxcVal.r = V ;
    vvxcVal.g = (V-minVlt)/(maxVlt-minVlt) ;
/*------------------------------------------------------------------------
 * ouputing the shader
 *------------------------------------------------------------------------
 */
    mhjjOut = mhjjVal ;
    jaiiOut = jaiiVal ;
    vvxcOut = vvxcVal;
    ccccOut = ccccVal ;
    kknnOut = kknnVal ;

    return ;
}
