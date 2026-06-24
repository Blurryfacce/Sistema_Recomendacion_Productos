<?php
/**
 * Plugin Name: Recomendador IA - Morales Cocoa
 * Description: Panel interactivo de demostración del modelo de Machine Learning.
 * Version: 2.0
 */

function cargar_script_ia() {
    wp_enqueue_script('morales-ia-js', plugin_dir_url(__FILE__) . 'script-ia.js', array(), '2.0', true);
}
add_action('wp_enqueue_scripts', 'cargar_script_ia');

function mostrar_panel_recomendacion() {
    return '
    <div id="panel-recomendacion-ia" style="border: 2px solid #5C4033; padding: 20px; border-radius: 10px; margin-top: 20px; background-color: #fcf8f2; max-width: 500px;">
        <h3 style="color: #5C4033; text-align: center; margin-bottom: 15px;">🍫 Simulador de IA en Vivo</h3>
        <p style="font-size: 14px; margin-bottom: 15px;">Cambia los valores para ver cómo reacciona el modelo predictivo:</p>
        
        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
            <label><strong>Preferencia de Categoría:</strong>
                <select id="ia-input-cat" style="width: 100%; padding: 5px;">
                    <option value="0">Leche (55%)</option>
                    <option value="1">Oscuro (75%)</option>
                </select>
            </label>
            
            <label><strong>Preferencia de Sabor:</strong>
                <select id="ia-input-flavor" style="width: 100%; padding: 5px;">
                    <option value="0">Frutos Secos</option>
                    <option value="1">Especias</option>
                    <option value="2">Herbal</option>
                    <option value="3">Tropical</option>
                    <option value="4">Mentolado</option>
                    <option value="5">Cítrico</option>
                </select>
            </label>

            <label><strong>Productos en el carrito:</strong>
                <input type="number" id="ia-input-items" value="2" min="1" max="10" style="width: 100%; padding: 5px;">
            </label>
        </div>

        <button id="btn-predecir-ia" style="width: 100%; background: #5C4033; color: white; padding: 12px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 16px;">
            Generar Recomendación con IA
        </button>

        <p id="ia-cargando" style="display: none; text-align: center; margin-top: 15px;">Procesando en TensorFlow...</p>
        
        <div id="resultado-ia" style="display: none; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ccc; text-align: center;">
            <p style="margin-bottom: 5px; color: #666;">✨ La IA recomienda:</p>
            <h4 id="ia-nombre-producto" style="color: #D2691E; margin-bottom: 5px; font-size: 18px;"></h4>
            <p style="font-size: 14px;">
                Sabor: <strong id="ia-sabor"></strong> | Confianza: <strong id="ia-confianza"></strong>%
            </p>
        </div>
    </div>
    ';
}
add_shortcode('recomendacion_ia', 'mostrar_panel_recomendacion');