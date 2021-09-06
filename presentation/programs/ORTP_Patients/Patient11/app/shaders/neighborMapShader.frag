#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * nsewMapShader:   gets coordinates of north, south, east and west points
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Tue 08 Aug 2017 12:12:30 PM EDT
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
precision highp     float;
precision highp     int ;


/*------------------------------------------------------------------------
 * interface variables
 *------------------------------------------------------------------------
 */
in      vec2        pixPos ;
layout  (location = 0 ) out vec4 nhshMap ;
layout  (location = 1 ) out vec4 etwtMap ;
layout  (location = 2 ) out vec4 updnMap ;

uniform sampler2D   crdtTxt ;
uniform sampler2D   compMap ;
uniform sampler2D   dcmpMap ;

uniform float       mx, my ;
uniform vec3        domainResolution ;

/*========================================================================
 * locate
 *========================================================================
 */
vec2 locate( vec3 texCoord )
{
    float   x, y ;
    float   wd = mx*my - 1.0 ;

    float zSliceNo  = floor( texCoord.z*mx*my) ;

    x = texCoord.x / mx ;
    y = texCoord.y / my ;

    x += (mod(zSliceNo,mx)/mx) ;
    y += floor((wd-zSliceNo)/ mx )/my ;

    return texture(compMap,vec2(x,y)).xy ;
}

/*========================================================================
 * main body of the shader
 *========================================================================
 */
void main(){
    vec2    C      = texture( dcmpMap, pixPos  ).xy ;
    vec3    cc      = texture( crdtTxt, C ).xyz ;
    vec3    ii      = vec3(1.,0.,0.)/domainResolution ;
    vec3    jj      = vec3(0.,1.,0.)/domainResolution ;
    vec3    kk      = vec3(0.,0.,1.)/domainResolution ;

    vec2    east  = locate(cc+ii) ;
    vec2    west  = locate(cc-ii) ;
    vec2    north = locate(cc+jj) ;
    vec2    south = locate(cc-jj) ;
    vec2    up    = locate(cc+kk) ;
    vec2    down  = locate(cc-kk) ;
    
    nhshMap = vec4(north.x, north.y, south.x, south.y) ;
    etwtMap = vec4(east.x, east.y, west.x, west.y) ;
    updnMap = vec4(up.x, up.y, down.x,down.y) ;
}
