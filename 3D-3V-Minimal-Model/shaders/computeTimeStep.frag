#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * computeTimeStep : march the the solution for one time-step
 *
 * PROGRAMMER   : ABOUZAR KABOUDIAN
 * DATE         : Wed 14 Apr 2021 18:32:25 (EDT)
 * PLACE        : Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
#include precision.glsl

/*------------------------------------------------------------------------
 * interface variables
 *------------------------------------------------------------------------
 */
in vec2 cc ;

// uniforms ..............................................................
uniform float   tau_pv, tau_v1, tau_v2, tau_pw, tau_mw, tau_d, tau_0, 
                tau_r,  tau_si, K,      V_sic,  V_c,    V_v ,  C_si ;

uniform float   dt, lx, diffCoef, C_m ;
uniform float   pacemakerPositionX ;
uniform float   pacemakerPositionY ;
uniform float   pacemakerPeriod ;
uniform float   pacemakerRadius ;
uniform bool    pacemakerActive ;

uniform sampler2D   icolor0 ;

uniform int     resolution ;// resolution in all directions
uniform int     mx, my ;    /* number of z-layers in S and T directions 
                               of the textures */

// directional information ...............................................
uniform usampler2D  idir0 ;
uniform usampler2D  idir1 ;

#include directionMap.glsl

// coordinate of the system ..............................................
uniform sampler2D   compressed3dCrdt ;

// output colors .........................................................
out vec4 ocolor0 ;

// variable macros .......................................................
#include variables.glsl

#define isInBounds(v)  (all(greaterThanEqual(v,ivec2(0))) && \
        all(lessThan(v,size)))
#define isInDomain(I)   ((texelFetch(domain, I, 0).r>0.5) && \
        isInBounds(I))

/*========================================================================
 * main body fo the shader
 *========================================================================
 */
void main(){
    // extract pixel values from textures ................................
    ivec2 isize = textureSize(icolor0,        0 ) ;
    ivec2 texelPos = ivec2( cc*vec2(isize) ) ; 
    //ivec2 texelPos = ivec2( cc*vec2(size) ) ;

    // localize variables ................................................
    vec4 color0 = texelFetch( icolor0 , texelPos , 0) ; 

    uvec4 dir0  = texelFetch( idir0 , texelPos,0 ) ;
    uvec4 dir1  = texelFetch( idir1 , texelPos,0 ) ;

    // Calculating right hand side vars ..................................
    float p = step(V_c, vlt) ;
    float q = step(V_v, vlt) ;

    float tau_mv = (1.0-q)*tau_v1   +  q*tau_v2 ;

    float Ifi  = -fig*p*(vlt - V_c)*(1.0-vlt)/tau_d ;
    float Iso  =  vlt*(1.0  - p )/tau_0 + p/tau_r ;

    float tn = tanh(K*(vlt-V_sic)) ;
    float Isi  = -sig*(1.0  + tn) /(2.0*tau_si) ;
    Isi *= C_si ;

    float I_sum = Isi + Ifi + Iso ;

    float dFig2dt  = (1.0-p)*(1.0-fig)/tau_mv - p*fig/tau_pv ;
    float dSig2dt  = (1.0-p)*(1.0-sig)/tau_mw - p*sig/tau_pw ;

    fig += dFig2dt*dt ;
    sig += dSig2dt*dt ;

    // diffusion .........................................................
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

    dVlt2dt -= I_sum/C_m ;

    // march membrane potential using euler time-stepping ................
    vlt += dVlt2dt*dt ;

    // update solution time ..............................................
    time += dt ;

    if ( time > pacemakerPeriod ){
        time = 0. ;
        
        if ( length(vec2(pacemakerPositionX,pacemakerPositionY)
                    - cc )< pacemakerRadius && pacemakerActive ){
            vlt = 1. ;
        }
    }

    // output colors .....................................................
    ocolor0 = vec4(color0) ;
    
    return ;
}
