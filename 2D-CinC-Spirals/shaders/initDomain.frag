#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * initDomain   : initialize domain boundaries
 *
 * PROGRAMMER   : ABOUZAR KABOUDIAN
 * DATE         : Wed 14 Apr 2021 18:27:44 (EDT)
 * PLACE        : Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
#include precision.glsl

// interface variables ...................................................
in vec2 cc ;

// output colors .........................................................
layout (location=0) out vec4 domain0 ;
layout (location=1) out vec4 domain1 ;

/*========================================================================
 * main body of the shader
 *========================================================================
 */
void main(){
    vec2 c = vec2(0.5) ;
    float d = length(cc-c) ;
    vec4 domain = ( d >0.1 && d<0.4 ) ? vec4(1.) : vec4(0.) ;

    domain0 = domain ;
    domain1 = domain ;
}
