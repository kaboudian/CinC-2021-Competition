#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * collideShader:   Calculate collisions in the LBM method
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Wed 24 Oct 2018 18:13:21 (EDT)
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
precision highp float;

/*------------------------------------------------------------------------
 * Interface variables : 
 *------------------------------------------------------------------------
 */
in vec2 pixPos ;

uniform sampler2D       in_n_s_e_w ;
uniform sampler2D       in_ne_se_nw_sw;
uniform sampler2D       in_n0_rho_ux_uy ;
uniform float           viscosity ;
uniform float           dt ;
uniform float           dx ;

/*------------------------------------------------------------------------
 * It turns out for my current graphics card the maximum number of 
 *------------------------------------------------------------------------
 */
layout (location = 0)  out vec4 out_n_s_e_w ;
layout (location = 1 ) out vec4 out_ne_se_nw_sw  ;
layout (location = 2 ) out vec4 out_n0_rho_ux_uy ;

/*========================================================================
 * main body of the shader
 *========================================================================
 */
void main(){
    /* read Domain Resolution */
    vec2    size = vec2(textureSize( in_n_s_e_w, 0 ) ); 
    vec2    cc = pixPos ;

    /* unit vectors in x and y directions */ 
    vec2    ii = vec2(1.,0.)/size ;
    vec2    jj = vec2(0.,1.)/size ;

    /* extracting colors of each node */
    vec4    n_s_e_w     = texture( in_n_s_e_w,      cc ) ;
    vec4    ne_se_nw_sw = texture( in_ne_se_nw_sw,  cc ) ;
    vec4    n0_rho_ux_uy= texture( in_n0_rho_ux_uy, cc ) ;

/*------------------------------------------------------------------------
 * localizing variables
 *------------------------------------------------------------------------
 */
    float   nN  = n_s_e_w.r ;
    float   nS  = n_s_e_w.g ;
    float   nE  = n_s_e_w.b ;
    float   nW  = n_s_e_w.a ;
    float   nNE = ne_se_nw_sw.r ;
    float   nSE = ne_se_nw_sw.g ;
    float   nNW = ne_se_nw_sw.b ;
    float   nSW = ne_se_nw_sw.a ;
    float   n0  = n0_rho_ux_uy.r ;
    float   rho = n0_rho_ux_uy.g ;
    float   ux  = n0_rho_ux_uy.b ;
    float   uy  = n0_rho_ux_uy.a ;

    /* reciprocal of relaxation time */
    float   oC   = dt/dx ;
    float   ooCs2 = 3.*oC*oC ;
    float   ooCs4 = ooCs2*ooCs2 ;
    float   tau = viscosity*ooCs2/dt + 0.5 ;
    float   omega = 1./tau ;     

/*------------------------------------------------------------------------
 * calculate the collisions within the boundaries
 *------------------------------------------------------------------------
 */
    if (    cc.x > ii.x     && 
            cc.x <(1.-ii.x) &&
            cc.y > jj.y     && 
            cc.y <(1.-jj.y) ){

        rho = n0 + nN + nS + nE + nW + nNW + nNE + nSW + nSE ;

        ux = (nE + nNE + nSE - nW - nNW - nSW) / rho;
        uy = (nN + nNE + nNW - nS - nSE - nSW) / rho;

        float one9thrho = rho/9. ;
        float four9thrho = rho*4./9. ;
        float one36thrho = rho/36. ;

   //     float   ux3 = 3. * ux;
   //     float   uy3 = 3. * uy;
   //     float   ux2 = ux * ux;
   //     float   uy2 = uy * uy;
   //     float   uxuy2 = 2. * ux * uy;
   //     float   u2 = ux2 + uy2;
   //     float   u215 = 1.5 * u2;
        float   ux3 =  ux * ooCs2 ;
        float   uy3 =  uy * ooCs2 ;
        float   ux2 =  ux * ux;
        float   uy2 =  uy * uy;
        float   uxuy2 = 2. * ux * uy;
        float   u2 = ux2 + uy2;
        float   u215 = 0.5 * u2 * ooCs2 ;

            n0  += 
        omega*(four9thrho* (1.                               - u215)-n0  );

            nE  += 
        omega*(one9thrho * (1.+ux3+     .5*ooCs4*ux2         - u215)-nE  );

            nW  += 
        omega*(one9thrho * (1.-ux3+     .5*ooCs4*ux2         - u215)-nW  );

            nN  += 
        omega*(one9thrho * (1.+uy3+     .5*ooCs4*uy2         - u215)-nN  );

            nS  += 
        omega*(one9thrho * (1.-uy3+     .5*ooCs4*uy2         - u215)-nS  );

            nNE += 
        omega*(one36thrho* (1.+ux3+uy3+ .5*ooCs4*(u2+uxuy2)  - u215)-nNE );

            nSE += 
        omega*(one36thrho* (1.+ux3-uy3+ .5*ooCs4*(u2-uxuy2)  - u215)-nSE );

            nNW += 
        omega*(one36thrho* (1.-ux3+uy3+ .5*ooCs4*(u2-uxuy2)  - u215)-nNW );

            nSW += 
        omega*(one36thrho* (1.-ux3-uy3+ .5*ooCs4*(u2+uxuy2)  - u215)-nSW );
    }

/*------------------------------------------------------------------------
 * at right end, copy left-flowing densities from next row to the left
 *------------------------------------------------------------------------
 */
    if ( cc.y> ii.y && cc.y < (1.-2.*ii.y) && cc.x > (1.-ii.x)){
        nW  = texture( in_n_s_e_w ,     cc - ii ).a ;
        nNW = texture( in_ne_se_nw_sw,  cc - ii ).b ; 
        nSW = texture( in_ne_se_nw_sw,  cc - ii ).a ; 
    }
    
/*------------------------------------------------------------------------
 * update outputs
 *------------------------------------------------------------------------
 */
    out_n_s_e_w     = vec4( nN,     nS,     nE,     nW  ) ;
    out_ne_se_nw_sw = vec4( nNE,    nSE,    nNW,    nSW ) ;
    out_n0_rho_ux_uy= vec4( n0,     rho,    ux,     uy  ) ;

    return ;
}
