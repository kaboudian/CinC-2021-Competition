/*========================================================================
 * RL1  : Rush Larsen 1: works with y_inf and tau_y
 *      dy/dt = (y_inf - y)/tau_y where
 *========================================================================
 */
float RL1(float yo, float y_inf, float tau_inf,float deltaT){
    return y_inf + (yo - y_inf)*exp(-deltaT/tau_inf) ; 
}

/*========================================================================
 * RL2 : Rush Larsen 2: works with a and b values 
 *      dy/dt = (y_inf - y)/tau_y where
 *      y_inf = a/(a+b)     and      tau_y = 1./(a+b)
 *========================================================================
 */
float RL2(float yo, float a, float b,float deltaT){
    float y_inf = a/(a+b) ;
    float t_inf = 1./(a+b) ;

    return RL1(yo,y_inf,t_inf,deltaT) ; 
}
