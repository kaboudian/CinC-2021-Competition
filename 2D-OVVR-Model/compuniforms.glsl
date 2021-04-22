/* uniform samplers of state variables  */
uniform sampler2D   
        icolor0, icolor1, icolor2, icolor3, icolor4,  icolor5, 
        icolor6, icolor7, icolor8, icolor9, icolor10 ;

/* directions                           */
uniform sampler2D   domain ;
uniform usampler2D  idir0 , idir1 ;
#include directionMap.glsl

uniform float       dt ;                /* time step                */
uniform float       ds ;                /* domain size in x,y-dir   */
uniform float       diffCoef ;          /* diffusion coeficient     */
uniform float       C_m ;               /* membrane capacitance     */

uniform int         cellType ;

/* pacemaker                            */
uniform float   pacemakerPositionX ;
uniform float   pacemakerPositionY ;
uniform float   pacemakerPeriod ;
uniform float   pacemakerRadius ;
uniform bool    pacemakerActive ;

/* Extra-cellular concenterations       */
uniform float       Ca_o, Na_o, K_o ;

/* time factor multipliers              */
uniform float       Ct_m          ; 
uniform float       Ct_h          ; 
uniform float       Ct_j          ; 
uniform float       Ct_hCaMKslow  ; 
uniform float       Ct_hslow      ; 
uniform float       Ct_mL         ; 
uniform float       Ct_jCaMK      ; 
uniform float       Ct_hL         ; 
uniform float       Ct_hLCaMK     ; 
uniform float       Ct_a          ; 
uniform float       Ct_ifast      ; 
uniform float       Ct_islow      ; 
uniform float       Ct_aCaMK      ; 
uniform float       Ct_iCaMKfast  ; 
uniform float       Ct_iCaMKslow  ; 
uniform float       Ct_d          ; 
uniform float       Ct_ffast      ; 
uniform float       Ct_fslow      ; 
uniform float       Ct_fCafast    ; 
uniform float       Ct_fCaslow    ; 
uniform float       Ct_jCa        ; 
uniform float       Ct_fCaMKfast  ; 
uniform float       Ct_fCaCaMKfast; 
uniform float       Ct_n          ; 
uniform float       Ct_xrfast     ; 
uniform float       Ct_xrslow     ; 
uniform float       Ct_xs1        ; 
uniform float       Ct_xs2        ; 
uniform float       Ct_xk1        ; 
uniform float       Ct_relNP      ; 
uniform float       Ct_relCaMK    ; 
uniform float       Ct_tr         ; 
uniform float       Ct_diffCa     ; 
uniform float       Ct_diffNa     ; 
uniform float       Ct_diffK      ; 

/* current multipliers                  */
uniform float       C_Na        ;
uniform float       C_Nafast    ;
uniform float       C_Nalate    ;
uniform float       C_NaCa      ;
uniform float       C_to        ;
uniform float       C_CaL       ;
uniform float       C_CaNa      ;
uniform float       C_CaK       ;
uniform float       C_Kr        ;
uniform float       C_Ks        ;
uniform float       C_K1        ;
uniform float       C_NaCai     ;
uniform float       C_NaCass    ;
uniform float       C_NaKNa     ;
uniform float       C_NaKK      ;
uniform float       C_NaK       ;
uniform float       C_Nab       ;
uniform float       C_Kb        ;
uniform float       C_Cab       ;
uniform float       C_pCa       ;
uniform float       C_relNP     ;
uniform float       C_relCaMK   ;
uniform float       C_upNP      ;
uniform float       C_upCaMK    ;
uniform float       C_leak      ;
uniform float       C_up        ;
uniform float       C_tr        ;
uniform float       C_rel       ;
uniform float       C_diffCa    ;
uniform float       C_diffNa    ;
uniform float       C_diffK     ;


/* Scaling Factors                      */
uniform float       SGNalate ;  
uniform float       SGto     ;  
uniform float       SPCa     ;  
uniform float       SGKr     ;  
uniform float       SGKs     ;  
uniform float       SGK1     ;  
uniform float       SGNaCa   ;  
uniform float       SGNaK    ;  
uniform float       SGKb     ;  
uniform float       SJrel    ;  
uniform float       SJup     ;  
uniform float       SCMDN    ;


/* macros (of constants)                */
#define bt          4.75
#define arel        2.375
#define btCaMK      5.9375
#define arekCaMK    2.96875

#define i           0
#define ss          1

#define kNa1        15.0
#define kNa2        5.0
#define kNa3        88.12
#define kasymm      12.5
#define omegaNa     6.0e4
#define omegaCa     6.0e4
#define omegaNaCa   5.0e3
#define kCaon       1.5e6
#define kCaoff      5.0e3
#define KmCaAct     150.e-6

#define Nao         Na_o
#define Cao         Ca_o
#define Ko          K_o

#define qNa         0.5224
#define qCa         0.1670

//#define Nao         140.0
//#define Cao         1.8
//#define Ko          5.4

#define zNa         1.0
#define zCa         2.0
#define zK          1.0 

#define gKi         0.75
#define gKo         0.75
#define gCai        1.0 
#define gCao        0.341

#define GNaCa       0.0008
#define GNa         14.838
#define Gto         0.02

#define gNai        0.75
#define gNao        0.75

#define PNab        3.75e-10
#define PCab        2.5e-8
#define GpCa        0.0005
#define PRNaK       0.01833

#define arelCaMK    2.96875
#define byCaMK      5.9375

#define ACaMK       0.05
#define bCaMK       0.00068
#define CaMK0       0.05
#define KmCaM       0.0015
#define KmCaMK      0.15
#define CaMKo       0.05

#define GNafast     75.0
#define GNalate     0.0075

#define CSQN        10.
#define KmCSQN      0.8
#define CMDNI       0.05
#define KmCMDN      0.00238
#define TRPN        0.07
#define KmTRPN      0.0005
#define tdiffCaCnst 0.2

#define Acap        1.534e-4
#define Ageo        0.767e-4
#define vcell       38.0e-6
#define vss         0.76e-6
#define vmyo        25.84e-6
#define vnsr        2.098e-6
#define vjsr        0.182e-6

#define BSR         0.047
#define KmBSR       0.00087
#define BSL         1.124
#define KmBSL       0.0087


#define F           96486.7
#define R           8314.3
#define T           310.

#define kp1         949.5
#define kp2         687.2
#define kp3         1899.
#define kp4         639.0
#define km1         182.4
#define km2         39.4
#define km3         79300.0
#define km4         40.0
#define KKi         0.5
#define KKo         0.3582
#define MgADP       0.05
#define MgATP       9.8
#define KMgATP      1.698e-7
#define H           1.e-7
#define SP          4.2
#define KHP         1.698e-7
#define KNaP        224.0
#define KKP         292.0

#define K0Nai       9.073        
#define K0Nao       27.78 
#define Delta       -0.1550 

const float rtof    = R*T/F ;
const float fort    = F/(R*T) ;

#define     EPI     1
#define     ENDO    2
#define     MID     0

/* raise a number to power 8        */
float   pow8(float x){
    return  x*x*x*x*
            x*x*x*x ;
}
