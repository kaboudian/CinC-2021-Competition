#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * click : implementation of the click
 *
 * PROGRAMMER   : ABOUZAR KABOUDIAN
 * DATE         : Wed 14 Apr 2021 22:57:50 (EDT)
 * PLACE        : Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */

#include precision.glsl

#include variables.glsl

in vec2 cc ;

uniform sampler2D   idomain ;
uniform sampler2D   icolor0 ;

uniform vec2        clickPosition ;
uniform float       radius ;
uniform bool        adding ;
uniform bool        pacing ;

layout (location=0) out vec4 odomain ;
layout (location=1) out vec4 ocolor0 ; 

void main(){
    vec4 domain = texture( idomain, cc) ;
    vec4 color0 = texture( icolor0, cc ) ;

    if ( length(clickPosition-cc) < radius ){
        if (pacing ){
           vlt = 1. ;
        }else{
            domain = adding ? vec4(0) : vec4(1) ;
            if (!adding){ // removing obstacles?
                vlt = 0. ;
                fig = 1. ;
                sig = 0.4 ;
            }
        }
    }

    odomain = domain ;
    ocolor0 = color0 ;

    return ;
}
