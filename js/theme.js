// js/theme.js

document.addEventListener('DOMContentLoaded', () => {
    const themeSwitches = document.querySelectorAll('.theme-switch input[type="checkbox"]');
    
    // Function to apply the theme
    const applyTheme = (isDark) => {
        if (isDark) {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme'); // fallback class
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }
        
        // Sync all switches on the page
        themeSwitches.forEach(switchEl => {
            switchEl.checked = isDark;
        });
    };

    // Load saved theme or default to dark (true)
    const savedTheme = localStorage.getItem('isDarkTheme');
    let isDark = true; // default to dark theme
    
    if (savedTheme !== null) {
        isDark = savedTheme === 'true';
    }
    
    // Apply initial theme
    applyTheme(isDark);

    // Add event listeners to all switches
    themeSwitches.forEach(switchEl => {
        switchEl.addEventListener('change', (e) => {
            isDark = e.target.checked;
            localStorage.setItem('isDarkTheme', isDark);
            applyTheme(isDark);
        });
    });
});
