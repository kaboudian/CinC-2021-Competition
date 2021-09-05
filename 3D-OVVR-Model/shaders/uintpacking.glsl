/*========================================================================
 * packing and unpacking two integers to and from a single unsigned int.
 *========================================================================
 */
#define pack(i,j)   uint((uint(i)<<16)+uint(j))
#define unpack(I)   ivec2(uint(I)>>16, uint(I) & uint(65535) )
