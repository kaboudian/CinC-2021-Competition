#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * tip_s2.frag  :   Second step of reduction to look for the spiral tip
 *                  Row-wise reduction to create a single pixel 
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Thu 17 Dec 2020 17:21:31 (EST)
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
precision highp int ;
precision highp float ;

in vec2 cc ;
uniform sampler2D   inColor ;
layout (location=0) out vec4 ocolor ;

void main(){
    ivec2 size = textureSize( inColor, 0 ) ;
    float sx = 1./float(size.x) ;

    vec4 color = vec4(0.) ;
    vec2 p ;

    for (int i=0 ; i < size.x ; i++ ){
        p = vec2((float(i)+0.5)*sx,0.5) ;
        color += texture( inColor, p) ;

        if ( color.r > 0. || color.g >0.){
            break ;
        }
    }

    ocolor = vec4(color) ;
    return ;
}
