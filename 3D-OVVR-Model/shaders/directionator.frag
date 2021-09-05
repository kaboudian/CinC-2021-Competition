#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * directionator.frag : find North, South, East, West, Up and Down
 * dirction indices 
 *
 * PROGRAMMER   : ABOUZAR KABOUDIAN
 * DATE         : Sat 06 Mar 2021 21:02:53 (EST)
 * PLACE        : Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
#include precision.glsl
#include uintpacking.glsl
#include directionMap.glsl
/*-------------------------------------------------------------------------
 * interfacial variables
 *-------------------------------------------------------------------------
 */
in vec2 cc ;

uniform usampler2D fullTexelIndex, compressedTexelIndex ;
uniform int mx, my ;

/*------------------------------------------------------------------------
 * output colors
 *------------------------------------------------------------------------
 */
layout (location = 0) out uvec4 odir0 ;
layout (location = 1) out uvec4 odir1 ;

/*========================================================================
 * getIJ: return the IJ index on the full 2d-matrix
 *========================================================================
 */
ivec2 getIJ(ivec3 idx, ivec3 size){
    int si = idx.z % mx ;
    int sj = idx.z / mx ;

    return ivec2(size.x*si + idx.x, (my-1-sj)*size.y + idx.y) ;
}

/*========================================================================
 * getIdx: get the 3d index from the IJ indices
 *========================================================================
 */
ivec3 getIdx( ivec2 IJ, ivec3 size ){
    int si = IJ.x / size.x ;
    int sj = (my - 1) - (IJ.y/size.y) ;

    return ivec3( IJ.x % size.x, IJ.y % size.y , mx*sj + si ) ;
}

/*========================================================================
 * macros 
 *========================================================================
 */
#define isInBounds( v )     (all(greaterThanEqual(v,ivec3(0))) && \
        all(lessThan(v,size)))

#define texelInDomain(I)  ( texelFetch(compressedTexelIndex,(I),\
            0).a==uint(1) )
#define inDomain( v )   (texelInDomain( getIJ(v, size) )) 
#define isNotGood(v)   (!( inDomain(v) && isInBounds( v ) ))

/*========================================================================
 * getPackedIndex: get packed index of the point by applying the zero-flux
 * condition.
 *========================================================================
 */
uint getPackedIndex( ivec3 C, ivec3 D, ivec3 size ){
    ivec3 checkPoint = C+D ;
    
    if ( isNotGood(checkPoint) ){ /* if that direction is not good move in
                                     the opposite direction */
        checkPoint = C-D ;
        if ( isNotGood( checkPoint ) ){ /* if the opposite direction is
                                           not good either, use the
                                           central point coordinate */
            checkPoint = C ;
        }
    }
    uvec2 targetIndex = texelFetch(
            compressedTexelIndex,
            getIJ(checkPoint,size),
            0 ).xy ;
    return pack(targetIndex.x,targetIndex.y) ;  
}

/*========================================================================
 * main
 *========================================================================
 */
void main(){
    // get the sizes of the compressed and the full domain ...............
    ivec2 compSize = textureSize(fullTexelIndex,        0 ) ;
    ivec2 fullSize = textureSize(compressedTexelIndex,  0 ) ;

    // calculate the resolution of the full domain .......................
    ivec3 size = ivec3( fullSize.x/mx , fullSize.y/my, mx*my ) ;

    // get the textel position and full texel index ......................
    ivec2 texelPos = ivec2( cc*vec2(compSize) ) ; 
    ivec4 fullTexelIndex = 
        ivec4( texelFetch(  fullTexelIndex, texelPos, 0) ) ;

    // if the texel is extra, just leave .................................
    if ( fullTexelIndex.a != 1 ){
        return ;
    }
    
    // 3-dimentional index of the of texel ...............................
    ivec3 cidx = getIdx( fullTexelIndex.xy , size ) ;

    // diretionional vectors .............................................
    ivec3 ii = ivec3(1,0,0) ;
    ivec3 jj = ivec3(0,1,0) ;
    ivec3 kk = ivec3(0,0,1) ;

    // calculating the packed indices of the each compute point ..........
    uvec4 dir0 , dir1 ;
   
    NORTH = getPackedIndex( cidx, jj, size) ; // north direction
    SOUTH = getPackedIndex( cidx,-jj, size) ; // south direction
    EAST  = getPackedIndex( cidx, ii, size) ; // east  direction
    WEST  = getPackedIndex( cidx,-ii, size) ; // west  direction

    UP    = getPackedIndex( cidx, kk, size) ; // up   direction
    DOWN  = getPackedIndex( cidx,-kk, size) ; // down direction

    // outputing the calculated points ...................................
    odir0 = uvec4(dir0) ;
    odir1 = uvec4(dir1) ;

    return ;
}
