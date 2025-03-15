(function() {
    const lat = document.querySelector('#lat').value || 18.9298052;
    const lng = document.querySelector('#lng').value || -70.4463565;
    const mapa = L.map('mapa').setView([lat, lng ], 12);
    let marker;
    //uyilizar provider y geocoder
    const geocodeService = L.esri.Geocoding.geocodeService();    

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // el pin 
    marker = new L.marker([lat, lng], {
        draggable:true,
        autoPan:true
    })
    .addTo(mapa)

    //Detectar el movimiento del pin
    marker.on('moveend', function(e){
        marker = e.target

        const posicion = marker.getLatLng();
        console.log(posicion)

        mapa.panTo(new L.latLng(posicion.lat, posicion.lng))

        // obtener inf de las calles al soltar el pin
        geocodeService.reverse().latlng(posicion, 12).run(function(error, resultado){
            marker.bindPopup(resultado.address.LongLabel)

            // llenar los campos
            document.querySelector(".calle").textContent= resultado?.address?.Address ?? ''
            document.querySelector("#calle").value = resultado?.address?.Address ?? ''
            document.querySelector("#lat").value = resultado?.latlng?.lat ?? ''
            document.querySelector("#lng").value = resultado?.latlng?.lng ?? ''
            
            
        })


        
    })


})()