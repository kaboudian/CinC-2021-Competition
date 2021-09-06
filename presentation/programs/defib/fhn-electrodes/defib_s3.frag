#version 300 es

precision highp float ;
precision highp int ;

in vec2 cc ;

uniform sampler2D   icolor ;
uniform sampler2D   activeElectrodes ;
uniform sampler2D   electrodeCoordinates ;
uniform float       electrodeSize ;

layout (location = 0 ) out vec4 ocolor ;

#define paces(l)    (texture( activeElectrodes, l).r>.5 &&  \
        length(cc-(l))<electrodeSize )
void main(){
    vec4    color  = texture( icolor, cc ) ;
    vec2    crd    = texture( electrodeCoordinates,   cc ).xy ;
    float   dx  = (cc.x - crd.x )>0. ? 1. : -1. ;
    float   dy  = (cc.y - crd.y )>0. ? 1. : -1. ;

    vec2 size   = vec2(textureSize(electrodeCoordinates,0).xy) ;
    vec2 ii = vec2(dx,0.)/size ;
    vec2 jj = vec2(0.,dy)/size ;

    if ( paces( crd+ii      ) ) color.r = 1. ;
    if ( paces( crd+jj      ) ) color.r = 1. ;
    if ( paces( crd+ii+jj   ) ) color.r = 1. ;
    if ( paces( crd         ) ) color.r = 1. ;

    ocolor = vec4(color) ;
    return ;
}
