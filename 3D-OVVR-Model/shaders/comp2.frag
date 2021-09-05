#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * comp2.frag   : march color-set 4 to 11 for one time step
 *
 * PROGRAMMER   : ABOUZAR KABOUDIAN
 * DATE         : Wed 28 Oct 2020 20:43:39 (EDT)
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
layout (location = 0) out vec4 ocolor4  ; 
layout (location = 1) out vec4 ocolor5  ; 
layout (location = 2) out vec4 ocolor6  ; 
layout (location = 3) out vec4 ocolor7  ; 
layout (location = 4) out vec4 ocolor8  ; 
layout (location = 5) out vec4 ocolor9  ; 
layout (location = 6) out vec4 ocolor10 ; 

// Functions/macros for Rush-Larsen time integration .....................
#include    rush_larsen.glsl

/*========================================================================
 * laplacian
 *========================================================================
 */
void laplacian(sampler2D icolor, out vec2 size, out vec4 l ){
    size = vec2(textureSize( icolor, 0 )) ;
    ivec2 texelPos = ivec2( gl_FragCoord.xy ) ;
    
    uvec4 dir0  = texelFetch( idir0 , texelPos,0 ) ;
    uvec4 dir1  = texelFetch( idir1 , texelPos,0 ) ;

    l =     texelFetch( icolor, unpack( NORTH ), 0 )
        +   texelFetch( icolor , unpack( SOUTH ), 0 )
        +   texelFetch( icolor , unpack( EAST  ), 0 )
        +   texelFetch( icolor , unpack( WEST  ), 0 )
        +   texelFetch( icolor , unpack( UP    ), 0 )
        +   texelFetch( icolor , unpack( DOWN  ), 0 )
        -6.*texelFetch( icolor , texelPos, 0 )        ;

    return ;
}

/*========================================================================
 * main body of the shader
 *========================================================================
 */
