```
vec4 Texture3D( sampler2D sample, vec3 texCoord )
{
    float x, y ;
    float wd ;

    wd = mx*my-1.0 ;

    float zSliceNo  = floor( texCoord.z*mx*my) ;
    
    x = texCoord.x / mx ;
    y = texCoord.y / my ;

    x += (mod(zSliceNo,mx)/mx) ;
    y += floor((wd-zSliceNo)/ mx )/my ;

    return texture( sample,  vec2(x,y) ) ;
}
```
