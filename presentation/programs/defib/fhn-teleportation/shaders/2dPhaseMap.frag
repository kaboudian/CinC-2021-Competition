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
uniform sampler2D   inColor , tip ;
uniform float       uThreshold, vThreshold ;
uniform float       thickness ;

uniform float       tx, ty ;

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

    bool f = (u>ut)  ;
    bool g = (v>vt)  ;

    if ( f && g  ){
        ocolor = vec4(vec3(96., 192., 240.)/255.,1.) ;
    }else if ( f ){
        ocolor = vec4(vec3(240., 72., 72.)/255.,1.) ;
    }else if ( g ){
        ocolor =  vec4(vec3(240., 192., 72.)/255.,1.) ;
    }else{
        ocolor = vec4(vec3(255., 255., 240.)/255.,1.) ;
    }

  //  if ( abs(length(cc-vec2(0.5))-radius)<0.01 ){
  //      ocolor = mix( ocolor , vec4(0.,1.,0.,1.),0.2 ) ;
  //  }

    vec2 probe = vec2(tx,ty) ;

    if ( length( cc-probe )< 0.1 ){
        ocolor = mix( ocolor, vec4(1.,0.,0.,1.) ,0.3) ;
    }

    return ;
}
