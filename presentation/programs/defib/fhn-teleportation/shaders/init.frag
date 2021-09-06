#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * init.frag    : initialize the domain
 *
 * PROGRAMMER   : ABOUZAR KABOUDIAN
 * DATE         : Mon 19 Oct 2020 14:34:45 (EDT)
 * PLACE        : Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */

precision highp float ;
precision highp int ;

in vec2 cc, pixPos ;

layout (location = 0) out vec4 color1 ;
layout (location = 1) out vec4 color2 ;

#define inreg(a,b)  ( (cc.y<0.53) && (cc.x >(a)) && (cc.x<(b)) )

void main() {
    vec4 color = vec4(0.) ;
    
    if (inreg(0.5,0.55) ){
        color.r = 1. ;
    }
    if (inreg(0.5,0.525)){
        color.g = .17 ;
    }

    color1 = color ;
    color2 = color ;
    return ;
}
