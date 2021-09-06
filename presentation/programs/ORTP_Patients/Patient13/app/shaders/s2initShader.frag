#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * s2initShader :   mhjj, jaii, vvxc, cccc, kknn
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Wed 19 Jul 2017 12:31:30 PM EDT
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
precision highp float;

/*------------------------------------------------------------------------
 * Interface variables 
 *------------------------------------------------------------------------
 */
in vec2 pixPos ;
uniform float   minVlt, maxVlt ;

/*------------------------------------------------------------------------
 * outputs
 *------------------------------------------------------------------------
 */
layout (location = 0 )  out vec4  mhjjOut ;
layout (location = 1 )  out vec4  jaiiOut ;
layout (location = 2 )  out vec4  vvxcOut ;
layout (location = 3 )  out vec4  ccccOut ;
layout (location = 4 )  out vec4  kknnOut ;

/*========================================================================
 * Main body of the shader
 *========================================================================
 */
void main() {

/*------------------------------------------------------------------------
 * location 0 : mhji
 *------------------------------------------------------------------------
 */
    mhjjOut = vec4( 9.8264e-04 ,    /* m                */
                    0.8092 ,        /* h                */
                    0.8092 ,        /* j                */
                    2.53943e-5      /* JrelNP           */  ) ;

/*------------------------------------------------------------------------
 * location 1 : haii
 *------------------------------------------------------------------------
 */
    jaiiOut = vec4( 3.17262e-7 ,    /* JrelCaMK         */
                    0.00101185 ,    /* a                */
                    0.999542 ,      /* ifast            */
                    0.589579        /* iFlow            */  ) ;

/*------------------------------------------------------------------------
 * location 0 : vvxc
 *------------------------------------------------------------------------
 */
    float   vlt = -87.84 ;
    float   v   = ( vlt - minVlt )/(maxVlt - minVlt) ;

    vvxcOut = vec4( vlt,        /* membrane potential   */ 
                    v,          /* scaled potential     */
                    0.996801 ,  /* xK1                  */
                    0.0124065   /* CaMKtrap             */  ) ; 

/*------------------------------------------------------------------------
 * location 1 : cccc
 *------------------------------------------------------------------------
 */
    ccccOut = vec4( 1.61 ,      /* Cansr                */
                    1.56 ,      /* Cajsr                */
                    8.43e-5 ,   /* Cass                 */
                    8.54e-5     /* Cai                  */  ) ;

/*------------------------------------------------------------------------
 * location 2 : kknn
 *------------------------------------------------------------------------
 */
    kknnOut = vec4( 143.79 ,    /* Kss                  */
                    143.79 ,    /* Ki                   */
                    7.23 ,      /* Nass                 */
                    7.23        /* Nai                  */  ) ;
              
    return ;
}