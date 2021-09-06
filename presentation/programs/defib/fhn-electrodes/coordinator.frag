#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * coordinator.frag :   determine the closest coordinate
 *
 * PROGRAMMER   : ABOUZAR KABOUDIAN
 * DATE         : Fri 13 Nov 2020 15:42:00 (EST)
 * PLACE        : Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
precision highp float ;
precision highp int ;

in vec2 cc ; 

layout (location = 0) out vec4 crd ; 

void main(){
    crd = vec4(cc.x, cc.y, 0.,1.) ;
    return ;
}