void main(){
    // localizing variables ..............................................
    // ivec2 texelPos = ivec2( gl_FragCoord.xy ) ;
    ivec2 isize = textureSize(icolor0,        0 ) ;
    ivec2 texelPos = ivec2( cc*vec2(isize) ) ; 

    uvec4 dir0  = texelFetch( idir0 , texelPos,0 ) ;
    uvec4 dir1  = texelFetch( idir1 , texelPos,0 ) ;

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
    
    // m .................................................................
    float minf  = 1.0/(1.0+exp((-(V+39.57))/9.871)) ;
    float tm    = 1.0/(6.765*exp((V+11.64)/34.77)
           +8.552*exp(-(V+77.42)/5.955)) ;

    m = RL1( m , minf , tm, dt ) ;

    // hfast, hslow ......................................................
    float hinf  = 1.0/(1.+exp((V+82.90)/6.086)) ;
    float thf   = 1.0/(1.432e-5*exp(-(V+1.196)/6.285)
            +6.149*exp((V+0.5096)/20.27)) ;
    float ths   = 1.0/(0.009794*exp(-(V+17.95)/28.05)
            +0.3343*exp((V+5.730)/56.66)) ;
    
    hfast = RL1( hfast, hinf, thf, dt ) ;
    hslow = RL1( hslow, hinf, ths, dt ) ;

    float Ahf   = 0.99 ; float Ahs = 0.01 ;
    float h     = Ahf*hfast + Ahs*hslow ;

    // j .................................................................
    float jinf  = hinf ;
    float tj    = 2.038+1.0/(0.02136*exp(-(V+100.6)/8.281)
            +0.3052*exp((V+0.9941)/38.45)) ;

    j = RL1( j, jinf, tj, dt ) ;

    // hCaMKslow .........................................................
    float hCaMKinf  = 1.0/(1.0+exp((V+89.1)/6.086)) ;
    float thCaMKs   = 3.0*ths ;
    float hCaMKfast = hfast ;

    hCaMKslow = RL1( hCaMKslow, hCaMKinf, thCaMKs, dt ) ;

    float hCaMK = Ahf*hCaMKfast + Ahs*hCaMKslow ;

    // jCaMK .............................................................
    float   jCaMKinf = jinf ;
    float   tjCaMK  =1.46*tj ;

    jCaMK = RL1( jCaMK, jCaMKinf, tjCaMK, dt ) ;

    // mL ................................................................
    float   mLinf = 1.0/(1.0+exp((-(V+42.85))/5.264)) ;
    float   tLm   = tm ;
    
    mL = RL1( mL, mLinf, tLm, dt ) ;

    // hL ................................................................
    float hLinf     = 1.0/(1.0+exp((V+87.61)/7.488)) ;
    float thL = 200.0 ;

    hL = RL1( hL, hLinf, thL, dt ) ;

    // hLCaMK ............................................................
    float hLCaMKinf = 1./(1.+exp((V+93.81)/7.488)) ;
    float tLCaMK = 3.*thL ;

    hLCaMK = RL1( hLCaMK, hLCaMKinf, tLCaMK, dt ) ;

    // xK1 ...............................................................
    float   xK1inf  = 1./
            (   1.  +   exp(   -(V+2.5538*Ko + 144.59  )/
                                     (1.5692*Ko + 3.8115 )  )   ) ;


    float   txK1    = (
            122.2/
            (   exp(   -( V+127.2   )/20.36 ) +
                exp(    ( V+236.8   )/69.33 )              ) 
        ) * Ct_xk1 ;

    xK1 = RL1(xK1 , xK1inf, txK1, dt ) ;

    // a (sa) ............................................................
    float   ainf    = 1./
            (   1. +    exp(  -(V-14.34)/14.82     )       )  ;
    
    float   ta      = (
            1.0515/
            (   1./ (   1.2089*(1.+exp(-(V-18.41)/29.38))  ) +
                3.5/(   1. + exp(  (V+100.)/29.38  )   )   ) 
        )*Ct_a ;
    
    sa = RL1 ( sa, ainf, ta , dt ) ;

    // ifast, islow ......................................................
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

    ifast = RL1( ifast, iinf, tifast, dt ) ;
    islow = RL1( islow, iinf, tislow, dt ) ;

    // kiii ..............................................................
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
                            (   exp(zNa*vfort) - 1.0       ) ;

        betaNao =  zNa*zNa*vffort*gNao*Nao/
                            (   exp(zNa*vfort) - 1.0       ) ;
        alphaKss = zK*zK*vffort*gKi*exp(zK*vfort)/
                            (   exp(zK*vfort) - 1.0        ) ;
        betaKo = zK*zK*vffort*gKo*Ko/(exp(zK*vfort)-1.) ;

    }else{
        alphaCass = (zCa*F*gCai + zCa*V*F*gCai ) ;
        betaCao = zCa*F*gCao*Cao/exp(zCa*vfort) ;
        alphaNass = zNa*gNai*(F+ vffort*zNa)  ;
        betaNao = zNa*F*gNao*Nao/
                            (   exp(zNa*vfort)        ) ;
        alphaKss = zK*gKi*(F + vffort*zK) ;
        betaKo = zK*F*gKo*Ko/exp(zK*vfort) ;

    }

    float   PsiCa       = alphaCass*Cass - betaCao ;
    float   PCa         = 0.0001*SPCa ;
    float   IbarCaL     = PCa*PsiCa ;

    float   PsiCaNa     = alphaNass*Nass - betaNao ;
    float   PCaNa       = 0.00125*PCa ;
    float   IbarCaNa    = PCaNa*PsiCaNa ;

    float   PCaK        = 3.574e-4*PCa ;
    float   PsiCaK      = alphaKss*Kss - betaKo ;
    float   IbarCaK     = PCaK*PsiCaK ;

    float   PCaCaMK     = 1.1*PCa ;
    float   IbarCaLCaMK = PCaCaMK*PsiCa ;

    float   PCaNaCaMK   = 0.00125*PCaCaMK ;
    float   IbarCaNaCaMK= PCaNaCaMK*PsiCaNa ;

    float   PCaKCaMK    = 3.574e-4*PCaCaMK ;
    float   IbarCaKCaMK = PCaKCaMK*PsiCaK ;

    float   Affast      = 0.6 ;
    float   Afslow      = 1.-Affast ;
    float   f           = Affast*ffast + Afslow*fslow ;

    float   AfCafast    =  0.3 +
               0.6/(    1. + exp((V-10.)/10.)              ) ;
    float   AfCaslow    = 1. - AfCafast ;
    float   fCa         = AfCafast*fCafast + AfCaslow*fCaslow ;

    float   fCaMKslow   = fslow ;
    float   AfCaMKfast  = Affast ;
    float   AfCaMKslow  = Afslow ;
    float   fCaMK       = AfCaMKfast*fCaMKfast + AfCaMKslow*fCaMKslow ;

    float   fCaCaMKslow = fCaslow ;
    float   AfCaCaCMfast= Affast ;
    float   AfCaCaCMslow= Afslow ;
    float   fCaCaMK     = 
        fCaCaMKfast*AfCaCaCMfast + fCaCaMKslow*AfCaCaCMslow ;


    float   CaMKb       = CaMKo*(1.0-CaMKt)/(1.0+KmCaM/Cass) ;
    float   CaMKa       = CaMKb + CaMKt ;

    float   fICaLCaMK   = 1./(1.+KmCaMK/CaMKa) ;

    float   alpha_I = d*(1.0 - fICaLCaMK )*( f*(1.-n) + fCa*n*jCa) ;
    float   beta_I  = d*fICaLCaMK*( fCaMK*(1.-n) + fCaCaMK*n*jCa ) ;

    // CaMKtrap ..........................................................
    float   dCaMKt2dt = ACaMK*CaMKb*(CaMKb + CaMKt) - bCaMK*CaMKt ;

    CaMKt += dCaMKt2dt*dt ;

    // ICaL ..............................................................
    float   ICaL    = C_CaL*(alpha_I*IbarCaL    + beta_I*IbarCaLCaMK    ) ;

    // ICaNa .............................................................
    float   ICaNa   = C_CaNa*(alpha_I*IbarCaNa  + beta_I*IbarCaNaCaMK   ) ;

    // ICaK ..............................................................
    float   ICaK    = C_CaK*(alpha_I*IbarCaK    + beta_I*IbarCaKCaMK    ) ;

    // Kss, JdiffK .......................................................
    float   tdiffK  = 2.0 * Ct_diffK ;
    float   JdiffK  = C_diffK*(Kss -Ki)/tdiffK ;

    float   dKss2dt = -ICaK*Acap/(F*vss) - JdiffK ;
    Kss += dKss2dt*dt ;

    // JrelNP ............................................................
    float   bjsr        = -ICaL/(1.0+pow8(1.5/Cajsr)) ;
    float   ajsr        = 1.0/(1.0+(0.0123/Cajsr) ) ;

    float   JrelNPinf   = arel*bjsr*SJrel ;
    float   trelNP      = max(bt*ajsr ,0.001) * Ct_relNP ;

    JrelNP = RL1( JrelNP, JrelNPinf , trelNP, dt  ) ;

    // JrelCaMK ..........................................................
    float   JrelCaMKinf = arelCaMK*bjsr*SJrel ;
    float   trelCaMK    = max( btCaMK * ajsr , 0.001 ) * Ct_relCaMK ;
    
    JrelCaMK = RL1( JrelCaMK, JrelCaMKinf, trelCaMK, dt ) ;

    // Jrel ..............................................................
    CaMKb       = CaMK0*(1.0-CaMKt)/(1.0 + KmCaM/Cass) ;
    CaMKa       = CaMKb + CaMKt ;

    float   frelCaMK    = 1.0/(1.0 + KmCaMK/CaMKa ) ;
    float   Jrel        = (1.0 - frelCaMK)*JrelNP +  frelCaMK*JrelCaMK ;
    Jrel               *= C_rel ;

    // Jup ...............................................................
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

    // Cansr .............................................................
    float   ttr         = 100.0 * Ct_tr ;
    float   Jtr         = ( Cansr - Cajsr )/ttr ;
            Jtr        *= C_tr ;


    float   dCansr2dt = Jup - Jtr*vjsr/vnsr ;

    Cansr += dCansr2dt*dt ;

    // Cajsr .............................................................
    float   aCajsrs= KmCSQN + Cajsr ;
    aCajsrs *= aCajsrs ;
    float   bCajsr = 1.0/(1.0 + CSQN*KmCSQN/aCajsrs ) ;

    float   dCajsr2dt = bCajsr*(Jtr - Jrel) ;
    Cajsr += dCajsr2dt*dt ;

    // INaCai , INaCass ..................................................
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

    Ca[ss]  = Cass ;
    Ca[i ]  = Cai ;
    Na[ss]  = Nass ;
    Na[i ]  = Nai ;

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

    float INaCai    = INaCaArray[ i  ] ;
    float INaCass   = INaCaArray[ ss ] ;

    // ICab, IpCa ........................................................
    float ICab  = C_Cab*PCab*(alphaCass*Cai - betaCao ) ;
    float IpCa  = C_pCa*GpCa*Cai/(0.0005+Cai) ;

    // Cai ...............................................................
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

    // ENa, EK, EKs ......................................................
    float   ENa         = rtof*log( Nao/Nai ) ;
    float   EK          = rtof*log( Ko/Ki   ) ;
    float   EKs         = rtof*log((Ko+PRNaK*Nao)/(Ki + PRNaK*Ki)) ;

    // INafast ...........................................................
    float   fINaCaMK    = 1.0/(1.0 + (KmCaMK/CaMKa) ) ;
    
    float INafast = GNafast*(V-ENa)*m*m*m*((1.-fINaCaMK)*h*j
            + fINaCaMK*hCaMK*jCaMK) ;

    // INalate ...........................................................
    float fINaLp = (1.0/(1.0+KmCaMK/CaMKa)) ;
    float INalate = GNalate*(V-ENa)*mL*((1.-fINaLp)*hL+fINaLp*hLCaMK) ;

    // INa ...............................................................
    float INa = C_Na*(C_Nafast*INafast + C_Nalate*INalate) ;
    
    // INaCa .............................................................
    float   INaCa       = C_NaCa*(INaCai + INaCass) ;

    // Ito ...............................................................
    float   Aifast      = 1./
            (    1. +   exp(   (V-213.6)/151.2 )           )  ;
    float   Aislow      = 1.0 - Aifast ;
    float   iavg        = Aifast*ifast + Aislow*islow ;


    float   AiCaMKfast  = Aifast ;
    float   AiCaMKslow  = Aislow ;
    float   iCaMK       = AiCaMKfast*iCaMKfast + AiCaMKslow*iCaMKslow;

    float   fItoCaMK    = fINaCaMK ;

    float   Ito         = C_to*SGto*Gto*( V - EK  )*
        ( ( 1.0 - fItoCaMK )*sa*iavg    +   fItoCaMK*aCaMK*iCaMK    ) ;

    // IKr ...............................................................
    float   Axrfast     = 1./
            (   1.  +   exp(    (V+54.81)/38.21    )       )  ;
    
    float   Axrslow     = 1.0 - Axrfast ;
    float   xr          = Axrfast*xrfast    +   Axrslow*xrslow ;

    float   RKr         = 1./( ( 1.+exp((V+55.)/75.) )*
                             ( 1.+exp((V-10.)/30.) )       ) ;

    float   GKr         = 0.046*SGKr ;

    float   IKr         = C_Kr*GKr*sqrt(Ko/5.4)*xr*RKr*(V-EK) ;

    // IKs ...............................................................
    float   GKs         = 0.0034*SGKs ;

    float   IKs         = C_Ks*GKs*(1.0 + 0.6/(1.0 + pow(3.8e-5/Cai, 1.4)))*
                            xs1*xs2*( V - EKs   ) ;

    // IK1 ...............................................................
    float   RK1         = 1./
            (   1. + exp((  V + 105.8 - 2.6*Ko  )/9.493 )   )  ;
    float   GK1         = 0.1908*sqrt(Ko)*SGK1 ;
    float   IK1         = C_K1*GK1*xK1*RK1*( V - EK ) ;

    // INaK ..............................................................
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

    // INab ..............................................................
    float   aNai        = alphaNass/gNai ;
    float   bNao        = betaNao/gNao ;

    float   INab        = C_Nab*PNab*(aNai*Nai - bNao) ;

    // IKb ...............................................................
    float   xKb         = 1.0/
            (   1.0 + exp( ( 14.48 - V )/18.34 )           )  ;
    float   GKb         = 0.003*SGKb ;

    float   IKb         = C_Kb*GKb*xKb*(V-EK) ;

    // JdiffNa, JdiffK ...................................................
    float   tauDiffNa   = 2.0 * Ct_diffNa ;
    float   tauDiffK    = 2.0 * Ct_diffK ;

    float   JdiffNa     = C_diffNa * ( Nass    - Nai   )/tauDiffNa ;
    JdiffK      = C_diffK  * ( Kss     - Ki    )/tauDiffK ;

    // Ki ................................................................
    float   dKi2dt      =
        -( Ito + IKr + IKs + IK1 +IKb - 2.0*INaK )*Acap/(F*vmyo) +
        JdiffK*vss/vmyo ;
    Ki +=  dKi2dt*dt ;

    // Nai ...............................................................
    float   dNai2dt     =
        -( INa + 3.0*INaCai + 3.0*INaK + INab)*Acap/(F*vmyo) +
        JdiffNa*vss/vmyo ;
    Nai += dNai2dt*dt ;

    // Nass ..............................................................
    float   dNass2dt    =
        -( ICaNa + 3.0*INaCass  )*Acap/(F*vss)  - JdiffNa ;
    Nass += dNass2dt*dt ;

    // Cass ..............................................................
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

    Cass += dCass2dt*dt ;

    // Isum ..............................................................
    float Isum =   INa
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
    // V .................................................................
    float lap ; vec2 size ;
    /// laplacian( icolor4, size, lap ) ;
    float dx = ds/float(mx*my) ;
    lap = (
            texelFetch( vlt_txtr, unpack( NORTH ), 0 )
        +   texelFetch( vlt_txtr, unpack( SOUTH ), 0 )
        +   texelFetch( vlt_txtr, unpack( EAST  ), 0 )
        +   texelFetch( vlt_txtr, unpack( WEST  ), 0 )
        +   texelFetch( vlt_txtr, unpack( UP    ), 0 )
        +   texelFetch( vlt_txtr, unpack( DOWN  ), 0 )
        -6.*texelFetch( vlt_txtr, texelPos, 0 )         ).vchannel ;

    float dv2dt = lap*diffCoef/(dx*dx) - Isum/C_m ;
    
    V += dv2dt*dt ;

    // time ..............................................................
    time += dt ;

    if ( pacemakerActive && time > pacemakerPeriod ){
        time = 0. ;
        
        if ( length(vec2(pacemakerPositionX,pacemakerPositionY)
                    - cc )< pacemakerRadius ){
            V = 0. ;
        }
    }

    // v: used for tracking wave back ....................................
    v = hslow ;

    // output color values ...............................................
    ocolor4   = vec4( color4  ) ;
    ocolor5   = vec4( color5  ) ;
    ocolor6   = vec4( color6  ) ;
    ocolor7   = vec4( color7  ) ;
    ocolor8   = vec4( color8  ) ;
    ocolor9   = vec4( color9  ) ;
    ocolor10  = vec4( color10 ) ;
   
    return ;
}
