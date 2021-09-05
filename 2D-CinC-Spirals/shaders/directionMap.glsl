#define N   dir0.r
#define S   dir0.g
#define E   dir0.b
#define W   dir0.a

#define NE  dir1.r
#define NW  dir1.g
#define SE  dir1.b
#define SW  dir1.a

/*========================================================================
 * packing and unpacking two integers to and from a single unsigned int.
 *========================================================================
 */
#define pack(i,j)   uint((uint(i)<<16)+uint(j))
#define unpack(I)   ivec2(uint(I)>>16, uint(I) & uint(65535) )
