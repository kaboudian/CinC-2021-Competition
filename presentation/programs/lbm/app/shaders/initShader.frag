#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * initShader   :   Initialize LBM Method 
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Wed 24 Oct 2018 18:11:01 (EDT)
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
precision highp float;

/*------------------------------------------------------------------------
 * Interface variables : 
 *------------------------------------------------------------------------
 */
in vec2 pixPos ;

uniform float u0 ;
uniform float viscosity ;
uniform float dt, dx ;
uniform float   width, height ;
/*------------------------------------------------------------------------
 * It turns out for my current graphics card the maximum number of 
 *------------------------------------------------------------------------
 */
layout (location = 0 )  out vec4 e_n_s_e_w ;
layout (location = 1 )  out vec4 o_n_s_e_w ;
layout (location = 2 )  out vec4 e_ne_se_nw_sw  ;
layout (location = 3 )  out vec4 o_ne_se_nw_sw  ;
layout (location = 4 )  out vec4 e_n0_rho_ux_uy  ;
layout (location = 5 )  out vec4 o_n0_rho_ux_uy  ;
layout (location = 6 )  out vec4 e_fluid_curl  ;
layout (location = 7 )  out vec4 o_fluid_curl  ;


/*========================================================================
 * Main body of the shader
 *========================================================================
 */
void main() {
    float   nN  ; 
    float   nS  ; 
    float   nE  ; 
    float   nW  ; 
    float   nNE ; 
    float   nSE ; 
    float   nNW ; 
    float   nSW ; 
    float   n0  ; 
    float   rho ; 
    float   ux  ; 
    float   uy  ; 

    float   C   = dx/dt ;
    float   ooCs2 = 3./(C*C) ;
    float   ooCs4 = ooCs2*ooCs2 ;
    float   tau = viscosity*ooCs2/dt + 0.5 ;
    float   omega =dt/tau ; 


    float   newux   = u0 ;
    float   newuy   = 0. ;
    float   newrho  = 1. ;
    float   ux3 = ooCs2* newux;
    float   uy3 = ooCs2 * newuy;
    float   ux2 = newux * newux;
    float   uy2 = newuy * newuy;
    float   uxuy2 = 2. * newux * newuy;
    float   u2 = ux2 + uy2;
    float   u215 = .5* ooCs2* u2;
    
    float four9ths  = 4./9. ;
    float one9th    = 1./9. ;
    float one36th   = 1./36. ;
    n0  = four9ths * newrho * (1.                               - u215);
    nE  = one9th   * newrho * (1.+ux3     + .5*ooCs4*ux2        - u215);
    nW  = one9th   * newrho * (1.-ux3     + .5*ooCs4*ux2        - u215);
    nN  = one9th   * newrho * (1.+uy3     + .5*ooCs4*uy2        - u215);
    nS  = one9th   * newrho * (1.-uy3     + .5*ooCs4*uy2        - u215);
    nNE = one36th  * newrho * (1.+ux3+uy3 + .5*ooCs4*(u2+uxuy2) - u215);
    nSE = one36th  * newrho * (1.+ux3-uy3 + .5*ooCs4*(u2-uxuy2) - u215);
    nNW = one36th  * newrho * (1.-ux3+uy3 + .5*ooCs4*(u2-uxuy2) - u215);
    nSW = one36th  * newrho * (1.-ux3-uy3 + .5*ooCs4*(u2+uxuy2) - u215);
    rho = newrho;
    ux  = newux;
    uy  = newuy;

    e_n_s_e_w = vec4(nN,nS,nE,nW) ;
    o_n_s_e_w = vec4(nN,nS,nE,nW) ;

    e_ne_se_nw_sw = vec4( nNE,    nSE,    nNW,    nSW ) ;
    o_ne_se_nw_sw = vec4( nNE,    nSE,    nNW,    nSW ) ;
    
    e_n0_rho_ux_uy = vec4( n0,     rho,    ux,     uy  ) ;
    o_n0_rho_ux_uy = vec4( n0,     rho,    ux,     uy  ) ;
    
    e_fluid_curl = vec4(1.,0.,0.,0.) ;
    o_fluid_curl = vec4(1.,0.,0.,0.) ;


    vec2 size= vec2(width,height) ;
    vec2 crd = vec2(width,height)*pixPos ;

    if ( length(crd - vec2(width*0.12,height*0.5))< 8.){
        e_fluid_curl.r = 0. ;
        o_fluid_curl.r = 0. ;
    }
   // if ( abs(pixPos.x -0.2)<0.001 && 
   //      abs(pixPos.y -0.5)<0.05 ){
   //     e_fluid_curl.r = 0. ;
   //     o_fluid_curl.r = 0. ;
   // }
    return ;
}
