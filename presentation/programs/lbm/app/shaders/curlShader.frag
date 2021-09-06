#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * curlShader   :   calculate the curl (vorticity)
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Thu 25 Oct 2018 11:30:09 (EDT)
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
precision highp float;

/*------------------------------------------------------------------------
 * Interface variables : 
 *------------------------------------------------------------------------
 */
in vec2 pixPos ;

uniform sampler2D       in_n0_rho_ux_uy ;
uniform sampler2D       in_fluid_curl ;

/*------------------------------------------------------------------------
 * output layers
 *------------------------------------------------------------------------
 */
layout (location = 0)  out vec4 out_fluid_curl ;

/*========================================================================
 * main body of the shader
 *========================================================================
 */
void main(){
    vec2    size = vec2(textureSize( in_fluid_curl, 0 ) ); 
    vec2    cc = pixPos ;

    /* unit vectors in x and y directions */ 
    vec2    ii = vec2(1.,0.)/size ;
    vec2    jj = vec2(0.,1.)/size ;

    vec4    fluid_curl = texture( in_fluid_curl, cc ) ;

    if (    cc.x > ii.x         &&
            cc.x < (1.-ii.x)    &&
            cc.y > jj.y         && 
            cc.y < (1.-jj.y)        ){
        fluid_curl.g = 
                texture( in_n0_rho_ux_uy, cc + ii ).a 
            -   texture( in_n0_rho_ux_uy, cc - ii ).a
            +   texture( in_n0_rho_ux_uy, cc + jj ).b
            -   texture( in_n0_rho_ux_uy, cc - jj ).b ;
    }

    if (    cc.y < 2.*jj.y      || 
            cc.y > 1.-2.*jj.y   || 
            cc.x < ii.x*2.      || 
            cc.x > 1.-2.*ii.x       ){
        fluid_curl.g = 0. ;
    }

    out_fluid_curl = fluid_curl ;

    return ;
}
