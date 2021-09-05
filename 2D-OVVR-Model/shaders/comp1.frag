#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * comp1.frag   : march color-set 0 to 3 for one time step
 *
 * PROGRAMMER   : ABOUZAR KABOUDIAN
 * DATE         : Wed 28 Oct 2020 12:21:16 (EDT)
 * PLACE        : Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
#include    precision.glsl

// interface variables ...................................................
in vec2 cc  ;

// uniforms and useful macros ............................................
#include    compuniforms.glsl

// variable macros .......................................................
#include    variables.glsl

// color outputs .........................................................
layout (location = 0) out vec4 ocolor0 ; 
layout (location = 1) out vec4 ocolor1 ; 
layout (location = 2) out vec4 ocolor2 ; 
layout (location = 3) out vec4 ocolor3 ; 

// Functions/macros for Rush-Larsen time integration .....................

#include    rush_larsen.glsl

/*========================================================================
 * main body of the shader
 *========================================================================
 */
void main(){
    // localizing variables ..............................................
    ivec2 texelPos = ivec2( gl_FragCoord.xy ) ;

    vec4 color0  = texelFetch( icolor0  , texelPos , 0 ) ;
    vec4 color1  = texelFetch( icolor1  , texelPos , 0 ) ;
    vec4 color2  = texelFetch( icolor2  , texelPos , 0 ) ;
    vec4 color3  = texelFetch( icolor3  , texelPos , 0 ) ;
    vec4 color4  = texelFetch( icolor4  , texelPos , 0 ) ;
    vec4 color5  = texelFetch( icolor5  , texelPos , 0 ) ;
    vec4 color6  = texelFetch( icolor6  , texelPos , 0 ) ;
    vec4 color7  = texelFetch( icolor7  , texelPos , 0 ) ;
    vec4 color8  = texelFetch( icolor8  , texelPos , 0 ) ;
    vec4 color9  = texelFetch( icolor9  , texelPos , 0 ) ;
    vec4 color10 = texelFetch( icolor10 , texelPos , 0 ) ;

    // aCaMK .............................................................
    float   aCaMKinf = 1./
            (   1. +    exp(  -(V-24.34)/14.82 )           ) ;

    float   ta       = 1.0515/
            (   1./ (   1.2089*(1.+exp(-(V-18.41)/29.38))  ) +
                3.5/(   1. + exp(  (V+100.)/29.38  )   )   ) ;

    ta *= Ct_aCaMK ;

    aCaMK = RL1( aCaMK, aCaMKinf, ta, dt ) ;

    // iCaMKfast, iCaMKslow ..............................................
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

    iCaMKfast = RL1( iCaMKfast, aCaMKinf, tiCaMKfast, dt ) ;
    iCaMKslow = RL1( iCaMKslow, aCaMKinf, tiCaMKslow, dt ) ;

    // d .................................................................
    float   dinf = 1./
            (   1. +    exp(   -(V+3.940)/4.230    )       ) ;

    float   td   =  0.6 + 1./
            (   exp(   -0.05*(V+6.0)               ) +
                exp(    0.09*(V+14.0)              )       ) ;
    td *= Ct_d ;
    
    d = RL1(d, dinf, td, dt ) ;

    // ffast, fslow ......................................................
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

    ffast = RL1( ffast , finf, tffast, dt ) ;
    fslow = RL1( fslow , finf, tfslow, dt ) ;

    // fCafast, fCaslow ..................................................
    float   fCainf   = finf ;
    float   tfCafast = 7.0 +
                1./(    0.04*exp( -(V-4.0)/7.0)    +
                        0.04*exp(  (V-4.0)/7.0)            ) ;
    tfCafast *= Ct_fCafast ;

    float   tfCaslow = 100.0 +
                1./(    0.00012*exp( -V/3.0 ) +
                        0.00012*exp(  V/7.0 )              ) ;
    tfCaslow *= Ct_fCaslow ;
    
    fCafast = RL1( fCafast, fCainf, tfCafast, dt ) ;
    fCaslow = RL1( fCaslow, fCainf, tfCaslow, dt ) ;

    // jCa ...............................................................
    float   jCainf  =  1./
            (   1. + exp(      (V+19.58)/3.696     )       ) ;

    float   tjCa    = 75.0*Ct_jCa ;
    
    jCa = RL1( jCa, jCainf, tjCa, dt ) ;

    // fCaMKfast .........................................................
    float   fCaMKinf = jCainf ;

    float   tfCaCMfast = 7.0 + 1./
            (   0.0045*exp(   -(V+20.0)/10.0       ) +
                0.0045*exp(    (V+20.0)/10.0       )       ) ;
    tfCaCMfast *= 2.5*Ct_fCaMKfast ;

    fCaMKfast = RL1(fCaMKfast, fCaMKinf, tfCaCMfast, dt ) ;

    // fCaCaMKfast .......................................................
    float   fCaCaMKinf = jCainf ;

    float   tfCaCaMKfast = 7.0 + 1./
            (   0.0045*exp(   -(V+20.0)/10.0       ) +
                0.0045*exp(    (V+20.0)/10.0       )       ) ;
    tfCaCaMKfast *=  2.5*2.5*Ct_fCaCaMKfast ;

    tfCaCaMKfast = RL1( tfCaCaMKfast, fCaCaMKinf, tfCaCaMKfast, dt ) ; 
    
    // n .................................................................
    float Kmn  = 0.002 ; float kp2n = 1000.0 ; float km2n = jCa ;
    Cass = Cajsr ;

    float kappa     = 1. + Kmn/Cass ;
    kappa           = kappa*kappa*kappa*kappa ;

    float alpha_n   = 1.0 /( kp2n/km2n  + kappa ) ;
    float ninf      = alpha_n*kp2n/km2n ;
    float tn        = Ct_n/km2n ;
    
    n = RL1( n, ninf, tn, dt ) ;

    // xrfast, xrslow ....................................................
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

    xrfast = RL1( xrfast, xrinf, txrfast, dt ) ;
    xrslow = RL1( xrslow, xrinf, txrslow, dt ) ;

    // xs1, xs2 ..........................................................
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

    xs1 = RL1( xs1, xs1inf, txs1, dt ) ;
    xs2 = RL1( xs2, xs2inf, txs2, dt ) ;
    
    
    // output color values ...............................................
    ocolor0 = vec4(color0) ;
    ocolor1 = vec4(color1) ;
    ocolor2 = vec4(color2) ;
    ocolor3 = vec4(color3) ;

    return ;
}
