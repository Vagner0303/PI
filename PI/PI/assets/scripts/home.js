    // JavaScript para alternar o tema 
    
    (function() {
        const toggleBtn = document.getElementById('toggleTheme');

        function setTheme(theme) {
            if (theme === 'dark') {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            localStorage.setItem('theme', theme);
        }

        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);

        toggleBtn.addEventListener('click', function() {
            const isDark = document.body.classList.contains('dark-mode');
            setTheme(isDark ? 'light' : 'dark');
        });
    })();