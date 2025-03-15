(function(){
    const lat =18.9298052;
    const lng = -70.4463565;
    const mapa = L.map('mapa-inicio').setView([lat, lng ], 12);

    let markers = new L.FeatureGroup().addTo(mapa)
    let propiedades = []

    // filtros
    
    const filtros = {
        categoria: "",
        precio: ""
    }

    const categoriaSelec = document.querySelector("#categoria");
    const precioSelec = document.querySelector("#precio");
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    //filtrado de categorias y precios
    categoriaSelec.addEventListener('change', e => {
        filtros.categoria=e.target.value
        filtrarPropiedad()
    })

    precioSelec.addEventListener('change', e => {
        filtros.precio=e.target.value
        filtrarPropiedad()
    })

    const obtenerPropiedades = async () => {
        try {
            const url = '/api/propiedades';
            
            const respuesta = await fetch(url);
            propiedades = await respuesta.json();
            mostrarPropiedades(propiedades)
        } catch (error) {
            console.log(error)
        }
    }

    const mostrarPropiedades = propiedades => {
        // limpiar los markers
        markers.clearLayers()
       propiedades.forEach(propiedad=> {
            // agregar los pines
            const marker = new L.marker([propiedad?.lat, propiedad?.lng], {
                autoPan:true
            })
            .addTo(mapa)
            .bindPopup(`
                <h1 class="text-xl font-extrabold uppercase my-3">${propiedad?.titulo}</h1>
                <img src="/img/uploads/${propiedad?.imagen}" alt="Imagen de ${propiedad?.titulo}">
                <p class="text-gray-600 font-bold">${propiedad?.precio.nombre}</p>
                <p class="text-gray-600 font-bold">${propiedad?.categoria.nombre}</p>
                <a href="/propiedad/${propiedad?.id}" class="bg-indigo-600 block p-2 text-center font-bold uppercase text-white">Ver Propiedad</a>
            `)

            markers.addLayer(marker)
       });
    }

    const filtrarPropiedad = () => {
        const resultado = propiedades.filter( filtrarCategoria ).filter(filtrarPrecio)

        mostrarPropiedades(resultado)
        console.log(resultado)
    }

    const filtrarCategoria = (propiedad) => {
        return filtros.categoria ? propiedad.categoriaId == filtros.categoria : propiedad
        
    }

    const filtrarPrecio = propiedad => filtros.precio ? propiedad.precioId == filtros.precio : propiedad

    obtenerPropiedades()

})()