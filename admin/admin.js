document.addEventListener('DOMContentLoaded', function() {
    // Sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    const sections = document.querySelectorAll('.content-section');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const headerTitle = document.querySelector('.admin-header-title');
    
    // Toggle sidebar on mobile
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });
    
    // Navigation functionality
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('onclick')) return; // Skip if it has onclick attribute (logout)
            
            e.preventDefault();
            
            // Update active link
            sidebarLinks.forEach(link => link.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');
            
            // Update header title
            headerTitle.textContent = this.textContent.trim();
            
            // Show corresponding section
            const targetSection = this.getAttribute('data-section');
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
            
            // Close sidebar on mobile
            if (window.innerWidth < 992) {
                sidebar.classList.remove('open');
            }
        });
    });
    
    // Example admin functionality - in a real app this would interact with a backend
    
    // Simulate getting users data
    const getUsersData = () => {
        // In a real app, this would be an API call
        console.log('Fetching users data...');
    };
    
    // Simulate getting freighters data
    const getFreightersData = () => {
        // In a real app, this would be an API call
        console.log('Fetching freighters data...');
    };
    
    // Simulate getting freights data
    const getFreightsData = () => {
        // In a real app, this would be an API call
        console.log('Fetching freights data...');
    };
    
    // Initialize data on first load
    getUsersData();
});

