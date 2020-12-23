// Añadir al functions.php
add_action('wp_enqueue_scripts', 'soundsoner_enqueue_custom_js');
function soundsoner_enqueue_custom_js() {
	wp_enqueue_script('custom', 'https://cdn.jsdelivr.net/gh/juancamejoalarcon/soundsoner/dist/js/app.js', 
    array(), false, true);
}
