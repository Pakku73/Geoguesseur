// Ajoute une animation au clic du bouton
document.querySelector('.start-button').addEventListener('click', function() {
    // Ajoute une classe CSS pour l'animation
    this.classList.add('clicked');
    
    // Remplace le texte du bouton pour simuler une action
    this.textContent = 'En cours...';
    
    // Exécute ton action ici (par exemple, redirige vers une autre page)
    // window.location.href = 'nouvelle_page.html';
});
