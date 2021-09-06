```
#version 300 es
precision highp float;
precision highp int ;

/*------------------------------------------------------------------------
 * Interface variables : 
 *------------------------------------------------------------------------
 */
in vec2 cc ;        // center coordinate of the pixel

uniform sampler2D   inVw ;  /* the input image/texture */

uniform float       ds_x, ds_y ;
uniform float       dt ;
uniform float       diffCoef, C_m ;

uniform float       a, b, epsilon ,delta;

/*------------------------------------------------------------------------
 * output color
 *------------------------------------------------------------------------
 */
layout (location = 0 )  out vec4 outVw ;

/*========================================================================
 * Main body of the shader
 *========================================================================
 */
void main() {
/*------------------------------------------------------------------------
 * reading from textures
 *------------------------------------------------------------------------
 */
    vec4    C = texture( inVw , pixPos ) ;
    float   v = C.r ;
    float   w = C.g ;

/*-------------------------------------------------------------------------
 * dv/dt
 *-------------------------------------------------------------------------
 */
    vec2    size    = vec2(textureSize( inVw, 0 ) );
    float   cddx    = size.x/ds_x ;
    cddx *= cddx ;

    vec2 ii = vec2(1.0,0.0)/size ;
    vec2 jj = vec2(0.0,1.0)/size ; 

    float dv2dt = (    texture(inVw,cc-ii).r   
                   +   texture(inVw,cc+ii).r   
                   +   texture(inVw,cc+jj).r
                   +   texture(inVw,cc-jj).r
                   -4.*texture(inVw,cc   ).r )*cddx ;

    dv2dt *= diffCoef ;
    
    dv2dt += v*(1.0-v)*(v-a)-w  ;

/*------------------------------------------------------------------------
 * dw / dt
 *------------------------------------------------------------------------
 */
    float   dw2dt = epsilon*(b*v-w+delta) ;

/*------------------------------------------------------------------------
 * Time integration for membrane potential
 *------------------------------------------------------------------------
 */

    v += dv2dt*dt ;
    w += dw2dt*dt ;

/*------------------------------------------------------------------------
 * ouputing the shader
 *------------------------------------------------------------------------
 */
    outVw = vec4(v,w,0.0,0.0);
    return ;
}
```
