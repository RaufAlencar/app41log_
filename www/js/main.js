// ARQUIVO PRINCIPAL - 41Log Fretes
document.addEventListener("DOMContentLoaded", function() {
    console.log("Aplicativo 41Log iniciado");
    
    // Inicialização do mapa
    let map;
    let directionsService;
    let directionsRenderer;
    
    // Preços base por KM
    const PRICING = {
        base: 80,        // Até 5km
        rates: [
            { max: 5,    price: 80  },
            { max: 8,    price: 90  },
            { max: 11,   price: 100 },
            { max: 15,   price: 110 },
            { max: 20,   price: 120 }
        ],
        additional: 15   // Acima de 20km (por km adicional)
    };

    // Inicializa o Google Maps
    function initMap() {
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: -25.4284, lng: -49.2733 }, // Centro de Curitiba
            zoom: 12
        });
        
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer();
        directionsRenderer.setMap(map);
        
        console.log("Google Maps inicializado");
        
        // Configura o autocomplete para os campos de endereço
        new google.maps.places.Autocomplete(
            document.getElementById("origin")
        );
        
        new google.maps.places.Autocomplete(
            document.getElementById("destination")
        );
    }

    // Calcula distância e preço
    async function calculateRoute() {
        const origin = document.getElementById("origin").value;
        const destination = document.getElementById("destination").value;
        
        if (!origin || !destination) {
            alert("Por favor, preencha origem e destino");
            return;
        }

        try {
            const response = await directionsService.route({
                origin: origin,
                destination: destination,
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC
            });
            
            // Mostra a rota no mapa
            directionsRenderer.setDirections(response);
            
            // Pega a distância em KM
            const distance = response.routes[0].legs[0].distance.value / 1000;
            const price = calculatePrice(distance);
            
            // Atualiza a UI
            document.getElementById("distance").textContent = distance.toFixed(2) + " km";
            document.getElementById("price").textContent = "R$ " + price.toFixed(2);
            
        } catch (error) {
            console.error("Erro ao calcular rota:", error);
            alert("Não foi possível calcular a rota. Verifique os endereços.");
        }
    }

    // Lógica de cálculo de preço
    function calculatePrice(distance) {
        if (distance <= 5) return PRICING.base;
        
        for (const rate of PRICING.rates) {
            if (distance <= rate.max) {
                return rate.price;
            }
        }
        
        // Acima de 20km: R$120 + R$15 por km adicional
        return PRICING.rates[PRICING.rates.length - 1].price + 
               (Math.ceil(distance - 20) * PRICING.additional);
    }

    // Mostra o modal de login
    function showLoginModal() {
        const modal = new bootstrap.Modal(
            document.getElementById("loginModal")
        );
        modal.show();
    }

    // Event Listeners
    document.getElementById("calculate-btn")?.addEventListener(
        "click", calculateRoute
    );
    
    // Exponha funções globais
    window.initMap = initMap;
    window.showLoginModal = showLoginModal;
});
