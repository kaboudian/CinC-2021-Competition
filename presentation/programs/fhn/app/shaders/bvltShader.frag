/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * bvltShader
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Wed 26 Oct 2016 06:21:49 PM EDT
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
#include precision.glsl

varying vec2        pixPos ;

uniform sampler2D   map ;
uniform float       ry ;
/*=========================================================================
 * main
 *=========================================================================
 */
void main(){
    vec4 val = texture2D( map, pixPos ) ;

    if ( pixPos.y < ry ){
        val.r = 1. ;
    } ;
    gl_FragColor = val ;
    return ;
}
