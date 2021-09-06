#version 300 es

precision highp float ;
precision highp int ;

in vec2 cc  ;

uniform sampler2D icolor ;

out vec4 ocolor ;

void main(){
    float o = texture(icolor, cc).r > 0.5 ? 1.: 0. ;

    ocolor = vec4(o,0.,0.,1.) ;
}
