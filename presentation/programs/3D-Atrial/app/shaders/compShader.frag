#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * compShader   :   Minimal Atrial Model 
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Tue 12 Jun 2018 02:22:27 PM EDT
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

uniform sampler2D   inTrgt ;
uniform vec3        domainResolution ;
uniform vec3        domainSize ;

uniform sampler2D   phaseTxt , nsewAvgTxt , updnAvgTxt ;
uniform sampler2D   nhshMapTxt, etwtMapTxt, updnMapTxt ;

uniform float   ds_x, ds_y ;
uniform float   dt ;
uniform float   diffCoef, C_m ;

uniform float   u_c  ,
                u_v  ,
                u_w  ,
                u_d  ,
                t_vm ,
                t_vp ,
                t_wm ,
                t_wp ,
                t_sp ,
                t_sm ,
                u_csi,
                x_k  ,
                t_d  ,
                t_o  ,
                t_soa,
                t_sob,
                u_so ,
                x_tso,
                t_si ,
                t_vmm ;

#define  u_0  0. 
#define  u_m  1.0 
#define  u_na 0.23 

/*------------------------------------------------------------------------
 * It turns out for my current graphics card the maximum number of 
 * drawBuffers is limited to 8 
 *------------------------------------------------------------------------
 */
layout (location = 0 )  out vec4 outTrgt ;

/*========================================================================
 * Hyperbolic tangent 
 *========================================================================
 */
float Tanh(float x){
    if ( x<-3.0){
        return -1.0 ;
    } else if (x>3.0){
        return 1.0 ;
    } else {
        return x*(27.0 + x*x)/(27.0+9.0*x*x) ;
    }
}

/*========================================================================
 * Main body of the shader
 *========================================================================
 */
void main() {
    vec3 cdd = domainResolution/domainSize ;
    cdd  *= cdd ;

/*------------------------------------------------------------------------
 * reading from textures
 *------------------------------------------------------------------------
 */
    vec4    phasVal = texture( phaseTxt, pixPos ) ;
    vec4    inVal   = texture( inTrgt, pixPos ) ;

/*------------------------------------------------------------------------
 * check if we are outside domain
 *------------------------------------------------------------------------
 */
    if (phasVal.r < 0.01){
        outTrgt = inVal ;
        return ;
    }
/*------------------------------------------------------------------------
 * Extracting local variables
 *------------------------------------------------------------------------
 */
    float U = inVal.r ;
    float V = inVal.g ;
    float W = inVal.b ;
    float D = inVal.a ;

/*------------------------------------------------------------------------
 * Additional functions 
 *------------------------------------------------------------------------
 */
    float   H_u_na  = ( U > u_na    )   ?   1.0 : 0.0 ;
    float   H_u_v   = ( U > u_v     )   ?   1.0 : 0.0 ;
    float   H_u_w   = ( U > u_w     )   ?   1.0 : 0.0 ;
    float   H_u_d   = ( U > u_d     )   ?   1.0 : 0.0 ;
    float   H_u_c   = ( U > u_c     )   ?   1.0 : 0.0 ;

/*------------------------------------------------------------------------
 * I_fi
 *------------------------------------------------------------------------
 */
    float   I_fi = -V*(U-u_na)*(u_m-U)*H_u_na/t_d ;

/*------------------------------------------------------------------------
 * I_so
 *------------------------------------------------------------------------
 */
    float   t_so = t_soa + 0.5  *(t_sob - t_soa)
                                *(1.0 + Tanh((U-u_so)*x_tso)    ) ;

    float   I_so = (U-u_0)*(1.-H_u_c)/t_o + H_u_c/t_so ;

/*------------------------------------------------------------------------
 * I_si
 *------------------------------------------------------------------------
 */
    float   I_si = -W*D/t_si ;
   
/*------------------------------------------------------------------------
 * V
 *------------------------------------------------------------------------
 */
    float   dV2dt = (1. - H_u_na)*(1.-V)/((1.-H_u_v)*t_vm + H_u_v*t_vmm )
                - H_u_na*V/t_vp ;
    V += dV2dt*dt ;

/*------------------------------------------------------------------------
 * W
 *------------------------------------------------------------------------
 */
    float   dW2dt = (1.-H_u_w)*(1.-W)/t_wm - H_u_w*W/t_wp ;
    W += dW2dt*dt ;

/*------------------------------------------------------------------------
 * D
 *------------------------------------------------------------------------
 */
    float   dD2dt = (  (1.-H_u_d)/t_sm + H_u_d/t_sp         )*
                    (  (1. + Tanh(x_k*(U-u_csi)))*0.5 - D   ) ;
    D += dD2dt*dt ;

    
/*-------------------------------------------------------------------------
 * Laplacian
 *-------------------------------------------------------------------------
 */
    vec4 nhshMap = texture(nhshMapTxt, pixPos ) ;
    vec4 etwtMap = texture(etwtMapTxt, pixPos ) ;
    vec4 updnMap = texture(updnMapTxt, pixPos ) ;

    vec4    nsewAvg    = texture( nsewAvgTxt, pixPos ) ;
    vec4    updnAvg    = texture( updnAvgTxt, pixPos ) ;

    float   nGrad = nsewAvg.r*(texture(inTrgt,nhshMap.xy).r - inVal.r) ;
    float   sGrad =-nsewAvg.a*(texture(inTrgt,nhshMap.zw).r - inVal.r) ;
    float   eGrad = nsewAvg.g*(texture(inTrgt,etwtMap.xy).r - inVal.r) ;
    float   wGrad =-nsewAvg.b*(texture(inTrgt,etwtMap.zw).r - inVal.r) ;
    float   uGrad = updnAvg.r*(texture(inTrgt,updnMap.xy).r - inVal.r) ;
    float   dGrad =-updnAvg.b*(texture(inTrgt,updnMap.zw).r - inVal.r) ;

    float dU2dt   = (eGrad - wGrad)*cdd.x 
                    + (nGrad - sGrad)*cdd.y 
                    + (uGrad - dGrad)*cdd.z
                    ;
    dU2dt *= diffCoef ;

/*------------------------------------------------------------------------
 * I_sum
 *------------------------------------------------------------------------
 */
    float I_sum = I_fi+I_so+I_si ;

/*------------------------------------------------------------------------
 * Time integration for membrane potential
 *------------------------------------------------------------------------
 */
    dU2dt -= I_sum/C_m ;
    U += dU2dt*dt ;

/*------------------------------------------------------------------------
 * ouputing the shader
 *------------------------------------------------------------------------
 */

    outTrgt = vec4(U,V,W,D);

    return ;
}
