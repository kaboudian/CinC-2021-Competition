#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * init1.frag   : initialize color-set 0 to 3
 *
 * PROGRAMMER   : ABOUZAR KABOUDIAN
 * DATE         : Tue 27 Oct 2020 18:52:54 (EDT)
 * PLACE        : Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
#include    precision.glsl

// interface variables ...................................................
in vec2 cc  ;

// variable macros .......................................................
#include    variables.glsl

// color outputs .........................................................
layout (location = 0) out vec4 ocolor0 ; 
layout (location = 1) out vec4 ocolor1 ; 
layout (location = 2) out vec4 ocolor2 ; 
layout (location = 3) out vec4 ocolor3 ; 

/*========================================================================
 * main body of the shader
 *========================================================================
 */
void main(){
    // color declarations ................................................
    vec4 color0, color1, color2, color3,  color4, color5, 
         color6, color7, color8, color9, color10, color11 ;

    // color initializations .............................................
    aCaMK       = 0.000515567 ;
    iCaMKfast   = 0.9999542 ;
    iCaMKslow   = 0.641861 ;
    d           = 2.43015e-9 ;

    ffast       = 1.0 ;
    fslow       = 0.910671 ;
    fCafast     = 1.0 ;
    fCaslow     = 0.99982 ;
    
    xrfast      = 8.26608e-6 ;
    xrslow      = 0.453268  ;
    xs1         = 0.270492 ;
    xs2         = 0.0001963 ;

    // output color values ...............................................
    ocolor0 = vec4(color0) ;
    ocolor1 = vec4(color1) ;
    ocolor2 = vec4(color2) ;
    ocolor3 = vec4(color3) ;

    return ;
}
