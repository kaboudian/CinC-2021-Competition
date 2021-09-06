#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * display.frag : calculate the colors for the various regions of
 * activation
 *
 * PROGRAMMER   : ABOUZAR KABOUDIAN
 * DATE         : Mon 19 Oct 2020 14:23:21 (EDT)
 * PLACE        : Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
precision highp float ;
precision highp int ;

// interface variables ---------------------------------------------------
in vec2 cc ;
uniform sampler2D   inColor ;
uniform float       uThreshold, vThreshold ;
uniform float       thickness ;

layout (location=0) out vec4 ocolor ;

// macros ----------------------------------------------------------------
#define ut  uThreshold
#define vt  vThreshold

#define u   color.r
#define v   color.g

/*========================================================================
 * main body 
 *========================================================================
 */
void main(){
    vec4 color = texture(inColor , cc ) ;

    float f = (u>ut) ? 1. : 0. ;
    float g = (v>vt) ? 1. : 0. ;

    if ( f>0.5 && g >0.5 ){
        ocolor = vec4(vec3(96., 192., 240.)/255.,1.) ;
        return ;
    }

    if ( f > 0.5 ){
        ocolor = vec4(vec3(240., 72., 72.)/255.,1.) ;
        return ;
    }

    if ( g >0.5 ){
        ocolor =  vec4(vec3(240., 192., 72.)/255.,1.) ;
        return ;
    }

    ocolor = vec4(vec3(255., 255., 240.)/255.,1.) ;
    return ;
}
