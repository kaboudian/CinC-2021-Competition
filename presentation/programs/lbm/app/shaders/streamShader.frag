#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * streamShader :   
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Wed 24 Oct 2018 21:15:57 (-0400)
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

uniform sampler2D       in_n_s_e_w ;
uniform sampler2D       in_ne_se_nw_sw ;
uniform sampler2D       in_n0_rho_ux_uy ;
uniform sampler2D       in_fluid_curl ;

uniform float           viscosity ;
uniform float           u0 ;
uniform float           dt ;
uniform float           dx ;


/*------------------------------------------------------------------------
 * output layers
 *------------------------------------------------------------------------
 */
layout (location = 0 ) out vec4 out_n_s_e_w ;
layout (location = 1 ) out vec4 out_ne_se_nw_sw  ;
layout (location = 2 ) out vec4 out_n0_rho_ux_uy ;

#define     isFluid(pos)    texture(in_fluid_curl, pos).r>0.5

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
    //float   omega = 1./(3.*viscosity + 0.5 ) ;    
    float   C   = dx/dt ;
    float   ooCs2 = 3./(C*C) ;
    float   ooCs4 = ooCs2*ooCs2 ;
    float   tau = viscosity*ooCs2/dt + 0.5 ;
    float   omega = 1./tau ; 


    float   newux   = u0 ;
    float   newuy   = 0. ;
    float   newrho  = 1. ;
    float   ux3 = ooCs2 * newux;
    float   uy3 = ooCs2 * newuy;
    float   ux2 = newux * newux;
    float   uy2 = newuy * newuy;
    float   uxuy2 = 2. * newux * newuy;
    float   u2 = ux2 + uy2;
    float   u215 = 0.5 *ooCs2* u2;

    float four9ths  = 4./9. ;
    float one9th    = 1./9. ;
    float one36th   = 1./36. ;

