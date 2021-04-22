<!DOCTYPE html>
<html>
<head>
    <title>OVVR</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />

    <script src='https://abubujs.org/libs/Abubu.latest.js' 
	    type='text/javascript'></script>
    <!-- editors and jQuery -->
    <script 
    src='https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.5/ace.js'  
    type="text/javascript" charset="utf-8">
    </script>
    <script 
        src='https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.5/mode-glsl.js'>
    </script>
    <script 
        src='https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.5/theme-tomorrow.js'>
    </script>
    <script
        src='https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.5/keybinding-vim.js'>
    </script>
    <script 
        src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js">
    </script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.6.0/jszip.min.js"></script>


<style>
<?php
  echo file_get_contents( __dir__ . "/../abubu_app.css" ) ;
?>

div.relative {
    position: relative;
    width:100% ;
    min-height : 600px ;
    max-height : 100% ;
    max-width: 1024px
} 

div.editor {
    position    : absolute ;
    margin-left : 20px ;
    width       : 90%;
    height      : 100% ;
    border      : 3px solid grey;
    border-radius: 10px ;
}

#loading { 
    position : fixed ;
    bottom : 20px ;
    left : 10px ;
}

#loadProgress {
    width : 300px ;
    background-color: #ddd ;
}

#loadBar {
    width : 0% ;
    height : 20px ;
    background-color: #4caf50 ;
    border-radius: 3px ;
}

</style>
</head>


<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<!-- All shaders included here (codes written in GLSL)                 -->
<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->

<?php
    include "shader.php" ;
   
    shader( 'initDomain'            ) ;
    shader( 'zeroFluxDirections'    ) ;

    shader( 'init1'                 ) ;
    shader( 'init2'                 ) ;
    shader( 'comp1'                 ) ;
    shader( 'comp2'                 ) ;
    shader( 'click'                 ) ;
?>



<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<!-- body of the html page                                             -->
<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<body onload='loadWebGL();'>
    <h1>The OVVR Model</h1>
    <table>
        <tr>
            <td>
                <canvas id=canvas_1 width=512 height=512>
                    Your browser doesn't support HTML5.0
                </canvas>
            </td>
            <td>
                <canvas id=canvas_2 width=512 height=512>
                    Your browser doesn't support HTML5.0
                </canvas>
            </td>
        </tr>
    </table>
    
    <div class='relative' id='editorSection' style='display:none'>
        <h2>Source code editor</h2>
        <div class='editor' id='editor'></div>
    </div>

<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<!-- main script - JavaScript code                                     -->
<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<script>
<?php
    echo file_get_contents( __dir__ . "/app.js" ) ;    
?></script>

</body>
</html>
