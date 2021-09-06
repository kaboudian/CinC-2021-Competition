#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * compShader   :   FitzHugh-Nagumo Model 
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Wed 06 Dec 2017 04:25:26 PM EST
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
precision highp float;
precision highp int ;

/*------------------------------------------------------------------------
 * Interface variables : 
 * varyings change to "in" types in fragment shaders 
 * and "out" in vertexShaders
 *------------------------------------------------------------------------
 */
in vec2 pixPos ;

uniform sampler2D   inUv ;

uniform float       ds_x, ds_y ;
uniform float       dt ;
uniform float       diffCoef, C_m ;

uniform float   a, b, epsilon ,delta;

#define vSampler  inUv 
#define C0  -2.5
#define C1  (4./3.)
#define C2  (-1./12.)

/*------------------------------------------------------------------------
 * It turns out for my current graphics card the maximum number of 
 * drawBuffers is limited to 8 
 *------------------------------------------------------------------------
 */
layout (location = 0 )  out vec4 outUv ;

/*========================================================================
 * Main body of the shader
 *========================================================================
 */
void main() {
    vec2    cc = pixPos ;
    vec2    size    = vec2(textureSize( vSampler, 0 ) );
    float   cddx    = size.x/ds_x ;
    float   cddy    = size.y/ds_y ;

    cddx *= cddx ;
    cddy *= cddy ;

/*------------------------------------------------------------------------
 * reading from textures
 *------------------------------------------------------------------------
 */
    vec4    C = texture( inUv , pixPos ) ;
    float   u = C.r ;
    float   v = C.g ;

/*------------------------------------------------------------------------
 * v
 *------------------------------------------------------------------------
 */
    float   dv2dt = epsilon*(b*u-v+delta) ;

/*-------------------------------------------------------------------------
 * Laplacian
 *-------------------------------------------------------------------------
 */
    vec2 ii = vec2(1.0,0.0)/size ;
    vec2 jj = vec2(0.0,1.0)/size ; 
    vec2 iip = ii+jj ;
    vec2 jjp = jj-ii ;
    
    float gamma = 1./3. ;

    float du2dt = (1.-gamma)*((     C2*texture(vSampler,cc+2.*ii).r
                                +   C1*texture(vSampler,cc+ii).r
                                +   C0*C.r
                                +   C1*texture(vSampler,cc-ii).r   
                                +   C2*texture(vSampler,cc-2.*ii).r )*cddx
                            +   (   C2*texture(vSampler,cc+2.*jj).r
                                +   C1*texture(vSampler,cc+jj).r
                                +   C0*C.r
                                +   C1*texture(vSampler,cc-jj).r 
                                +   C2*texture(vSampler,cc-2.*jj).r)*cddy  )

                +   gamma*0.5*(  
                                +   C2*texture(vSampler,cc+2.*iip).r
                                +   C2*texture(vSampler,cc+2.*jjp).r
                                +   C2*texture(vSampler,cc-2.*jjp).r
                                +   C2*texture(vSampler,cc-2.*iip).r
                                +   C1*texture(vSampler,cc+iip).r
                                +   C1*texture(vSampler,cc-iip).r
                                +   C1*texture(vSampler,cc-jjp).r
                                +   C1*texture(vSampler,cc+jjp).r
                                +   2.*C0*C.r               )*(cddx) ;
    du2dt *= diffCoef ;

/*------------------------------------------------------------------------
 * Time integration for membrane potential
 *------------------------------------------------------------------------
 */
    du2dt += u*(1.0-u)*(u-a)-v  ;

    u += du2dt*dt ;
    v += dv2dt*dt ;

/*------------------------------------------------------------------------
 * ouputing the shader
 *------------------------------------------------------------------------
 */

    outUv = vec4(u,v,0.0,0.0);

    return ;
}
