```glsl
#version 300 es

/*------------------------------------------------------------------------
 * Interface variables : 
 *------------------------------------------------------------------------
 */
in      vec2    cc ;

uniform float   escapeRadius ;
uniform int     noIterations ;
uniform float   x1, x2, y1, y2 ;

/*------------------------------------------------------------------------
 * Output color of the shader 
 *------------------------------------------------------------------------
 */
out vec4 outcolor ;


/*========================================================================
 * Main body of the shader
 *========================================================================
 */
void main() {
    float   iter = 0. ;
    
    /* calculate coordinate of the pixel based on the domain bounds */
    vec2    pixCrd = vec2(x1,y1) + cc*vec2(x2-x1,y2-y1) ; 

    /* store the initial z0 value */
    vec2    z0 = pixCrd ;

    /* initialize z */
    vec2    z = z0 ;

    /* Loop to calculate new values of the map to check if the modulus of
     * a point remains bound */
    for (int i=0; i <noIterations; i++){
        z = vec2( 
                z0.x + z.x*z.x -z.y*z.y, /* new real component      */
                z0.y + 2.0*z.x*z.y       /* new imaginary component */
                ) ;

        // check if escape condition is breached 
        if((length(z)>escapeRadius )){
            break ;
        }
        iter += 1.0 ;
    }

    float mu = iter - log(log(length(z)))/log(escapeRadius) ;
    outcolor = vec4(mu) ;
    return ;
}
```
