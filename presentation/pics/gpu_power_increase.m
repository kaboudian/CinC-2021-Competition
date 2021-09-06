models = [680 980 1080 2080 3080] ;
coreXclock = [1.545e3 2.179e3 4.114e3 4.46e3 1.253e4] ;
year = [2012 2014 2016 2018 2020] ;

bar(year, coreXclock) ;

xlabel('Release Year') ;
ylabel('Core x Clock [GHz]') ;
title('Computational power of different generations of NVIDIA gaming cards') ;
saveas(gcf,'gpu_power_increase.png') ;

