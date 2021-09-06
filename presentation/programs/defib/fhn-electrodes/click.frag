#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * click.frag   : Changes u or v values around a click location
 *
 * PROGRAMMER   : ABOUZAR KABOUDIAN
 * DATE         : Mon 19 Oct 2020 14:34:00 (EDT)
 * PLACE        : Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */

precision highp float ;
precision highp int ;

uniform sampler2D   inTexture ;
uniform vec2    clickPosition ;
uniform float   clickRadius ;
uniform float   clickU,clickV ;
uniform bool    clickAlterU, clickAlterV ;

in vec2 cc, pixPos ;

layout (location = 0) out vec4 ocolor ;

#define u       color.r
#define v       color.g
#define time    color.b
// Main body of the shader
void main() {
    vec2  size  = vec2(textureSize(inTexture, 0)) ;

    // read the color of the pixel .......................................
    vec4 color = texture( inTexture , cc ) ;
 
    if ( length(clickPosition - cc )< clickRadius ){
        if ( clickAlterU ){
            u = clickU ;
        }
        if ( clickAlterV ){
            v = clickV ;
        }
    }

    // output the color of the pixel .....................................
    ocolor = color ;
    return ;
}
