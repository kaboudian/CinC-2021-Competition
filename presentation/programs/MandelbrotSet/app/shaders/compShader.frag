#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * compShader   :   Mandelbrot Shader 
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Wed 06 Dec 2017 04:25:26 PM EST
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
#include precision.glsl

/*------------------------------------------------------------------------
 * Interface variables : 
 * varyings change to "in" types in fragment shaders 
 * and "out" in vertexShaders
 *------------------------------------------------------------------------
 */
in      vec2    cc ;

uniform float   escapeRadius ;
uniform int     noIterations ;
uniform vec2   x1, x2, y1, y2 ;

/*------------------------------------------------------------------------
 * It turns out for my current graphics card the maximum number of 
 * drawBuffers is limited to 8 
 *------------------------------------------------------------------------
 */
out vec4 outcolor ;

#define float2 vec2 
#define float4 vec4 

vec2 quickTwoSum(float a, float b){
    float s = a + b ;
    float e = b - (s - a) ;
    return vec2(s,e) ;
}

vec2 twoSum(float a, float b){
    float s = a + b ;
    float v = s - a ;
    float e = ( a - ( s - v ) ) + (b - v) ;
    return vec2(s,e) ;
}

vec2 df64_add(vec2 a, vec2 b){
    vec2 s, t ;
    s = twoSum(a.x, b.x) ;
    t = twoSum(a.y, b.y) ;
    s.y += t.x ;
    s = quickTwoSum(s.x, s.y) ;
    s.y += t.y ;
    s = quickTwoSum(s.x, s.y) ;
    return s ;
}

vec2 split( float a ){
    const float sp = 4097. ;
    float t = a*sp ;
    float ah = t - (t - a) ;
    float al = a - ah ;
    return vec2(ah,al) ;
}

vec4 splitComp( vec2 c ){
    const float sp = 4097. ;
    vec2 t = c*sp ;
    vec2 ch = t - (t - c ) ;
    vec2 cl = c - ch ;
    return vec4( ch.x, cl.x, ch.y, cl.y ) ;
}

vec2 twoProd( float a, float b ){
    float p = a*b ;
    vec2 aS = split(a) ;
    vec2 bS = split(b) ;
    float err = (( aS.x*bS.x - p)
            + aS.x*bS.y  + aS.y*bS.x )
        + aS.y*bS.y ;
    return vec2( p, err ) ;
}

vec2 df64_mult( vec2 a , vec2 b){
    vec2 p ;
    p = twoProd( a.x, b.x ) ;
    p.y += a.x * b.y ;
    p.y += a.y * b.x ;
    p = quickTwoSum(p.x, p.y) ;
    return p ;
}

bool df64_neq( vec2 a, vec2 b){
    return  ( a.x != b.x || a.y != b.y ) ;
}

bool df64_lt( vec2 a, vec2 b){
    return ( (a.x < b.x) || (a.x == b.x && a.y< b.y )) ;
}

/*========================================================================
 * Main body of the shader
 *========================================================================
 */
void main() {
    float   iter = 0. ;
    vec2    cx = split(cc.x) ;
    vec2    cy = split(cc.y) ;

    vec2    c0x = df64_add( x1, df64_mult( cx , df64_add(x2, -x1)) ) ;
    vec2    c0y = df64_add( y1, df64_mult( cy , df64_add(y2, -y1)) ) ;
    vec2    er = split(escapeRadius*escapeRadius) ;
        
    vec2  zx = c0x ;
    vec2  zy = c0y ;
    bool  scaped = false ;
    float   mu = 0. ;


    vec2    pixCrd = vec2(x1.x,y1.x) + cc*vec2(x2.x-x1.x,y2.x-y1.x) ; 
    vec2    c0 = pixCrd ;
    vec2    z = c0 ;

    vec2 zxu , zyu ;
    vec2 zls ;
    for (int i=0; i <noIterations; i++){
        zxu = df64_add( c0x, 
                df64_add( df64_mult(zx,zx), -df64_mult(zy,zy)) ) ;
        zyu = df64_add( c0y, 
                df64_mult(split(2.), df64_mult(zx, zy))) ;

        zx = zxu ;
        zy = zyu ;
        
        zls = df64_add( df64_mult(zx,zx),df64_mult(zy,zy) ) ;

        if( df64_lt( er, zls) ){
            scaped = true ;
            break ;
        }

        iter += 1.0 ;
    }

    mu = iter - log(log(length(sqrt(zls.x))))/log(escapeRadius) ;
    outcolor = vec4(mu) ;
    return ;
}
