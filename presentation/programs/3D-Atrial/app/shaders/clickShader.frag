#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * clickShader  :   shades the click
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Thu 24 Aug 2017 02:34:52 PM EDT
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
#include precision.glsl

/*------------------------------------------------------------------------
 * Interface Variables
 *------------------------------------------------------------------------
 */
in      vec2        pixPos ;

uniform sampler2D   clickCoordinates ;
uniform sampler2D   target ;
uniform float       clickRadius ;
uniform float        clickValue ;
uniform sampler2D   crdtTxt ;
uniform sampler2D   phaseTxt ;
uniform sampler2D   dcmpMap, compMap ;

/*------------------------------------------------------------------------
 * output variables
 *------------------------------------------------------------------------
 */
layout (location=0) out vec4 FragColor ;

/*========================================================================
 * main body of the shader
 *========================================================================
 */
void main(){
    vec4    clickCrdt = texture(clickCoordinates, vec2(0.5,0.5) ) ;
    vec3    pixCrdt = texture( crdtTxt, texture(dcmpMap,pixPos).xy).rgb ;
    vec4    inColor = texture( target, pixPos ) ;
    float   phase   = texture( phaseTxt, pixPos ).r ;

    FragColor = inColor ;

    if ( (phase >0.99 ) &&
        ( length( clickCrdt.xyz - pixCrdt) < clickRadius ) &&
        ( clickCrdt.a >0.5 )){
        FragColor.r = clickValue ;
    }
}
