// Global variables
let directionsService;
let directionsRenderer;
let userLocation;
let isLoggedIn = false;
let userRole = null;
let autocompleteService;
let placesService;
let calculatedPrice = 0;
let calculatedDistance = 0;

// Price table according to distance
const pricingTable = [
    { maxDist: 5, price: 80.00 },
    { maxDist: 8, price: 90.00 },
    { maxDist: 11, price: 100.00 },
    { maxDist: 15, price: 110.00 },
    { maxDist: 20, price: 120.00 }
];

// Additional services pricing
const additionalServices = {
    stairs: 10.00,  // per floor
    hoisting: 50.00,
    assembly: 35.00,
    packaging: 25.00
};

// Curitiba region neighborhoods and common locations
const curitibaLocations = [
    "Centro, Curitiba, PR",
    "Batel, Curitiba, PR",
    "Água Verde, Curitiba, PR",
    "Portão, Curitiba, PR",
    "Rebouças, Curitiba, PR",
    "Mercês, Curitiba, PR",
    "Santa Felicidade, Curitiba, PR",
    "Cabral, Curitiba, PR",
    "Juvevê, Curitiba, PR",
    "Hauer, Curitiba, PR",
    "Boqueirão, Curitiba, PR",
    "Pinheirinho, Curitiba, PR",
    "Capão Raso, Curitiba, PR",
    "São José dos Pinhais, PR",
    "Colombo, PR",
    "Araucária, PR",
    "Campo Largo, PR",
    "Pinhais, PR",
    "Fazenda Rio Grande, PR",
    "Almirante Tamandaré, PR"
];

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap components
    initBootstrapComponents();
    
    // Add event listeners
    addEventListeners();
    
    // Check if user is logged in
    checkAuthStatus();
    
    // Populate location datalists if they exist
    populateLocationDatalist();
    
    // Set animations
    setAnimations();
});

// Initialize Bootstrap components
function initBootstrapComponents() {
    // Initialize all tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Add animations to elements
function setAnimations() {
    // Add fade-in effects for cards
    const cards = document.querySelectorAll('.card');
    if (cards) {
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });
    }
    
    // Add pulse effect to WhatsApp buttons
    const whatsappBtns = document.querySelectorAll('.btn-success');
    if (whatsappBtns) {
        whatsappBtns.forEach(btn => {
            btn.classList.add('pulse-animation');
        });
    }
}

// Add event listeners
function addEventListeners() {
    // Login forms submission
    document.getElementById('userLoginForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin('user');
    });
    
    document.getElementById('adminLoginForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin('admin');
    });
    
    // Phone number formatting for Curitiba region
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (!this.value) {
                this.value = '(41) ';
            }
        });
        
        input.addEventListener('input', function() {
            const cleaned = this.value.replace(/\D/g, '');
            if (cleaned.length <= 2) {
                this.value = '(41) ';
            } else if (cleaned.length <= 7) {
                this.value = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
            } else {
                this.value = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`;
            }
        });
    });
    
    // Origin and destination inputs - add autocomplete
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');
    
    if (originInput) {
        originInput.addEventListener('input', function() {
            if (autocompleteService) {
                suggestAddresses(this.value, 'originSuggestions');
            }
        });
    }
    
    if (destinationInput) {
        destinationInput.addEventListener('input', function() {
            if (autocompleteService) {
                suggestAddresses(this.value, 'destinationSuggestions');
            }
        });
    }
    
    // Stairs select change
    const hasStairsSelect = document.getElementById('hasStairs');
    if (hasStairsSelect) {
        hasStairsSelect.addEventListener('change', function() {
            const floorsContainer = document.getElementById('floorsContainer');
            floorsContainer.style.display = this.value === 'Sim' ? 'block' : 'none';
        });
    }
    
    // Add click handlers to all WhatsApp buttons on the homepage
    const whatsappButtons = document.querySelectorAll('.whatsapp-button, .whatsapp-floating a, .btn-success');
    whatsappButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.hasAttribute('href') && this.getAttribute('href').includes('wa.me')) {
                e.preventDefault();
                
                // Basic customer information
                let name = '';
                let interest = 'informações sobre fretes';
                
                // Try to get name if we're on a form page
                const nameInput = document.getElementById('clientName');
                if (nameInput && nameInput.value) {
                    name = nameInput.value;
                } else {
                    // Try to get it from the login form
                    const userEmail = document.getElementById('userEmail');
                    if (userEmail && userEmail.value) {
                        name = userEmail.value.split('@')[0];
                    }
                }
                
                // Create the message
                let message = '';
                
                if (name) {
                    message = encodeURIComponent(`Olá! Meu nome é ${name} e gostaria de obter ${interest} na 41Log.`);
                } else {
                    message = encodeURIComponent(`Olá! Gostaria de obter ${interest} na 41Log.`);
                }
                
                window.open(`https://wa.me/5541995500770?text=${message}`, '_blank');
            }
        });
    });
}

