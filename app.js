document.addEventListener('DOMContentLoaded', () => {
    const firstAiders = [
        { name: 'Nurse Ellen-Anne', phone: '+27 ** *** ****' },
        { name: 'Akuabata Igwe', phone: '+27 ** *** ****' },
        { name: 'Dumiso Nzimande', phone: '+27 ** *** ****' },
        { name: 'Leslie J Obi', phone: '+27 76 067 2615'}
    ];

    const firstAidersList = document.getElementById('first-aiders-list');
    const searchBar = document.getElementById('search-bar');

    function displayFirstAiders(aiders) {
        firstAidersList.innerHTML = '';
        aiders.forEach(aider => {
            const listItem = document.createElement('li');
            listItem.textContent = `${aider.name} - ${aider.phone}`;
            firstAidersList.appendChild(listItem);
        });
    }

    searchBar.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredAiders = firstAiders.filter(aider => 
            aider.name.toLowerCase().includes(searchTerm)
        );
        displayFirstAiders(filteredAiders);
    });

    // Initial display
    displayFirstAiders(firstAiders);
});
