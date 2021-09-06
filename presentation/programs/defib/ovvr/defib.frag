#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * defib.frag   : Defibrillation shader
 *
 * PROGRAMMER   : ABOUZAR KABOUDIAN
 * DATE         : Mon 19 Oct 2020 14:18:47 (EDT)
 * PLACE        : Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
precision highp float ;
precision highp int ;

// interface variables ---------------------------------------------------
in vec2 cc ;
uniform sampler2D   inColor ;
uniform float uThreshold, vThreshold ;
uniform float thickness ;

layout (location=0) out vec4 ocolor ;

// macros ----------------------------------------------------------------

#define ut  uThreshold
#define vt  vThreshold

#define u   color.r
#define v   color.g

#define noThetaDivs 20.

/*========================================================================
 * main body
 *========================================================================
 */
void main(){
    vec4 color = texture(inColor , cc ) ;
    vec4 col ;

    float f = (u>ut) ? 1. : -1. ;
    float g = (v<vt) ? 1. : -1. ;
    
    float pi = acos(-1.) ;
    vec2  dir ;
    float theta ;

    if (f<0. && g<0. ){
        // search around the point to see if the point is in the region
        // which requires stimulation
        for(float i=0. ; i<noThetaDivs ;i+=1.){
            theta = 2.*i*pi/noThetaDivs ;
            dir = thickness*vec2(cos(theta),sin(theta)) ;
            col = texture(inColor, cc + dir ) ;

            if ( (((col.g<vt) ? 1. : -1.) *g) < 0. ){
                u = 1. ;
                break ;
            }
        }
    }
    
    ocolor = vec4(color) ;
    return ;
}