// Populate datalists with Curitiba region locations
function populateLocationDatalist() {
    const originDatalist = document.getElementById('originSuggestions');
    const destinationDatalist = document.getElementById('destinationSuggestions');
    
    if (originDatalist) {
        curitibaLocations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            originDatalist.appendChild(option);
        });
    }
    
    if (destinationDatalist) {
        curitibaLocations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            destinationDatalist.appendChild(option);
        });
    }
}

// Suggest addresses using Google Places Autocomplete
function suggestAddresses(input, datalistId) {
    if (!input || input.length < 3) return;
    
    const datalist = document.getElementById(datalistId);
    if (!datalist) return;
    
    const request = {
        input: input,
        componentRestrictions: { country: 'br' },
        location: new google.maps.LatLng(-25.4284, -49.2733), // Curitiba center
        radius: 50000 // 50km radius around Curitiba
    };
    
    autocompleteService.getPlacePredictions(request, function(predictions, status) {
        // Clear previous suggestions
        datalist.innerHTML = '';
        
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            predictions.forEach(prediction => {
                const option = document.createElement('option');
                option.value = prediction.description;
                datalist.appendChild(option);
            });
        }
    });
}

// Show login modal
function showLoginModal() {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
}

// Handle login
function handleLogin(role) {
    const email = document.getElementById(`${role}Email`).value;
    const password = document.getElementById(`${role}Password`).value;
    
    // In a real app, this would be a server request
    // For demo purposes, we'll simulate a successful login
    
    // Simulate API call delay
    setTimeout(() => {
        // Set logged in state
        isLoggedIn = true;
        userRole = role;
        
        // Store in localStorage (in a real app, you would store a token)
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', role);
        localStorage.setItem('userEmail', email);
        
        // Close the modal
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        loginModal.hide();
        
        // Redirect to the appropriate dashboard
        redirectToDashboard(role);
    }, 1000);
}

// Check auth status
function checkAuthStatus() {
    isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    userRole = localStorage.getItem('userRole');
    
    if (isLoggedIn && userRole) {
        // User is logged in, redirect to dashboard if not already there
        const currentPath = window.location.pathname;
        
        if (currentPath === '/' || currentPath === '/index.html') {
            redirectToDashboard(userRole);
        }
    }
}

// Redirect to dashboard
function redirectToDashboard(role) {
    switch (role) {
        case 'user':
            window.location.href = 'user/index.html';
            break;
        case 'admin':
            window.location.href = 'admin/index.html';
            break;
    }
}

// Calculate route and update price based on distance
function calculateRoute() {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    
    if (!origin || !destination) {
        alert('Por favor, informe os endereços de origem e destino.');
        return;
    }
    
    // Show loading state
    const priceDisplay = document.getElementById('calculatedPrice');
    if (priceDisplay) {
        priceDisplay.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculando...';
    }
    
    // Use Google Maps Directions API to calculate the route
    directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
    }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            // Get route distance in kilometers
            calculatedDistance = response.routes[0].legs[0].distance.value / 1000;
            
            // Calculate base price from distance
            calculatedPrice = calculatePriceFromDistance(calculatedDistance);
            
            // Show the result to user
            updatePriceDisplay(calculatedDistance, calculatedPrice);
        } else {
            console.error('Error calculating route:', status);
            if (priceDisplay) {
                priceDisplay.innerHTML = '<i class="fas fa-exclamation-triangle text-warning"></i> Não foi possível calcular o preço. Por favor, tente novamente.';
            }
        }
    });
}

