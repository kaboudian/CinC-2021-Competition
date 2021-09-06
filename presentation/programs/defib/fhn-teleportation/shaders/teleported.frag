#version 300 es
precision   highp float ;
in  vec2 cc ;
uniform     sampler2D icolor ; 
out vec4 ocolor ;

void main(){
    vec4 color = texture( icolor , cc ) ;

    if ( color.r >0.5 ){
        color = vec4(1.) ;
    }
    ocolor = color ;
    return ;
}
