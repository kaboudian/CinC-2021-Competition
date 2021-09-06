#version 300 es
precision   highp float ;

uniform float uThreshold, vThreshold ;
uniform float thickness ;
uniform float tx, ty ;

uniform sampler2D   itcolor ;
uniform sampler2D   iscolor ;

out vec4 ocolor ;

// macros ----------------------------------------------------------------

#define ut  uThreshold
#define vt  vThreshold

#define u   color.r
#define v   color.g

#define noThetaDivs 20.


void main(){
    float pi    = acos(-1.) ;

    vec4 tcolor = texture( itcolor, vec2(0.5) ) ;
    
    if (tcolor.r>0.5){
        ocolor = vec4(1.) ;
        return ;
    }

    vec2 probe  = vec2(tx,ty)  ;
    
    vec4 col ;
    vec4 color = texture(iscolor , probe ) ;
    bool f = (u>ut) ;
    bool g = (v>vt) ;
    
    vec2  dir ;
    float stheta ;

    if (!(f||g)){
        // search around the point to see if the point is in the region
        // which requires stimulation
        for(float i=0. ; i<noThetaDivs ;i+=1.){
            stheta = 2.*i*pi/noThetaDivs ;
            dir = thickness*vec2(cos(stheta),sin(stheta)) ;
            col = texture(iscolor, probe + dir ) ;

            if ((col.g>vt) && (col.r<ut) ){
                tcolor.r = 1. ;
                break ;
            }
        }
    }
    
    ocolor = tcolor ;

    return ;
}