// Calculate price based on distance
function calculatePriceFromDistance(distance) {
    // Find the price tier based on distance
    let priceItem = pricingTable.find(item => distance <= item.maxDist);
    
    // If distance is greater than our maximum tier, use the last tier
    if (!priceItem && distance > 20) {
        priceItem = pricingTable[pricingTable.length - 1];
    }
    
    // Return the price, or 0 if not found
    return priceItem ? priceItem.price : 0;
}

// Update the price display with calculated values
function updatePriceDisplay(distance, basePrice) {
    const priceDisplay = document.getElementById('calculatedPrice');
    if (!priceDisplay) return;
    
    // Format values for display
    const formattedDistance = distance.toFixed(1);
    const formattedPrice = basePrice.toFixed(2).replace('.', ',');
    
    // Update the display
    priceDisplay.innerHTML = `
        <div class="alert alert-success">
            <i class="fas fa-check-circle me-2"></i>
            <strong>Distância calculada:</strong> ${formattedDistance} km
            <br>
            <strong>Preço base:</strong> R$ ${formattedPrice}
            <br>
            <small class="text-muted">*Preço final pode incluir adicionais como escadas, içamento, etc.</small>
        </div>
    `;
    
    // Also update the WhatsApp button text
    const quoteButton = document.querySelector('[data-action="quote"]');
    if (quoteButton) {
        quoteButton.innerHTML = `<i class="fab fa-whatsapp me-2"></i> Obter Cotação (R$ ${formattedPrice} + adicionais)`;
    }
}

// Calculate total price including additional services
function calculateTotalPrice() {
    let totalPrice = calculatedPrice;
    
    // Check for stairs
    const hasStairs = document.getElementById('hasStairs')?.value;
    if (hasStairs === 'Sim') {
        const floorCount = parseInt(document.getElementById('floorCount')?.value || 0);
        totalPrice += additionalServices.stairs * floorCount;
    }
    
    // Check for other additional services
    if (document.getElementById('needsHoisting')?.checked) {
        totalPrice += additionalServices.hoisting;
    }
    
    if (document.getElementById('needsAssembly')?.checked) {
        totalPrice += additionalServices.assembly;
    }
    
    if (document.getElementById('needsPackaging')?.checked) {
        totalPrice += additionalServices.packaging;
    }
    
    return totalPrice;
}

// Logout function
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    
    window.location.href = '/index.html';
}

// Initialize map when Maps API is loaded
function initMap() {
    // Initialize the directions service
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    
    // Initialize Google Places services if we're on a page that needs them
    if (document.getElementById('origin') || document.getElementById('destination')) {
        const mapDiv = document.createElement('div');
        mapDiv.style.display = 'none';
        document.body.appendChild(mapDiv);
        
        const hiddenMap = new google.maps.Map(mapDiv, {
            center: { lat: -25.4284, lng: -49.2733 }, // Curitiba coordinates
            zoom: 12
        });
        
        autocompleteService = new google.maps.places.AutocompleteService();
        placesService = new google.maps.places.PlacesService(hiddenMap);
        
        // Try to get user's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    userLocation = pos;
                    
                    // Try to get address from coordinates
                    const geocoder = new google.maps.Geocoder();
                    geocoder.geocode({ location: pos }, (results, status) => {
                        if (status === 'OK' && results[0]) {
                            const originInput = document.getElementById('origin');
                            if (originInput && !originInput.value) {
                                originInput.value = results[0].formatted_address;
                            }
                        }
                    });
                },
                () => {
                    console.log('Error: The Geolocation service failed.');
                }
            );
        }
        
        // Add event listeners to calculate route when addresses change
        const originInput = document.getElementById('origin');
        const destinationInput = document.getElementById('destination');
        
        if (originInput && destinationInput) {
            originInput.addEventListener('change', calculateRoute);
            destinationInput.addEventListener('change', calculateRoute);
        }
    }
}