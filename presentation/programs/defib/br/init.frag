#version 300 es

precision highp int ;
precision highp float ;

in vec2 cc ;

// output color layouts ..................................................
layout (location = 0) out vec4 fcolor1 ;
layout (location = 1) out vec4 fcolor2 ;
layout (location = 2) out vec4 scolor1 ;
layout (location = 3) out vec4 scolor2 ;


// macros to assign color channels to physical variable ..................
#include    variables.glsl

/*========================================================================
 * main body of the shader
 *========================================================================
 */
void main(){
    vec4 color1, color2 ;

    m   = 0.011 ;
    h   = 0.9877 ;
    j   = 0.9748 ;
    d   = 0.003 ;
    V   = -83.0 ;
    Cai = 1.782e-7 ;
    x1  = 0.0057 ;
    f   = 1.0 ;

    if ( cc.x < 0.02 ){
        V = 0. ;
    }

    // output colors .....................................................
    fcolor1 = vec4(color1) ;
    scolor1 = vec4(color1) ;
    
    fcolor2 = vec4(color2) ;
    scolor2 = vec4(color2) ;
}
