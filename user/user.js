document.addEventListener('DOMContentLoaded', function() {
    // Initialize form validation
    const freightRequestForm = document.getElementById('freightRequestForm');
    const userProfileForm = document.getElementById('userProfileForm');
    
    // Set default date and time for the scheduled date input
    const scheduledDateInput = document.getElementById('scheduledDate');
    if (scheduledDateInput) {
        // Set default to tomorrow at noon
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(12, 0, 0, 0);
        
        // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
        const formattedDate = tomorrow.toISOString().slice(0, 16);
        scheduledDateInput.value = formattedDate;
    }
    
    // Set up the stairs/floors toggle interaction
    const hasStairsSelect = document.getElementById('hasStairs');
    const floorsContainer = document.getElementById('floorsContainer');
    
    if (hasStairsSelect) {
        hasStairsSelect.addEventListener('change', function() {
            if (this.value === 'Sim') {
                floorsContainer.style.display = 'block';
            } else {
                floorsContainer.style.display = 'none';
            }
        });
    }
    
    // Freight request form submission
    if (freightRequestForm) {
        freightRequestForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendFreightRequestToWhatsApp();
        });
    }
    
    // Add direct event listener to the quote button
    const quoteButton = document.getElementById('quoteButton');
    if (quoteButton) {
        quoteButton.addEventListener('click', function(e) {
            e.preventDefault();
            sendFreightRequestToWhatsApp();
        });
    }
    
    // Add a button to recalculate route and price
    const calculateButton = document.getElementById('calculateRouteBtn');
    if (calculateButton) {
        calculateButton.addEventListener('click', function(e) {
            e.preventDefault();
            calculateRoute();
        });
    }
    
    // Trigger calculation when service options change
    const serviceCheckboxes = document.querySelectorAll('#needsHoisting, #needsAssembly, #needsPackaging');
    serviceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateTotalPriceDisplay);
    });
    
    if (hasStairsSelect) {
        hasStairsSelect.addEventListener('change', updateTotalPriceDisplay);
    }
    
    const floorCountInput = document.getElementById('floorCount');
    if (floorCountInput) {
        floorCountInput.addEventListener('input', updateTotalPriceDisplay);
    }
    
    // Function to update the total price display including additional services
    function updateTotalPriceDisplay() {
        if (calculatedPrice <= 0) return;
        
        const totalPrice = calculateTotalPrice();
        const formattedTotalPrice = totalPrice.toFixed(2).replace('.', ',');
        
        // Update the WhatsApp button text
        const quoteButton = document.getElementById('quoteButton');
        if (quoteButton) {
            quoteButton.innerHTML = `<i class="fab fa-whatsapp me-2"></i> Obter Cotação (R$ ${formattedTotalPrice})`;
        }
        
        // Update price breakdown if it exists
        const priceBreakdown = document.getElementById('priceBreakdown');
        if (priceBreakdown) {
            let breakdownHTML = `<div class="price-breakdown-item">
                <span>Preço base (${calculatedDistance.toFixed(1)} km):</span>
                <span>R$ ${calculatedPrice.toFixed(2).replace('.', ',')}</span>
            </div>`;
            
            // Add additional services
            const hasStairs = document.getElementById('hasStairs')?.value;
            if (hasStairs === 'Sim') {
                const floorCount = parseInt(document.getElementById('floorCount')?.value || 0);
                const stairsPrice = additionalServices.stairs * floorCount;
                breakdownHTML += `<div class="price-breakdown-item">
                    <span>Escadas (${floorCount} ${floorCount > 1 ? 'andares' : 'andar'}):</span>
                    <span>+ R$ ${stairsPrice.toFixed(2).replace('.', ',')}</span>
                </div>`;
            }
            
            if (document.getElementById('needsHoisting')?.checked) {
                breakdownHTML += `<div class="price-breakdown-item">
                    <span>Içamento:</span>
                    <span>+ R$ ${additionalServices.hoisting.toFixed(2).replace('.', ',')}</span>
                </div>`;
            }
            
            if (document.getElementById('needsAssembly')?.checked) {
                breakdownHTML += `<div class="price-breakdown-item">
                    <span>Montagem:</span>
                    <span>+ R$ ${additionalServices.assembly.toFixed(2).replace('.', ',')}</span>
                </div>`;
            }
            
            if (document.getElementById('needsPackaging')?.checked) {
                breakdownHTML += `<div class="price-breakdown-item">
                    <span>Embalagem:</span>
                    <span>+ R$ ${additionalServices.packaging.toFixed(2).replace('.', ',')}</span>
                </div>`;
            }
            
            // Add total
            breakdownHTML += `<div class="price-breakdown-total">
                <span>Valor Total:</span>
                <span>R$ ${formattedTotalPrice}</span>
            </div>`;
            
            priceBreakdown.innerHTML = breakdownHTML;
            priceBreakdown.style.display = 'block';
        }
    }
    
    // Function to send freight request data to WhatsApp
    function sendFreightRequestToWhatsApp() {
        // Get form data
        const clientName = document.getElementById('clientName')?.value || 'Não informado';
        const origin = document.getElementById('origin')?.value || 'Não informado';
        const destination = document.getElementById('destination')?.value || 'Não informado';
        const cargoType = document.getElementById('cargoType')?.value || 'Não informado';
        const cargoWeight = document.getElementById('cargoWeight')?.value || 'Não informado';
        const cargoDescription = document.getElementById('cargoDescription')?.value || 'Não informado';
        const scheduledDate = document.getElementById('scheduledDate')?.value;
        
        // Get additional service details
        const hasStairs = document.getElementById('hasStairs')?.value || 'Não';
        const floorCount = hasStairs === 'Sim' ? document.getElementById('floorCount')?.value || '0' : '0';
        const needsHoisting = document.getElementById('needsHoisting')?.checked ? 'Sim' : 'Não';
        const needsAssembly = document.getElementById('needsAssembly')?.checked ? 'Sim' : 'Não';
        const needsPackaging = document.getElementById('needsPackaging')?.checked ? 'Sim' : 'Não';
        
        // Format date for display if available
        let dateFormatted = 'Não informado';
        if (scheduledDate) {
            try {
                const date = new Date(scheduledDate);
                dateFormatted = `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
            } catch (e) {
                dateFormatted = scheduledDate;
            }
        }
        
        // Calculate the total price including additional services
        const totalPrice = calculateTotalPrice();
        
        // Create additional services text with prices
        let additionalServicesText = '';
        let additionalCost = 0;
        
        if (hasStairs === 'Sim') {
            const stairsPrice = additionalServices.stairs * parseInt(floorCount);
            additionalServicesText += `- Escadas: ${floorCount} ${parseInt(floorCount) > 1 ? 'andares' : 'andar'} (+R$${stairsPrice.toFixed(2)})\n`;
            additionalCost += stairsPrice;
        }
        if (needsHoisting === 'Sim') {
            additionalServicesText += `- Içamento (+R$${additionalServices.hoisting.toFixed(2)})\n`;
            additionalCost += additionalServices.hoisting;
        }
        if (needsAssembly === 'Sim') {
            additionalServicesText += `- Montagem (+R$${additionalServices.assembly.toFixed(2)})\n`;
            additionalCost += additionalServices.assembly;
        }
        if (needsPackaging === 'Sim') {
            additionalServicesText += `- Embalagem (+R$${additionalServices.packaging.toFixed(2)})\n`;
            additionalCost += additionalServices.packaging;
        }
        
        // Add price breakdown
        let priceText = '';
        if (calculatedDistance > 0) {
            priceText = 
                `💰 *Orçamento Calculado:*\n` +
                `- Distância: ${calculatedDistance.toFixed(1)} km\n` +
                `- Preço base: R$${calculatedPrice.toFixed(2)}\n` +
                (additionalCost > 0 ? `- Serviços adicionais: R$${additionalCost.toFixed(2)}\n` : '') +
                `- *Valor total: R$${totalPrice.toFixed(2)}*\n\n`;
        } else {
            priceText = `💰 *Aguardando orçamento*\n\n`;
        }
        
        // Construct the message
        const message = encodeURIComponent(
            `Olá! Gostaria de solicitar um frete na 41Log.\n\n` +
            `👤 *Nome:* ${clientName}\n` +
            `📍 *Origem:* ${origin}\n` +
            `🏁 *Destino:* ${destination}\n` +
            `📦 *Tipo de Carga:* ${cargoType}\n` +
            `⚖️ *Peso Aproximado:* ${cargoWeight} kg\n` +
            `📝 *Descrição:* ${cargoDescription}\n` +
            `🗓️ *Data:* ${dateFormatted}\n\n` +
            `🔧 *Serviços Adicionais:*\n${additionalServicesText || '- Nenhum serviço adicional selecionado\n'}\n` +
            priceText +
            `Aguardo a confirmação. Obrigado!`
        );
        
        // Open WhatsApp with the pre-filled message
        window.open(`https://wa.me/5541995500770?text=${message}`, '_blank');
    }
    
    // Handle all WhatsApp buttons to send form data
    const whatsappButtons = document.querySelectorAll('.btn-success:not(#quoteButton), .whatsapp-floating a, .whatsapp-button, .btn-whatsapp');
    whatsappButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // If the button is inside the freight form, let the form handler take care of it
            if (this.closest('#freightRequestForm')) {
                return;
            }
            
            e.preventDefault();
            
            // Check if there's form data available
            const freight = document.getElementById('freightRequestForm');
            if (freight && isFormPartiallyFilled(freight)) {
                // Send form data directly
                sendFreightRequestToWhatsApp();
                return;
            }
            
            // For buttons not related to form submission and when no form data is available
            const message = encodeURIComponent('Olá! Gostaria de falar sobre os serviços da 41Log.');
            window.open(`https://wa.me/5541995500770?text=${message}`, '_blank');
        });
    });
    
    // User profile form submission
    if (userProfileForm) {
        userProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('profileName').value;
            const phone = document.getElementById('profilePhone').value;
            
            // Create WhatsApp message for profile update
            const message = encodeURIComponent(
                `Olá! Gostaria de atualizar meu perfil na 41Log.\n\n` +
                `👤 *Nome:* ${name}\n` +
                `📱 *Telefone:* ${phone}\n\n` +
                `Aguardo a confirmação da atualização. Obrigado!`
            );
            
            // Open WhatsApp with the pre-filled message
            window.open(`https://wa.me/5541995500770?text=${message}`, '_blank');
            
            // Close modal
            const profileModal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
            profileModal.hide();
            
            // Show success message
            alert('Sua solicitação de atualização de perfil foi enviada via WhatsApp!');
        });
    }
    
    // Function to check if form is partially filled
    function isFormPartiallyFilled(form) {
        const inputs = form.querySelectorAll('input:not([type="hidden"]), select, textarea');
        for (let input of inputs) {
            if (input.value && input.id !== 'scheduledDate') { // Ignore the date which has a default value
                return true;
            }
        }
        return false;
    }
    
    // Add animations for a more engaging interface
    function addAnimations() {
        // Add animation to the WhatsApp button
        const whatsappButtons = document.querySelectorAll('.btn-success');
        whatsappButtons.forEach(btn => {
            btn.addEventListener('mouseover', function() {
                this.style.transform = 'scale(1.05)';
            });
            btn.addEventListener('mouseout', function() {
                this.style.transform = 'scale(1)';
            });
        });
        
        // Add animation to form elements
        const formElements = document.querySelectorAll('input, select, textarea');
        formElements.forEach(el => {
            el.addEventListener('focus', function() {
                this.closest('.mb-3')?.classList.add('active-field');
            });
            el.addEventListener('blur', function() {
                this.closest('.mb-3')?.classList.remove('active-field');
            });
        });
    }
    
    // Call animations
    addAnimations();
});

// Add to head for animations
document.head.insertAdjacentHTML('beforeend', `
<style>
.pulse-animation {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(37, 211, 102, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
    }
}

.active-field {
    transition: all 0.3s ease;
    transform: translateY(-2px);
}

.service-check {
    transition: all 0.3s ease;
}

.service-check:hover {
    transform: translateY(-2px);
}
</style>
`);