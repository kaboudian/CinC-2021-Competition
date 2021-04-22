#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * init2.frag   : initialize color-set 4 to 11
 *
 * PROGRAMMER   : ABOUZAR KABOUDIAN
 * DATE         : Tue 27 Oct 2020 18:52:14 (EDT)
 * PLACE        : Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */

#include precision.glsl

// interface variables ...................................................
in vec2 cc ;

// variable macros .......................................................
#include    variables.glsl

// color outputs .........................................................
layout (location = 0) out vec4 ocolor4 ; 
layout (location = 1) out vec4 ocolor5 ; 
layout (location = 2) out vec4 ocolor6 ; 
layout (location = 3) out vec4 ocolor7 ; 
layout (location = 4) out vec4 ocolor8 ; 
layout (location = 5) out vec4 ocolor9 ; 
layout (location = 6) out vec4 ocolor10; 

/*========================================================================
 * main body of the shader
 *========================================================================
 */
void main(){
    // color declarations ................................................
    vec4 color0, color1, color2, color3,  color4, color5, 
         color6, color7, color8, color9,  color10 ;

    // color initializations .............................................
    m           = 0.0074621 ;
    hfast       = 0.692591  ;
    hslow       = 0.692574  ;
    j           = 0.692477  ;

    hCaMKslow   = 0.448501    ;   
    jCaMK       = 0.692413    ;   
    mL          = 0.000194015 ;
    hL          = 0.496116    ;

    JrelNP      = 2.53943e-5  ;
    hLCaMK      = 0.265885   ;

    JrelCaMK    = 3.17262e-7 ;
    sa          = 0.00101185 ;
    ifast       = 0.999542   ;
    islow       = 0.589579   ;

    vlt         = -87.84 ;
    v           = hslow ;

    Cansr       = 1.61 ;  
    Cajsr       = 1.56 ;   
    Cass        = 8.43e-5 ;
    Cai         = 8.54e-5;

    Kss         = 143.79 ; 
    Ki          = 143.79 ;
    Nass        = 7.23   ; 
    Nai         = 7.23   ;
    
    time = MAX_TIME ;

    // output color values ...............................................
    ocolor4  = vec4( color4  ) ;
    ocolor5  = vec4( color5  ) ;
    ocolor6  = vec4( color6  ) ;
    ocolor7  = vec4( color7  ) ;
    ocolor8  = vec4( color8  ) ;
    ocolor9  = vec4( color9  ) ;
    ocolor10 = vec4( color10 ) ;

    return ;
}

