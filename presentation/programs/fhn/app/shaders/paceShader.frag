#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * paceShader   :   paces the domain
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Tue 30 Jul 2019 16:08:14 (EDT)
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
precision highp float;
precision highp int ;

/*------------------------------------------------------------------------
 * Interface variables
 *------------------------------------------------------------------------
 */
in vec2 pixPos ;
in vec2 cc ;

uniform sampler2D   in_map ;
uniform float       v, w , radius ;
uniform bool        setV, setW ;
uniform bool        perturb ;
uniform vec2        pacePosition ;
uniform bool        circular ;

layout (location =0 ) out vec4 out_map ;

/*========================================================================
 * pace
 *========================================================================
 */
vec2 pace(vec2 vw){
    vec2 outVal ;
    if (setV){
        outVal.x = v ;
    }
    if (setW){
        outVal.y = w ;
    }

    if (perturb){
        outVal += vw ;
    }
    return outVal ;
}

/*========================================================================
 * Main body of the shader
 *========================================================================
 */
void main() {
    vec4 map = texture(in_map, cc) ;
    if ( circular ){
        if ( length(cc - pacePosition)< radius ){
            map.xy = pace(map.xy) ;
        }
    }else{
        if ( abs(cc.x-pacePosition.x)< radius ){
            map.xy = pace(map.xy) ;
        }
    }

    out_map = map ;
    return ;
}
