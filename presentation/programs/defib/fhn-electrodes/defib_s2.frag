#version 300 es

precision highp float ;
precision highp int ;

in vec2 cc ;

uniform sampler2D icolor ;
uniform int mx, my ;

layout (location = 0 ) out vec4 ocolor ;

void main(){
    vec4 color =texture(icolor, cc)  ;
    ivec2 size = textureSize( icolor, 0 ) ;

    ivec2 nxy = (size/ivec2(mx,mx))/2 ;

    vec2  ii = vec2(1.,0.)/vec2(size) ;
    vec2  jj = vec2(0.,1.)/vec2(size) ;

    for( int i=(-nxy.x) ; i<=nxy.x ; i++){
        for( int j=(-nxy.y) ; j<=nxy.y ; j++){
            if( texture( icolor, cc+ii*float(i)+jj*float(j) ).r>0.5 ){
                color.r = 1.  ;
                break ;
            }
        }
    }

    ocolor = vec4(color.r) ;
    return ;
}
