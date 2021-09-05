#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * zeroFluxDirections : calculate the zero flux directions
 *
 * PROGRAMMER   : ABOUZAR KABOUDIAN
 * DATE         : Wed 14 Apr 2021 18:30:03 (EDT)
 * PLACE        : Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
#include precision.glsl

in vec2 cc ;
// interface variables ...................................................
uniform sampler2D   domain ;

// output colors .........................................................
layout (location=0) out uvec4 odir0 ;
layout (location=1) out uvec4 odir1 ;

// .......................................................................
#include directionMap.glsl

#define isInBounds(v)  (all(greaterThanEqual(v,ivec2(0))) && \
        all(lessThanEqual(v,size)))
#define isInDomain(I)   ((texelFetch(domain, I, 0).r>0.5) && \
        isInBounds(I))

/*========================================================================
 * getPackedIndex
 *========================================================================
 */
uint getPackedIndex(ivec2 c, ivec2 d, ivec2 size){
    ivec2 checkPoint = c+d ;
    
    if ( !isInDomain(checkPoint) ){ /* if that point was not good move to 
                                       the opposite direction */
        checkPoint = c-d ;

        if( !isInDomain(checkPoint)){/* if the opposite direction is no
                                        good either, use the central point 
                                        coordinate */
            checkPoint = c ;
        }
    }
    return pack(checkPoint.x,checkPoint.y) ;
}

#define ppack(cd)   pack((cd).x, (cd).y)

/*========================================================================
 * main body of the shader
 *========================================================================
 */
void main(){
    // get the center of the fragment ....................................
    ivec2 size = textureSize( domain, 0  ) ;
    ivec2 c = ivec2(gl_FragCoord.xy) ;

    ivec2 ii = ivec2(1,0) ;
    ivec2 jj = ivec2(0,1) ;
    ivec2 ij = ii+jj ;
    ivec2 ji = ii-jj ;

    // calculate the directions ..........................................
    uvec4 dir0, dir1 ;

    N   = getPackedIndex(c,    jj, size ) ;
    S   = getPackedIndex(c,   -jj, size ) ;
    E   = getPackedIndex(c,    ii, size ) ;
    W   = getPackedIndex(c,   -ii, size ) ;
   
    NE  = getPackedIndex(c, ij , size ) ;
    NW  = getPackedIndex(c,-ji, size ) ;
    SE  = getPackedIndex(c, ji, size ) ;
    SW  = getPackedIndex(c,-ij, size ) ;

    // output calculated colors ..........................................
    odir0 = dir0 ;
    odir1 = dir1 ;

    return ;
}
