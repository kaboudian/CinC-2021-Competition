#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * pAvgShader   :   average of phase-field value
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

uniform sampler2D   phaseTxt ;
uniform sampler2D   nhshMapTxt, etwtMapTxt, updnMapTxt ;

layout  (location = 0 ) out vec4 nsew ;
layout  (location = 1 ) out vec4 updn ;

/*========================================================================
 * main body of the shader
 *========================================================================
 */
void main(){
    vec4 nhshMap = texture(nhshMapTxt, pixPos ) ;
    vec4 etwtMap = texture(etwtMapTxt, pixPos ) ;
    vec4 updnMap = texture(updnMapTxt, pixPos ) ;

    float   c   = texture(phaseTxt, pixPos     ).r ;     
    float   n   = texture(phaseTxt, nhshMap.xy ).r ; 
    float   s   = texture(phaseTxt, nhshMap.zw ).r ;
    float   e   = texture(phaseTxt, etwtMap.xy ).r ;
    float   w   = texture(phaseTxt, etwtMap.zw ).r ;
    float   u   = texture(phaseTxt, updnMap.xy ).r ;
    float   d   = texture(phaseTxt, updnMap.zw ).r ;
    
    nsew = 0.5*(vec4(c)+vec4(n,e,w,s)) ;
    updn = 0.5*(vec4(c)+vec4(u,u,d,d)) ;
}
