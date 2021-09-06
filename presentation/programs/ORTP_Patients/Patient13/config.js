/*========================================================================
 * Configure Require.js
 *========================================================================
 */
var require = {
    /*  The following is required 
        for URL busting and avoiding cache! */
    urlArgs: "bust=" + (new Date()).getTime(),
    baseUrl: './',
         // Default load path for js files
    shim: {
             'detector': { exports: 'Detector' },
         },
         // Third party code lives in js/lib
    paths: {
        // Require.js plugins
        text: 'libs/text',
        shader: 'libs/shader', /* looks in the ./shaders/ directory */
        image:  'libs/image',
    }
};
