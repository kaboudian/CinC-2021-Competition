<!DOCTYPE html>
<html>
<head>
    <title>3V-MM</title>
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

<style>
<?php
  echo file_get_contents( __dir__ . "/../abubu_app.css" ) ;
?>

div.relative {
  position: relative;
  height: 512px;
  border: 1px solid black;
  width:100% ;
} 

div.editor {
  position : absolute;
  top: 0px;
  right: 0;
  bottom: 0;
  left: 0;
  width:100%;
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
<!-- body of the html page                                             -->
<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<body onload='loadWebGL();'>
    <h1>2D 3-Variable Minimal Model</h1>


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
    

    <table style='width:100%' id=editors>
        <tr id='compEditors' style='display:none'>
            <td id='ecomp'> 
                <h2>comp editor</h2>
                <div class=relative id=compEditorContainer>
                    <div class=editor id='compEditor'></div>
                </div>
            </td>
        </tr>

        <tr  id='initEditors' style='display:none'>
            <td id='einit'> 
                <h2>init editor</h2>
                <div class=relative id=initEditorContainer>
                    <div class=editor id='initEditor'></div>
                </div>
            </td>
         </tr>
    </table>
    
<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<!-- All shaders included here (codes written in GLSL)                 -->
<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<?php
    include "shader.php" ;
   
    shader( 'initDomain'            ) ;
    shader( 'zeroFluxDirections'    ) ;
    shader( 'initSolution'          ) ;
    shader( 'computeTimeStep'       ) ;
    shader( 'click'    ) ;
?>

<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<!-- main script - JavaScript code                                     -->
<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<script>
<?php
    echo file_get_contents( __dir__ . "/app.js" ) ;    
?></script>


</body>
</html>

