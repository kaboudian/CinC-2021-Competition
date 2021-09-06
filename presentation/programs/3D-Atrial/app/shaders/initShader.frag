#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * initShader   :   Initialize Beeler-Reuter Variables 
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Wed 19 Jul 2017 12:31:30 PM EDT
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
precision highp float;

/*------------------------------------------------------------------------
 * Interface variables : 
 * varyings change to "in" types in fragment shaders 
 * and "out" in vertexShaders
 *------------------------------------------------------------------------
 */
in vec2 pixPos ;


uniform sampler2D crdtTxt ;
uniform sampler2D dcmpMap ;

/*------------------------------------------------------------------------
 * It turns out for my current graphics card the maximum number of 
 * drawBuffers is limited to 8 
 *------------------------------------------------------------------------
 */
layout (location = 0 )  out vec4 outFtrgt ;
layout (location = 1 )  out vec4 outStrgt ;



/*========================================================================
 * Main body of the shader
 *========================================================================
 */
void main() {
    vec2    C  = texture( dcmpMap, pixPos   ).xy ;
    vec3    cc = texture( crdtTxt, C        ).xyz ;

    vec4 outVal = vec4(0.,1.,1.,0.) ; 

    if ( cc.y <0.5 ){
        if ( (cc.x >0.45) && (cc.x <0.5) )
            outVal.r = 1.0 ;
        else if ( cc.x >0.5 && cc.x <0.6 )
            outVal.g = 0.0 ;
    }
    outFtrgt = outVal ; 
    outStrgt = outVal ; 
    return ;
}
