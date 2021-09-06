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
uniform sampler2D   inColor, itcolor ;
uniform float       uThreshold, vThreshold ;
uniform float       thickness ;
uniform float       tx, ty ;

uniform sampler2D   tip ;

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
    float g = (v>vt) ? 1. : -1. ;
    
    float pi = acos(-1.) ;
    vec2  dir ;
    float stheta ;

    vec4 tcolor = texture( itcolor, vec2(0.5) ) ;

    bool teleporting = ( tcolor.r> 0.5  && tcolor.g<0.5 ) ;


    vec2    tippos = texture(tip, vec2(0.5) ).xy ;
    vec2    dest = vec2(tx,ty);
    float   dist = length(tippos-dest) ;
    if ( length( cc - tippos ) <= dist && teleporting ){
        if (f<0. && g<0. ){
            // search around the point to see if the point is in the region
            // which requires stimulation
            for(float i=0. ; i<noThetaDivs ;i+=1.){
                stheta = 2.*i*pi/noThetaDivs ;
                dir = 0.5*thickness*vec2(cos(stheta),sin(stheta)) ;
                col = texture(inColor, cc + dir ) ;

                if ( (((col.g>vt) ? 1. : -1.) *g) < 0. &&
                        col.r<ut ){
                    u = 1. ;
                    break ;
                }
            }
        }
    }
    
    ocolor = vec4(color) ;
    return ;
}