/*------------------------------------------------------------------------
 * update streams
 *------------------------------------------------------------------------
 */
    if (    cc.x > ii.x         && 
            cc.x < (1.-ii.x)    &&
            cc.y > jj.y         && 
            cc.y < (1.-jj.y)        ){

        /* flow in the appropriate direction if the neighbor is fluid 
           otherwise bounce back off of the obstackle                    */
        nN  = (isFluid( cc-jj )) ? 
            texture(in_n_s_e_w , cc - jj    ).r :  /* neighbor is fluid  */
            texture(in_n_s_e_w , cc         ).g ;  /* bounce off barrier */

        nS  = (isFluid( cc+jj)) ?
            texture(in_n_s_e_w , cc + jj    ).g : 
            texture(in_n_s_e_w , cc         ).r ; 

        nE  = (isFluid(cc-ii)) ?
            texture(in_n_s_e_w , cc - ii    ).b : 
            texture(in_n_s_e_w , cc         ).a ;
        
        nW  = (isFluid(cc+ii)) ?
            texture(in_n_s_e_w , cc + ii    ).a : 
            texture(in_n_s_e_w , cc         ).b ;

        
        nNE = ( isFluid( cc - ii - jj ) ) ? 
            texture(in_ne_se_nw_sw ,  cc - ii - jj      ).r :
            texture(in_ne_se_nw_sw ,  cc                ).a ;

        nSE = ( isFluid( cc - ii + jj ) ) ?
            texture(in_ne_se_nw_sw ,  cc - ii + jj      ).g :
            texture(in_ne_se_nw_sw ,  cc                ).b ;
            
        nNW = (isFluid( cc + ii - jj ) ) ?
            texture(in_ne_se_nw_sw ,  cc + ii - jj      ).b :
            texture(in_ne_se_nw_sw ,  cc                ).g ;

        nSW = (isFluid( cc + ii + jj ) ) ? 
            texture(in_ne_se_nw_sw ,  cc + ii + jj      ).a :
            texture(in_ne_se_nw_sw ,  cc                ).r ;

/*------------------------------------------------------------------------
 * applying boundary conditions
 *------------------------------------------------------------------------
 */ 
    }else if ( cc.x < ii.x  ){ // Inlet B.C.
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
    }else if ( cc.x > (1.-ii.x) ){ // Outlet B.C.
        n_s_e_w     = texture( in_n_s_e_w,      cc - ii ) ;
        ne_se_nw_sw = texture( in_ne_se_nw_sw,  cc - ii ) ;
        n0_rho_ux_uy= texture( in_n0_rho_ux_uy, cc - ii ) ;

        nN  = n_s_e_w.r ;
        nS  = n_s_e_w.g ;
        nE  = n_s_e_w.b ;
        nW  = n_s_e_w.a ;
        nNE = ne_se_nw_sw.r ;
        nSE = ne_se_nw_sw.g ;
        nNW = ne_se_nw_sw.b ;
        nSW = ne_se_nw_sw.a ;
        n0  = n0_rho_ux_uy.r ;
        rho = n0_rho_ux_uy.g ;
        ux  = n0_rho_ux_uy.b ;
        uy  = n0_rho_ux_uy.a ;
    }else if( cc.y <  jj.y ){    //  Bottom Boundary
        n_s_e_w     = texture(in_n_s_e_w , cc ) ;
        ne_se_nw_sw = texture( in_ne_se_nw_sw , cc )  ;

        /* Specular Bounce Back */
        nN  = n_s_e_w.g ; 
        nNE = ne_se_nw_sw.g ;
        nNW = ne_se_nw_sw.a ; 

        /* Regular stream function */
        nS  = (isFluid( cc+jj)) ?
            texture(in_n_s_e_w , cc + jj    ).g : 
            texture(in_n_s_e_w , cc         ).r ; 

        nE  = (isFluid(cc-ii)) ?
            texture(in_n_s_e_w , cc - ii    ).b : 
            texture(in_n_s_e_w , cc         ).a ;
        
        nW  = (isFluid(cc+ii)) ?
            texture(in_n_s_e_w , cc + ii    ).a : 
            texture(in_n_s_e_w , cc         ).b ;
        
        nSE = ( isFluid( cc - ii + jj ) ) ?
            texture(in_ne_se_nw_sw ,  cc - ii + jj      ).g :
            texture(in_ne_se_nw_sw ,  cc                ).b ;
            
        
        nSW = (isFluid( cc + ii + jj ) ) ? 
            texture(in_ne_se_nw_sw ,  cc + ii + jj      ).a :
            texture(in_ne_se_nw_sw ,  cc                ).r ;
    }else if ( cc.y > (1.-jj.y)){ // Top Boundary
        
        /* Specular bounce back */
        nS  = texture(in_n_s_e_w ,      cc  ).r ; 
        nSE = texture(in_ne_se_nw_sw ,  cc  ).r ;
        nSW = texture(in_ne_se_nw_sw ,  cc  ).b ;

        nN  = (isFluid( cc-jj )) ? 
            texture(in_n_s_e_w , cc - jj    ).r :  
            texture(in_n_s_e_w , cc         ).g ;  

        nE  = (isFluid(cc-ii)) ?
            texture(in_n_s_e_w , cc - ii    ).b : 
            texture(in_n_s_e_w , cc         ).a ;
        
        nW  = (isFluid(cc+ii)) ?
            texture(in_n_s_e_w , cc + ii    ).a : 
            texture(in_n_s_e_w , cc         ).b ;

        
        nNE = ( isFluid( cc - ii - jj ) ) ? 
            texture(in_ne_se_nw_sw ,  cc - ii - jj      ).r :
            texture(in_ne_se_nw_sw ,  cc                ).a ;

                    
        nNW = (isFluid( cc + ii - jj ) ) ?
            texture(in_ne_se_nw_sw ,  cc + ii - jj      ).b :
            texture(in_ne_se_nw_sw ,  cc                ).g ;
    }
    rho = n0 + nN + nS + nE + nW + nNW + nNE + nSW + nSE ;
    ux = (nE + nNE + nSE - nW - nNW - nSW) / rho;
    uy = (nN + nNE + nNW - nS - nSE - nSW) / rho;
 
/*------------------------------------------------------------------------
 * update outputs
 *------------------------------------------------------------------------
 */
    out_n_s_e_w     = vec4( nN,     nS,     nE,     nW  ) ;
    out_ne_se_nw_sw = vec4( nNE,    nSE,    nNW,    nSW ) ;
    out_n0_rho_ux_uy= vec4( n0,     rho,    ux,     uy  ) ;

    return ;
}
