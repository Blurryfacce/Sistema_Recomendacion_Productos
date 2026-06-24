document.addEventListener("DOMContentLoaded", function() {
    const btnPredecir = document.getElementById("btn-predecir-ia");
    const panelResultado = document.getElementById("resultado-ia");
    const textoCargando = document.getElementById("ia-cargando");

    if (!btnPredecir) return; // Si no estamos en la página del shortcode, salir

    btnPredecir.addEventListener("click", function() {
        // 1. Mostrar texto de carga y ocultar resultados anteriores
        textoCargando.style.display = "block";
        panelResultado.style.display = "none";
        btnPredecir.disabled = true;

        // 2. Leer los datos EN VIVO de lo que seleccionó el usuario en pantalla (NADA QUEMADO)
        const categoriaSeleccionada = parseInt(document.getElementById("ia-input-cat").value);
        const saborSeleccionado = parseInt(document.getElementById("ia-input-flavor").value);
        const itemsCarrito = parseInt(document.getElementById("ia-input-items").value);

        // 3. Armar el paquete de datos dinámico
        const datosSesion = {
            cat_preference: categoriaSeleccionada,
            flavor_preference: saborSeleccionado,
            items_in_cart: itemsCarrito,
            subtotal: itemsCarrito * 2.50, // Simulamos que cada chocolate cuesta $2.50
            time_on_catalog_s: 60, // Valores de relleno para mantener feliz al modelo
            viewed_detail: 1,
            cacao_avg_cart: categoriaSeleccionada === 0 ? 55.0 : 75.0
        };

        // 4. Enviar los datos variables al backend de Python
        fetch("http://localhost:8000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosSesion)
        })
        .then(respuesta => respuesta.json())
        .then(datos => {
            // 5. Mostrar la respuesta
            textoCargando.style.display = "none";
            btnPredecir.disabled = false;
            
            document.getElementById("ia-nombre-producto").innerText = datos.name;
            document.getElementById("ia-sabor").innerText = datos.flavor.replace('_', ' ');
            
            // Multiplicamos la confianza por 100 para que se vea como porcentaje
            const confianzaPorcentaje = (datos.confidence * 100).toFixed(1);
            document.getElementById("ia-confianza").innerText = confianzaPorcentaje;
            
            panelResultado.style.display = "block";
        })
        .catch(error => {
            console.error("Error al conectar con la IA:", error);
            textoCargando.innerText = "Error: Verifica que uvicorn esté corriendo en el puerto 8000.";
            btnPredecir.disabled = false;
        });
    });
});