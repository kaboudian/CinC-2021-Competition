#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * tip_s1.frag  :   First step of reduction to look for the spiral tip
 *                  Column-wise reduction to create a row of pixels
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Thu 17 Dec 2020 17:21:31 (EST)
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */

precision highp int ;
precision highp float ;

in vec2 cc ;
uniform sampler2D   inColor ;
uniform float       uThreshold, vThreshold ;

layout (location=0) out vec4 ocolor ;

// macros ----------------------------------------------------------------
#define ut  uThreshold
#define vt  vThreshold

#define u   color.r
#define v   color.g

/*========================================================================
 * main body of the shader
 *========================================================================
 */
void main(){
    vec4 color ;
    bool f,g  ;

    ivec2 size = textureSize( inColor, 0 ) ;
    vec2  s = vec2(1.)/vec2(size) ;

    vec2 pos ;
    vec2 p ;

    bool r1, r2, r3, r4 ;

    // reduction in y-direction
    for( int jc = 0 ; jc< size.y ; jc++){
        pos = vec2( cc.x, (float(jc)+0.5)*s.y ) ; 
        r1 = false ;
        r2 = false ;
        r3 = false ;
        r4 = false ;

        // look around the point and tick each region that exists 
        for( int i= -2 ; i <3 ; i+=1 ){
            for( int j= -2 ; j <3 ; j+=1 ){
                p = pos + vec2(i,j)*s  ;
                color = texture(inColor, p) ;
                f = (u>ut) ;
                g = (v>vt) ;
               
                if ( f && g ){
                    r1 = true ;
                }else if ( f ){
                    r2 = true ;
                }else if ( g ){
                    r3 = true ;
                }else{
                    r4 = true ;
                }
            }
        }
        // chek if all four regions are present around p ;
        if ( r1 && r2 && r3 && r4 ){
            ocolor = vec4(pos.xy, 0.,0.) ;
            return ;
        }
    }

    ocolor = vec4(0.) ;

    return ;
}
